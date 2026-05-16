-- ==============================================================================
-- PostgreSQL Database Schema: Lead Pipeline Module
-- ==============================================================================

-- 1. EXTENSIONS
-- Required for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- ENUMS
-- ==============================================================================

-- Lead Status Tracking
CREATE TYPE lead_status AS ENUM ('active', 'converted', 'lost', 'archived');

-- Lead Priority Tracking
CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- 2. LEAD STAGES
-- Defines the stages in the sales pipeline (e.g., New, Contacted, Qualified, Proposal)
CREATE TABLE lead_stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. LEADS
-- Core table storing the prospect information
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Tracking
    status lead_status DEFAULT 'active',
    priority lead_priority DEFAULT 'medium',
    stage_id INT REFERENCES lead_stages(id) ON DELETE SET NULL,
    estimated_value DECIMAL(15, 2) DEFAULT 0.00,
    source VARCHAR(100), -- e.g., 'Website', 'Referral', 'Cold Call'
    
    -- Audit fields
    created_by UUID, -- References users table
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LEAD ASSIGNMENTS
-- Tracks which sales rep is currently assigned to a lead, allowing for reassignment history
CREATE TABLE lead_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL, -- References users table
    assigned_by UUID, -- References users table
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP WITH TIME ZONE
);

-- 5. LEAD NOTES
-- Text notes attached to a lead by sales reps
CREATE TABLE lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    
    -- Audit fields
    created_by UUID NOT NULL, -- References users table
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. LEAD ACTIVITIES
-- Audit log of actions performed on a lead (e.g., Stage Changed, Email Sent)
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- e.g., 'stage_change', 'note_added', 'email_sent'
    description TEXT,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    
    -- Audit fields
    performed_by UUID, -- References users table
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. LEAD FOLLOWUPS
-- Scheduled tasks or reminders associated with a lead
CREATE TABLE lead_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL, -- References users table
    followup_type VARCHAR(50) NOT NULL, -- e.g., 'Call', 'Email', 'Meeting'
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_by UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Leads
CREATE INDEX idx_leads_stage_id ON leads(stage_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company_name ON leads(company_name);

-- Lead Assignments
CREATE INDEX idx_lead_assign_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assign_user_id ON lead_assignments(assigned_to);
CREATE INDEX idx_lead_assign_current ON lead_assignments(is_current) WHERE is_current = TRUE;

-- Lead Notes
CREATE INDEX idx_lead_notes_lead_id ON lead_notes(lead_id);

-- Lead Activities
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);

-- Lead Followups
CREATE INDEX idx_lead_followups_lead_id ON lead_followups(lead_id);
CREATE INDEX idx_lead_followups_assigned ON lead_followups(assigned_to);
CREATE INDEX idx_lead_followups_scheduled ON lead_followups(scheduled_at) WHERE is_completed = FALSE;

-- ==============================================================================
-- TRIGGERS FOR AUDIT FIELDS
-- ==============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER set_timestamp_lead_stages
BEFORE UPDATE ON lead_stages
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_leads
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_lead_notes
BEFORE UPDATE ON lead_notes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_lead_followups
BEFORE UPDATE ON lead_followups
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
