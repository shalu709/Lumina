package com.lumina.repository;

import com.lumina.entity.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    @Query("SELECT m FROM DirectMessage m WHERE (m.sender.id = :user1 AND m.receiver.id = :user2) OR (m.sender.id = :user2 AND m.receiver.id = :user1) ORDER BY m.timestamp ASC")
    List<DirectMessage> findChatThread(@Param("user1") Long user1, @Param("user2") Long user2);

    @Query(value = "SELECT DISTINCT sender_id FROM direct_messages WHERE receiver_id = :userId " +
           "UNION " +
           "SELECT DISTINCT receiver_id FROM direct_messages WHERE sender_id = :userId", nativeQuery = true)
    List<Long> findDistinctChatPartners(@Param("userId") Long userId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);
}
