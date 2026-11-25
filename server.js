
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sql, initDb } = require("./database/db");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET missing in .env file");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize database once
const dbReady = initDb();

app.use(async (req, res, next) => {
    try {
        await dbReady;
        next();
    } catch (error) {
        console.error("Database initialization error:", error);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate student ID
function getStudentId(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            message: "Invalid student ID"
        });
        return null;
    }

    return id;
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

// ===================================
// REGISTER API
// ===================================

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

        const existingUser = await sql`
            SELECT id FROM users
            WHERE email = ${normalizedEmail}
        `;

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await sql`
            INSERT INTO users (name, email, password_hash)
            VALUES (
                ${name.trim()},
                ${normalizedEmail},
                ${passwordHash}
            )
            RETURNING id, name, email
        `;

        res.status(201).json({
            message: "Registration successful",
            user: result[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// ===================================
// LOGIN API
// ===================================

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

        const normalizedEmail = email.trim().toLowerCase();

        const users = await sql`
            SELECT * FROM users
            WHERE email = ${normalizedEmail}
        `;

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

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
            { expiresIn: "1d" }
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

// ===================================
// GET ALL STUDENTS
// ===================================

app.get("/api/students", authenticateToken, async (req, res) => {
    try {
        const students = await sql`
            SELECT id, name, email, course, created_at
            FROM students
            WHERE user_id = ${req.user.id}
            ORDER BY id DESC
        `;

        res.json(students);

    } catch (error) {
        console.error("Fetch error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===================================
// GET STUDENT BY ID
// ===================================

app.get("/api/students/:id", authenticateToken, async (req, res) => {
    try {
        const id = getStudentId(req, res);
        if (id === null) return;

        const students = await sql`
            SELECT id, name, email, course, created_at
            FROM students
            WHERE id = ${id}
            AND user_id = ${req.user.id}
        `;

        if (students.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(students[0]);

    } catch (error) {
        console.error("Fetch student error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===================================
// ADD STUDENT
// ===================================

app.post("/api/students", authenticateToken, async (req, res) => {
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

        const normalizedEmail = email.trim().toLowerCase();

        const result = await sql`
            INSERT INTO students
                (name, email, course, user_id)
            VALUES (
                ${name.trim()},
                ${normalizedEmail},
                ${course.trim()},
                ${req.user.id}
            )
            RETURNING id, name, email, course, created_at
        `;

        res.status(201).json({
            message: "Student added successfully",
            student: result[0]
        });

    } catch (error) {
        console.error("Add student error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Student email already exists"
            });
        }

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===================================
// UPDATE STUDENT
// ===================================

app.put("/api/students/:id", authenticateToken, async (req, res) => {
    try {
        const id = getStudentId(req, res);
        if (id === null) return;

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

        const normalizedEmail = email.trim().toLowerCase();

        const result = await sql`
            UPDATE students
            SET
                name = ${name.trim()},
                email = ${normalizedEmail},
                course = ${course.trim()}
            WHERE id = ${id}
            AND user_id = ${req.user.id}
            RETURNING id, name, email, course, created_at
        `;

        if (result.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully",
            student: result[0]
        });

    } catch (error) {
        console.error("Update error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Student email already exists"
            });
        }

        res.status(500).json({
            message: "Database error"
        });
    }
});

// ===================================
// DELETE STUDENT
// ===================================

app.delete("/api/students/:id", authenticateToken, async (req, res) => {
    try {
        const id = getStudentId(req, res);
        if (id === null) return;

        const result = await sql`
            DELETE FROM students
            WHERE id = ${id}
            AND user_id = ${req.user.id}
            RETURNING id
        `;

        if (result.length === 0) {
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

// ===================================
// SERVER START
// ===================================

if (require.main === module) {
    dbReady
        .then(() => {
            const server = app.listen(PORT, () => {
                console.log("--------------------------------");
                console.log("StudentHub Task 04");
                console.log("Neon PostgreSQL connected!");
                console.log("JWT Authentication enabled!");
                console.log(`Server running at http://localhost:${PORT}`);
                console.log("--------------------------------");
            });

            server.on("error", (error) => {
                console.error("Server error:", error.message);
            });
        })
        .catch((error) => {
            console.error("Database startup failed:", error);
            process.exit(1);
        });
}

// Export for deployment platforms
module.exports = app;
