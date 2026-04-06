package com.lumina.repository;

import com.lumina.entity.GlobalMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface GlobalMessageRepository extends JpaRepository<GlobalMessage, Long> {
    List<GlobalMessage> findByChannelAndIsHiddenFalseOrderByCreatedAtAsc(String channel);
    List<GlobalMessage> findByChannelAndCreatedAtAfterAndIsHiddenFalseOrderByCreatedAtAsc(
        String channel, LocalDateTime since
    );
}
