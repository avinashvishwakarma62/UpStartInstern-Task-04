# 🎓 StudentHub – Student Management System

A full-stack Student Management System developed as **Task 04** during my internship at UpStart. StudentHub provides a simple interface and RESTful APIs to manage student records with secure authentication and PostgreSQL database integration.

## 🚀 Project Overview

StudentHub is designed to simplify student record management. It allows users to perform CRUD (Create, Read, Update, Delete) operations on student information.

The backend uses Node.js and Express.js, while Neon PostgreSQL provides cloud-based database storage.

## ✨ Features

- **Student Management:** Add, view, update, and delete student records.
- **RESTful APIs:** Organized API endpoints for student operations.
- **User Registration:** Register users with email and password.
- **User Login:** Authenticate users securely.
- **Password Hashing:** Passwords are hashed using bcryptjs.
- **JWT Authentication:** Secure API access using JSON Web Tokens.
- **User Data Isolation:** Users can access only their own student records.
- **Cloud Database:** Integrated with Neon PostgreSQL.
- **Responsive Dashboard:** Simple and user-friendly interface.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Styling and layout |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | REST API development |
| PostgreSQL | Database |
| Neon | Cloud PostgreSQL hosting |
| bcryptjs | Password hashing |
| JSON Web Token | Authentication |
| Postman | API testing |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
UpStartInstern-Task-04/
│
├── database/
│   └── db.js
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/avinashvishwakarma62/UpStartInstern-Task-04.git
```

### 2. Navigate to the Project Directory

```bash
cd UpStartInstern-Task-04
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000
JWT_SECRET=your_random_secret_key
DATABASE_URL=your_neon_postgresql_connection_string
```

Replace the placeholder values with your own credentials. Never upload `.env` to GitHub.

### 5. Start the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## 🔗 API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and generate JWT |

### Student Management APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | Get all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Add a new student |
| PUT | `/api/students/:id` | Update student details |
| DELETE | `/api/students/:id` | Delete a student |

**Authentication:** Student APIs require a valid JWT Bearer token in the Authorization header.

Example:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🗄️ Database Structure

### Users Table

- `id` – Primary key
- `name` – User name
- `email` – Unique email address
- `password_hash` – Hashed password
- `created_at` – Account creation timestamp

### Students Table

- `id` – Primary key
- `name` – Student name
- `email` – Student email
- `course` – Course name
- `user_id` – Reference to the associated user
- `created_at` – Record creation timestamp

## 🧪 API Testing

The backend APIs were tested using Postman.

| Test Case | Result |
|---|---|
| User Registration | Passed |
| User Login | Passed |
| JWT Authentication | Passed |
| Add Student | Passed |
| Get All Students | Passed |
| Update Student | Passed |
| Delete Student | Passed |
| Neon PostgreSQL Connection | Passed |

## ☁️ Deployment

The project is configured for deployment using:

- **Frontend & Backend Hosting:** Vercel
- **Cloud Database:** Neon PostgreSQL
- **Source Code:** GitHub

Environment variables must be configured in the Vercel project settings before deployment.

## 🎯 Learning Outcomes

Through this project, I gained practical experience in:

- Building RESTful APIs using Express.js.
- Connecting Node.js applications with PostgreSQL.
- Implementing JWT-based authentication.
- Hashing passwords securely.
- Performing CRUD operations.
- Testing APIs using Postman.
- Managing code with Git and GitHub.
- Deploying a backend application with cloud database integration.

## 👨‍💻 Developer

**Avinash Vishwakarma**

B.Tech – Computer Science and Engineering

- GitHub: [@avinashvishwakarma62](https://github.com/avinashvishwakarma62)
- Portfolio: [My Portfolio](https://my-portfolio-avinash-62.vercel.app)
- LinkedIn: [Connect with me](https://www.linkedin.com/)

---

⭐ If you find this project useful, consider giving it a star!

**Developed as part of UpStart Internship – Task 04.**
