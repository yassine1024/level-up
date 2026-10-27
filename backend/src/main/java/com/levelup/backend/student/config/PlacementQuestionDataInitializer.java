package com.levelup.backend.student.config;

import com.levelup.backend.student.entity.PlacementQuestion;
import com.levelup.backend.student.repository.PlacementQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Configuration
public class PlacementQuestionDataInitializer {

    @Bean
    CommandLineRunner seedPlacementQuestions(PlacementQuestionRepository repository) {
        return args -> initialize(repository);
    }

    @Transactional
    void initialize(PlacementQuestionRepository repository) {
        if (repository.count() > 0) {
            return;
        }

        questions().forEach(repository::save);
    }

    private List<PlacementQuestion> questions() {
        return List.of(
                question("A1", "grammar", "present simple: he/she/it + -s", "She ____ to school every day.", "go", "goes", "going", "gone", "B", "With he, she or it, the present simple verb takes -s: she goes.", 1),
                question("A1", "grammar", "verb to be: am, is, are", "I ____ a student.", "am", "is", "are", "be", "A", "With I, the verb to be is am.", 2),
                question("A1", "vocabulary", "basic adjectives: opposites", "What is the opposite of \"big\"?", "tall", "small", "long", "old", "B", "Small is the opposite of big.", 3),
                question("A2", "grammar", "past simple: irregular verbs", "Yesterday we ____ to the beach.", "go", "goes", "went", "have gone", "C", "Yesterday is finished time, so we use the past simple. The past of go is went.", 4),
                question("A2", "grammar", "some and any", "There isn't ____ milk in the fridge.", "some", "any", "many", "a", "B", "In negative sentences we use any. Milk is uncountable, so many and a are wrong.", 5),
                question("A2", "grammar", "comparative adjectives", "My brother is ____ than me.", "tall", "taller", "tallest", "more tall", "B", "To compare two people we use the comparative: short adjectives take -er, so taller than.", 6),
                question("B1", "grammar", "present perfect with since and for", "I have lived in Oran ____ 2015.", "for", "since", "from", "during", "B", "We use since with a starting point in time and for with a length of time.", 7),
                question("B1", "grammar", "first conditional", "If it rains tomorrow, we ____ at home.", "stay", "will stay", "would stay", "stayed", "B", "For a real possibility in the future we use if + present simple, then will + verb.", 8),
                question("B1", "vocabulary", "phrasal verbs", "The meeting was ____ because the manager was ill.", "called off", "called up", "called back", "called in", "A", "To call off means to cancel.", 9),
                question("B2", "grammar", "past perfect", "By the time we arrived, the film ____.", "already started", "has already started", "had already started", "was already start", "C", "The film started before we arrived, so the earlier event takes the past perfect.", 10),
                question("B2", "grammar", "verb patterns: suggest + -ing", "She suggested ____ a taxi.", "to take", "taking", "take", "that taking", "B", "Suggest is followed by the -ing form, or by that + a clause.", 11),
                question("B2", "vocabulary", "confusable words: affect and effect", "The new policy had a significant ____ on sales.", "affect", "effect", "effort", "affair", "B", "Effect is the noun meaning a result; after \"a significant\" we need a noun.", 12),
                question("C1", "grammar", "inversion after negative adverbials", "Hardly ____ the room when the phone rang.", "I had entered", "had I entered", "I entered", "did I entered", "B", "After hardly at the start of a sentence, the subject and auxiliary swap places.", 13),
                question("C1", "vocabulary", "precise adjectives", "The report was criticised for being too ____; it lacked concrete examples.", "vague", "detailed", "precise", "specific", "A", "A report that lacks concrete examples is vague.", 14),
                question("C1", "grammar", "third conditional with inversion", "Had I known about the delay, I ____ earlier.", "would leave", "would have left", "will have left", "had left", "B", "Had I known is an inverted third conditional, so the result is would have + past participle.", 15)
        );
    }

    private PlacementQuestion question(
            String level, String skill, String focus, String prompt,
            String optionA, String optionB, String optionC, String optionD,
            String correctOption, String explanation, int sortOrder
    ) {
        return new PlacementQuestion(
                prompt, level, skill, focus, optionA, optionB, optionC,
                optionD, correctOption, explanation, sortOrder
        );
    }
}
