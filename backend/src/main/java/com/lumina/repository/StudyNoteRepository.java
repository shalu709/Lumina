package com.lumina.repository;

import com.lumina.entity.StudyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    List<StudyNote> findByUserId(Long userId);
}
