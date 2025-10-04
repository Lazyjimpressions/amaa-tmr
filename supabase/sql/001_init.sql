-- AMAA TMR Database Schema
-- Initial database setup for AMAA TMR application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id INTEGER,
    communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
    collaboration_rating INTEGER NOT NULL CHECK (collaboration_rating >= 1 AND collaboration_rating <= 5),
    leadership_rating INTEGER NOT NULL CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
    comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table for storing calculated insights
CREATE TABLE IF NOT EXISTS insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(5,2) NOT NULL,
    metric_trend VARCHAR(20), -- 'positive', 'negative', 'neutral'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table for team management
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table for team membership
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_submitted_at ON surveys(submitted_at);
CREATE INDEX IF NOT EXISTS idx_insights_metric_name ON insights(metric_name);
CREATE INDEX IF NOT EXISTS idx_insights_period ON insights(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate team insights
CREATE OR REPLACE FUNCTION calculate_team_insights(team_uuid UUID)
RETURNS TABLE (
    metric_name VARCHAR,
    metric_value DECIMAL,
    metric_trend VARCHAR,
    period_start DATE,
    period_end DATE
) AS $$
BEGIN
    -- Calculate communication insights
    RETURN QUERY
    SELECT 
        'communication_score'::VARCHAR as metric_name,
        AVG(s.communication_rating)::DECIMAL as metric_value,
        CASE 
            WHEN AVG(s.communication_rating) > (
                SELECT AVG(communication_rating) 
                FROM surveys 
                WHERE submitted_at < NOW() - INTERVAL '1 month'
            ) THEN 'positive'
            WHEN AVG(s.communication_rating) < (
                SELECT AVG(communication_rating) 
                FROM surveys 
                WHERE submitted_at < NOW() - INTERVAL '1 month'
            ) THEN 'negative'
            ELSE 'neutral'
        END as metric_trend,
        (CURRENT_DATE - INTERVAL '1 month')::DATE as period_start,
        CURRENT_DATE as period_end
    FROM surveys s
    JOIN team_members tm ON s.user_id = tm.user_id
    WHERE tm.team_id = team_uuid
    AND s.submitted_at >= NOW() - INTERVAL '1 month';
    
    -- Calculate collaboration insights
    RETURN QUERY
    SELECT 
        'collaboration_score'::VARCHAR as metric_name,
        AVG(s.collaboration_rating)::DECIMAL as metric_value,
        CASE 
            WHEN AVG(s.collaboration_rating) > (
                SELECT AVG(collaboration_rating) 
                FROM surveys 
                WHERE submitted_at < NOW() - INTERVAL '1 month'
            ) THEN 'positive'
            WHEN AVG(s.collaboration_rating) < (
                SELECT AVG(collaboration_rating) 
                FROM surveys 
                WHERE submitted_at < NOW() - INTERVAL '1 month'
            ) THEN 'negative'
            ELSE 'neutral'
        END as metric_trend,
        (CURRENT_DATE - INTERVAL '1 month')::DATE as period_start,
        CURRENT_DATE as period_end
    FROM surveys s
    JOIN team_members tm ON s.user_id = tm.user_id
    WHERE tm.team_id = team_uuid
    AND s.submitted_at >= NOW() - INTERVAL '1 month';
    
    -- Calculate leadership insights
    RETURN QUERY
    SELECT 
        'leadership_score'::VARCHAR as metric_name,
        AVG(s.leadership_rating)::DECIMAL as metric_value,
        CASE 
            WHEN AVG(s.leadership_rating) > (
                SELECT AVG(leadership_rating) 
                FROM surveys 
                WHERE submitted_at < NOW() - INTERVAL '1 month'
            ) THEN 'positive'
            WHEN AVG(s.leadership_rating) < (
                SELECT AVG(leadership_rating) 
                FROM surveys 
                WHERE submitted_at < NOW() - INTERVAL '1 month'
            ) THEN 'negative'
            ELSE 'neutral'
        END as metric_trend,
        (CURRENT_DATE - INTERVAL '1 month')::DATE as period_start,
        CURRENT_DATE as period_end
    FROM surveys s
    JOIN team_members tm ON s.user_id = tm.user_id
    WHERE tm.team_id = team_uuid
    AND s.submitted_at >= NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO teams (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Development Team', 'Main development team for AMAA TMR project'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Marketing Team', 'Marketing and communications team');

-- Insert sample insights
INSERT INTO insights (metric_name, metric_value, metric_trend, period_start, period_end) VALUES 
    ('communication_score', 4.2, 'positive', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE),
    ('collaboration_score', 3.8, 'neutral', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE),
    ('leadership_score', 4.5, 'positive', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE);

-- Set up Row Level Security (RLS) policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for surveys (users can only see their own surveys)
CREATE POLICY "Users can view own surveys" ON surveys
    FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert own surveys" ON surveys
    FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

-- Create policies for insights (public read access)
CREATE POLICY "Insights are viewable by everyone" ON insights
    FOR SELECT USING (true);

-- Create policies for teams (team members can view team data)
CREATE POLICY "Team members can view team" ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()::integer
        )
    );

CREATE POLICY "Team members can view team membership" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()::integer
        )
    );
