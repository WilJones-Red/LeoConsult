-- Table to track all chatbot interactions for analytics and improvement
CREATE TABLE IF NOT EXISTS chat_logs (
    id BIGSERIAL PRIMARY KEY,
    user_query TEXT NOT NULL,
    matched_question TEXT,
    bot_response TEXT NOT NULL,
    confidence_score FLOAT,
    predicted_intent TEXT,
    user_feedback INTEGER, -- 1 for thumbs up, -1 for thumbs down, null for no feedback
    session_id TEXT, -- Track conversation sessions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries on analytics
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_confidence ON chat_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_chat_logs_feedback ON chat_logs(user_feedback);

-- View for low-confidence queries (questions the bot struggled with)
CREATE OR REPLACE VIEW low_confidence_queries AS
SELECT 
    id,
    user_query,
    bot_response,
    confidence_score,
    created_at
FROM chat_logs
WHERE confidence_score < 0.6
ORDER BY created_at DESC;

-- View for analytics dashboard
CREATE OR REPLACE VIEW chat_analytics AS
SELECT 
    COUNT(*) as total_queries,
    AVG(confidence_score) as avg_confidence,
    COUNT(CASE WHEN user_feedback = 1 THEN 1 END) as positive_feedback,
    COUNT(CASE WHEN user_feedback = -1 THEN 1 END) as negative_feedback,
    COUNT(CASE WHEN confidence_score < 0.6 THEN 1 END) as low_confidence_count
FROM chat_logs;

COMMENT ON TABLE chat_logs IS 'Logs all chatbot interactions for analytics and continuous improvement';
