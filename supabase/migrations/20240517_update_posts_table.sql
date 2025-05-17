-- Create post_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('normal', 'opportunity', 'event', 'competition', 'achievement', 'hackathon');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraint to posts table
ALTER TABLE public.posts
ADD CONSTRAINT fk_posts_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add default values for counts
ALTER TABLE public.posts
ALTER COLUMN likes_count SET DEFAULT 0,
ALTER COLUMN comments_count SET DEFAULT 0,
ALTER COLUMN shares_count SET DEFAULT 0;

-- Add NOT NULL constraints for required fields
ALTER TABLE public.posts
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- Add check constraints for post types
ALTER TABLE public.posts
ADD CONSTRAINT check_post_type
CHECK (type IN ('normal', 'opportunity', 'event', 'competition', 'achievement', 'hackathon'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(type);

-- Add RLS policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy for reading posts (anyone can read)
CREATE POLICY "Anyone can read posts"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- Policy for creating posts (authenticated users only)
CREATE POLICY "Authenticated users can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for updating posts (only post owner)
CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting posts (only post owner)
CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 