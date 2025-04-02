import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";


// Firebase Config
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
const db = getFirestore(app);
const auth = getAuth(app);

// Function to Show Alerts
function showAlert(message, type = "success") {
    sessionStorage.setItem("alertMessage", JSON.stringify({ message, type }));
}

// Show stored alert message on page load
window.onload = function () {
    const alertData = sessionStorage.getItem("alertMessage");
    if (alertData) {
        const { message, type } = JSON.parse(alertData);
        alert(`${type.toUpperCase()}: ${message}`);
        sessionStorage.removeItem("alertMessage");
    }
};

// Check if User is Logged In
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../../Loader_/Login_/register.html";
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const today = new Date().toISOString().split("T")[0];
            const lastLogin = userData.lastLogin || null;
            let newStreak = userData.visitStreak || 1;

            // Update Streak Logic
            if (lastLogin) {
                const lastLoginDate = new Date(lastLogin);
                const diff = (new Date(today) - lastLoginDate) / (1000 * 60 * 60 * 24);

                if (diff === 1) {
                    newStreak += 1;
                } else if (diff > 1) {
                    newStreak = 1;
                }
            }

            // Save Updated Data to Firestore
            await setDoc(userDocRef, { lastLogin: today, visitStreak: newStreak }, { merge: true });

            // Update UI
            document.getElementById("profile-pic").src = userData.profilePicture || "https://dummyimage.com/150x150/ccc/ffffff.png&text=Profile";
            document.getElementById("username").innerText = userData.name || "Unknown User";
            document.getElementById("email").innerText = userData.email || "No Email Provided";
            document.getElementById("challenges").innerText = userData.challengesCompleted || 0;
            document.getElementById("streak").innerText = newStreak;

            // 🔹 Display Achievements & Badges
            const achievementsList = document.getElementById("achievements");
            achievementsList.innerHTML = "";
            (userData.achievements || []).forEach(achievement => {
                const li = document.createElement("li");
                li.innerText = achievement;
                achievementsList.appendChild(li);
            });

            const badgesList = document.getElementById("badges");
            badgesList.innerHTML = "";
            (userData.badges || []).forEach(badge => {
                const li = document.createElement("li");
                li.innerText = badge;
                badgesList.appendChild(li);
            });
        } else {
            console.log("No user data found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        showAlert("Error loading user data!", "error");
    }
});


// Profile Picture Upload and Preview (Using Cloudinary)
document.getElementById("profile-pic-file").addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        // Validate File Type (Allow JPEG, PNG, WEBP)
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
            this.value = ""; // Clear input
            return;
        }

        // Preview Image Before Upload
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("profile-pic").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Upload Image to Cloudinary
document.getElementById("upload-image").addEventListener("click", async () => {
    const fileInput = document.getElementById("profile-pic-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Profile_Picture");
    formData.append("folder", "profile_pictures");
    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dhgoozkfm/image/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.secure_url) {
            document.getElementById("profile-pic").src = data.secure_url;

            // Save URL to Firestore
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, { profilePicture: data.secure_url }, { merge: true });
                alert("Profile picture updated successfully!");
            }
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Image upload failed.");
    }
});


// Save Username Changes
document.getElementById("save-profile").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const newName = document.getElementById("username-input").value.trim();

        if (!newName) {
            alert("Please enter a valid username.");
            return;
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, { name: newName }, { merge: true });
            showAlert("Username updated successfully!", "success");
            window.location.reload();
        } catch (error) {
            console.error("Error updating username:", error);
            showAlert("Failed to update username!", "error");
        }
    }
});

// Logout Function
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "../../index.html";
        } catch (error) {
            console.error("Logout Error:", error);
            showAlert("Error logging out!", "error");
        }
    });
}

// Ensure Profile Picture is Set When Page Loads
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                document.getElementById("profile-pic").src = userData.profilePicture || "https://via.placeholder.com/150";
            }
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        }
    }
});
