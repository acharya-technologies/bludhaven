// /lib/export-sql.ts
import { getSupabaseClient } from "./supabase/client"

interface UserData {
  projects: any[]
  expenses: any[]
  installments: any[]
  profile: any
  user: any
}

export const exportUserDataAsSQL = async (userId: string): Promise<string> => {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      throw new Error("Unauthorized access")
    }

    // Fetch all user data
    const [profileRes, projectsRes, expensesRes, installmentsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      supabase
        .from('bludhaven_projects')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('bludhaven_expenses')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('bludhaven_installments')
        .select('*')
        .eq('user_id', userId)
    ])

    const userData: UserData = {
      profile: profileRes.data || null,
      projects: projectsRes.data || [],
      expenses: expensesRes.data || [],
      installments: installmentsRes.data || [],
      user: user
    }

    return generateSQLScript(userData)
  } catch (error: any) {
    console.error("Failed to export SQL:", error)
    throw new Error(error.message || "Failed to generate SQL export")
  }
}

const generateSQLScript = (userData: UserData): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const userName = userData.user.user_metadata?.full_name || 
                   userData.user.email?.split('@')[0] || 
                   'user_' + userData.user.id.substring(0, 8)
  
  const sqlHeader = `-- BLUDHAVEN DATABASE BACKUP SCRIPT
-- Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
-- User: ${userData.user.email}
-- User ID: ${userData.user.id}
-- Total Records: ${userData.projects.length + userData.expenses.length + userData.installments.length + 1}

-- ======================================================================
-- IMPORTANT: This script creates a COMPLETE DATABASE RECREATION for user
-- ======================================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.bludhaven_expenses CASCADE;
DROP TABLE IF EXISTS public.bludhaven_installments CASCADE;
DROP TABLE IF EXISTS public.bludhaven_projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ======================== TABLE CREATION ============================

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  user_id uuid,
  email text,
  name text,
  user_type text DEFAULT 'admin'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create projects table
CREATE TABLE public.bludhaven_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  leader text NOT NULL,
  contact text,
  status text NOT NULL DEFAULT 'enquiry'::text 
    CHECK (status = ANY (ARRAY['enquiry'::text, 'advance'::text, 'delivered'::text, 'archived'::text])),
  priority text NOT NULL DEFAULT 'medium'::text 
    CHECK (priority = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text])),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_hours integer DEFAULT 0,
  actual_hours integer DEFAULT 0,
  finalized_amount numeric DEFAULT 0.00,
  amount_received numeric DEFAULT 0.00,
  booking_date date,
  deadline date,
  tech_stack text[] DEFAULT '{}'::text[],
  resources text[] DEFAULT '{}'::text[],
  images text[] DEFAULT '{}'::text[],
  tags text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create installments table
CREATE TABLE public.bludhaven_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.bludhaven_projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  due_date date,
  paid_date date,
  status text DEFAULT 'pending'::text 
    CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.bludhaven_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  description text,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ======================== INSERT DATA ==============================

-- Insert profile data`

  // Generate INSERT statements
  let sqlInserts = ''

  // Insert profile
  if (userData.profile) {
    sqlInserts += `
INSERT INTO public.profiles (
  id, user_id, email, name, user_type, created_at, updated_at
) VALUES (
  '${userData.profile.id}',
  '${userData.profile.user_id || userData.user.id}',
  ${escapeString(userData.user.email)},
  ${escapeString(userData.profile.name || userData.user.user_metadata?.full_name || '')},
  ${escapeString(userData.profile.user_type || 'admin')},
  ${escapeTimestamp(userData.profile.created_at || userData.user.created_at)},
  ${escapeTimestamp(userData.profile.updated_at || userData.user.created_at)}
);`
  }

  // Insert projects
  if (userData.projects.length > 0) {
    sqlInserts += `

-- Insert project data (${userData.projects.length} projects)`
    
    userData.projects.forEach((project, index) => {
      sqlInserts += `
INSERT INTO public.bludhaven_projects (
  id, user_id, title, description, leader, contact, status, priority, progress,
  estimated_hours, actual_hours, finalized_amount, amount_received, booking_date,
  deadline, tech_stack, resources, images, tags, created_at, updated_at
) VALUES (
  '${project.id}',
  '${project.user_id}',
  ${escapeString(project.title)},
  ${escapeString(project.description || '')},
  ${escapeString(project.leader)},
  ${escapeString(project.contact || '')},
  ${escapeString(project.status)},
  ${escapeString(project.priority)},
  ${project.progress || 0},
  ${project.estimated_hours || 0},
  ${project.actual_hours || 0},
  ${project.finalized_amount || 0},
  ${project.amount_received || 0},
  ${project.booking_date ? `'${project.booking_date}'` : 'NULL'},
  ${project.deadline ? `'${project.deadline}'` : 'NULL'},
  ${escapeArray(project.tech_stack || [])},
  ${escapeArray(project.resources || [])},
  ${escapeArray(project.images || [])},
  ${escapeArray(project.tags || [])},
  ${escapeTimestamp(project.created_at)},
  ${escapeTimestamp(project.updated_at)}
);`
    })
  }

  // Insert installments
  if (userData.installments.length > 0) {
    sqlInserts += `

-- Insert installment data (${userData.installments.length} installments)`
    
    userData.installments.forEach((installment, index) => {
      sqlInserts += `
INSERT INTO public.bludhaven_installments (
  id, project_id, user_id, amount, due_date, paid_date, status, description, created_at, updated_at
) VALUES (
  '${installment.id}',
  ${installment.project_id ? `'${installment.project_id}'` : 'NULL'},
  '${installment.user_id}',
  ${installment.amount},
  ${installment.due_date ? `'${installment.due_date}'` : 'NULL'},
  ${installment.paid_date ? `'${installment.paid_date}'` : 'NULL'},
  ${escapeString(installment.status || 'pending')},
  ${escapeString(installment.description || '')},
  ${escapeTimestamp(installment.created_at)},
  ${escapeTimestamp(installment.updated_at)}
);`
    })
  }

  // Insert expenses
  if (userData.expenses.length > 0) {
    sqlInserts += `

-- Insert expense data (${userData.expenses.length} expenses)`
    
    userData.expenses.forEach((expense, index) => {
      sqlInserts += `
INSERT INTO public.bludhaven_expenses (
  id, user_id, category, amount, description, date, created_at, updated_at
) VALUES (
  '${expense.id}',
  '${expense.user_id}',
  ${escapeString(expense.category)},
  ${expense.amount},
  ${escapeString(expense.description || '')},
  '${expense.date}',
  ${escapeTimestamp(expense.created_at)},
  ${escapeTimestamp(expense.updated_at)}
);`
    })
  }

  const sqlFooter = `

-- ======================== DATABASE OPTIMIZATION =======================

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bludhaven_projects_user_id ON public.bludhaven_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_bludhaven_projects_status ON public.bludhaven_projects(status);
CREATE INDEX IF NOT EXISTS idx_bludhaven_installments_project_id ON public.bludhaven_installments(project_id);
CREATE INDEX IF NOT EXISTS idx_bludhaven_installments_status ON public.bludhaven_installments(status);
CREATE INDEX IF NOT EXISTS idx_bludhaven_installments_user_id ON public.bludhaven_installments(user_id);
CREATE INDEX IF NOT EXISTS idx_bludhaven_expenses_user_id ON public.bludhaven_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_bludhaven_expenses_date ON public.bludhaven_expenses(date);
CREATE INDEX IF NOT EXISTS idx_bludhaven_expenses_category ON public.bludhaven_expenses(category);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_bludhaven_projects_updated_at ON public.bludhaven_projects;
CREATE TRIGGER update_bludhaven_projects_updated_at 
  BEFORE UPDATE ON public.bludhaven_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bludhaven_installments_updated_at ON public.bludhaven_installments;
CREATE TRIGGER update_bludhaven_installments_updated_at 
  BEFORE UPDATE ON public.bludhaven_installments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bludhaven_expenses_updated_at ON public.bludhaven_expenses;
CREATE TRIGGER update_bludhaven_expenses_updated_at 
  BEFORE UPDATE ON public.bludhaven_expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your environment)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Summary of imported data
DO $$
DECLARE
    project_count integer;
    installment_count integer;
    expense_count integer;
    profile_count integer;
    total_amount_received numeric;
    total_expenses numeric;
    net_balance numeric;
BEGIN
    SELECT COUNT(*) INTO project_count FROM public.bludhaven_projects;
    SELECT COUNT(*) INTO installment_count FROM public.bludhaven_installments;
    SELECT COUNT(*) INTO expense_count FROM public.bludhaven_expenses;
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    
    SELECT COALESCE(SUM(amount_received), 0) INTO total_amount_received FROM public.bludhaven_projects;
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses FROM public.bludhaven_expenses;
    
    net_balance := total_amount_received - total_expenses;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'BLUDHAVEN DATABASE SUCCESSFULLY RESTORED';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'User: ${escapeSQLString(userData.user.email)}';
    RAISE NOTICE 'Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}';
    RAISE NOTICE '------------------------------------------------------------';
    RAISE NOTICE 'DATA SUMMARY:';
    RAISE NOTICE '- Profiles:        %', profile_count;
    RAISE NOTICE '- Projects:        %', project_count;
    RAISE NOTICE '- Installments:    %', installment_count;
    RAISE NOTICE '- Expenses:        %', expense_count;
    RAISE NOTICE '------------------------------------------------------------';
    RAISE NOTICE 'FINANCIAL SUMMARY:';
    RAISE NOTICE '- Total Received:  ₹%', total_amount_received;
    RAISE NOTICE '- Total Expenses:  ₹%', total_expenses;
    RAISE NOTICE '- Net Balance:     ₹%', net_balance;
    RAISE NOTICE '============================================================';
END $$;

-- To execute this script:
-- 1. Save as 'bludhaven_restore_${userName}_${timestamp}.sql'
-- 2. Run: psql -U your_username -d your_database -f filename.sql
-- 3. Or execute in pgAdmin / DBeaver query tool

-- ========================== END OF SCRIPT ============================`

  return sqlHeader + sqlInserts + sqlFooter
}

