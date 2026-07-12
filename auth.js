import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { GOOGLE_API_KEY } from './config.js'; // Secured configuration reference

// 1. FIREBASE PROJECT CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAUy2XgvCpuSGdpnNxJ8NiN1LFTFuqNUV8",
  authDomain: "trailblazers--29.firebaseapp.com",
  projectId: "trailblazers--29",
  storageBucket: "trailblazers--29.firebasestorage.app",
  messagingSenderId: "256240620470",
  appId: "1:256240620470:web:d727943d940d5366f1a717"
};

// Initialize Firebase App Components
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const MATRIC_SUFFIX = "@student.local"; 

// DOM Element Selectors
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logoutBtn');
const matricInput = document.querySelector('input[name="matriculation-number"]');
const passwordInput = document.querySelector('input[name="password"]');
const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('LoggedInView');
const ALLOWED_GOOGLE_EMAILS = [
  "lecturer.admin@gmail.com",
  "department.head@gmail.com",
  "emmanuelosebeyo2@gmail.com" 
];

// Inline Error Element Factory
let authError = document.createElement('div');
authError.style.cssText = "color: #ff4d4d; margin-bottom: 15px; font-size: 14px; display: none; font-family: 'Montserrat', sans-serif; font-weight: 600; text-align: center; width: 100%;";
if (loginForm) {
  const loginButton = loginForm.querySelector('.btn-login') || loginForm.querySelector('button[type="submit"]');
  if (loginButton) {
    loginForm.insertBefore(authError, loginButton);
  }
}

// Helper to safely present UI feedback errors
function displayError(message) {
  authError.innerText = message;
  authError.style.display = "block";
}

// 2. CORE AUTHENTICATION STATE OBSERVER (Handles all view toggles and restrictions automatically)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if the login method came from Google
    const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');

    // If it's a Google user, check if their email is missing from your whitelist
    if (isGoogleUser && !ALLOWED_GOOGLE_EMAILS.includes(user.email)) {
      console.warn("Unauthorized Google login attempt blocked:", user.email);
      
      // 1. Show the custom red error message inside the sidebar
      displayError("This Google account does not have access to this portal.");
      
      // 2. Boot them straight back out of Firebase
      signOut(auth);
      return; // Stop right here so the dashboard layout never triggers
    }

    // User passed checks (Either a valid Matric account or a whitelisted Google account)
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "flex"; 
    if (loginForm) loginForm.reset();
    authError.style.display = "none";
  } else {
    // User signed out -> Return display layout to public portal view
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
});

// 3. TRADITIONAL MATRICULATION NUMBER / PASSWORD LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none'; // Clear old views
    
    // Read directly from your mapped input elements
    let rawMatric = matricInput ? matricInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!rawMatric || !password) {
      displayError("Please enter your matriculation number and password.");
      return;
    }

    // Automatically append the domain suffix if the student only typed their raw numbers
    if (!rawMatric.includes('@')) {
      rawMatric = `${rawMatric}${MATRIC_SUFFIX}`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, rawMatric, password);
      console.log("Logged in successfully via Matric identity:", userCredential.user);
      // No window.location.href needed! onAuthStateChanged handles the view flip automatically.
    } catch (error) {
      console.error("Matric Auth Error:", error.code);
      displayError("Invalid credentials. Please verify your details and try again.");
    }
  });
}

// 4. ONE-CLICK GOOGLE SIGN-IN FLOW
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    authError.style.display = 'none';

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        console.log("Logged in successfully via Google credential:", result.user);
        // No window.location.href needed!
      })
      .catch((error) => {
        console.error("Google Authentication Failed:", error.message);
        displayError("Google sign-in failed. Please ensure your domain is trusted.");
      });
  });
}

// 5. SECURE SYSTEM LOGOUT FLOW
// =======================================================
// 5. SECURE SYSTEM LOGOUT FLOW
// =======================================================
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); // 🛑 Stops the browser from reloading or jumping pages
    console.log("Logout button successfully clicked!"); // Check your console for this!

    signOut(auth)
      .then(() => {
        console.log("User logged out cleanly from Firebase.");
        // The onAuthStateChanged observer will automatically flip the views now
      })
      .catch((error) => {
        console.error("Logout process error:", error.message);
      });
  });
} else {
  console.log("Warning: JavaScript could not find an element with id='logoutBtn'");
}

// =======================================================
// ANNOUNCEMENTS DATA ENGINE & CALENDAR LOGIC
// =======================================================
window.allAnnouncements = [];

async function fetchAnnouncements() {
  const feedContainer = document.querySelector('.announcements-feed-list');
  if (!feedContainer) return;

  try {
    const response = await fetch('announcements.json');
    const data = await response.json();
    window.allAnnouncements = data;
    renderAnnouncementsByDate(null);
  } catch (error) {
    console.error("Error reading announcements data file:", error);
    feedContainer.innerHTML = '<div class="feed-row-item"><p style="color: #ef4444;">Failed to load notices.</p></div>';
  }
}

function renderAnnouncementsByDate(selectedDate) {
  const feedContainer = document.querySelector('.announcements-feed-list');
  if (!feedContainer) return;

  let filteredAnnouncements = window.allAnnouncements;
  if (selectedDate) {
    filteredAnnouncements = window.allAnnouncements.filter(ann => ann.date === selectedDate);
  }

  feedContainer.innerHTML = '';

  if (filteredAnnouncements.length === 0) {
    feedContainer.innerHTML = '<div class="feed-row-item"><p style="color: #94a3b8;">No announcements for this date.</p></div>';
    return;
  }

  filteredAnnouncements.forEach((announcement) => {
    const rowHTML = `
      <div class="feed-row-item">
        <div class="feed-icon"><i class="fas fa-bullhorn"></i></div>
        <div class="feed-details">
          <h4>${announcement.title}</h4>
          <p>${announcement.content}</p>
        </div>
        <div class="feed-date">${announcement.date}</div>
      </div>
    `;
    feedContainer.insertAdjacentHTML('beforeend', rowHTML);
  });
}

function attachCalendarListeners() {
  const dayNumbers = document.querySelectorAll('.day-num');
  dayNumbers.forEach(dayEl => {
    dayEl.addEventListener('click', function() {
      if (this.classList.contains('muted')) return;

      dayNumbers.forEach(el => el.classList.remove('active'));
      this.classList.add('active');

      const dayNum = this.textContent.trim();
      const selectedDate = `${dayNum.padStart(2, '0')}/06/2026`; // Configured target timeline
      
      renderAnnouncementsByDate(selectedDate);
    });
    
    if (!dayEl.classList.contains('muted')) {
      dayEl.style.cursor = 'pointer';
    }
  });
}

// Engine Boot Routine
fetchAnnouncements();
setTimeout(() => {
  attachCalendarListeners();
}, 100);
