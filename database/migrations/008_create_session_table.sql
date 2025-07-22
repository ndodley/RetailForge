CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",   -- The session ID (unique identifier for each session)
    "sess" json NOT NULL,                       -- The session data, stored as JSON (contains user info, etc.)
    "expire" timestamp(6) NOT NULL              -- The expiration date/time for the session
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");  -- Makes 'sid' the primary key

CREATE INDEX "IDX_session_expire" ON "session" ("expire");                -- Index for fast lookup and cleanup of expired sessions