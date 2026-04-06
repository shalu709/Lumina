package com.lumina.repository;

import com.lumina.entity.VaultNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VaultNoteRepository extends JpaRepository<VaultNote, Long> {
    List<VaultNote> findBySectionKeyOrderByUpvotesDesc(String sectionKey);
}
