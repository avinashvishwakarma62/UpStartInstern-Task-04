# Student Management REST API

A simple REST API built using Node.js and Express.js to manage student records.

Developed as part of **UpStartInstern – Task 02: REST API with Express**.

## Features

- GET – Retrieve all students
- GET by ID – Retrieve a specific student
- POST – Add a new student
- PUT – Update student details
- DELETE – Remove a student
- JSON request and response handling
- Proper HTTP status codes
- 404 error handling for missing students

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Postman

## Installation and Setup

1. Clone this repository.
2. Open the project folder in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open:

`http://localhost:3000/students`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /students | Get all students |
| GET | /students/:id | Get student by ID |
| POST | /students | Add student |
| PUT | /students/:id | Update student |
| DELETE | /students/:id | Delete student |

## Testing

All API endpoints were tested using Postman.

## Data Storage

Student records are stored in an in-memory array. Data resets when the server restarts.

## Developer

Avinash Vishwakarma

**Internship:** UpStartInstern