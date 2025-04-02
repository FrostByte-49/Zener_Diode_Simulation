// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";


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

// Get the submit button
const submit = document.getElementById('submit1');

submit.addEventListener("click", function (event) {
    event.preventDefault();

    // Get user inputs
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Validation: Check if fields are empty
    if (!email || !password) {
        showAlert("Please enter both email and password.", "error");
        return;
    }

    // Sign in user with email and password
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showAlert("Signed in successfully!", "success");
            console.log("User:", userCredential.user);

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = "../../index.html";
            }, 1500);
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case "auth/user-not-found":
                    errorMessage = "No account found with this email.";
                    break;
                case "auth/wrong-password":
                    errorMessage = "Incorrect password. Try again.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Invalid email format.";
                    break;
                case "auth/network-request-failed":
                    errorMessage = "Network error. Check your connection.";
                    break;
                default:
                    errorMessage = error.message;
            }

            showAlert(errorMessage, "error");
            console.error("Error Code:", error.code, "Message:", error.message);
        });
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
