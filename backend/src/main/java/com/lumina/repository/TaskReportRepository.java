package com.lumina.repository;

import com.lumina.entity.TaskReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskReportRepository extends JpaRepository<TaskReport, Long> {
}
