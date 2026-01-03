-- COMPLETE DATABASE RECREATION SCRIPT
-- This will DROP existing tables and RECREATE with all your data

-- Disable triggers and constraints temporarily
SET session_replication_role = 'replica';

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.bludhaven_expenses CASCADE;
DROP TABLE IF EXISTS public.bludhaven_installments CASCADE;
DROP TABLE IF EXISTS public.bludhaven_projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table (simplified without auth.users dependency for portability)
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

-- Enable triggers and constraints
SET session_replication_role = 'origin';

-- =================== INSERT ALL DATA ===================

-- Insert into profiles
INSERT INTO public.profiles (id, user_id, email, name, user_type, created_at, updated_at) VALUES
('45f6ea95-c19f-4b0b-8764-065f47746980', '45f6ea95-c19f-4b0b-8764-065f47746980', 'omkarkulkarni2025.comp@mmcoe.edu.in', 'Batman''s Greatest Failure', 'admin', '2025-11-14T17:38:19.707721+00:00', '2025-11-14T17:38:19.707721+00:00'),
('2bc2d328-dc91-4835-832e-ef8b208579ff', '2bc2d328-dc91-4835-832e-ef8b208579ff', 'jason@bludhaven.gov', 'Jason Todd', 'admin', '2025-11-14T19:21:22.688719+00:00', '2025-11-14T19:21:22.688719+00:00'),
('f42a5236-1256-4087-bea9-37f7852d7077', 'f42a5236-1256-4087-bea9-37f7852d7077', 'bairagdaraltamsh@gmail.com', 'Altamsh B', 'admin', '2025-11-16T14:32:44.521485+00:00', '2025-11-16T14:32:44.521485+00:00'),
('6308bb29-a4e5-46d0-af72-67e4228fe2b3', '6308bb29-a4e5-46d0-af72-67e4228fe2b3', 'patilonkar4408@gmail.com', 'Godlent', 'operator', '2025-12-09T18:04:03.463858+00:00', '2025-12-09T18:04:03.463858+00:00');

