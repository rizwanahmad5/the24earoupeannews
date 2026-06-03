-- Add 'pending_review' to article_status enum
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'pending_review';

-- Add post_limit column to user_roles (NULL = unlimited)
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS post_limit integer DEFAULT NULL;
