
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Check environment variables
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET missing in .env file");
}

// Middleware
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000"
    ]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// ===============================
// REGISTER API
// ===============================

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !isValidEmail(email.trim()) ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "Valid name, email and password (minimum 8 characters) required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        `).run(
            name.trim(),
            normalizedEmail,
            passwordHash
        );

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: result.lastInsertRowid,
                name: name.trim(),
                email: normalizedEmail
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// ===============================
// LOGIN API
// ===============================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !isValidEmail(email.trim())
        ) {
            return res.status(400).json({
                message: "Valid email and password required"
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email.trim().toLowerCase());

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// ===============================
// GET ALL STUDENTS
// ===============================

app.get("/api/students", authenticateToken, (req, res) => {
    try {
        const students = db.prepare(`
            SELECT id, name, email, course, created_at
            FROM students
            WHERE user_id = ?
            ORDER BY id DESC
        `).all(req.user.id);

        res.json(students);

    } catch (error) {
        console.error("Fetch error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===============================
// GET STUDENT BY ID
// ===============================

app.get("/api/students/:id", authenticateToken, (req, res) => {
    try {
        const student = db.prepare(`
            SELECT id, name, email, course, created_at
            FROM students
            WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.user.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);

    } catch (error) {
        console.error("Fetch student error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===============================
// ADD STUDENT
// ===============================

app.post("/api/students", authenticateToken, (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof course !== "string" ||
            !name.trim() ||
            !course.trim() ||
            !isValidEmail(email.trim())
        ) {
            return res.status(400).json({
                message: "Valid name, email and course required"
            });
        }

        const result = db.prepare(`
            INSERT INTO students
            (name, email, course, user_id)
            VALUES (?, ?, ?, ?)
        `).run(
            name.trim(),
            email.trim().toLowerCase(),
            course.trim(),
            req.user.id
        );

        const student = db.prepare(`
            SELECT id, name, email, course, created_at
            FROM students
            WHERE id = ? AND user_id = ?
        `).get(result.lastInsertRowid, req.user.id);

        res.status(201).json({
            message: "Student added successfully",
            student
        });

    } catch (error) {
        console.error("Add student error:", error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "Student email already exists"
            });
        }

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===============================
// UPDATE STUDENT
// ===============================

app.put("/api/students/:id", authenticateToken, (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof course !== "string" ||
            !name.trim() ||
            !course.trim() ||
            !isValidEmail(email.trim())
        ) {
            return res.status(400).json({
                message: "Valid name, email and course required"
            });
        }

        const result = db.prepare(`
            UPDATE students
            SET name = ?, email = ?, course = ?
            WHERE id = ? AND user_id = ?
        `).run(
            name.trim(),
            email.trim().toLowerCase(),
            course.trim(),
            req.params.id,
            req.user.id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const student = db.prepare(`
            SELECT id, name, email, course, created_at
            FROM students
            WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.user.id);

        res.json({
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        console.error("Update error:", error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "Student email already exists"
            });
        }

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===============================
// DELETE STUDENT
// ===============================

app.delete("/api/students/:id", authenticateToken, (req, res) => {
    try {
        const result = db.prepare(`
            DELETE FROM students
            WHERE id = ? AND user_id = ?
        `).run(
            req.params.id,
            req.user.id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===============================
// SERVER START
// ===============================

const server = app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("StudentHub Task 04");
    console.log("Database connected successfully!");
    console.log("Authentication enabled!");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("--------------------------------");
});

server.on("error", (error) => {
    console.error("Server error:", error.message);
});
