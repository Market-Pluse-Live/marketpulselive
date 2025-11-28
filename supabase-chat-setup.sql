-- Chat Messages Table for Market Pulse Live
-- Run this in your Supabase SQL Editor

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    content TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by room
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security (but allow all operations for now)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read messages
CREATE POLICY "Anyone can read messages" ON messages
    FOR SELECT USING (true);

-- Policy to allow anyone to insert messages
CREATE POLICY "Anyone can insert messages" ON messages
    FOR INSERT WITH CHECK (true);

-- Policy to allow deletion (for admin moderation)
CREATE POLICY "Anyone can delete messages" ON messages
    FOR DELETE USING (true);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Optional: Clean up old messages (messages older than 24 hours)
-- You can run this periodically or set up a cron job
-- DELETE FROM messages WHERE created_at < NOW() - INTERVAL '24 hours';

