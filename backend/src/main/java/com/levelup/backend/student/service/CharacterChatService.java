package com.levelup.backend.student.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.levelup.backend.agent.AgentsClient;
import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.repository.LessonResourceRepository;
import com.levelup.backend.student.dto.CharacterEpisodeResponse;
import com.levelup.backend.student.dto.CharacterEpisodeStartRequest;
import com.levelup.backend.student.dto.CharacterMessageRequest;
import com.levelup.backend.student.dto.CharacterReplyResponse;
import com.levelup.backend.student.entity.CharacterEpisode;
import com.levelup.backend.student.entity.CharacterMessage;
import com.levelup.backend.student.entity.MistakeSource;
import com.levelup.backend.student.entity.StudentMistake;
import com.levelup.backend.student.repository.CharacterEpisodeRepository;
import com.levelup.backend.student.repository.CharacterMessageRepository;
import com.levelup.backend.student.repository.StudentMistakeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CharacterChatService {

    private static final Logger logger = LoggerFactory.getLogger(CharacterChatService.class);
    private final CharacterEpisodeRepository episodeRepository;
    private final CharacterMessageRepository messageRepository;
    private final StudentMistakeRepository mistakeRepository;
    private final LessonLookupService lessonLookupService;
    private final LessonResourceRepository resourceRepository;
    private final AgentsClient agentsClient;
    private final ObjectMapper objectMapper;

    public CharacterChatService(
            CharacterEpisodeRepository episodeRepository,
            CharacterMessageRepository messageRepository,
            StudentMistakeRepository mistakeRepository,
            LessonLookupService lessonLookupService,
            LessonResourceRepository resourceRepository,
            AgentsClient agentsClient,
            ObjectMapper objectMapper
    ) {
        this.episodeRepository = episodeRepository;
        this.messageRepository = messageRepository;
        this.mistakeRepository = mistakeRepository;
        this.lessonLookupService = lessonLookupService;
        this.resourceRepository = resourceRepository;
        this.agentsClient = agentsClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public CharacterEpisodeResponse start(
            User user,
            Long lessonId,
            CharacterEpisodeStartRequest request
    ) {
        Lesson lesson = lessonLookupService.requirePublished(lessonId);
        ObjectNode agentRequest = objectMapper.createObjectNode();
        agentRequest.set("lesson", lessonInfo(lesson));
        agentRequest.put("characterRole", blankOr(request.characterRole(), "friend"));
        agentRequest.put("scenario", blankOr(request.scenario(), ""));
        agentRequest.put("otherText", resourceText(lesson, LessonResourceType.OTHER));
        agentRequest.put("otherDescription", resourceDescription(lesson, LessonResourceType.OTHER));
        agentRequest.put("vocabularyText", resourceText(lesson, LessonResourceType.VOCABULARY));
        agentRequest.put("grammarText", resourceText(lesson, LessonResourceType.GRAMMAR));

        JsonNode episode = agentsClient.createCharacterEpisode(agentRequest)
                .filter(this::validEpisode)
                .orElseGet(() -> fallbackEpisode(lesson, request));
        String episodeJson = writeJson(episode);
        CharacterEpisode saved = episodeRepository.save(new CharacterEpisode(lesson, user, episodeJson));
        messageRepository.save(new CharacterMessage(
                saved,
                CharacterMessage.Role.CHARACTER,
                episode.path("openingLine").asText(),
                null
        ));
        return new CharacterEpisodeResponse(
                saved.getId(),
                lessonId,
                episode,
                episode.path("openingLine").asText()
        );
    }

    @Transactional
    public CharacterReplyResponse reply(
            User user,
            Long episodeId,
            CharacterMessageRequest request
    ) {
        CharacterEpisode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Character episode not found"));
        requireOwner(user, episode);
        if (episode.isFinished()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Character episode already finished");
        }

        List<CharacterMessage> messages = messageRepository.findAllByEpisode_IdOrderByCreatedAtAsc(episodeId);
        ObjectNode agentRequest = objectMapper.createObjectNode();
        agentRequest.put("level", episode.getLesson().getUnit().getLevel().getId());
        agentRequest.set("episode", readJson(episode.getEpisodeJson()));
        ArrayNode history = agentRequest.putArray("history");
        messages.stream().skip(Math.max(0, messages.size() - 20)).forEach(message -> {
            ObjectNode item = history.addObject();
            item.put("role", message.getRole() == CharacterMessage.Role.CHARACTER ? "character" : "student");
            item.put("text", message.getText());
        });
        agentRequest.put("studentMessage", request.studentMessage());
        agentRequest.put("spoken", request.spoken());
        agentRequest.putArray("allowedModes").add("type");
        agentRequest.put("maxTurns", 10);

        CharacterMessage studentMessage = messageRepository.save(new CharacterMessage(
                episode,
                CharacterMessage.Role.STUDENT,
                request.studentMessage(),
                null
        ));

        JsonNode response = agentsClient.createCharacterReply(agentRequest)
                .filter(this::validReply)
                .orElseGet(() -> fallbackReply(request));
        JsonNode correction = response.get("correction");
        messageRepository.save(new CharacterMessage(
                episode,
                CharacterMessage.Role.CHARACTER,
                response.path("reply").asText(),
                correction == null || correction.isNull() ? null : writeJson(correction)
        ));
        if (correction != null && !correction.isNull()) {
            saveMistake(user, episode, request.studentMessage(), correction);
        }
        if (response.path("episodeComplete").asBoolean()) {
            episode.finish();
        }
        return new CharacterReplyResponse(
                episodeId,
                response.path("reply").asText(),
                response.path("emotion").asText("neutral"),
                correction,
                response.get("nextInput"),
                response.path("episodeComplete").asBoolean()
        );
    }

    private void saveMistake(User user, CharacterEpisode episode, String studentText, JsonNode correction) {
        String original = correction.path("original").asText(studentText);
        String corrected = correction.path("corrected").asText();
        String explanation = correction.path("explanation").path("en").asText("");
        String focus = correction.path("focus").asText("");
        mistakeRepository.save(new StudentMistake(
                user,
                episode.getLesson(),
                original,
                original,
                corrected,
                explanation,
                focus,
                MistakeSource.CHAT
        ));
    }

    private boolean validEpisode(JsonNode episode) {
        return episode != null
                && episode.isObject()
                && episode.path("title").isTextual()
                && episode.path("setting").isTextual()
                && episode.path("character").isObject()
                && episode.path("openingLine").isTextual()
                && !episode.path("openingLine").asText().isBlank();
    }

    private boolean validReply(JsonNode response) {
        return response != null
                && response.isObject()
                && response.path("reply").isTextual()
                && !response.path("reply").asText().isBlank()
                && response.path("emotion").isTextual()
                && response.path("nextInput").isObject()
                && response.path("episodeComplete").isBoolean();
    }

    private JsonNode fallbackEpisode(Lesson lesson, CharacterEpisodeStartRequest request) {
        ObjectNode episode = objectMapper.createObjectNode();
        String role = blankOr(request.characterRole(), "friend");
        episode.put("title", "A conversation about " + lesson.getTitle());
        episode.put("setting", "You are practising " + lesson.getTitle() + " with your " + role + ".");
        ObjectNode character = episode.putObject("character");
        character.put("name", "Alex");
        character.put("role", "your " + role);
        character.put("personality", "Friendly and encouraging.");
        episode.putArray("goals").add(lesson.getTitle());
        episode.putArray("targetWords");
        episode.put("openingLine", "Hi! I am Alex. What would you like to say about " + lesson.getTitle() + "?");
        return episode;
    }

    private JsonNode fallbackReply(CharacterMessageRequest request) {
        ObjectNode response = objectMapper.createObjectNode();
        response.put("reply", "Thanks for sharing. Can you tell me a little more?");
        response.put("emotion", "encouraging");
        response.putNull("correction");
        ObjectNode nextInput = response.putObject("nextInput");
        nextInput.put("mode", "type");
        nextInput.putArray("suggestions");
        response.put("episodeComplete", false);
        return response;
    }

    private void requireOwner(User user, CharacterEpisode episode) {
        if (!episode.getStudent().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your character episode");
        }
    }

    private ObjectNode lessonInfo(Lesson lesson) {
        ObjectNode info = objectMapper.createObjectNode();
        info.put("title", lesson.getTitle());
        info.put("level", lesson.getUnit().getLevel().getId());
        info.put("unitTitle", lesson.getUnit().getTitle());
        return info;
    }

    private String resourceText(Lesson lesson, LessonResourceType type) {
        return resourceRepository.findAllByLesson_Id(lesson.getId()).stream()
                .filter(resource -> resource.getType() == type)
                .map(LessonResource::getExtractedText)
                .filter(text -> text != null && !text.isBlank())
                .findFirst()
                .orElse("");
    }

    private String resourceDescription(Lesson lesson, LessonResourceType type) {
        return resourceRepository.findAllByLesson_Id(lesson.getId()).stream()
                .filter(resource -> resource.getType() == type)
                .map(LessonResource::getDescription)
                .filter(text -> text != null && !text.isBlank())
                .findFirst()
                .orElse("");
    }

    private String blankOr(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private JsonNode readJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored character episode is invalid");
        }
    }

    private String writeJson(JsonNode value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store character response");
        }
    }
}
