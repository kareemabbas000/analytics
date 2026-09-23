-- Create ENUMs
CREATE TYPE org_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MEMBER');
CREATE TYPE credential_status AS ENUM ('healthy', 'rate_limited', 'authentication_error', 'permission_error', 'disabled', 'unknown');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected', 'error');

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Zernio Credentials (Admin only)
CREATE TABLE zernio_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    description TEXT,
    priority INT NOT NULL DEFAULT 1,
    status credential_status NOT NULL DEFAULT 'unknown',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Zernio Connected Accounts
CREATE TABLE zernio_connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    handle TEXT,
    zernio_account_id TEXT NOT NULL,
    assigned_credential_id UUID REFERENCES zernio_credentials(id) ON DELETE SET NULL,
    status connection_status NOT NULL DEFAULT 'connected',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, zernio_account_id)
);

-- 5. Zernio Failover Events
CREATE TABLE zernio_failover_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    connected_account_id UUID REFERENCES zernio_connected_accounts(id) ON DELETE CASCADE,
    prev_credential_id UUID REFERENCES zernio_credentials(id) ON DELETE SET NULL,
    new_credential_id UUID REFERENCES zernio_credentials(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Zernio Request Logs
CREATE TABLE zernio_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID REFERENCES zernio_credentials(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    connected_account_id UUID REFERENCES zernio_connected_accounts(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INT,
    duration INT,
    success BOOLEAN NOT NULL,
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Social Account Daily Metrics
CREATE TABLE social_account_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connected_account_id UUID NOT NULL REFERENCES zernio_connected_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    followers INT,
    reach INT,
    impressions INT,
    views INT,
    engagements INT,
    likes INT,
    comments INT,
    shares INT,
    saves INT,
    clicks INT,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(connected_account_id, date)
);

-- 8. Social Post Metrics
CREATE TABLE social_post_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connected_account_id UUID NOT NULL REFERENCES zernio_connected_accounts(id) ON DELETE CASCADE,
    zernio_post_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    content_type TEXT,
    caption TEXT,
    reach INT,
    impressions INT,
    views INT,
    likes INT,
    comments INT,
    shares INT,
    saves INT,
    engagements INT,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(connected_account_id, zernio_post_id)
);

-- 9. AI Reports
CREATE TABLE ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connected_account_id UUID NOT NULL REFERENCES zernio_connected_accounts(id) ON DELETE CASCADE,
    report_period TEXT NOT NULL,
    comparison_period TEXT,
    report_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. System Settings (Admin only)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functions
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_orgs BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_org_members BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_zernio_creds BEFORE UPDATE ON zernio_credentials FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_zernio_accounts BEFORE UPDATE ON zernio_connected_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_metrics BEFORE UPDATE ON social_account_daily_metrics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_post_metrics BEFORE UPDATE ON social_post_metrics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_ai_reports BEFORE UPDATE ON ai_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_system_settings BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- RLS Setup
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE zernio_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE zernio_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE zernio_failover_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE zernio_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_account_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is SUPER_ADMIN
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Organizations RLS
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid()
    ));

-- Organization Members RLS
CREATE POLICY "Users can view members of their organizations" ON organization_members
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()
    ));

-- Zernio Credentials RLS (Super Admin Only)
CREATE POLICY "Super Admins can manage credentials" ON zernio_credentials
    FOR ALL USING (is_super_admin());

-- System Settings RLS
CREATE POLICY "Super Admins can manage system settings" ON system_settings
    FOR ALL USING (is_super_admin());
CREATE POLICY "Anyone can read system settings" ON system_settings
    FOR SELECT USING (true);

-- Tenant data RLS (Users can only see data for their orgs)
-- Connected Accounts
CREATE POLICY "Org members view connected accounts" ON zernio_connected_accounts
    FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = zernio_connected_accounts.organization_id AND om.user_id = auth.uid()));

-- Daily Metrics
CREATE POLICY "Org members view metrics" ON social_account_daily_metrics
    FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = social_account_daily_metrics.organization_id AND om.user_id = auth.uid()));

-- Post Metrics
CREATE POLICY "Org members view post metrics" ON social_post_metrics
    FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = social_post_metrics.organization_id AND om.user_id = auth.uid()));

-- AI Reports
CREATE POLICY "Org members view reports" ON ai_reports
    FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = ai_reports.organization_id AND om.user_id = auth.uid()));

-- Request logs and Failovers (Admins only)
CREATE POLICY "Org admins view failovers" ON zernio_failover_events
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM organization_members om WHERE om.organization_id = zernio_failover_events.organization_id AND om.user_id = auth.uid() AND (om.role = 'ADMIN' OR om.role = 'SUPER_ADMIN')
    ));

CREATE POLICY "Org admins view logs" ON zernio_request_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM organization_members om WHERE om.organization_id = zernio_request_logs.organization_id AND om.user_id = auth.uid() AND (om.role = 'ADMIN' OR om.role = 'SUPER_ADMIN')
    ));
