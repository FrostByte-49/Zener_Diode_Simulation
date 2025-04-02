import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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

// Reset Password Function
const reset = document.getElementById("reset");

reset.addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;

    if (email === "") {
        alert("Please enter your email address.");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password reset email sent! Check your inbox.");
        })
        .catch((error) => {
            console.error("Error:", error.code, error.message);
            alert("Failed to send reset email: " + error.message);
        });
});