-- Insert into bludhaven_projects
INSERT INTO public.bludhaven_projects (
  id, user_id, title, description, leader, contact, status, priority, progress, 
  estimated_hours, actual_hours, finalized_amount, amount_received, booking_date, 
  deadline, tech_stack, resources, images, tags, created_at, updated_at
) VALUES 
('d5b5f022-345e-40fa-b87a-2c92a02ad5f0', '45f6ea95-c19f-4b0b-8764-065f47746980', 'NiftyGifts – Hand-Curated E-commerce Platform', 'NiftyGifts is a precision-built e-commerce platform focused on curated and personalized gifting experiences. Developed with Next.js, Supabase, and Tailwind CSS, it enables seamless management of products, secure payments via Razorpay, and a refined user interface. The objective is to bridge emotional gifting with modern technology, ensuring a premium, minimal, and efficient shopping experience', 'Sakshi Raut', '9561471307', 'advance', 'low', 100, 8, 8, 5000, 2000, '2025-10-21', '2025-12-31', ARRAY['Supabase','Razorpay','NextJS','ShadCN'], ARRAY['https://notepad.link/m1u6a','https://drive.proton.me/urls/21X3S18ATW#kLOrdHDoRxqH','https://notepad.link/sUt2u'], ARRAY['https://i.postimg.cc/Dzs2TjTm/image.png','https://i.postimg.cc/g0vP5xVX/image.png','https://i.postimg.cc/tC1ww1yZ/image.png','https://i.postimg.cc/zDQPCJht/image.png','https://i.postimg.cc/VsScQZBx/image.png','https://i.postimg.cc/J7Xd5fQH/image.png','https://i.postimg.cc/909S4SLq/image.png','https://i.postimg.cc/t4CMHDK1/image.png','https://i.postimg.cc/KYCqBbRY/image.png','https://i.postimg.cc/NfQN1pfD/image.png','https://i.postimg.cc/KjfDqhvr/image.png','https://i.postimg.cc/5tzqcC20/image.png'], ARRAY['Web App'], '2025-10-27T04:45:13.488443+00:00', '2025-11-30T21:46:02.915+00:00'),
('1237fb6e-5b7a-4566-be66-ba2606b9dfb2', '45f6ea95-c19f-4b0b-8764-065f47746980', 'AutoServe - Automotive Service Billing and Management System', 'A full-stack AutoServe platform to modernize garage billing, service tracking and customer communication. Developed with Next.js + Supabase. Features include inspection reports, automated estimates, technician assignment, real-time tracking and SMS/email notifications.', 'Shravani Pawar', '9356500692', 'advance', 'low', 90, 0, 0, 5000, 2000, '2025-10-20', '2025-12-31', ARRAY['NextJS','MySQL','Clerk','Twillio Whatsapp'], ARRAY['https://clerk.com/','https://twilio.com/user/account/phone-numbers/verified','https://shrib.com/#Graham6lOjqMb','https://drive.proton.me/urls/72YXD50ZM8#c6yl5qwf44ky'], ARRAY['https://i.postimg.cc/X7VN26YH/image.png','https://i.postimg.cc/q7ndJ174/image.png','https://i.postimg.cc/VLbD5vtZ/image.png','https://i.postimg.cc/cJTcPnq3/image.png','https://i.postimg.cc/v8CC0pLL/image.png','https://i.postimg.cc/X7w1QXv6/image.png','https://i.postimg.cc/Kz6Q5ySQ/image.png','https://i.postimg.cc/QNcqrwrZ/image.png','https://i.postimg.cc/J4xrSr6R/image.png'], ARRAY['Web'], '2025-10-27T04:46:52.777185+00:00', '2025-12-11T11:37:54.595+00:00'),
('2cc0a322-0326-4960-82bb-c08a276a267e', '45f6ea95-c19f-4b0b-8764-065f47746980', 'Smart Bluetooth Attendance System', 'The Smart Bluetooth Attendance System automatically records student attendance using Bluetooth technology — no manual marking required. When a class starts, the system detects nearby registered student devices and logs their attendance instantly', 'Pranjali Patil', '8421482544', 'advance', 'low', 50, 0, 0, 7000, 3000, '2025-10-26', '2025-12-31', ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], '2025-10-27T05:29:04.112772+00:00', '2025-11-02T07:39:41.334802+00:00'),
('85043431-cfb6-4ef6-b508-ca4e9ece40e0', '45f6ea95-c19f-4b0b-8764-065f47746980', 'AI powered multilingual content localization engine for skill courses', 'An AI-powered multilingual content localization engine that uses Gemini Translator to convert English skill course material into major Indian languages with adaptive tone control — from formal and technical to casual and conversational, ensuring accessibility and cultural relevance across diverse learners', 'Anjali Abhijit Shinde', '9209038933', 'advance', 'low', 10, 12, 0, 5000, 2000, '2025-10-31', '2025-12-31', ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], '2025-11-01T16:56:42.284399+00:00', '2025-11-30T21:46:46.262+00:00'),
('e02af494-3436-4bf5-ab3e-17dc24a11aa9', '45f6ea95-c19f-4b0b-8764-065f47746980', 'AutoAssure – Smart Car Resell Platform', 'AutoAssure is a full-stack car resell platform designed to make used-car buying and selling seamless, transparent, and secure. It combines live auctions, instant purchases, and AI-assisted recommendations into one platform. The system connects verified sellers and buyers with real-time updates and complete transaction flow — from car listing to ownership transfer.', 'Abhishek Kale', '9309801671', 'advance', 'low', 100, 0, 0, 5000, 2000, '2025-10-16', '2025-12-31', ARRAY['nextjs','supabase','gemini','socket io','2 roles rbac'], ARRAY['https://autoassure.vercel.app/'], ARRAY['https://i.postimg.cc/ydV84Fq5/Screenshot-2025-11-05-131948.png'], ARRAY['2 server'], '2025-11-02T07:57:54.864677+00:00', '2025-11-05T07:24:19.211039+00:00'),
('754cd6ca-6fe8-491c-8d4d-7e731cfa63b1', '45f6ea95-c19f-4b0b-8764-065f47746980', 'CrimeReport', 'Crime report: 2 roles (user,admin) Ai integration gemini flutter cloudinary supabase', 'Altamsh', 'altamsh', 'delivered', 'low', 100, 0, 0, 4000, 4000, '2025-10-10', '2025-12-31', ARRAY['Flutter','Gemini','Supabase','Cloudinary'], ARRAY['https://crime-report-beta.vercel.app/'], ARRAY[]::text[], ARRAY['Cross Platform'], '2025-11-03T08:54:47.261194+00:00', '2025-11-03T09:05:07.123087+00:00'),
('b591eccc-4b44-4549-b1f2-13e694ecfe17', '45f6ea95-c19f-4b0b-8764-065f47746980', 'WanderPlan - AI travel planner', 'WanderPlan is an AI-powered travel planner that generates personalized itineraries based on destination, preferences, and duration. It offers business and leisure travel modes, quick summaries, and real-time travel tips to help users plan efficiently', 'Vaishnavi Sagare', '1ndrajeet', 'delivered', 'low', 100, 0, 0, 3000, 3000, '2025-11-10', '2025-12-14', ARRAY['React','Gemini','Shadcn'], ARRAY['https://wanderplan-nu.vercel.app/','https://aistudio.google.com/app/api-keys','https://dashboard.clerk.com/','VITE_GEMINI_API_KEY, VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY'], ARRAY['https://i.postimg.cc/6qwLjPdk/Screenshot-2025-11-08-082753.png','https://i.postimg.cc/90Vt8kGK/Screenshot-2025-11-08-082841.png','https://i.postimg.cc/HsvXXnhp/Screenshot-2025-11-08-083017.png','https://i.postimg.cc/KvpBBjHb/Screenshot-2025-11-08-083036.png'], ARRAY['Web','Clerk'], '2025-11-05T08:52:15.578486+00:00', '2025-11-13T19:28:52.103+00:00'),
('ee98a811-c43a-4cff-b39e-07d0207b1fd4', '45f6ea95-c19f-4b0b-8764-065f47746980', 'VidSumm AI – System Specification', 'VidSumm AI (Student Mode) is a web application that converts videos into text and audio summaries. It supports local video uploads and YouTube links, generating AI-powered text summaries, interactive chat Q&A, quizzes, and downloadable PPTs and audio files. Built with Next.js, Tailwind CSS, FastAPI, Whisper, Gemini AI, and gTTS, it delivers fast, automated content summarization for students', 'Atharva Jadhav', '7385048302', 'delivered', 'critical', 100, 8, 16, 7000, 7000, '2025-11-11', '2025-11-17', ARRAY['FastAPi','Next.js','Whisper','Gemini AI','Docker'], ARRAY['https://drive.google.com/drive/folders/145UJEDpnWFp3oAKDRxbGfMl9UR5XtsRX?usp=drive_link','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= CLERK_SECRET_KEY=  DATABASE_URL=  NEXT_PUBLIC_GEMINI_API_KEY=  NEXT_PUBLIC_FASTAPI_URL='], ARRAY['https://i.postimg.cc/gJ3zjgbn/image.png'], ARRAY['Web','Video Summarization','AI','API'], '2025-11-11T11:26:48.193551+00:00', '2025-11-26T16:58:00.04+00:00'),
('9db4ad7b-4b3d-4089-8117-7facd16531bc', '45f6ea95-c19f-4b0b-8764-065f47746980', 'Poultry Management System', 'The Poultry Management System is a lightweight, fast, and minimal web application built to streamline day-to-day poultry farm operations. The system focuses on core features such as egg production tracking, vaccination scheduling, batch & flock management, customer and order records, and financial summaries — all delivered with a modern UI using Next.js and a secured REST API backed by MySQL. This MVP is optimized for low development cost while still maintaining professional quality and meeting all functional requirements.', 'Sneha Pawar', '9373208512', 'advance', 'low', 100, 16, 16, 5000, 2000, '2025-11-25', '2025-12-17', ARRAY['NextJs','Mysql','REST API'], ARRAY['https://notepad.link/QLnNf','https://poultry-management-system-sigma.vercel.app/','https://drive.proton.me/urls/X3HAJJE63W#cL9tRA5sZc1n'], ARRAY['https://i.postimg.cc/j5Z3J2m4/Next-js-Service-Management-2025-12-17-120453.png','https://i.postimg.cc/5yy751WK/Next-js-Service-Management-2025-12-17-120511.png','https://i.postimg.cc/DZBpb0H5/Next-js-Service-Management-2025-12-17-120536.png','https://i.postimg.cc/PxtFxY3v/Next-js-Service-Management-2025-12-17-120547.png'], ARRAY['Web','Management system'], '2025-11-25T15:19:32.627424+00:00', '2025-12-17T13:11:53.078+00:00');

