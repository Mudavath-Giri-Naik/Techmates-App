-- Create enum for post types
CREATE TYPE post_type AS ENUM ('normal', 'opportunity', 'event', 'competition', 'achievement', 'hackathon');

-- Create Posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type post_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Time-based fields
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Opportunity fields
    company TEXT,
    role TEXT,
    requirements TEXT[],
    location TEXT,
    salary TEXT,
    application_link TEXT,
    
    -- Event fields
    venue TEXT,
    organizer TEXT,
    registration_link TEXT,
    max_participants INTEGER,
    
    -- Competition fields
    prize TEXT,
    rules TEXT[],
    
    -- Hackathon fields
    theme TEXT,
    technologies TEXT[],
    
    -- Achievement fields
    category TEXT,
    achievement_date TIMESTAMP WITH TIME ZONE,
    achievement_link TEXT
);

-- Create Likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    likes_count INTEGER DEFAULT 0
);

-- Create Comment Likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- Create Shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Views table
CREATE TABLE IF NOT EXISTS public.views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create RLS policies for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow users to read all posts
CREATE POLICY "Allow users to read all posts"
    ON public.posts
    FOR SELECT
    USING (true);

-- Allow authenticated users to create posts
CREATE POLICY "Allow authenticated users to create posts"
    ON public.posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update their own posts"
    ON public.posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts"
    ON public.posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all likes"
    ON public.likes
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create likes"
    ON public.likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes"
    ON public.likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all comments"
    ON public.comments
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create comments"
    ON public.comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments"
    ON public.comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments"
    ON public.comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for comment likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all comment likes"
    ON public.comment_likes
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create comment likes"
    ON public.comment_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comment likes"
    ON public.comment_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for shares
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all shares"
    ON public.shares
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create shares"
    ON public.shares
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for views
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all views"
    ON public.views
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create views"
    ON public.views
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'likes' THEN
            UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'shares' THEN
            UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'likes' THEN
            UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'shares' THEN
            UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for post counts
CREATE TRIGGER update_post_likes_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_post_comments_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_post_shares_count
    AFTER INSERT OR DELETE ON shares
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

-- Create function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for comment likes count
CREATE TRIGGER update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_count(); 