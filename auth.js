import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// 1. YOUR FIREBASE PROJECT CREDENTIALS (CONNECTED)
const firebaseConfig = {
  apiKey: "AIzaSyAUy2XgvCpuSGdpnNxJ8NiN1LFTFuqNUV8",
  authDomain: "trailblazers--29.firebaseapp.com",
  projectId: "trailblazers--29",
  storageBucket: "trailblazers--29.firebasestorage.app",
  messagingSenderId: "256240620470",
  appId: "1:256240620470:web:d727943d940d5366f1a717"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 2. UPDATED TO MATCH YOUR CONSOLE BACKEND
const MATRIC_SUFFIX = "@student.local"; 

// DOM Elements mapped exactly to your UNILAG markup
const loginForm = document.querySelector('form'); // Targets the login form directly
const matricInput = document.querySelector('input[name="matriculation-number"]');
const passwordInput = document.querySelector('input[name="password"]');
const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('LoggedInView');
const logoutBtn = document.getElementById('logoutBtn');

// Dynamically inject an error message block right above the login button
let authError = document.createElement('div');
authError.style.cssText = "color: #ff4d4d; margin-bottom: 15px; font-size: 14px; display: none; font-family: 'Montserrat', sans-serif; font-weight: 600; text-align: center; width: 100%;";
if (loginForm) {
  const loginButton = loginForm.querySelector('.btn-login');
  loginForm.insertBefore(authError, loginButton);
}

// 3. Track Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in -> switch to dashboard layout
    loggedOutView.style.display = "none";
    loggedInView.style.display = "flex"; 
    if (loginForm) loginForm.reset();
    authError.style.display = "none";
  } else {
    // User is signed out -> return to public site & login sidebar
    loggedOutView.style.display = "block";
    loggedInView.style.display = "none";
  }
});

// 4. Handle Login Form Submission
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authError.style.display = "none";
    
    // Get values and clear spaces
    let matric = matricInput.value.trim();
    const password = passwordInput.value;

    if (!matric || !password) {
      authError.style.display = "block";
      authError.innerText = "Please enter both Matriculation Number and Password.";
      return;
    }

    // If you accidentally typed the full email in the box, strip it down to just the matric number
    if (matric.includes('@')) {
      matric = matric.split('@')[0];
    }
    
    const syntheticEmail = `${matric}${MATRIC_SUFFIX}`.toLowerCase();

    signInWithEmailAndPassword(auth, syntheticEmail, password)
      .catch((error) => {
        authError.style.display = "block";
        console.error("Firebase Auth Error:", error);

        switch (error.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
          case 'auth/invalid-email':
            authError.innerText = "Invalid Matric Number or Password.";
            break;
          case 'auth/network-request-failed':
            authError.innerText = "Network error. Please check your internet connection and try again.";
            break;
          case 'auth/unauthorized-domain':
            authError.innerText = "This domain is not authorized in Firebase Auth. Use localhost or add this domain to your Firebase console.";
            break;
          default:
            authError.innerText = error.message || "An error occurred. Please try again.";
            break;
        }
      });
  });
}

// 5. Handle Logout Button Click
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth).catch((error) => console.error("Logout failed: ", error));
  });
}
// Store announcements globally for filtering
window.allAnnouncements = [];

async function fetchAnnouncements() {
  const feedContainer = document.querySelector('.announcements-feed-list');
  if (!feedContainer) return;

  try {
    // Dynamically read from your local JSON file
    const response = await fetch('announcements.json');
    const data = await response.json();

    // Store announcements globally
    window.allAnnouncements = data;

    // Render all announcements initially
    renderAnnouncementsByDate(null);

  } catch (error) {
    console.error("Error reading announcements data file:", error);
    feedContainer.innerHTML = '<div class="feed-row-item"><p style="color: #ef4444;">Failed to load notices.</p></div>';
  }
}

function renderAnnouncementsByDate(selectedDate) {
  const feedContainer = document.querySelector('.announcements-feed-list');
  if (!feedContainer) return;

  // Filter announcements by selected date
  let filteredAnnouncements = window.allAnnouncements;
  if (selectedDate) {
    filteredAnnouncements = window.allAnnouncements.filter(ann => ann.date === selectedDate);
  }

  // Clear container
  feedContainer.innerHTML = '';

  if (filteredAnnouncements.length === 0) {
    feedContainer.innerHTML = '<div class="feed-row-item"><p style="color: #94a3b8;">No announcements for this date.</p></div>';
    return;
  }

  // Render filtered announcements
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
      // Only allow clicking on current month dates (not muted)
      if (this.classList.contains('muted')) return;

      // Remove active class from all days
      dayNumbers.forEach(el => el.classList.remove('active'));
      // Add active class to clicked day
      this.classList.add('active');

      // Get the day number
      const dayNum = this.textContent.trim();
      // Format date as "DD/MM/YYYY" - using June 2026 as shown in calendar
      const selectedDate = `${dayNum.padStart(2, '0')}/06/2026`;
      
      // Filter and render announcements for this date
      renderAnnouncementsByDate(selectedDate);
    });
    // Add pointer cursor to indicate clickability
    if (!dayEl.classList.contains('muted')) {
      dayEl.style.cursor = 'pointer';
    }
  });
}

// Call it to render your list when your main screen initializes
fetchAnnouncements();

// Attach calendar listeners after DOM is ready
setTimeout(() => {
  attachCalendarListeners();
}, 100);