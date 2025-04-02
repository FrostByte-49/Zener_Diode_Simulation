// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYPE1JvPCUa6LDLekmXosmFQ-SegUAe0Y",
    authDomain: "zener-login.firebaseapp.com",
    projectId: "zener-login",
    storageBucket: "zener-login.appspot.com",
    messagingSenderId: "1066231166290",
    appId: "1:1066231166290:web:546eb712962a18818c368b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Get the submit button
const submit = document.getElementById('submit');

submit.addEventListener("click", async function (event) {
    event.preventDefault();

    // Get user inputs
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    // Validation: Check if fields are empty
    if (!name || !email || !password) {
        showAlert("Please fill in all fields.", "error");
        return;
    }

    // Password length validation
    if (password.length < 6) {
        showAlert("Password must be at least 6 characters long.", "error");
        return;
    }

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            profilePicture: "default.png", // Placeholder profile picture
            achievements: ["First Login"],
            badges: ["Beginner"],
            challengesCompleted: 0,
            visitStreak: 1
        });

        showAlert("Account created successfully!", "success");

        // Redirect after a short delay to ensure user sees the alert
        setTimeout(() => {
            window.location.href = "../../index.html";
        }, 1500);

    } catch (error) {
        let errorMessage = "An error occurred. Please try again.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "This email is already in use.";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email format.";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Password is too weak.";
        }

        showAlert(errorMessage, "error");
        console.error("Error Code:", error.code, "Message:", error.message);
    }
});

// Function to show alert messages
function showAlert(message, type) {
    const alertBox = document.createElement("div");
    alertBox.innerText = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.padding = "10px 20px";
    alertBox.style.backgroundColor = type === "success" ? "green" : "red";
    alertBox.style.color = "white";
    alertBox.style.fontSize = "16px";
    alertBox.style.borderRadius = "5px";
    alertBox.style.zIndex = "1000";

    document.body.appendChild(alertBox);

    // Remove alert after 2 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 2000);
}
