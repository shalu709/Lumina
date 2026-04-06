package com.lumina.repository;

import com.lumina.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySectionKeyAndIsHiddenFalseOrderByCreatedAtAsc(String sectionKey);
    List<ChatMessage> findBySectionKeyAndCreatedAtAfterAndIsHiddenFalseOrderByCreatedAtAsc(
        String sectionKey, LocalDateTime since
    );
}
