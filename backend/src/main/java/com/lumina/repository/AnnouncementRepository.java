package com.lumina.repository;

import com.lumina.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByCollegeAndCourseAndBatchAndSectionOrderByCreatedAtDesc(
        String college, String course, String batch, String section
    );
}
