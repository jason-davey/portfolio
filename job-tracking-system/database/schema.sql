-- Job Tracking & Application Automation System Database Schema
-- SQLite database for comprehensive job opportunity management

-- Companies table
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50), -- startup, small, medium, large, enterprise
    location VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    culture_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job opportunities table
CREATE TABLE job_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50), -- executive, director, senior, mid, junior
    employment_type VARCHAR(50), -- full-time, contract, consulting, interim
    location VARCHAR(255),
    remote_option VARCHAR(50), -- remote, hybrid, on-site
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(10) DEFAULT 'AUD',
    job_description TEXT,
    requirements TEXT,
    nice_to_have TEXT,
    source VARCHAR(100), -- linkedin, indeed, direct, referral, etc.
    source_url VARCHAR(500),
    posted_date DATE,
    application_deadline DATE,
    status VARCHAR(50) DEFAULT 'identified', -- identified, scored, applied, interview, rejected, offer
    ai_score INTEGER DEFAULT 0, -- 0-100 compatibility score
    manual_score INTEGER, -- optional manual override
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Job requirements analysis (for AI scoring)
CREATE TABLE job_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    category VARCHAR(100), -- technical, leadership, experience, industry, education
    requirement TEXT NOT NULL,
    importance VARCHAR(20), -- required, preferred, nice-to-have
    match_score INTEGER DEFAULT 0, -- 0-100 how well we match this requirement
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_opportunities (id)
);

-- Application tracking
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    resume_version VARCHAR(255), -- which resume version was used
    cover_letter_path VARCHAR(500), -- path to generated cover letter
    application_date DATE NOT NULL,
    application_method VARCHAR(100), -- email, online-form, recruiter, etc.
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    follow_up_date DATE,
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, acknowledged, interview, rejected, offer
    feedback TEXT,
    gdrive_folder_path VARCHAR(500), -- Google Drive folder for this application
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_opportunities (id)
);

-- Interview tracking
CREATE TABLE interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    round INTEGER DEFAULT 1, -- 1st round, 2nd round, etc.
    interview_type VARCHAR(100), -- phone, video, in-person, panel, technical
    interviewer_names TEXT,
    interview_date DATETIME,
    duration INTEGER, -- minutes
    location VARCHAR(255),
    preparation_notes TEXT,
    questions_asked TEXT,
    my_questions TEXT,
    feedback_received TEXT,
    outcome VARCHAR(50), -- passed, failed, pending
    next_steps TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications (id)
);

-- My profile/skills for scoring algorithm
CREATE TABLE my_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category VARCHAR(100), -- technical, leadership, experience, industry, education
    skill VARCHAR(255) NOT NULL,
    proficiency_level INTEGER DEFAULT 5, -- 1-10 scale
    years_experience INTEGER,
    can_teach BOOLEAN DEFAULT FALSE,
    examples TEXT, -- specific examples or projects
    keywords TEXT, -- comma-separated keywords for matching
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generated documents tracking
CREATE TABLE generated_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    document_type VARCHAR(50), -- cover_letter, tailored_resume, thank_you_note
    template_used VARCHAR(255),
    content TEXT,
    file_path VARCHAR(500),
    gdrive_path VARCHAR(500),
    generation_method VARCHAR(100), -- ai_generated, template_based, manual
    customizations TEXT, -- specific customizations made
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_opportunities (id)
);

-- Email/communication tracking
CREATE TABLE communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    application_id INTEGER,
    communication_type VARCHAR(50), -- application, follow_up, thank_you, rejection, offer
    direction VARCHAR(20), -- sent, received
    subject VARCHAR(255),
    content TEXT,
    recipient_email VARCHAR(255),
    sender_email VARCHAR(255),
    sent_date DATETIME,
    response_received BOOLEAN DEFAULT FALSE,
    response_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_opportunities (id),
    FOREIGN KEY (application_id) REFERENCES applications (id)
);

-- Networking contacts
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company_id INTEGER,
    email VARCHAR(255),
    linkedin_url VARCHAR(500),
    phone VARCHAR(50),
    relationship VARCHAR(100), -- former_colleague, recruiter, industry_contact, referral
    notes TEXT,
    last_contact_date DATE,
    next_follow_up_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Activity log for tracking all system activities
CREATE TABLE activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_type VARCHAR(100), -- job_added, application_sent, interview_scheduled, etc.
    entity_type VARCHAR(50), -- job, application, interview, etc.
    entity_id INTEGER,
    description TEXT NOT NULL,
    metadata TEXT, -- JSON for additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_jobs_company ON job_opportunities(company_id);
CREATE INDEX idx_jobs_status ON job_opportunities(status);
CREATE INDEX idx_jobs_score ON job_opportunities(ai_score DESC);
CREATE INDEX idx_jobs_priority ON job_opportunities(priority);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_profile_category ON my_profile(category);
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_date ON activity_log(created_at DESC);

-- Views for common queries
CREATE VIEW job_summary AS
SELECT
    j.id,
    j.title,
    c.name as company_name,
    j.level,
    j.employment_type,
    j.location,
    j.remote_option,
    j.salary_max,
    j.ai_score,
    j.priority,
    j.status,
    j.posted_date,
    j.application_deadline,
    a.application_date,
    a.status as application_status
FROM job_opportunities j
LEFT JOIN companies c ON j.company_id = c.id
LEFT JOIN applications a ON j.id = a.job_id
ORDER BY j.ai_score DESC, j.priority DESC;

CREATE VIEW application_pipeline AS
SELECT
    j.title,
    c.name as company_name,
    a.application_date,
    a.status,
    COUNT(i.id) as interview_count,
    MAX(i.interview_date) as last_interview_date
FROM applications a
JOIN job_opportunities j ON a.job_id = j.id
JOIN companies c ON j.company_id = c.id
LEFT JOIN interviews i ON a.id = i.application_id
GROUP BY a.id
ORDER BY a.application_date DESC;