
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

// Check Neon connection URL
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing in .env file");
}

// Connect to Neon PostgreSQL
const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
async function initDb() {
    // Users table
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Students table
    await sql`
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            course VARCHAR(200) NOT NULL,
            user_id INTEGER REFERENCES users(id)
                ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Index for faster user-wise student queries
    await sql`
        CREATE INDEX IF NOT EXISTS idx_students_user_id
        ON students(user_id)
    `;

    console.log("Neon PostgreSQL connected successfully!");
    console.log("Tables ready: users, students");
}

module.exports = {
    sql,
    initDb
};