-- Insert into bludhaven_installments
INSERT INTO public.bludhaven_installments (id, project_id, user_id, amount, due_date, paid_date, status, description, created_at, updated_at) VALUES
('c8f9bb91-bdf9-4248-a523-59cb8d98eed9', '1237fb6e-5b7a-4566-be66-ba2606b9dfb2', '45f6ea95-c19f-4b0b-8764-065f47746980', 2000, '2025-10-27', '2025-10-27', 'paid', 'Advance Paid', '2025-10-27T05:00:02.133179+00:00', '2025-10-27T05:25:27.431883+00:00'),
('50f3efea-f623-4830-839a-a9dd1bde940f', '1237fb6e-5b7a-4566-be66-ba2606b9dfb2', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-12-28', NULL, 'pending', 'Final Payment', '2025-10-27T05:23:26.062367+00:00', '2025-10-27T05:25:29.003866+00:00'),
('b293fcbd-97a6-48d9-8653-3d40a54f78ee', '2cc0a322-0326-4960-82bb-c08a276a267e', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-12-27', '2025-11-01', 'paid', 'Advance Payment', '2025-10-27T05:30:34.768416+00:00', '2025-11-01T16:54:35.107166+00:00'),
('bd6b3f84-3dbb-4716-8563-b06f2709e026', '2cc0a322-0326-4960-82bb-c08a276a267e', '45f6ea95-c19f-4b0b-8764-065f47746980', 4000, '2025-12-31', NULL, 'pending', 'Final Payment', '2025-10-27T05:30:54.536465+00:00', '2025-10-27T05:30:54.536465+00:00'),
('5618bbe5-20bb-4adb-af1f-cb70ba3f7be9', 'd5b5f022-345e-40fa-b87a-2c92a02ad5f0', '45f6ea95-c19f-4b0b-8764-065f47746980', 2000, '2025-10-23', '2025-10-27', 'paid', 'Advance Paid', '2025-10-27T05:32:04.135003+00:00', '2025-10-27T05:32:24.923078+00:00'),
('053fbb43-ee39-4ab4-ba56-2f8c0d6e02c9', 'd5b5f022-345e-40fa-b87a-2c92a02ad5f0', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-12-30', NULL, 'pending', 'Final Payment', '2025-10-27T05:32:22.361184+00:00', '2025-10-27T05:32:22.361184+00:00'),
('e0b2de02-c0c0-4f10-9935-5fc58210f7b5', '85043431-cfb6-4ef6-b508-ca4e9ece40e0', '45f6ea95-c19f-4b0b-8764-065f47746980', 2000, '2025-11-02', '2025-11-02', 'paid', 'Advance', '2025-11-01T16:58:42.37434+00:00', '2025-11-02T07:47:11.495973+00:00'),
('9ad4b38a-cbe9-4814-8c9a-ccbb414eecfc', '85043431-cfb6-4ef6-b508-ca4e9ece40e0', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-12-31', NULL, 'pending', 'Final Payment', '2025-11-01T16:58:54.991552+00:00', '2025-11-01T16:58:54.991552+00:00'),
('adedffd1-e3fa-4d55-a58c-2a829a44b3d0', 'e02af494-3436-4bf5-ab3e-17dc24a11aa9', '45f6ea95-c19f-4b0b-8764-065f47746980', 2000, '2025-10-21', '2025-11-04', 'paid', 'Advance', '2025-11-02T07:58:44.321058+00:00', '2025-11-04T09:22:35.052439+00:00'),
('1e386642-d5df-469e-b6db-0df74ffe0c96', 'e02af494-3436-4bf5-ab3e-17dc24a11aa9', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-12-31', NULL, 'pending', 'Final Payment', '2025-11-02T07:58:59.253211+00:00', '2025-11-02T07:58:59.253211+00:00'),
('5efada41-02bd-4dda-a054-6e1e019dce21', '754cd6ca-6fe8-491c-8d4d-7e731cfa63b1', '45f6ea95-c19f-4b0b-8764-065f47746980', 4000, '2025-12-03', '2025-11-03', 'paid', 'Full Payment (single serve)', '2025-11-03T08:56:03.642018+00:00', '2025-11-03T08:57:00.418489+00:00'),
('5585f485-0fc6-430a-9ef1-e2c346097b04', 'ee98a811-c43a-4cff-b39e-07d0207b1fd4', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-11-12', '2025-11-13', 'paid', 'Advance', '2025-11-11T11:30:12.469905+00:00', '2025-11-11T11:30:12.469905+00:00'),
('ba6f68a0-77b1-42bb-a723-8ca1657648da', 'b591eccc-4b44-4549-b1f2-13e694ecfe17', '45f6ea95-c19f-4b0b-8764-065f47746980', 1500, '2025-11-14', '2025-11-13', 'paid', 'Advance', '2025-11-13T15:03:07.179262+00:00', '2025-11-13T15:03:07.179262+00:00'),
('2467eaf6-cb1d-42a7-b6e3-9c9fa01f2548', 'b591eccc-4b44-4549-b1f2-13e694ecfe17', '45f6ea95-c19f-4b0b-8764-065f47746980', 1500, '2025-12-14', '2025-11-13', 'paid', 'Final', '2025-11-13T15:03:30.393178+00:00', '2025-11-13T15:03:30.393178+00:00'),
('ccf4bb81-a82c-466b-b2c3-9193c855f180', 'ee98a811-c43a-4cff-b39e-07d0207b1fd4', '45f6ea95-c19f-4b0b-8764-065f47746980', 4000, '2025-11-17', '2025-11-29', 'paid', 'Final Payment', '2025-11-21T20:21:04.170451+00:00', '2025-11-21T20:21:04.170451+00:00'),
('34f4d160-42d3-48b0-a27f-6e5871238e4a', '9db4ad7b-4b3d-4089-8117-7facd16531bc', '45f6ea95-c19f-4b0b-8764-065f47746980', 2000, '2025-11-26', '2025-11-27', 'paid', 'Advance', '2025-11-25T15:21:47.285494+00:00', '2025-11-25T15:21:47.285494+00:00'),
('89746c32-31de-4ba3-a3d5-1ce1efb3682d', '9db4ad7b-4b3d-4089-8117-7facd16531bc', '45f6ea95-c19f-4b0b-8764-065f47746980', 3000, '2025-12-31', NULL, 'pending', 'Final payment', '2025-11-25T15:22:08.825426+00:00', '2025-11-25T15:22:08.825426+00:00');

-- Insert into bludhaven_expenses
INSERT INTO public.bludhaven_expenses (id, user_id, category, amount, description, date, created_at, updated_at) VALUES
('6be413c8-dfd0-4ea6-b376-1c65c5c1615a', '45f6ea95-c19f-4b0b-8764-065f47746980', 'other', 4000, 'Course', '2025-12-09', '2025-12-09T17:42:41.412261+00:00', '2025-12-09T17:42:41.412261+00:00');

-- Create indexes for better performance
CREATE INDEX idx_bludhaven_projects_user_id ON public.bludhaven_projects(user_id);
CREATE INDEX idx_bludhaven_projects_status ON public.bludhaven_projects(status);
CREATE INDEX idx_bludhaven_installments_project_id ON public.bludhaven_installments(project_id);
CREATE INDEX idx_bludhaven_installments_status ON public.bludhaven_installments(status);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_bludhaven_projects_updated_at BEFORE UPDATE ON public.bludhaven_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bludhaven_installments_updated_at BEFORE UPDATE ON public.bludhaven_installments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bludhaven_expenses_updated_at BEFORE UPDATE ON public.bludhaven_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Summary of inserted data
DO $$
DECLARE
    project_count integer;
    installment_count integer;
    expense_count integer;
    profile_count integer;
BEGIN
    SELECT COUNT(*) INTO project_count FROM public.bludhaven_projects;
    SELECT COUNT(*) INTO installment_count FROM public.bludhaven_installments;
    SELECT COUNT(*) INTO expense_count FROM public.bludhaven_expenses;
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    
    RAISE NOTICE 'Database successfully recreated with:';
    RAISE NOTICE '- % projects', project_count;
    RAISE NOTICE '- % installments', installment_count;
    RAISE NOTICE '- % expenses', expense_count;
    RAISE NOTICE '- % profiles', profile_count;
    RAISE NOTICE 'Total: % records', project_count + installment_count + expense_count + profile_count;
END $$;


-- Add daily logs table for the tracker
CREATE TABLE public.bludhaven_daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Execution metrics
  hours_worked numeric DEFAULT 0 CHECK (hours_worked >= 0 AND hours_worked <= 24),
  learned_something boolean DEFAULT false,
  wrote_code boolean DEFAULT false,
  committed_pushed boolean DEFAULT false,
  deployed_shipped boolean DEFAULT false,
  
  -- Execution details
  what_shipped text,
  notes text,
  commit_count integer DEFAULT 0,
  
  -- Flags
  is_completed boolean DEFAULT false,
  is_missed boolean DEFAULT false,
  
  -- Constraints
  UNIQUE(user_id, log_date),
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_bludhaven_daily_logs_user_id_date ON public.bludhaven_daily_logs(user_id, log_date);
CREATE INDEX idx_bludhaven_daily_logs_is_completed ON public.bludhaven_daily_logs(is_completed);
CREATE INDEX idx_bludhaven_daily_logs_is_missed ON public.bludhaven_daily_logs(is_missed);

-- Trigger for updated_at
CREATE TRIGGER update_bludhaven_daily_logs_updated_at 
  BEFORE UPDATE ON public.bludhaven_daily_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid uuid)
RETURNS TABLE (
  current_streak integer,
  longest_streak integer,
  total_missed_days integer,
  total_days_executed integer,
  total_hours_logged numeric,
  execution_rate numeric
) AS $$
DECLARE
  streak_count integer := 0;
  max_streak integer := 0;
  temp_streak integer := 0;
  prev_date date;
  curr_date date;
  missed_counter integer := 0;
  executed_counter integer := 0;
  total_hours numeric := 0;
  total_days integer;
BEGIN
  -- Count executed days and hours
  SELECT 
    COUNT(*),
    COALESCE(SUM(hours_worked), 0)
  INTO executed_counter, total_hours
  FROM bludhaven_daily_logs 
  WHERE user_id = user_uuid 
    AND is_completed = true;

  -- Count missed days
  SELECT COUNT(*)
  INTO missed_counter
  FROM bludhaven_daily_logs 
  WHERE user_id = user_uuid 
    AND is_missed = true;

  -- Calculate streaks
  FOR curr_date IN
    SELECT DISTINCT log_date
    FROM bludhaven_daily_logs
    WHERE user_id = user_uuid
    ORDER BY log_date DESC
  LOOP
    IF EXISTS (
      SELECT 1 FROM bludhaven_daily_logs
      WHERE user_id = user_uuid 
        AND log_date = curr_date 
        AND is_completed = true
        AND hours_worked >= 3
        AND (learned_something = true OR wrote_code = true OR committed_pushed = true)
    ) THEN
      IF prev_date IS NULL OR prev_date - curr_date = 1 THEN
        temp_streak := temp_streak + 1;
      ELSE
        temp_streak := 1;
      END IF;
      
      IF streak_count = 0 THEN
        streak_count := temp_streak;
      END IF;
      
      IF temp_streak > max_streak THEN
        max_streak := temp_streak;
      END IF;
    ELSE
      EXIT;
    END IF;
    
    prev_date := curr_date;
  END LOOP;

  -- Calculate execution rate (last 30 days)
  SELECT COUNT(*) INTO total_days
  FROM generate_series(
    CURRENT_DATE - 30,
    CURRENT_DATE - 1,
    '1 day'::interval
  ) as day
  WHERE EXISTS (
    SELECT 1 FROM bludhaven_daily_logs
    WHERE user_id = user_uuid 
      AND log_date = day::date 
      AND is_completed = true
  );

  RETURN QUERY SELECT
    streak_count,
    max_streak,
    missed_counter,
    executed_counter,
    total_hours,
    ROUND((total_days::numeric / 30) * 100, 1);
END;
$$ LANGUAGE plpgsql;