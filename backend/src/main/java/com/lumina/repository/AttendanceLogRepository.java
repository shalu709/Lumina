package com.lumina.repository;

import com.lumina.entity.AppUser;
import com.lumina.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    List<AttendanceLog> findByUser(AppUser user);
    List<AttendanceLog> findByUserAndCourseName(AppUser user, String courseName);
    List<AttendanceLog> findByUserAndDateRecorded(AppUser user, LocalDate dateRecorded);
}
