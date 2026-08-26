import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { GOOGLE_API_KEY } from './config.js';

// =======================================================
// 1. FIREBASE PROJECT CONFIGURATION
// =======================================================
const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
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

// =======================================================
// 2. CORE AUTHENTICATION STATE OBSERVER
// =======================================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');

    // Email filtering interceptor
    if (isGoogleUser && !ALLOWED_GOOGLE_EMAILS.includes(user.email)) {
      console.warn("Unauthorized Google login attempt blocked:", user.email);
      displayError("This Google account does not have access to this portal.");
      signOut(auth);
      return;
    }

    // Access Granted View Switch
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "flex"; 
    if (loginForm) loginForm.reset();
    authError.style.display = "none";
  } else {
    // Return display layout to public portal view
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
});

// =======================================================
// 3. TRADITIONAL MATRICULATION NUMBER / PASSWORD LOGIN
// =======================================================
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none'; 
    
    let rawMatric = matricInput ? matricInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!rawMatric || !password) {
      displayError("Please enter your matriculation number and password.");
      return;
    }

    // Format matric input to full synthetic email format
    if (!rawMatric.includes('@')) {
      rawMatric = `${rawMatric}${MATRIC_SUFFIX}`;
    }

    console.log("Attempting login for synthetic email:", rawMatric);

    try {
      await signInWithEmailAndPassword(auth, rawMatric, password);
      console.log("Logged in successfully via Matric identity.");
    } catch (error) {
      console.error("Matric Auth Error Code:", error.code, "| Message:", error.message);
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        displayError("Invalid credentials. Verify your matric number and password.");
      } else {
        displayError(`Login error: ${error.message}`);
      }
    }
  });
}

// =======================================================
// 4. ONE-CLICK GOOGLE SIGN-IN FLOW
// =======================================================
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    authError.style.display = 'none';

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        console.log("Logged in successfully via Google credential:", result.user);
      })
      .catch((error) => {
        console.error("Google Authentication Failed Code:", error.code, "| Message:", error.message);
        displayError(`Google sign-in failed (${error.code}). Check browser console for details.`);
      });
  });
}

// =======================================================
// 5. SECURE SYSTEM LOGOUT FLOW
// =======================================================
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    console.log("Logout button successfully clicked!");

    signOut(auth)
      .then(() => {
        console.log("User logged out cleanly from Firebase.");
      })
      .catch((error) => {
        console.error("Logout process error:", error.message);
      });
  });
}

// =======================================================
// 6. MOBILE SIDEBAR DRAWER TOGGLE LOGIC
// =======================================================
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const dashboardSidebar = document.querySelector('.dashboard-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarLinks = document.querySelectorAll('.sidebar-grid-menu .menu-item');

if (menuToggleBtn && dashboardSidebar) {
  menuToggleBtn.addEventListener('click', () => {
    dashboardSidebar.classList.toggle('active');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    dashboardSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      dashboardSidebar.classList.remove('active');
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
  });
});

// =======================================================
// 7. DYNAMIC TAB & VIEW SWITCHER
// =======================================================
function switchDashboardTab(tabName) {
  const menuItems = document.querySelectorAll('.sidebar-grid-menu .menu-item');
  const homeView = document.getElementById('dashboardHomeView');
  const coursesView = document.getElementById('coursesView');
  const timetableView = document.getElementById('timetableView');

  // Update active highlight in sidebar menu
  menuItems.forEach(item => {
    const itemText = item.querySelector('span')?.textContent.trim();
    if (itemText === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Hide all view panels first
  if (homeView) homeView.style.display = 'none';
  if (coursesView) coursesView.style.display = 'none';
  if (timetableView) timetableView.style.display = 'none';

  // Route active view
  if (tabName === 'Courses' && coursesView) {
    coursesView.style.display = 'block';
  } else if (tabName === 'Timetable' && timetableView) {
    timetableView.style.display = 'block';
  } else if (homeView) {
    homeView.style.display = 'block';
  }
}

// Attach event listeners to Sidebar Menu Items
document.querySelectorAll('.sidebar-grid-menu .menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const tabName = item.querySelector('span')?.textContent.trim();
    if (tabName) switchDashboardTab(tabName);
  });
});

// Attach event listeners to Quick Access Cards
document.querySelectorAll('.access-box').forEach(box => {
  box.addEventListener('click', () => {
    const tabName = box.querySelector('span')?.textContent.trim();
    if (tabName) switchDashboardTab(tabName);
  });
});

// =======================================================
// 8. INTERACTIVE CALENDAR DATE SELECTOR LOGIC
// =======================================================
function attachCalendarListeners() {
  const dayNumbers = document.querySelectorAll('.day-num');
  const focusedEventDate = document.querySelector('.focused-event-date');
  
  dayNumbers.forEach(dayEl => {
    if (dayEl.classList.contains('muted')) return;
    
    dayEl.style.cursor = 'pointer';
    dayEl.addEventListener('click', function() {
      dayNumbers.forEach(el => el.classList.remove('active'));
      this.classList.add('active');

      const dayNum = this.textContent.trim();
      if (focusedEventDate) {
        focusedEventDate.textContent = `Mon, ${dayNum} June 2026`;
      }
    });
  });
}

attachCalendarListeners();