
const API_URL = "http://localhost:3000/api/students";

const studentList = document.getElementById("studentList");
const totalStudents = document.getElementById("totalStudents");
const studentForm = document.getElementById("studentForm");
const formSection = document.getElementById("studentFormSection");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const searchInput = document.getElementById("searchInput");

let students = [];

// Fetch students from database
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch students");
        }

        students = await response.json();
        displayStudents(students);

    } catch (error) {
        studentList.innerHTML = `
            <tr><td colspan="5">Unable to load students. Check server.</td></tr>
        `;
        console.error(error);
    }
}

// Display students
function displayStudents(data) {
    totalStudents.textContent = data.length;

    if (data.length === 0) {
        studentList.innerHTML = `
            <tr><td colspan="5">No students found.</td></tr>
        `;
        return;
    }

    studentList.innerHTML = data.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>
                <button onclick="editStudent(${student.id})">Edit</button>
                <button onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

// Prevent HTML injection
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Open add student form
addBtn.addEventListener("click", () => {
    studentForm.reset();
    document.getElementById("studentId").value = "";
    document.getElementById("formTitle").textContent = "Add New Student";
    formSection.hidden = false;
});

// Cancel form
cancelBtn.addEventListener("click", () => {
    formSection.hidden = true;
    studentForm.reset();
});

// Add or update student
studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("studentId").value;

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim()
    };

    if (!student.name || !student.email || !student.course) {
        alert("Please fill all fields.");
        return;
    }

    try {
        const response = await fetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Operation failed");
        }

        alert(result.message || "Student saved successfully!");

        formSection.hidden = true;
        studentForm.reset();
        await fetchStudents();

    } catch (error) {
        alert(error.message);
    }
});

// Edit student
function editStudent(id) {
    const student = students.find(s => s.id === id);

    if (!student) return;

    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;

    document.getElementById("formTitle").textContent = "Edit Student";
    formSection.hidden = false;
}

// Delete student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert("Student deleted successfully!");
        await fetchStudents();

    } catch (error) {
        alert(error.message);
    }
}

// Search students
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query)
    );

    displayStudents(filtered);
});

// Initial load
fetchStudents();
