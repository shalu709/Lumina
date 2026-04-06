package com.lumina.repository;

import com.lumina.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    
    List<AppUser> findTop10ByOrderByReputationScoreDesc();
    
    List<AppUser> findTop10ByCollegeAndCourseAndBatchAndSectionOrderByReputationScoreDesc(
        String college, String course, String batch, String section
    );
}
