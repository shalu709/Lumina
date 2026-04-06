-- Lumina Database Schema for Supabase (PostgreSQL)

-- 1. app_users
CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    college VARCHAR(255),
    course VARCHAR(255),
    batch VARCHAR(255),
    section VARCHAR(255),
    college_id VARCHAR(255),
    is_class_rep BOOLEAN DEFAULT FALSE,
    reputation_score INTEGER DEFAULT 100,
    allow_read_receipts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. user_subjects
CREATE TABLE IF NOT EXISTS user_subjects (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_attendance_percent INTEGER DEFAULT 75
);

-- 3. app_tasks
CREATE TABLE IF NOT EXISTS app_tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(255),
    posted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITHOUT TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    college VARCHAR(255),
    course VARCHAR(255),
    batch VARCHAR(255),
    section VARCHAR(255),
    report_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_by_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL
);

-- 4. attendance_logs
CREATE TABLE IF NOT EXISTS attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    date_recorded DATE,
    attended BOOLEAN DEFAULT FALSE,
    logged_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. vault_notes
CREATE TABLE IF NOT EXISTS vault_notes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    resource_url VARCHAR(255),
    section_key VARCHAR(255),
    subject_context VARCHAR(255),
    upvotes INTEGER DEFAULT 0,
    uploaded_by_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. announcements
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT TRUE,
    college VARCHAR(255),
    course VARCHAR(255),
    batch VARCHAR(255),
    section VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    content VARCHAR(1000) NOT NULL,
    section_key VARCHAR(255) NOT NULL,
    report_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. course_ratings
CREATE TABLE IF NOT EXISTS course_ratings (
    id BIGSERIAL PRIMARY KEY,
    course_name VARCHAR(255),
    professor_name VARCHAR(255),
    stars INTEGER,
    review_text TEXT,
    college VARCHAR(255),
    anonymous_identifier VARCHAR(255),
    user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. direct_messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. global_messages
CREATE TABLE IF NOT EXISTS global_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    content VARCHAR(1000) NOT NULL,
    channel VARCHAR(255) NOT NULL,
    report_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. study_notes
CREATE TABLE IF NOT EXISTS study_notes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    ai_summary TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE
);

-- 12. task_reports
CREATE TABLE IF NOT EXISTS task_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    reported_task_id BIGINT NOT NULL REFERENCES app_tasks(id) ON DELETE CASCADE,
    reason VARCHAR(255),
    reported_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. user_blocks
CREATE TABLE IF NOT EXISTS user_blocks (
    id BIGSERIAL PRIMARY KEY,
    blocker_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    blocked_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. user_task_completions
CREATE TABLE IF NOT EXISTS user_task_completions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    task_id BIGINT NOT NULL REFERENCES app_tasks(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