// Helper functions for SQL escaping
const escapeString = (str: string): string => {
  if (!str) return "''"
  // Escape single quotes by doubling them
  return `'${str.replace(/'/g, "''")}'`
}

const escapeSQLString = (str: string): string => {
  if (!str) return ''
  // For use in SQL comments/notices
  return str.replace(/'/g, "''")
}

const escapeArray = (arr: any[]): string => {
  if (!arr || arr.length === 0) return "'{}'::text[]"
  
  const escapedItems = arr.map(item => {
    if (typeof item === 'string') {
      return `"${item.replace(/"/g, '""')}"`
    }
    return `"${item}"`
  }).join(',')
  
  return `ARRAY[${escapedItems}]::text[]`
}

const escapeTimestamp = (timestamp: string): string => {
  if (!timestamp) return 'now()'
  return `'${timestamp}'::timestamptz`
}

// Function to trigger SQL download
export const downloadSQLExport = async (userId: string) => {
  try {
    const sql = await exportUserDataAsSQL(userId)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const userName = sql.match(/User: (.+)/)?.[1]?.split('@')[0] || 'user'
    
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `bludhaven_backup_${userName}_${timestamp}.sql`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error: any) {
    console.error("Download failed:", error)
    throw error
  }
}

// Optional: Add this to your existing handleExport function
export const handleExport = async (format: 'html' | 'pdf' | 'sql' = 'html') => {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Please login to export data")
      return
    }

    switch (format) {
      case 'html':
        // Your existing HTML export logic
        break
      case 'pdf':
        // Your existing PDF export logic
        break
      case 'sql':
        await downloadSQLExport(user.id)
        break
      default:
        throw new Error("Invalid export format")
    }
  } catch (error: any) {
    console.error("Export failed:", error)
    alert(error.message || "Failed to export data")
  }
}