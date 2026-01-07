-- Migration: Initial Schema Setup for Portfolio
-- Description: Creates tables for projects and blog posts, storage buckets, and RLS policies
-- Date: 2026-01-07

-- =========================================
-- 1. CREATE TABLES
-- =========================================

-- Table: projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client TEXT,
  year TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  challenge TEXT,
  solution TEXT,
  outcome TEXT,
  content TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL,
  read_time TEXT,
  image_url TEXT,
  author TEXT DEFAULT 'Meet Joshi',
  gallery_images TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. CREATE INDEXES
-- =========================================

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Indexes for blog_posts table
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);

-- =========================================
-- 3. CREATE TRIGGER FUNCTION
-- =========================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 4. CREATE TRIGGERS
-- =========================================

-- Trigger for projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for blog_posts table
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 6. CREATE RLS POLICIES
-- =========================================

-- Projects policies
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;
CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  USING (auth.role() = 'authenticated');

-- Blog posts policies
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blog_posts;
CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blog_posts;
CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blog_posts;
CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  USING (auth.role() = 'authenticated');

-- =========================================
-- 7. CREATE STORAGE BUCKETS
-- =========================================

-- Note: Storage buckets are typically created via Supabase Dashboard or API
-- The following SQL can be run manually in Supabase SQL Editor:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('project-images', 'project-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('blog-images', 'blog-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 8. STORAGE POLICIES (Run after creating buckets)
-- =========================================

-- Note: Run these commands in Supabase SQL Editor after creating storage buckets

-- CREATE POLICY "Public can view project images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'project-images');

-- CREATE POLICY "Public can view blog images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'blog-images');

-- CREATE POLICY "Authenticated users can upload project images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'project-images' AND
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Authenticated users can upload blog images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'blog-images' AND
--     auth.role() = 'authenticated'
--   );

-- =========================================
-- 9. SEED DATA (Optional - Sample Data)
-- =========================================

-- Insert sample projects
INSERT INTO projects (slug, title, client, year, description, category, technologies, image_url, challenge, solution, outcome, published)
VALUES
  (
    'nexus-ecommerce',
    'Nexus E-Commerce',
    'Nexus Retail Group',
    '2023',
    'A full-scale e-commerce platform featuring real-time inventory management, AI-driven product recommendations, and a seamless checkout experience.',
    'Web',
    ARRAY['Angular', 'Node.js', 'Stripe', 'Tailwind'],
    'https://picsum.photos/id/201/800/600',
    'Nexus needed to migrate from a legacy monolithic system to a microservices architecture without disrupting their 50k daily active users.',
    'We architected a headless solution using Angular for the storefront and Node.js for the backend services.',
    'Page load times dropped to 0.8s, conversion rates increased by 15% in the first quarter.',
    true
  ),
  (
    'fittrack-pro',
    'FitTrack Pro',
    'HealthCorp Inc.',
    '2023',
    'Mobile application for tracking fitness goals, visualizing workout progress, and connecting with personal trainers.',
    'Mobile',
    ARRAY['Flutter', 'Firebase', 'Dart'],
    'https://picsum.photos/id/73/800/600',
    'Users were abandoning existing fitness apps due to complex data entry and lack of visual progress indicators.',
    'We utilized Flutter to create a buttery-smooth cross-platform experience with custom gesture controls.',
    'The app achieved a 4.8-star rating on the App Store and user retention at day-30 is 40% higher than industry average.',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, date, category, read_time, image_url, author, published)
VALUES
  (
    'the-future-of-angular',
    'The Future of Angular: What v18+ Brings',
    'Exploring the new zoneless change detection, signal-based inputs, and how they revolutionize performance.',
    '<p>Angular has long been criticized for its reliance on Zone.js, a library that monkey-patches browser APIs to trigger change detection.</p><p>With the introduction of Signals and Zoneless change detection, Angular is entering a new era of performance.</p>',
    NOW() - INTERVAL '30 days',
    'Development',
    '5 min read',
    'https://picsum.photos/id/1/800/400',
    'Meet Joshi',
    true
  ),
  (
    'mastering-md3',
    'Mastering Material Design 3',
    'A deep dive into the tonal palettes, dynamic color systems, and elevation guides of MD3.',
    '<p>Material Design 3 (or Material You) is Google''s most expressive design system to date.</p><p>One of the key features is the dynamic color system, which extracts a color scheme from the user''s wallpaper.</p>',
    NOW() - INTERVAL '60 days',
    'Design',
    '7 min read',
    'https://picsum.photos/id/106/800/400',
    'Meet Joshi',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

-- To verify the migration, run:
-- SELECT * FROM projects;
-- SELECT * FROM blog_posts;
