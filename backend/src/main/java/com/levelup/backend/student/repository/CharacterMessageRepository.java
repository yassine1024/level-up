package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.CharacterMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CharacterMessageRepository extends JpaRepository<CharacterMessage, Long> {

    List<CharacterMessage> findAllByEpisode_IdOrderByCreatedAtAsc(Long episodeId);
}
