package com.lumina.repository;

import com.lumina.entity.UserSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserSubjectRepository extends JpaRepository<UserSubject, Long> {
    List<UserSubject> findByUserId(Long userId);
}
