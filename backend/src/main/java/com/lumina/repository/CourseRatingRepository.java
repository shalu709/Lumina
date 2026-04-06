package com.lumina.repository;

import com.lumina.entity.CourseRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRatingRepository extends JpaRepository<CourseRating, Long> {
    List<CourseRating> findByCollegeOrderByCreatedAtDesc(String college);
    List<CourseRating> findByCourseNameIgnoreCaseAndCollege(String courseName, String college);
    List<CourseRating> findByProfessorNameIgnoreCaseAndCollege(String professorName, String college);
}
