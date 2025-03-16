// ייבוא ספריות מ-Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// הגדרות Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAoIwZ6r-DimpL6rI59umjqGI-TVCH4XW0",
    authDomain: "rany-project.firebaseapp.com",
    databaseURL: "https://rany-project-default-rtdb.firebaseio.com",
    projectId: "rany-project",
    storageBucket: "rany-project.firebasestorage.app",
    messagingSenderId: "360595894621",
    appId: "1:360595894621:web:b4dea9a85e2e1758e5b8b4",
    measurementId: "G-KMX92SH7MY"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// פונקציה ללוגין למשתמש קיים
function loginUser(event) {
    event.preventDefault(); // מונע שליחה כפולה של הטופס

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // בדיקה שכל השדות מלאים
    if (!email || !password) {
        alert("Please fill out both fields.");
        return;
    }

    // התחברות עם Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User logged in:", user);

            // ניווט לממשק המשתמש או דף אחר אחרי לוגין
            window.location.href = "client-dashboard.html";  // דף לדוגמה לאחר התחברות
        })
        .catch((error) => {
            console.error("Error logging in user:", error.message);
            alert(`Error: ${error.message}`);
        });
}

// חיבור כפתור התחברות לפונקציה loginUser
document.getElementById("loginForm").addEventListener("submit", loginUser);
