package com.lumina.repository;

import com.lumina.entity.AppTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AppTaskRepository extends JpaRepository<AppTask, Long> {
    List<AppTask> findByCreatedById(Long userId);
    @Query("SELECT t FROM AppTask t WHERE t.isHidden = false AND (t.createdBy.id = :userId OR (t.isPublic = true AND t.college = :college AND t.course = :course AND t.batch = :batch AND t.section = :section))")
    List<AppTask> findSectionAndPersonalTasks(
            @Param("userId") Long userId,
            @Param("college") String college, 
            @Param("course") String course, 
            @Param("batch") String batch, 
            @Param("section") String section
    );
}
