// ייבוא ספריות מ-Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const database = getDatabase(app);

// פונקציה ליצירת חשבון חדש
function createAccount() {
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const height = document.getElementById("height").value.trim();
    const weight = document.getElementById("weight").value.trim();
    const workoutType = document.querySelector('input[name="workout"]:checked')?.value;
    const fitnessInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(interest => interest.value);
    const experience = document.getElementById("experience").value.trim();

    // בדיקה שכל השדות מלאים
    if (!fname || !lname || !email || !password || !height || !weight || !workoutType || fitnessInterests.length === 0 || !experience) {
        alert("Please fill out all fields.");
        return;
    }

    // יצירת חשבון חדש עם Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User created:", user);

            // שמירת פרטי המשתמש ב-Database תחת מזהה המשתמש
            const userData = {
                uid: user.uid, 
                firstName: fname,
                lastName: lname,
                email: email,
                height: height,
                weight: weight,
                workoutType: workoutType,
                fitnessInterests: fitnessInterests,
                experienceLevel: experience,
                createdAt: new Date().toISOString()
            };

            return set(ref(database, `users/${user.uid}`), userData);
        })
        .then(() => {
            alert("Account created successfully!");
            console.log("User data saved to database.");
        })
        .catch((error) => {
            console.error("Error:", error.message);
            alert(`Error: ${error.message}`);
        });
}

// חיבור כפתור יצירת החשבון לפונקציה createAccount
document.getElementById("signup-button").addEventListener("click", createAccount);
