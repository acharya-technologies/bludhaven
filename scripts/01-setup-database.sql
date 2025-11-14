-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.bludhaven_installments;
DROP TABLE IF EXISTS public.bludhaven_projects;

-- Create projects table
CREATE TABLE public.bludhaven_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  leader TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'enquiry' CHECK (status IN ('enquiry', 'advance', 'delivered', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_hours INTEGER DEFAULT 0,
  actual_hours INTEGER DEFAULT 0,
  finalized_amount DECIMAL(12,2) DEFAULT 0.00,
  amount_received DECIMAL(12,2) DEFAULT 0.00,
  booking_date DATE,
  deadline DATE,
  tech_stack TEXT[] DEFAULT '{}',
  resources TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create installments table
CREATE TABLE public.bludhaven_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.bludhaven_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert projects data
INSERT INTO public.bludhaven_projects (
  id, user_id, title, description, leader, contact, status, priority, progress, 
  estimated_hours, actual_hours, finalized_amount, amount_received, booking_date, 
  deadline, tech_stack, resources, images, tags, created_at, updated_at
) VALUES 
(
  '5e2c3ad3-22b7-4851-9530-55b37d1f8867',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'AcadX – Next-Gen Attendance Management System',
  'AcadX is a modern web-based attendance management system developed using Next.js and PostgreSQL. It streamlines attendance tracking for students, teachers, and administrators through real-time data updates, role-based dashboards, and automated parent notifications using Twilio SMS API. The system reduces manual workload by over 75%, enhances communication, and ensures accurate reporting with a scalable, secure architecture deployed on Vercel. Designed for educational institutions seeking digital transformation in attendance management',
  'Aditya Suryavanshi',
  '9970587607',
  'archived',
  'low',
  0,
  0,
  0,
  '5000.00',
  '0.00',
  '2025-12-23',
  '2025-12-31',
  '{}',
  '{}',
  '{}',
  '{}',
  '2025-10-27 06:09:37.536964+00',
  '2025-11-04 11:51:17.567493+00'
),
(
  'e02af494-3436-4bf5-ab3e-17dc24a11aa9',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'AutoAssure – Smart Car Resell Platform',
  'AutoAssure is a full-stack car resell platform designed to make used-car buying and selling seamless, transparent, and secure. It combines live auctions, instant purchases, and AI-assisted recommendations into one platform. The system connects verified sellers and buyers with real-time updates and complete transaction flow — from car listing to ownership transfer.',
  'Abhishek Kale',
  '9309801671',
  'advance',
  'low',
  100,
  0,
  0,
  '5000.00',
  '2000.00',
  '2025-10-16',
  '2025-12-31',
  '{"nextjs","supabase","gemini","socket io","2 roles rbac"}',
  '{"https://autoassure.vercel.app/"}',
  '{"https://i.postimg.cc/ydV84Fq5/Screenshot-2025-11-05-131948.png"}',
  '{"2 server"}',
  '2025-11-02 07:57:54.864677+00',
  '2025-11-05 07:24:19.211039+00'
),
(
  '754cd6ca-6fe8-491c-8d4d-7e731cfa63b1',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'CrimeReport',
  'Crime report: 2 roles (user,admin) Ai integration gemini flutter cloudinary supabase',
  'Altamsh',
  'altamsh',
  'delivered',
  'low',
  100,
  0,
  0,
  '4000.00',
  '4000.00',
  '2025-10-10',
  '2025-12-31',
  '{"Flutter","Gemini","Supabase","Cloudinary"}',
  '{"https://crime-report-beta.vercel.app/"}',
  '{}',
  '{"Cross Platform"}',
  '2025-11-03 08:54:47.261194+00',
  '2025-11-03 09:05:07.123087+00'
),
(
  '2cc0a322-0326-4960-82bb-c08a276a267e',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'Smart Bluetooth Attendance System',
  'The Smart Bluetooth Attendance System automatically records student attendance using Bluetooth technology — no manual marking required. When a class starts, the system detects nearby registered student devices and logs their attendance instantly',
  'Pranjali Patil',
  '8421482544',
  'advance',
  'low',
  50,
  0,
  0,
  '7000.00',
  '3000.00',
  '2025-10-26',
  '2025-12-31',
  '{}',
  '{}',
  '{}',
  '{}',
  '2025-10-27 05:29:04.112772+00',
  '2025-11-02 07:39:41.334802+00'
),
(
  '1237fb6e-5b7a-4566-be66-ba2606b9dfb2',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'AutoServe - Automotive Service Billing and Management System',
  'A full-stack AutoServe platform to modernize garage billing, service tracking and customer communication. Developed with Next.js + Supabase. Features include inspection reports, automated estimates, technician assignment, real-time tracking and SMS/email notifications.',
  'Shravani Pawar',
  '9356500692',
  'advance',
  'low',
  0,
  0,
  0,
  '5000.00',
  '2000.00',
  '2025-10-20',
  '2025-12-31',
  '{}',
  '{}',
  '{}',
  '{}',
  '2025-10-27 04:46:52.777185+00',
  '2025-10-27 05:26:52.333617+00'
),
(
  '85043431-cfb6-4ef6-b508-ca4e9ece40e0',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'AI powered multilingual content localization engine for skill courses',
  'An AI-powered multilingual content localization engine that uses Gemini Translator to convert English skill course material into major Indian languages with adaptive tone control — from formal and technical to casual and conversational, ensuring accessibility and cultural relevance across diverse learners',
  'Anjali Abhijit Shinde',
  '9209038933',
  'advance',
  'low',
  100,
  12,
  0,
  '5000.00',
  '2000.00',
  '2025-10-31',
  '2025-12-31',
  '{}',
  '{}',
  '{}',
  '{}',
  '2025-11-01 16:56:42.284399+00',
  '2025-11-02 07:47:11.495973+00'
),
(
  'd5b5f022-345e-40fa-b87a-2c92a02ad5f0',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'NiftyGifts – Hand-Curated E-commerce Platform',
  'NiftyGifts is a precision-built e-commerce platform focused on curated and personalized gifting experiences. Developed with Next.js, Supabase, and Tailwind CSS, it enables seamless management of products, secure payments via Razorpay, and a refined user interface. The objective is to bridge emotional gifting with modern technology, ensuring a premium, minimal, and efficient shopping experience',
  'Sakshi Raut',
  '9561471307',
  'advance',
  'low',
  100,
  8,
  8,
  '5000.00',
  '2000.00',
  '2025-10-21',
  '2025-12-31',
  '{"Supabase"}',
  '{}',
  '{}',
  '{}',
  '2025-10-27 04:45:13.488443+00',
  '2025-11-13 15:34:56.12+00'
),
(
  'b591eccc-4b44-4549-b1f2-13e694ecfe17',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'WanderPlan - AI travel planner',
  'WanderPlan is an AI-powered travel planner that generates personalized itineraries based on destination, preferences, and duration. It offers business and leisure travel modes, quick summaries, and real-time travel tips to help users plan efficiently',
  'Vaishnavi Sagare',
  '1ndrajeet',
  'delivered',
  'low',
  100,
  0,
  0,
  '3000.00',
  '3000.00',
  '2025-11-10',
  '2025-12-14',
  '{"React","Gemini","Shadcn"}',
  '{"https://wanderplan-nu.vercel.app/","https://aistudio.google.com/app/api-keys","https://dashboard.clerk.com/","VITE_GEMINI_API_KEY, VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY"}',
  '{"https://i.postimg.cc/6qwLjPdk/Screenshot-2025-11-08-082753.png","https://i.postimg.cc/90Vt8kGK/Screenshot-2025-11-08-082841.png","https://i.postimg.cc/HsvXXnhp/Screenshot-2025-11-08-083017.png","https://i.postimg.cc/KvpBBjHb/Screenshot-2025-11-08-083036.png"}',
  '{"Web","Clerk"}',
  '2025-11-05 08:52:15.578486+00',
  '2025-11-13 19:28:52.103+00'
),
(
  'ee98a811-c43a-4cff-b39e-07d0207b1fd4',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  'VidSumm AI – System Specification',
  'VidSumm AI (Student Mode) is a web application that converts videos into text and audio summaries. It supports local video uploads and YouTube links, generating AI-powered text summaries, interactive chat Q&A, quizzes, and downloadable PPTs and audio files. Built with Next.js, Tailwind CSS, FastAPI, Whisper, Gemini AI, and gTTS, it delivers fast, automated content summarization for students',
  'Atharva Jadhav',
  '7385048302',
  'advance',
  'critical',
  10,
  0,
  0,
  '7000.00',
  '3000.00',
  '2025-11-11',
  '2025-11-17',
  '{"FastAPi","Next.js","Whisper","Gemini AI","Docker"}',
  '{}',
  '{}',
  '{"Web","Video Summarization","AI","API"}',
  '2025-11-11 11:26:48.193551+00',
  '2025-11-13 19:05:52.181+00'
),
(
  '01b10066-a93a-4fa2-a427-264462f287a3',
  'e20b3d8d-9276-4a2a-a591-2f7f40d2c242',
  'Demo',
  '',
  'Demo',
  'Demo',
  'enquiry',
  'medium',
  0,
  0,
  0,
  '0.00',
  '0.00',
  NULL,
  NULL,
  '{}',
  '{}',
  '{}',
  '{}',
  '2025-11-14 16:10:40.735462+00',
  '2025-11-14 16:10:40.735462+00'
);

-- Insert installments data
INSERT INTO public.bludhaven_installments (
  id, project_id, user_id, amount, due_date, paid_date, status, description, created_at, updated_at
) VALUES 
(
  'c8f9bb91-bdf9-4248-a523-59cb8d98eed9',
  '1237fb6e-5b7a-4566-be66-ba2606b9dfb2',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '2000.00',
  '2025-10-27',
  '2025-10-27',
  'paid',
  'Advance Paid',
  '2025-10-27 05:00:02.133179+00',
  '2025-10-27 05:25:27.431883+00'
),
(
  '50f3efea-f623-4830-839a-a9dd1bde940f',
  '1237fb6e-5b7a-4566-be66-ba2606b9dfb2',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-12-28',
  NULL,
  'pending',
  'Final Payment',
  '2025-10-27 05:23:26.062367+00',
  '2025-10-27 05:25:29.003866+00'
),
(
  'bd6b3f84-3dbb-4716-8563-b06f2709e026',
  '2cc0a322-0326-4960-82bb-c08a276a267e',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '4000.00',
  '2025-12-31',
  NULL,
  'pending',
  'Final Payment',
  '2025-10-27 05:30:54.536465+00',
  '2025-10-27 05:30:54.536465+00'
),
(
  '053fbb43-ee39-4ab4-ba56-2f8c0d6e02c9',
  'd5b5f022-345e-40fa-b87a-2c92a02ad5f0',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-12-30',
  NULL,
  'pending',
  'Final Payment',
  '2025-10-27 05:32:22.361184+00',
  '2025-10-27 05:32:22.361184+00'
),
(
  '5618bbe5-20bb-4adb-af1f-cb70ba3f7be9',
  'd5b5f022-345e-40fa-b87a-2c92a02ad5f0',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '2000.00',
  '2025-10-23',
  '2025-10-27',
  'paid',
  'Advance Paid',
  '2025-10-27 05:32:04.135003+00',
  '2025-10-27 05:32:24.923078+00'
),
(
  '6f5992e5-2a7e-42da-92c2-1f91003248fa',
  '5e2c3ad3-22b7-4851-9530-55b37d1f8867',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '2000.00',
  '2025-12-27',
  NULL,
  'pending',
  'Advance',
  '2025-10-27 06:15:20.367721+00',
  '2025-10-27 06:15:20.367721+00'
),
(
  '9d81897a-7b9c-4b81-ba19-109e5fffe544',
  '5e2c3ad3-22b7-4851-9530-55b37d1f8867',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-12-27',
  NULL,
  'pending',
  'Final Payment',
  '2025-10-27 06:15:38.972504+00',
  '2025-10-27 06:15:38.972504+00'
),
(
  'b293fcbd-97a6-48d9-8653-3d40a54f78ee',
  '2cc0a322-0326-4960-82bb-c08a276a267e',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-12-27',
  '2025-11-01',
  'paid',
  'Advance Payment',
  '2025-10-27 05:30:34.768416+00',
  '2025-11-01 16:54:35.107166+00'
),
(
  '9ad4b38a-cbe9-4814-8c9a-ccbb414eecfc',
  '85043431-cfb6-4ef6-b508-ca4e9ece40e0',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-12-31',
  NULL,
  'pending',
  'Final Payment',
  '2025-11-01 16:58:54.991552+00',
  '2025-11-01 16:58:54.991552+00'
),
(
  'e0b2de02-c0c0-4f10-9935-5fc58210f7b5',
  '85043431-cfb6-4ef6-b508-ca4e9ece40e0',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '2000.00',
  '2025-11-02',
  '2025-11-02',
  'paid',
  'Advance',
  '2025-11-01 16:58:42.37434+00',
  '2025-11-02 07:47:11.495973+00'
),
(
  '1e386642-d5df-469e-b6db-0df74ffe0c96',
  'e02af494-3436-4bf5-ab3e-17dc24a11aa9',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-12-31',
  NULL,
  'pending',
  'Final Payment',
  '2025-11-02 07:58:59.253211+00',
  '2025-11-02 07:58:59.253211+00'
),
(
  '5efada41-02bd-4dda-a054-6e1e019dce21',
  '754cd6ca-6fe8-491c-8d4d-7e731cfa63b1',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '4000.00',
  '2025-12-03',
  '2025-11-03',
  'paid',
  'Full Payment (single serve)',
  '2025-11-03 08:56:03.642018+00',
  '2025-11-03 08:57:00.418489+00'
),
(
  'adedffd1-e3fa-4d55-a58c-2a829a44b3d0',
  'e02af494-3436-4bf5-ab3e-17dc24a11aa9',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '2000.00',
  '2025-10-21',
  '2025-11-04',
  'paid',
  'Advance',
  '2025-11-02 07:58:44.321058+00',
  '2025-11-04 09:22:35.052439+00'
),
(
  '7de512a3-be4d-4f61-a639-7adea6afe5b8',
  'ee98a811-c43a-4cff-b39e-07d0207b1fd4',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '4000.00',
  '2025-11-17',
  NULL,
  'pending',
  'Final',
  '2025-11-11 11:30:28.060504+00',
  '2025-11-11 11:30:28.060504+00'
),
(
  '5585f485-0fc6-430a-9ef1-e2c346097b04',
  'ee98a811-c43a-4cff-b39e-07d0207b1fd4',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '3000.00',
  '2025-11-12',
  '2025-11-13',
  'paid',
  'Advance',
  '2025-11-11 11:30:12.469905+00',
  '2025-11-11 11:30:12.469905+00'
),
(
  'ba6f68a0-77b1-42bb-a723-8ca1657648da',
  'b591eccc-4b44-4549-b1f2-13e694ecfe17',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '1500.00',
  '2025-11-14',
  '2025-11-13',
  'paid',
  'Advance',
  '2025-11-13 15:03:07.179262+00',
  '2025-11-13 15:03:07.179262+00'
),
(
  '2467eaf6-cb1d-42a7-b6e3-9c9fa01f2548',
  'b591eccc-4b44-4549-b1f2-13e694ecfe17',
  '45f6ea95-c19f-4b0b-8764-065f47746980',
  '1500.00',
  '2025-12-14',
  '2025-11-13',
  'paid',
  'Final',
  '2025-11-13 15:03:30.393178+00',
  '2025-11-13 15:03:30.393178+00'
);

-- Enable Row Level Security
ALTER TABLE public.bludhaven_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bludhaven_installments ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" ON public.bludhaven_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.bludhaven_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.bludhaven_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.bludhaven_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for installments
CREATE POLICY "Users can view their own installments" ON public.bludhaven_installments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installments" ON public.bludhaven_installments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installments" ON public.bludhaven_installments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installments" ON public.bludhaven_installments
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_bludhaven_projects_user_id ON public.bludhaven_projects(user_id);
CREATE INDEX idx_bludhaven_projects_status ON public.bludhaven_projects(status);
CREATE INDEX idx_bludhaven_projects_priority ON public.bludhaven_projects(priority);
CREATE INDEX idx_bludhaven_installments_project_id ON public.bludhaven_installments(project_id);
CREATE INDEX idx_bludhaven_installments_user_id ON public.bludhaven_installments(user_id);
CREATE INDEX idx_bludhaven_installments_status ON public.bludhaven_installments(status);
CREATE INDEX idx_bludhaven_installments_due_date ON public.bludhaven_installments(due_date);


ALTER TABLE public.bludhaven_projects REPLICA IDENTITY FULL;
ALTER TABLE public.bludhaven_installments REPLICA IDENTITY FULL;