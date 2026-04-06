package com.lumina.repository;

import com.lumina.entity.UserTaskCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserTaskCompletionRepository extends JpaRepository<UserTaskCompletion, Long> {
    List<UserTaskCompletion> findByUserId(Long userId);
}
