
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "students.db")
);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create Users Table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Create Students Table
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        course TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Check existing students table columns
const columns = db.prepare(
    "PRAGMA table_info(students)"
).all();

const hasUserId = columns.some(
    column => column.name === "user_id"
);

// Add user_id to old Task 03 database
if (!hasUserId) {
    db.exec(`
        ALTER TABLE students
        ADD COLUMN user_id INTEGER REFERENCES users(id)
    `);

    console.log("Database migration completed!");
}

// Verify database tables
const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table'
    AND name IN ('users', 'students')
`).all();

console.log("Database connected successfully!");
console.log("Tables ready:", tables.map(t => t.name).join(", "));

module.exports = db;
