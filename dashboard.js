import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"; 
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";  

// הגדרת Firebase
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

document.addEventListener("DOMContentLoaded", () => {
    // אלמנטים ב-DOM
    const heartRateElement = document.getElementById("heart-rate");
    const heightElement = document.getElementById("height");
    const weightElement = document.getElementById("weight");
    const nameElement = document.getElementById("Name");
    const exerciseStatusElement = document.getElementById("exercise-status-text");
    const emojiElement = document.getElementById("exercise-emoji"); // אימוג'י תרגיל
    const heartElement = document.querySelector(".heart"); // אלמנט הלב

    // הגדרת משתנים עבור הגרף
    const ctx = document.getElementById("repsGraph").getContext("2d");
    let repsData = [];    // אחסון נתוני חזרות
    let timeLabels = [];  // זמנים לשם תוויות בגרף
    let cumulativeReps = 0; // ערך מצטבר שמושפע מהמרווח בין החזרות
    let lastRepTime = null; // משתנה לאחסון הזמן של החזרה הקודמת

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Gym Reps',
                data: repsData,
                borderColor: 'rgb(255, 0, 0)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Reps'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // בדיקה אם משתמש מחובר
   onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is signed in:", user.uid);
    
            // שליפת מידע המשתמש לפי UID
            const userRef = ref(database, `/users/${user.uid}`);
            onValue(userRef, (userSnapshot) => {
                const userData = userSnapshot.val();
                if (!userData) {
                    console.error("User data not found in database.");
                    return;
                }
    
                // הצגת נתוני משתמש
                console.log("User data retrieved:", userData);
                nameElement.textContent = `${userData.firstName} ${userData.lastName}`;
                heightElement.textContent = userData.height ? `${userData.height}` : "--";
                weightElement.textContent = userData.weight ? `${userData.weight}` : "--";
            });
    
            // האזנה לנתוני דופק (B)
            const heartRef = ref(database, "/RX/TX/D");
            onValue(heartRef, (snapshot) => {
                const value = snapshot.val();
                const heartRate = parseFloat(value);
    
                if (!isNaN(heartRate)) {
                    heartRateElement.textContent = `${heartRate} bpm`;
                    const animationSpeed = 40 / heartRate;
                    heartElement.style.animationDuration = `${animationSpeed}s`;
                } else {
                    heartRateElement.textContent = "--";
                    heartElement.style.animationDuration = "1s";
                }
            });
    
        } else {
            console.log("No user is signed in. Redirecting to login page.");
            window.location.href = "login.html";
        }
    });
    
    

    // מאזין לשינויי סטטוס תרגיל ב-Firebase
    onValue(ref(database, "/RX/TX/A"), (snapshot) => {
        const value = snapshot.val();
        updateExerciseStatus(value === "1");
    });

    // עדכון סטטוס התרגיל (טקסט + אימוג'י)
    function updateExerciseStatus(isCorrect) {
        if (isCorrect) {
            exerciseStatusElement.textContent = "תקין";
            exerciseStatusElement.style.color = "green";
            emojiElement.textContent = "😊";
            emojiElement.className = "correct"; // הוספת קלאס לעיצוב האנימציה
        } else {
            exerciseStatusElement.textContent = "לא תקין";
            exerciseStatusElement.style.color = "red";
            emojiElement.textContent = "😠";
            emojiElement.className = "incorrect"; // הוספת קלאס לעיצוב האנימציה
        }
    }

    // מאזין למידע חזרות מ-Firebase
    onValue(ref(database, "/RX/TX/C"), (snapshot) => {
        const repSignal = snapshot.val();  // קבלת סימן חזרה
        const now = Date.now();              // הזמן הנוכחי במילישניות
        const currentTime = new Date().toLocaleTimeString();  // תווית זמן

        if (repSignal == 0) {
            // כאשר מתקבל "0" - איפוס הגרף והמשתנים
            cumulativeReps = 0;
            lastRepTime = null;
            timeLabels.length = 0;
            repsData.length = 0;
            timeLabels.push(currentTime);
            repsData.push(cumulativeReps);
        } else {
            if (lastRepTime === null) {
                // החזרה הראשונה לאחר האיפוס, אין חישוב מרווח
                lastRepTime = now;
                cumulativeReps += 1;
            } else {
                const dt = (now - lastRepTime) / 1000; // מרווח בזמן בשניות
                lastRepTime = now;
                // ככל שהמרווח קטן, ההגדלה תהיה גדולה (1/dt)
                const increment = 1 / dt;
                cumulativeReps += increment;
            }
            timeLabels.push(currentTime);
            repsData.push(cumulativeReps);
        }

        // שמירה על עד 10 נקודות בגרף
        if (timeLabels.length > 10) {
            timeLabels.shift();
            repsData.shift();
        }
        chart.update();  // עדכון הגרף
    });

    // פונקציה לשליחת מידע ל-Firebase
    function sendExerciseData(value) {
        update(ref(database, "/RX/"), { RX: value })
            .then(() => {
                console.log(`Sent ${value} to /RX/`);
            })
            .catch((error) => {
                console.error("Error sending data:", error);
            });
    }

    // מאזינים ללחיצות על הכפתורים
    document.getElementById("biceps").addEventListener("click", () => {
        sendExerciseData(2);
    });

    document.getElementById("hummer").addEventListener("click", () => {
        sendExerciseData(1);
    });

    document.getElementById("push-up").addEventListener("click", () => {
        sendExerciseData(3);
    });
    

    // פונקציה ליציאת משתמש
    document.getElementById("logoutButton").addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                alert("User logged out successfully!");
                window.location.href = "index.html"; // חזרה לדף הבית לאחר התנתקות
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    });
});
