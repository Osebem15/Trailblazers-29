import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// =======================================================
// 1. EMBEDDED API KEYS & CONFIGURATION
// =======================================================
const GOOGLE_API_KEY = atob("QUl6YVN5QzIwenBmaW9lMEM3aXl6U210NWV4NWg4WDRwUXk1cmM0");
const SUPABASE_URL = "https://yuebmlmamkclsfizurkp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWJtbG1hbWtjbHNmaXp1cmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDIyMzksImV4cCI6MjEwMzQ3ODIzOX0.eWDugNSs0GD0Mx-eWaDjkiLx07B_oqjm-xVTdB39zpI";

const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
  authDomain: "trailblazers--29.firebaseapp.com",
  projectId: "trailblazers--29",
  storageBucket: "trailblazers--29.firebasestorage.app",
  messagingSenderId: "256240620470",
  appId: "1:256240620470:web:d727943d940d5366f1a717"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// SUPABASE STORAGE INITIALIZATION
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MATRIC_SUFFIX = "@student.local"; 

const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logoutBtn');
const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('LoggedInView') || document.getElementById('loggedInView');

const ALLOWED_GOOGLE_EMAILS = [
  "lecturer.admin@gmail.com",
  "department.head@gmail.com",
  "emmanuelosebeyo2@gmail.com" 
];

let authError = document.createElement('div');
authError.style.cssText = "color: #ff4d4d; margin-bottom: 15px; font-size: 14px; display: none; font-family: 'Montserrat', sans-serif; font-weight: 600; text-align: center; width: 100%;";
if (loginForm) {
  const loginButton = loginForm.querySelector('.btn-login') || loginForm.querySelector('button[type="submit"]');
  if (loginButton) loginForm.insertBefore(authError, loginButton);
}

function displayError(message) {
  authError.innerText = message;
  authError.style.display = "block";
}

// =======================================================
// 1A. ACCORDION + SUPABASE FILE UPLOAD & FETCHING HELPERS
// =======================================================

window.toggleCourseTopics = async function(topicContainerId, courseCode) {
  const container = document.getElementById(topicContainerId);
  if (!container) return;

  const isHidden = container.style.display === 'none' || container.style.display === '';
  container.style.display = isHidden ? 'block' : 'none';

  if (isHidden && courseCode) {
    await fetchTopicMaterials(courseCode, topicContainerId);
  }
};

async function fetchTopicMaterials(courseCode, topicContainerId) {
  const topicContainer = document.getElementById(topicContainerId);
  if (!topicContainer) return;

  try {
    const q = query(
      collection(db, 'course_materials'),
      where('courseCode', '==', courseCode)
    );
    const querySnapshot = await getDocs(q);

    const topicMap = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!topicMap[data.topicName]) {
        topicMap[data.topicName] = [];
      }
      topicMap[data.topicName].push({ id: doc.id, ...data });
    });

    const expandableTopics = topicContainer.querySelectorAll('.topic-expandable');
    expandableTopics.forEach((topicEl) => {
      const summaryText = topicEl.querySelector('summary')?.textContent.trim() || '';
      const materialsList = topicEl.querySelector('.materials-list');
      if (!materialsList) return;

      const matchingTopicKey = Object.keys(topicMap).find((key) =>
        summaryText.toLowerCase().includes(key.toLowerCase())
      );
      const files = matchingTopicKey ? topicMap[matchingTopicKey] : [];

      if (files.length === 0) {
        materialsList.innerHTML = `<p style="color: #8fa5c3; font-size: 0.8rem;">No uploaded notes yet. Be the first to upload!</p>`;
        return;
      }

      materialsList.innerHTML = files.map((file) => `
        <div class="material-file-row" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span style="color: #8fa5c3; font-size: 0.85rem;">
            <i class="${getFileIconClass(file.fileType)}" style="${getFileIconStyle(file.fileType)} margin-right: 6px;"></i> ${file.fileName}
          </span>
          <div style="display: flex; gap: 6px;">
            <a href="${file.fileUrl}" target="_blank" class="btn-outline" style="padding: 4px 8px; font-size: 0.75rem;">
              <i class="fa-solid fa-eye"></i> View
            </a>
            <a href="${file.fileUrl}" download="${file.fileName}" target="_blank" class="btn-outline" style="padding: 4px 8px; font-size: 0.75rem;">
              <i class="fa-solid fa-download"></i> Download
            </a>
            <button onclick="printDocument('${file.fileUrl}')" class="btn-outline" style="padding: 4px 8px; font-size: 0.75rem;">
              <i class="fa-solid fa-print"></i> Print
            </button>
          </div>
        </div>
      `).join('');
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
  }
}

function getFileIconClass(fileType = '') {
  if (fileType.includes('pdf')) return 'fa-solid fa-file-pdf';
  if (fileType.includes('image')) return 'fa-solid fa-file-image';
  if (fileType.includes('video') || fileType.includes('mp4')) return 'fa-solid fa-file-video';
  return 'fa-solid fa-file-lines';
}

function getFileIconStyle(fileType = '') {
  if (fileType.includes('pdf')) return 'color: #ff4d4d;';
  if (fileType.includes('image')) return 'color: #4ade80;';
  if (fileType.includes('video') || fileType.includes('mp4')) return 'color: #4f8bff;';
  return 'color: var(--gold-glow);';
}

window.printDocument = function(fileUrl) {
  const printWindow = window.open(fileUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
    printWindow.onload = function() {
      printWindow.print();
    };
  }
};

window.openUploadModal = function(courseCode) {
  const modal = document.getElementById('uploadNotesModal');
  const courseInput = document.getElementById('uploadTargetCourse');
  if (courseInput) courseInput.value = courseCode;
  if (modal) modal.showModal();
};

const uploadMaterialForm = document.getElementById('uploadMaterialForm');
if (uploadMaterialForm) {
  uploadMaterialForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const course = document.getElementById('uploadTargetCourse')?.value;
    const topic = document.getElementById('uploadTargetTopic')?.value;
    const fileInput = document.getElementById('materialFileInput');
    const file = fileInput?.files?.[0];

    if (!course || !topic || !file) {
      alert('Please select a course, topic, and file before uploading.');
      return;
    }

    try {
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${course.replace(/\s+/g, '_')}/${cleanFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('course_materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from('course_materials')
        .getPublicUrl(filePath);

      const downloadURL = urlData.publicUrl;

      await addDoc(collection(db, 'course_materials'), {
        courseCode: course,
        topicName: topic,
        fileName: file.name,
        fileType: file.type,
        fileUrl: downloadURL,
        uploadedAt: new Date().toISOString(),
        uploaderEmail: auth.currentUser ? auth.currentUser.email : 'anonymous'
      });

      alert('Material uploaded successfully to Supabase Storage!');
      document.getElementById('uploadNotesModal')?.close();
      uploadMaterialForm.reset();

      const targetAccordionId = `${course.toLowerCase().replace(/\s+/g, '')}-topics`;
      fetchTopicMaterials(course, targetAccordionId);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  });
}

// =======================================================
// 2. AUTH OBSERVER + DYNAMIC GREETING & ADMIN CHECK
// =======================================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');

    if (isGoogleUser && !ALLOWED_GOOGLE_EMAILS.includes(user.email)) {
      displayError("This Google account does not have access to this portal.");
      signOut(auth);
      return;
    }

    const greetingHeader = document.querySelector('.welcome-greeting h2');
    if (greetingHeader) {
      let displayName = user.displayName;
      if (!displayName && user.email) {
        displayName = user.email.replace(MATRIC_SUFFIX, '').replace('@gmail.com', '').toUpperCase();
      }
      greetingHeader.innerHTML = `${displayName || 'Student'} <i class="fa-solid fa-circle-check" style="color: #1d9bf0; font-size:0.95rem;"></i>`;
    }

    const adminPanel = document.getElementById('adminFeesControl');
    if (adminPanel) {
      if (user.email && ALLOWED_GOOGLE_EMAILS.includes(user.email)) {
        adminPanel.style.display = 'block';
        renderAdminDuesTable();
      } else {
        adminPanel.style.display = 'none';
      }
    }

    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "flex"; 
    if (loginForm) loginForm.reset();
    authError.style.display = "none";
  } else {
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
});

// =======================================================
// 3. LOGIN & LOGOUT FLOWS (ROBUST AUTH & AUTO-REGISTER)
// =======================================================
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none'; 

    const matricInput = loginForm.querySelector('input[name="matriculation-number"]') || document.querySelector('input[name="matriculation-number"]');
    const passwordInput = loginForm.querySelector('input[name="password"]') || document.querySelector('input[name="password"]');

    let rawMatric = matricInput ? matricInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!rawMatric || !password) {
      displayError("Please enter your matriculation number and password.");
      return;
    }

    if (!rawMatric.includes('@')) rawMatric = `${rawMatric}${MATRIC_SUFFIX}`;

    try {
      await signInWithEmailAndPassword(auth, rawMatric, password);
    } catch (error) {
      console.error("Firebase Auth Sign-In Error:", error.code, error.message);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, rawMatric, password);
        } catch (createErr) {
          console.error("Firebase Auth Registration Error:", createErr.code, createErr.message);
          if (createErr.code === 'auth/weak-password') {
            displayError("Password must be at least 6 characters long.");
          } else {
            displayError("Invalid credentials or account creation failed. Verify your password.");
          }
        }
      } else if (error.code === 'auth/wrong-password') {
        displayError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/unauthorized-domain') {
        displayError("This domain is not authorized in the Firebase Console.");
      } else {
        displayError(`Authentication failed: ${error.message}`);
      }
    }
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider).catch((error) => {
      console.error("Google Sign-In Error:", error);
      displayError(`Google sign-in failed: ${error.message}`);
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    signOut(auth);
  });
}

// =======================================================
// 4. MOBILE SIDEBAR DRAWER TOGGLE
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
// 5. DYNAMIC TAB & VIEW SWITCHER
// =======================================================
function switchDashboardTab(tabName) {
  const menuItems = document.querySelectorAll('.sidebar-grid-menu .menu-item');
  const views = {
    'Home': document.getElementById('dashboardHomeView'),
    'Courses': document.getElementById('coursesView'),
    'Timetable': document.getElementById('timetableView'),
    'Results': document.getElementById('resultsView'),
    'Fees': document.getElementById('feesView'),
    'Notices': document.getElementById('noticesView'),
    'Documents': document.getElementById('documentsView')
  };

  menuItems.forEach((item) => {
    const itemText = item.querySelector('span')?.textContent.trim();
    item.classList.toggle('active', itemText === tabName);
  });

  Object.keys(views).forEach(key => {
    if (views[key]) views[key].style.display = 'none';
  });

  if (views[tabName]) {
    views[tabName].style.display = 'block';
  } else if (views['Home']) {
    views['Home'].style.display = 'block';
  }
}

document.querySelectorAll('.sidebar-grid-menu .menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const tabName = item.querySelector('span')?.textContent.trim();
    if (tabName) switchDashboardTab(tabName);
  });
});

document.querySelectorAll('.access-box').forEach(box => {
  box.addEventListener('click', () => {
    const tabName = box.querySelector('span')?.textContent.trim();
    if (tabName) switchDashboardTab(tabName);
  });
});

// =======================================================
// 6. COMPLETE DEPARTMENT SCORESHEET DATABASE
// =======================================================
const mockDepartmentResults = {
  "1st": {
    "ACC 101": [
      { matric: "210201155", ca: 4, exam: 36 },
      { matric: "250201001", ca: 21, exam: 45 },
      { matric: "250201002", ca: 25, exam: 63 },
      { matric: "250201003", ca: 25, exam: 63 },
      { matric: "250201004", ca: 18, exam: 43 },
      { matric: "250201005", ca: 22, exam: 54 },
      { matric: "250201006", ca: 24, exam: 51 },
      { matric: "250201007", ca: 26, exam: 58 },
      { matric: "250201008", ca: 26, exam: 52 },
      { matric: "250201009", ca: 25, exam: 0 },
      { matric: "250201010", ca: 30, exam: 40 },
      { matric: "250201011", ca: 21, exam: 62 },
      { matric: "250201012", ca: 28, exam: 64 },
      { matric: "250201013", ca: 20, exam: 45 },
      { matric: "250201014", ca: 29, exam: 69 },
      { matric: "250201015", ca: 20, exam: 58 },
      { matric: "250201016", ca: 26, exam: 54 },
      { matric: "250201017", ca: 29, exam: 65 },
      { matric: "250201018", ca: 21, exam: 44 },
      { matric: "250201019", ca: 18, exam: 56 },
      { matric: "250201020", ca: 20, exam: 47 },
      { matric: "250201021", ca: 25, exam: 45 },
      { matric: "250201022", ca: 29, exam: 47 },
      { matric: "250201023", ca: 26, exam: 56 },
      { matric: "250201024", ca: 21, exam: 55 },
      { matric: "250201025", ca: 25, exam: 57 },
      { matric: "250201026", ca: 23, exam: 47 },
      { matric: "250201027", ca: 27, exam: 62 },
      { matric: "250201028", ca: 16, exam: 40 },
      { matric: "250201029", ca: 26, exam: 14 },
      { matric: "250201030", ca: 22, exam: 48 },
      { matric: "250201031", ca: 22, exam: 38 },
      { matric: "250201032", ca: 20, exam: 51 },
      { matric: "250201033", ca: 26, exam: 64 },
      { matric: "250201035", ca: 26, exam: 55 },
      { matric: "250201036", ca: 19, exam: 37 },
      { matric: "250201037", ca: 27, exam: 62 },
      { matric: "250201038", ca: 25, exam: 66 },
      { matric: "250201042", ca: 27, exam: 61 },
      { matric: "250201043", ca: 24, exam: 47 },
      { matric: "250201044", ca: 25, exam: 31 },
      { matric: "250201045", ca: 27, exam: 64 },
      { matric: "250201046", ca: 27, exam: 43 },
      { matric: "250201047", ca: 27, exam: 47 },
      { matric: "250201048", ca: 23, exam: 49 },
      { matric: "250201049", ca: 21, exam: 52 },
      { matric: "250201050", ca: 26, exam: 55 },
      { matric: "250201051", ca: 25, exam: 43 },
      { matric: "250201052", ca: 15, exam: 36 },
      { matric: "250201053", ca: 26, exam: 52 },
      { matric: "250201054", ca: 25, exam: 35 },
      { matric: "250201055", ca: 22, exam: 42 },
      { matric: "250201063", ca: 22, exam: 45 },
      { matric: "250201064", ca: 23, exam: 43 },
      { matric: "250201065", ca: 27, exam: 24 },
      { matric: "250201066", ca: 25, exam: 0 },
      { matric: "250201067", ca: 23, exam: 56 },
      { matric: "250201068", ca: 28, exam: 27 },
      { matric: "250201069", ca: 23, exam: 42 },
      { matric: "250201070", ca: 27, exam: 55 },
      { matric: "250201071", ca: 22, exam: 45 },
      { matric: "250201079", ca: 26, exam: 41 },
      { matric: "250201081", ca: 20, exam: 33 },
      { matric: "250201105", ca: 26, exam: 44 },
      { matric: "250201106", ca: 27, exam: 50 },
      { matric: "250201107", ca: 29, exam: 48 },
      { matric: "250201108", ca: 14, exam: 38 },
      { matric: "250201109", ca: 20, exam: 48 },
      { matric: "250201110", ca: 27, exam: 55 },
      { matric: "250201111", ca: 27, exam: 33 },
      { matric: "250201112", ca: 29, exam: 44 },
      { matric: "250201113", ca: 20, exam: 57 },
      { matric: "250201114", ca: 24, exam: 48 },
      { matric: "250201115", ca: 26, exam: 42 },
      { matric: "250201117", ca: 28, exam: 54 },
      { matric: "250201288", ca: 21, exam: 24 },
      { matric: "250201289", ca: 24, exam: 55 },
      { matric: "250201290", ca: 24, exam: 59 },
      { matric: "250201291", ca: 28, exam: 59 },
      { matric: "250201292", ca: 20, exam: 42 },
      { matric: "250201293", ca: 26, exam: 34 },
      { matric: "250201294", ca: 28, exam: 28 },
      { matric: "250201295", ca: 25, exam: 61 },
      { matric: "250201296", ca: 26, exam: 45 },
      { matric: "250201297", ca: 25, exam: 38 },
      { matric: "250201299", ca: 23, exam: 57 },
      { matric: "250201300", ca: 10, exam: 30 },
      { matric: "250201301", ca: 25, exam: 42 },
      { matric: "250201302", ca: 23, exam: 52 },
      { matric: "250201303", ca: 27, exam: 24 },
      { matric: "250201304", ca: 28, exam: 34 },
      { matric: "250201305", ca: 26, exam: 49 },
      { matric: "250201306", ca: 25, exam: 50 },
      { matric: "250201308", ca: 29, exam: 51 },
      { matric: "250201316", ca: 25, exam: 55 },
      { matric: "250201317", ca: 26, exam: 34 },
      { matric: "250201318", ca: 17, exam: 41 },
      { matric: "250201319", ca: 25, exam: 65 },
      { matric: "250201320", ca: 27, exam: 57 },
      { matric: "250201321", ca: 27, exam: 59 },
      { matric: "250201322", ca: 22, exam: 51 },
      { matric: "250201323", ca: 25, exam: 17 },
      { matric: "250201324", ca: 26, exam: 61 },
      { matric: "250201325", ca: 24, exam: 65 },
      { matric: "250201328", ca: 24, exam: 30 },
      { matric: "250201330", ca: 20, exam: 55 },
      { matric: "250201331", ca: 27, exam: 27 },
      { matric: "250201332", ca: 27, exam: 58 },
      { matric: "250201333", ca: 26, exam: 38 },
      { matric: "250201334", ca: 28, exam: 37 },
      { matric: "250201335", ca: 27, exam: 16 },
      { matric: "250201336", ca: 23, exam: 37 },
      { matric: "250201337", ca: 24, exam: 48 },
      { matric: "250201338", ca: 18, exam: 57 },
      { matric: "250201339", ca: 23, exam: 48 },
      { matric: "250201340", ca: 15, exam: 43 },
      { matric: "250201341", ca: 26, exam: 54 },
      { matric: "250201342", ca: 23, exam: 24 },
      { matric: "250201343", ca: 22, exam: 57 },
      { matric: "250201344", ca: 26, exam: 49 },
      { matric: "250201345", ca: 26, exam: 51 },
      { matric: "250201346", ca: 22, exam: 23 },
      { matric: "250201347", ca: 24, exam: 63 },
      { matric: "250201348", ca: 23, exam: 62 },
      { matric: "250201349", ca: 27, exam: 36 },
      { matric: "250201353", ca: 14, exam: 21 },
      { matric: "250201354", ca: 25, exam: 14 },
      { matric: "250201355", ca: 30, exam: 10 },
      { matric: "250201356", ca: 16, exam: 24 },
      { matric: "250201357", ca: 19, exam: 51 },
      { matric: "250201358", ca: 18, exam: 17 },
      { matric: "250201359", ca: 26, exam: 35 },
      { matric: "250201360", ca: 20, exam: 44 },
      { matric: "250201361", ca: 24, exam: 58 },
      { matric: "250201362", ca: 0, exam: 41 },
      { matric: "250201363", ca: 26, exam: 58 },
      { matric: "250201364", ca: 23, exam: 56 },
      { matric: "250201365", ca: 15, exam: 19 },
      { matric: "250201366", ca: 24, exam: 33 },
      { matric: "250201367", ca: 25, exam: 45 },
      { matric: "250201368", ca: 23, exam: 43 },
      { matric: "250201369", ca: 28, exam: 27 },
      { matric: "250201371", ca: 27, exam: 43 },
      { matric: "250201372", ca: 25, exam: 63 },
      { matric: "250201373", ca: 24, exam: 56 },
      { matric: "250201374", ca: 29, exam: 41 },
      { matric: "250201375", ca: 27, exam: 15 },
      { matric: "250201376", ca: 23, exam: 56 },
      { matric: "250201378", ca: 26, exam: 23 },
      { matric: "250201379", ca: 18, exam: 55 },
      { matric: "250201380", ca: 26, exam: 29 },
      { matric: "250201381", ca: 23, exam: 53 },
      { matric: "250201382", ca: 26, exam: 49 },
      { matric: "250201383", ca: 25, exam: 43 },
      { matric: "250201384", ca: 26, exam: 36 },
      { matric: "250201385", ca: 27, exam: 45 },
      { matric: "250201386", ca: 23, exam: 57 },
      { matric: "250201387", ca: 20, exam: 41 },
      { matric: "250201389", ca: 22, exam: 64 },
      { matric: "250201390", ca: 12, exam: 28 },
      { matric: "250201391", ca: 21, exam: 20 },
      { matric: "250201392", ca: 23, exam: 17 },
      { matric: "250201393", ca: 9, exam: 47 },
      { matric: "250201394", ca: 23, exam: 57 },
      { matric: "250201395", ca: 27, exam: 40 },
      { matric: "250201396", ca: 29, exam: 36 },
      { matric: "250201397", ca: 23, exam: 50 },
      { matric: "250201398", ca: 22, exam: 43 },
      { matric: "250201399", ca: 25, exam: 47 },
      { matric: "250201400", ca: 24, exam: 40 },
      { matric: "250201401", ca: 25, exam: 35 },
      { matric: "250201402", ca: 28, exam: 22 },
      { matric: "250201403", ca: 20, exam: 30 },
      { matric: "250201404", ca: 30, exam: 40 },
      { matric: "250201405", ca: 27, exam: 57 },
      { matric: "250201406", ca: 22, exam: 31 },
      { matric: "250201407", ca: 29, exam: 48 },
      { matric: "250201408", ca: 25, exam: 20 }
    ],
    "AMS 101": [
      { matric: "230915246", ca: 20, exam: 47 },
      { matric: "250201001", ca: 18, exam: 47 },
      { matric: "250201002", ca: 19, exam: 47 },
      { matric: "250201003", ca: 20, exam: 57 },
      { matric: "250201004", ca: 19, exam: 45 },
      { matric: "250201005", ca: 19, exam: 58 },
      { matric: "250201006", ca: 19, exam: 52 },
      { matric: "250201007", ca: 20, exam: 47 },
      { matric: "250201008", ca: 19, exam: 51 },
      { matric: "250201009", ca: 19, exam: 47 },
      { matric: "250201010", ca: 18, exam: 51 },
      { matric: "250201011", ca: 19, exam: 56 },
      { matric: "250201012", ca: 20, exam: 48 },
      { matric: "250201013", ca: 19, exam: 45 },
      { matric: "250201014", ca: 20, exam: 55 },
      { matric: "250201015", ca: 20, exam: 52 },
      { matric: "250201016", ca: 19, exam: 56 },
      { matric: "250201017", ca: 18, exam: 53 },
      { matric: "250201018", ca: 18, exam: 50 },
      { matric: "250201019", ca: 20, exam: 51 },
      { matric: "250201020", ca: 20, exam: 47 },
      { matric: "250201021", ca: 18, exam: 47 },
      { matric: "250201022", ca: 19, exam: 54 },
      { matric: "250201023", ca: 19, exam: 50 },
      { matric: "250201024", ca: 20, exam: 51 },
      { matric: "250201025", ca: 20, exam: 50 },
      { matric: "250201026", ca: 20, exam: 52 },
      { matric: "250201027", ca: 20, exam: 52 },
      { matric: "250201028", ca: 18, exam: 38 },
      { matric: "250201029", ca: 20, exam: 40 },
      { matric: "250201030", ca: 20, exam: 54 },
      { matric: "250201031", ca: 20, exam: 48 },
      { matric: "250201032", ca: 19, exam: 45 },
      { matric: "250201033", ca: 18, exam: 57 },
      { matric: "250201035", ca: 20, exam: 46 },
      { matric: "250201036", ca: 19, exam: 51 },
      { matric: "250201037", ca: 20, exam: 49 },
      { matric: "250201038", ca: 20, exam: 57 },
      { matric: "250201042", ca: 19, exam: 51 },
      { matric: "250201043", ca: 19, exam: 54 },
      { matric: "250201044", ca: 20, exam: 45 },
      { matric: "250201045", ca: 18, exam: 53 },
      { matric: "250201046", ca: 19, exam: 50 },
      { matric: "250201047", ca: 18, exam: 48 },
      { matric: "250201048", ca: 20, exam: 57 },
      { matric: "250201049", ca: 18, exam: 55 },
      { matric: "250201050", ca: 19, exam: 50 },
      { matric: "250201051", ca: 18, exam: 51 },
      { matric: "250201052", ca: 18, exam: 49 },
      { matric: "250201053", ca: 19, exam: 49 },
      { matric: "250201054", ca: 19, exam: 43 },
      { matric: "250201055", ca: 20, exam: 54 },
      { matric: "250201063", ca: 19, exam: 49 },
      { matric: "250201064", ca: 20, exam: 54 },
      { matric: "250201065", ca: 20, exam: 38 },
      { matric: "250201066", ca: 20, exam: 49 },
      { matric: "250201067", ca: 18, exam: 57 },
      { matric: "250201068", ca: 20, exam: 38 },
      { matric: "250201069", ca: 20, exam: 47 },
      { matric: "250201070", ca: 19, exam: 53 },
      { matric: "250201071", ca: 20, exam: 49 },
      { matric: "250201079", ca: 20, exam: 46 },
      { matric: "250201081", ca: 20, exam: 41 },
      { matric: "250201105", ca: 19, exam: 49 },
      { matric: "250201106", ca: 18, exam: 42 },
      { matric: "250201107", ca: 19, exam: 50 },
      { matric: "250201108", ca: 18, exam: 40 },
      { matric: "250201109", ca: 20, exam: 45 },
      { matric: "250201110", ca: 20, exam: 52 },
      { matric: "250201111", ca: 20, exam: 44 },
      { matric: "250201112", ca: 18, exam: 49 },
      { matric: "250201113", ca: 19, exam: 58 },
      { matric: "250201114", ca: 19, exam: 50 },
      { matric: "250201115", ca: 20, exam: 51 },
      { matric: "250201117", ca: 18, exam: 48 },
      { matric: "250201288", ca: 19, exam: 43 },
      { matric: "250201289", ca: 19, exam: 49 },
      { matric: "250201290", ca: 19, exam: 57 },
      { matric: "250201291", ca: 0, exam: 53 },
      { matric: "250201292", ca: 0, exam: 50 },
      { matric: "250201293", ca: 18, exam: 52 },
      { matric: "250201294", ca: 18, exam: 45 },
      { matric: "250201295", ca: 20, exam: 56 },
      { matric: "250201296", ca: 19, exam: 51 },
      { matric: "250201297", ca: 19, exam: 43 },
      { matric: "250201299", ca: 18, exam: 55 },
      { matric: "250201300", ca: 20, exam: 37 },
      { matric: "250201301", ca: 20, exam: 46 },
      { matric: "250201302", ca: 20, exam: 48 },
      { matric: "250201303", ca: 20, exam: 46 },
      { matric: "250201304", ca: 19, exam: 51 },
      { matric: "250201305", ca: 18, exam: 49 },
      { matric: "250201306", ca: 20, exam: 53 },
      { matric: "250201308", ca: 19, exam: 53 },
      { matric: "250201316", ca: 18, exam: 41 },
      { matric: "250201317", ca: 19, exam: 45 },
      { matric: "250201318", ca: 18, exam: 43 },
      { matric: "250201319", ca: 19, exam: 56 },
      { matric: "250201320", ca: 19, exam: 49 },
      { matric: "250201321", ca: 20, exam: 44 },
      { matric: "250201322", ca: 20, exam: 49 },
      { matric: "250201323", ca: 18, exam: 35 },
      { matric: "250201324", ca: 20, exam: 54 },
      { matric: "250201325", ca: 19, exam: 56 },
      { matric: "250201328", ca: 19, exam: 38 },
      { matric: "250201330", ca: 20, exam: 52 },
      { matric: "250201331", ca: 18, exam: 49 },
      { matric: "250201332", ca: 20, exam: 44 },
      { matric: "250201333", ca: 19, exam: 49 },
      { matric: "250201334", ca: 20, exam: 35 },
      { matric: "250201335", ca: 19, exam: 34 },
      { matric: "250201336", ca: 18, exam: 48 },
      { matric: "250201337", ca: 20, exam: 49 },
      { matric: "250201338", ca: 19, exam: 49 },
      { matric: "250201339", ca: 19, exam: 44 },
      { matric: "250201340", ca: 19, exam: 47 },
      { matric: "250201341", ca: 20, exam: 48 },
      { matric: "250201342", ca: 20, exam: 38 },
      { matric: "250201343", ca: 20, exam: 58 },
      { matric: "250201344", ca: 19, exam: 46 },
      { matric: "250201345", ca: 18, exam: 54 },
      { matric: "250201346", ca: 20, exam: 45 },
      { matric: "250201347", ca: 20, exam: 52 },
      { matric: "250201348", ca: 20, exam: 55 },
      { matric: "250201349", ca: 0, exam: 41 },
      { matric: "250201353", ca: 20, exam: 33 },
      { matric: "250201354", ca: 20, exam: 33 },
      { matric: "250201355", ca: 0, exam: 33 },
      { matric: "250201356", ca: 18, exam: 46 },
      { matric: "250201357", ca: 18, exam: 47 },
      { matric: "250201358", ca: 20, exam: 40 },
      { matric: "250201359", ca: 20, exam: 50 },
      { matric: "250201360", ca: 19, exam: 45 },
      { matric: "250201361", ca: 20, exam: 55 },
      { matric: "250201362", ca: 19, exam: 48 },
      { matric: "250201363", ca: 18, exam: 50 },
      { matric: "250201364", ca: 19, exam: 48 },
      { matric: "250201365", ca: 20, exam: 48 },
      { matric: "250201366", ca: 20, exam: 44 },
      { matric: "250201367", ca: 18, exam: 53 },
      { matric: "250201368", ca: 19, exam: 45 },
      { matric: "250201369", ca: 18, exam: 34 },
      { matric: "250201371", ca: 20, exam: 47 },
      { matric: "250201372", ca: 18, exam: 55 },
      { matric: "250201373", ca: 20, exam: 53 },
      { matric: "250201374", ca: 19, exam: 47 },
      { matric: "250201375", ca: 18, exam: 47 },
      { matric: "250201376", ca: 18, exam: 59 },
      { matric: "250201378", ca: 20, exam: 46 },
      { matric: "250201379", ca: 20, exam: 42 },
      { matric: "250201380", ca: 19, exam: 41 },
      { matric: "250201381", ca: 20, exam: 41 },
      { matric: "250201382", ca: 20, exam: 49 },
      { matric: "250201383", ca: 19, exam: 53 },
      { matric: "250201384", ca: 20, exam: 39 },
      { matric: "250201385", ca: 19, exam: 37 },
      { matric: "250201386", ca: 18, exam: 49 },
      { matric: "250201387", ca: 18, exam: 48 },
      { matric: "250201389", ca: 18, exam: 51 },
      { matric: "250201390", ca: 20, exam: 47 },
      { matric: "250201391", ca: 19, exam: 46 },
      { matric: "250201392", ca: 19, exam: 42 },
      { matric: "250201393", ca: 18, exam: 45 },
      { matric: "250201394", ca: 20, exam: 54 },
      { matric: "250201395", ca: 0, exam: 42 },
      { matric: "250201396", ca: 20, exam: 47 },
      { matric: "250201397", ca: 19, exam: 55 },
      { matric: "250201398", ca: 19, exam: 41 },
      { matric: "250201399", ca: 20, exam: 46 },
      { matric: "250201400", ca: 19, exam: 37 },
      { matric: "250201401", ca: 19, exam: 43 },
      { matric: "250201402", ca: 19, exam: 42 },
      { matric: "250201403", ca: 20, exam: 40 },
      { matric: "250201404", ca: 18, exam: 47 },
      { matric: "250201405", ca: 20, exam: 50 },
      { matric: "250201406", ca: 18, exam: 45 },
      { matric: "250201407", ca: 20, exam: 50 },
      { matric: "250201408", ca: 19, exam: 34 }
    ],
    "SOC 101": [
      { matric: "210201562", ca: 0, exam: 80 },
      { matric: "250201001", ca: 0, exam: 73 },
      { matric: "250201002", ca: 0, exam: 73 },
      { matric: "250201003", ca: 0, exam: 78 },
      { matric: "250201004", ca: 0, exam: 52 },
      { matric: "250201005", ca: 0, exam: 78 },
      { matric: "250201006", ca: 0, exam: 68 },
      { matric: "250201007", ca: 0, exam: 78 },
      { matric: "250201008", ca: 0, exam: 73 },
      { matric: "250201009", ca: 0, exam: 77 },
      { matric: "250201010", ca: 0, exam: 62 },
      { matric: "250201011", ca: 0, exam: 78 },
      { matric: "250201012", ca: 0, exam: 85 },
      { matric: "250201013", ca: 0, exam: 67 },
      { matric: "250201014", ca: 0, exam: 88 },
      { matric: "250201015", ca: 0, exam: 77 },
      { matric: "250201016", ca: 0, exam: 82 },
      { matric: "250201017", ca: 0, exam: 83 },
      { matric: "250201018", ca: 0, exam: 67 },
      { matric: "250201019", ca: 0, exam: 77 },
      { matric: "250201020", ca: 0, exam: 63 },
      { matric: "250201021", ca: 0, exam: 67 },
      { matric: "250201022", ca: 0, exam: 83 },
      { matric: "250201023", ca: 0, exam: 73 },
      { matric: "250201024", ca: 0, exam: 83 },
      { matric: "250201025", ca: 0, exam: 78 },
      { matric: "250201026", ca: 0, exam: 78 },
      { matric: "250201027", ca: 0, exam: 78 },
      { matric: "250201028", ca: 0, exam: 55 },
      { matric: "250201029", ca: 0, exam: 75 },
      { matric: "250201030", ca: 0, exam: 77 },
      { matric: "250201031", ca: 0, exam: 63 },
      { matric: "250201032", ca: 0, exam: 68 },
      { matric: "250201033", ca: 0, exam: 77 },
      { matric: "250201035", ca: 0, exam: 65 },
      { matric: "250201036", ca: 0, exam: 63 },
      { matric: "250201037", ca: 0, exam: 87 },
      { matric: "250201038", ca: 0, exam: 72 },
      { matric: "250201042", ca: 0, exam: 70 },
      { matric: "250201043", ca: 0, exam: 72 },
      { matric: "250201044", ca: 0, exam: 67 },
      { matric: "250201045", ca: 0, exam: 77 },
      { matric: "250201046", ca: 0, exam: 65 },
      { matric: "250201047", ca: 0, exam: 72 },
      { matric: "250201048", ca: 0, exam: 75 },
      { matric: "250201049", ca: 0, exam: 73 },
      { matric: "250201050", ca: 0, exam: 73 },
      { matric: "250201051", ca: 0, exam: 67 },
      { matric: "250201052", ca: 0, exam: 57 },
      { matric: "250201053", ca: 0, exam: 78 },
      { matric: "250201054", ca: 0, exam: 65 },
      { matric: "250201055", ca: 0, exam: 70 },
      { matric: "250201063", ca: 0, exam: 67 },
      { matric: "250201064", ca: 0, exam: 72 },
      { matric: "250201065", ca: 0, exam: 58 },
      { matric: "250201066", ca: 0, exam: 63 },
      { matric: "250201067", ca: 0, exam: 75 },
      { matric: "250201068", ca: 0, exam: 62 },
      { matric: "250201069", ca: 0, exam: 67 },
      { matric: "250201070", ca: 0, exam: 72 },
      { matric: "250201071", ca: 0, exam: 67 },
      { matric: "250201079", ca: 0, exam: 65 },
      { matric: "250201081", ca: 0, exam: 57 },
      { matric: "250201105", ca: 0, exam: 70 },
      { matric: "250201106", ca: 0, exam: 53 },
      { matric: "250201107", ca: 0, exam: 73 },
      { matric: "250201108", ca: 0, exam: 47 },
      { matric: "250201109", ca: 0, exam: 65 },
      { matric: "250201110", ca: 0, exam: 77 },
      { matric: "250201111", ca: 0, exam: 63 },
      { matric: "250201112", ca: 0, exam: 70 },
      { matric: "250201113", ca: 0, exam: 78 },
      { matric: "250201114", ca: 0, exam: 68 },
      { matric: "250201115", ca: 0, exam: 68 },
      { matric: "250201117", ca: 0, exam: 75 },
      { matric: "250201288", ca: 0, exam: 52 },
      { matric: "250201289", ca: 0, exam: 73 },
      { matric: "250201290", ca: 0, exam: 78 },
      { matric: "250201291", ca: 0, exam: 72 },
      { matric: "250201292", ca: 0, exam: 67 },
      { matric: "250201293", ca: 0, exam: 62 },
      { matric: "250201294", ca: 0, exam: 55 },
      { matric: "250201295", ca: 0, exam: 77 },
      { matric: "250201296", ca: 0, exam: 70 },
      { matric: "250201297", ca: 0, exam: 63 },
      { matric: "250201299", ca: 0, exam: 77 },
      { matric: "250201300", ca: 0, exam: 42 },
      { matric: "250201301", ca: 0, exam: 67 },
      { matric: "250201302", ca: 0, exam: 77 },
      { matric: "250201303", ca: 0, exam: 53 },
      { matric: "250201304", ca: 0, exam: 67 },
      { matric: "250201305", ca: 0, exam: 73 },
      { matric: "250201306", ca: 0, exam: 72 },
      { matric: "250201308", ca: 0, exam: 77 },
      { matric: "250201316", ca: 0, exam: 58 },
      { matric: "250201317", ca: 0, exam: 60 },
      { matric: "250201318", ca: 0, exam: 57 },
      { matric: "250201319", ca: 0, exam: 82 },
      { matric: "250201320", ca: 0, exam: 73 },
      { matric: "250201321", ca: 0, exam: 78 },
      { matric: "250201322", ca: 0, exam: 70 },
      { matric: "250201323", ca: 0, exam: 55 },
      { matric: "250201324", ca: 0, exam: 78 },
      { matric: "250201325", ca: 0, exam: 80 },
      { matric: "250201328", ca: 0, exam: 53 },
      { matric: "250201330", ca: 0, exam: 73 },
      { matric: "250201331", ca: 0, exam: 67 },
      { matric: "250201332", ca: 0, exam: 63 },
      { matric: "250201333", ca: 0, exam: 68 },
      { matric: "250201334", ca: 0, exam: 62 },
      { matric: "250201335", ca: 0, exam: 45 },
      { matric: "250201336", ca: 0, exam: 67 },
      { matric: "250201337", ca: 0, exam: 72 },
      { matric: "250201338", ca: 0, exam: 72 },
      { matric: "250201339", ca: 0, exam: 63 },
      { matric: "250201340", ca: 0, exam: 62 },
      { matric: "250201341", ca: 0, exam: 70 },
      { matric: "250201342", ca: 0, exam: 57 },
      { matric: "250201343", ca: 0, exam: 78 },
      { matric: "250201344", ca: 0, exam: 67 },
      { matric: "250201345", ca: 0, exam: 75 },
      { matric: "250201346", ca: 0, exam: 62 },
      { matric: "250201347", ca: 0, exam: 78 },
      { matric: "250201348", ca: 0, exam: 82 },
      { matric: "250201349", ca: 0, exam: 50 },
      { matric: "250201353", ca: 0, exam: 50 },
      { matric: "250201354", ca: 0, exam: 47 },
      { matric: "250201355", ca: 0, exam: 42 },
      { matric: "250201356", ca: 0, exam: 60 },
      { matric: "250201357", ca: 0, exam: 63 },
      { matric: "250201358", ca: 0, exam: 53 },
      { matric: "250201359", ca: 0, exam: 68 },
      { matric: "250201360", ca: 0, exam: 65 },
      { matric: "250201361", ca: 0, exam: 78 },
      { matric: "250201362", ca: 0, exam: 63 },
      { matric: "250201363", ca: 0, exam: 70 },
      { matric: "250201364", ca: 0, exam: 68 },
      { matric: "250201365", ca: 0, exam: 40 },
      { matric: "250201366", ca: 0, exam: 58 },
      { matric: "250201367", ca: 0, exam: 68 },
      { matric: "250201368", ca: 0, exam: 65 },
      { matric: "250201369", ca: 0, exam: 48 },
      { matric: "250201371", ca: 0, exam: 65 },
      { matric: "250201372", ca: 0, exam: 77 },
      { matric: "250201373", ca: 0, exam: 77 },
      { matric: "250201374", ca: 0, exam: 65 },
      { matric: "250201375", ca: 0, exam: 45 },
      { matric: "250201376", ca: 0, exam: 77 },
      { matric: "250201378", ca: 0, exam: 62 },
      { matric: "250201379", ca: 0, exam: 67 },
      { matric: "250201380", ca: 0, exam: 58 },
      { matric: "250201381", ca: 0, exam: 68 },
      { matric: "250201382", ca: 0, exam: 72 },
      { matric: "250201383", ca: 0, exam: 73 },
      { matric: "250201384", ca: 0, exam: 55 },
      { matric: "250201385", ca: 0, exam: 53 },
      { matric: "250201386", ca: 0, exam: 67 },
      { matric: "250201387", ca: 0, exam: 65 },
      { matric: "250201389", ca: 0, exam: 70 },
      { matric: "250201390", ca: 0, exam: 43 },
      { matric: "250201391", ca: 0, exam: 42 },
      { matric: "250201392", ca: 0, exam: 42 },
      { matric: "250201393", ca: 0, exam: 57 },
      { matric: "250201394", ca: 0, exam: 75 },
      { matric: "250201395", ca: 0, exam: 65 },
      { matric: "250201396", ca: 0, exam: 67 },
      { matric: "250201397", ca: 0, exam: 75 },
      { matric: "250201398", ca: 0, exam: 60 },
      { matric: "250201399", ca: 0, exam: 68 },
      { matric: "250201400", ca: 0, exam: 58 },
      { matric: "250201401", ca: 0, exam: 60 },
      { matric: "250201402", ca: 0, exam: 58 },
      { matric: "250201403", ca: 0, exam: 58 },
      { matric: "250201404", ca: 0, exam: 67 },
      { matric: "250201405", ca: 0, exam: 72 },
      { matric: "250201406", ca: 0, exam: 62 },
      { matric: "250201407", ca: 0, exam: 73 },
      { matric: "250201408", ca: 0, exam: 48 }
    ],
    "AMS 103": [
      { matric: "230201094", name: "ADAM, Fridausi Suleiman", grade: "C" },
      { matric: "230915246", name: "AKINMADE, Ayomide Wisdom", grade: "B" },
      { matric: "250201001", name: "OLAOSUN, Isaac Ayoola", grade: "B" },
      { matric: "250201002", name: "QUADRI, Oluwaseni Adekunle", grade: "B" },
      { matric: "250201003", name: "OKUNUBI, Mujeeb Oyindamola", grade: "A" },
      { matric: "250201004", name: "YUSUPH, Aishat Tunmise", grade: "B" },
      { matric: "250201005", name: "ANENE, Deborah Ndubuisi", grade: "A" },
      { matric: "250201006", name: "AYANTOLA, Daniella Oluwapelumi", grade: "A" },
      { matric: "250201007", name: "ADUKANLE, Precious Oluwanifemi", grade: "B" },
      { matric: "250201008", name: "AMBELLY, Aleeyah Ochuware", grade: "A" },
      { matric: "250201009", name: "DIKE, Joy Nkemjika", grade: "B" },
      { matric: "250201010", name: "KELANI, Victor Abiola", grade: "A" },
      { matric: "250201011", name: "AJIBADE, Adeola Victoria", grade: "A" },
      { matric: "250201012", name: "BODE-ADAMS, Ireoluwa Olusola", grade: "A" },
      { matric: "250201013", name: "ABIDEKUN, Elizabeth Opeyemi", grade: "B" },
      { matric: "250201014", name: "CHIEGWU, Wilson Kenechukwu", grade: "A" },
      { matric: "250201015", name: "FAKOREDE, Aliyah Abike", grade: "C" },
      { matric: "250201016", name: "NNADI, Francis Ikem", grade: "B" },
      { matric: "250201017", name: "BOROKINNI, Precious Oyinkansola", grade: "B" },
      { matric: "250201019", name: "OMEJE, Somfe Benedicta", grade: "A" },
      { matric: "250201020", name: "OGUNBAYO, Anuoluwapo Ayomikun", grade: "A" },
      { matric: "250201021", name: "ADEFALUJO, Oluwafunmilayo Hannah", grade: "B" },
      { matric: "250201022", name: "ILORI, Oluwatofunmi Olamide", grade: "A" },
      { matric: "250201023", name: "FOLORUNSHO, Mosunmola Elizabeth", grade: "B" },
      { matric: "250201024", name: "OGUNKOYA, Oluwademilade Opeyemi", grade: "A" },
      { matric: "250201025", name: "ADEBAKIN, Yusuf Kayode", grade: "A" },
      { matric: "250201026", name: "SHITTU, Olamiposi Emmanuel", grade: "A" },
      { matric: "250201027", name: "SANI, Mubarak Yakubu", grade: "A" },
      { matric: "250201028", name: "AGBALAYA, Hiqmat Olamide", grade: "B" },
      { matric: "250201029", name: "ADIO, Oluwanifemi Favour", grade: "C" },
      { matric: "250201030", name: "KALU, Glory Virginia", grade: "B" },
      { matric: "250201031", name: "JOHN, Chisom Gift", grade: "B" },
      { matric: "250201032", name: "BANKOLE, Ibukun Victor", grade: "C" },
      { matric: "250201033", name: "NWOFIA, Jedidah Eziaha", grade: "A" },
      { matric: "250201035", name: "ALAWODE, Praise Abimbola", grade: "B" },
      { matric: "250201038", name: "DA-SILVA, Precious Oluwatayo", grade: "A" },
      { matric: "250201042", name: "AKINTAN, Jamal Olanrewaju", grade: "A" },
      { matric: "250201043", name: "OLUWALAJIKI, Deborah Taiwo", grade: "B" },
      { matric: "250201044", name: "HASSAN, Eniola Oluwadamilola", grade: "C" },
      { matric: "250201045", name: "OLANREWAJU, Daniel Success", grade: "B" },
      { matric: "250201046", name: "AKINOLA, Olusolape Vivian", grade: "C" },
      { matric: "250201047", name: "BAKARE, Gold Moriseninuola", grade: "B" },
      { matric: "250201048", name: "UZOECHI, Chika Michal", grade: "A" },
      { matric: "250201049", name: "AKINREFON, Eniola Priscilla", grade: "A" },
      { matric: "250201050", name: "AJISEGIRI, Eniola Samuel", grade: "A" },
      { matric: "250201051", name: "OMEKE, Precious Anuoluwapo", grade: "B" },
      { matric: "250201052", name: "ADEMOLA, Elijah Ayomide", grade: "A" },
      { matric: "250201053", name: "BAKARE, Sulhaa Temilola", grade: "A" },
      { matric: "250201054", name: "FAKAYODE, Samuel Oluwasemilore", grade: "C" },
      { matric: "250201055", name: "FADARE, Fadeshola Joyce", grade: "A" },
      { matric: "250201063", name: "FASHINA, Ifeoluwa Elizabeth", grade: "B" },
      { matric: "250201064", name: "OLADIRAN, Praise Opemipo", grade: "B" },
      { matric: "250201065", name: "OLUFADE, Oluwaseyi Olaitan", grade: "C" },
      { matric: "250201066", name: "AKINBODE, Precious Ifeoluwa", grade: "C" },
      { matric: "250201067", name: "PRINCEWILL, Joy-Abasi Idara", grade: "A" },
      { matric: "250201068", name: "KAZEEM, Abdullateef Opeyemi", grade: "B" },
      { matric: "250201069", name: "AFOLABIOZUA, Ebubechukwu Melchizedek", grade: "A" },
      { matric: "250201070", name: "AJAYI, Isaac Aduragbemi", grade: "B" },
      { matric: "250201071", name: "KILA, Khadijah Titilope", grade: "B" },
      { matric: "250201079", name: "ASAOLU, Babatope Christopher", grade: "B" },
      { matric: "250201081", name: "EMMANUEL, Okon Emmanuella Atinmma Ayomide", grade: "B" },
      { matric: "250201105", name: "OLASUNMIBOYE, Adedamola Faith", grade: "B" },
      { matric: "250201106", name: "IBITOYE, Olawumi Peace", grade: "B" },
      { matric: "250201107", name: "AFOLABI, Daniel Olanrewaju", grade: "B" },
      { matric: "250201108", name: "OLABAMERUN, Inioluwa Mercy", grade: "B" },
      { matric: "250201109", name: "CHUKWUDI, Okeh-Chidera Gift", grade: "C" },
      { matric: "250201110", name: "YUSUF, Abdul-Azeez Ajadi", grade: "A" },
      { matric: "250201111", name: "AMOLE, Abdulsamad Kolade", grade: "B" },
      { matric: "250201112", name: "HAMZAH, Fareedah Damilola", grade: "A" },
      { matric: "250201113", name: "ODUSOLA, Moyinoluwa Dorcas", grade: "B" },
      { matric: "250201114", name: "SALAU, Mistura Eniola", grade: "A" },
      { matric: "250201115", name: "MARTINS, Adefunke Dorcas", grade: "B" },
      { matric: "250201117", name: "BADEWOLE, Prosper Oluwatoorese", grade: "A" },
      { matric: "250201288", name: "HUTHMAN, Sheriffdeen Omogbolahan", grade: "B" },
      { matric: "250201289", name: "OLADUNJOYE, Opemipo Dorcas", grade: "B" },
      { matric: "250201290", name: "BANKOLE, Jason Oluwafayokunmi", grade: "A" },
      { matric: "250201291", name: "ODUGHU, Gift Oseremien", grade: "B" },
      { matric: "250201292", name: "ADEWOLE, Habeeb Gbolahan", grade: "B" },
      { matric: "250201293", name: "AJAYI, Ifeoluwa Uziezi", grade: "A" },
      { matric: "250201294", name: "AJAYI, Motunrayo Eloho", grade: "B" },
      { matric: "250201295", name: "LAMIDI, Emmanuel Olaoluwa", grade: "A" },
      { matric: "250201296", name: "OLADUNTOYE, Oluwatimilehin Lydia", grade: "B" },
      { matric: "250201297", name: "KOTUN, Sobur Olamiji", grade: "C" },
      { matric: "250201299", name: "OLALEYE, Mopelola Grace", grade: "A" },
      { matric: "250201300", name: "EKEOPARA, Chibuike Francis", grade: "C" },
      { matric: "250201301", name: "AFOLABI, Hezekiah Tope", grade: "B" },
      { matric: "250201302", name: "ADARAMOLA, Bisola Favour", grade: "B" },
      { matric: "250201303", name: "OLANREWAJU, Juliet Oluwadamilola", grade: "B" },
      { matric: "250201304", name: "ENIAFE, Abdulwahab Alabi", grade: "B" },
      { matric: "250201305", name: "BAKARE, Idris Abayomi", grade: "B" },
      { matric: "250201306", name: "ADEBAYO, Ife Kassium", grade: "A" },
      { matric: "250201308", name: "ADESANYA, Adetutu Adebimpe", grade: "A" },
      { matric: "250201316", name: "SHOBAYO, Malik Ramadan", grade: "B" },
      { matric: "250201317", name: "OVIAWE, Faith Orobosa", grade: "B" },
      { matric: "250201318", name: "ONI, Victoria Oluwaseyi", grade: "B" },
      { matric: "250201319", name: "MUSTAPHA, Amirat Temilade", grade: "A" },
      { matric: "250201320", name: "OBASESAN-YUSUF, Jafar Akanbi", grade: "A" },
      { matric: "250201321", name: "OGBEIDE, Serena Orobosa", grade: "B" },
      { matric: "250201322", name: "AKINYEMI, Faith Oluwadamilola", grade: "C" },
      { matric: "250201323", name: "OJORA, Roheem Adeola", grade: "D" },
      { matric: "250201324", name: "OSEBEYO, Emmanuel Ayomide", grade: "B" },
      { matric: "250201325", name: "ADENIRAN, Oluwadamilola Mercy", grade: "B" },
      { matric: "250201328", name: "COKER, Omogbemisola Adedoyin", grade: "C" },
      { matric: "250201330", name: "ONI, Daniel Oluwadamilare", grade: "A" },
      { matric: "250201331", name: "OLOMO, Adeshina Emmanuel", grade: "B" },
      { matric: "250201332", name: "SHIYANBADE, Faderera Oluwanifemi", grade: "B" },
      { matric: "250201333", name: "NWANKWO, Favour Uchechi", grade: "C" },
      { matric: "250201334", name: "MONSURU, Abdul-Quadri Gbolahan", grade: "B" },
      { matric: "250201335", name: "OLADIMEJI, Isaac Ayomikun", grade: "D" },
      { matric: "250201336", name: "OYENIRAN, Olamide Jeremiah", grade: "B" },
      { matric: "250201337", name: "AGBASI, Chimamanda Valerie", grade: "B" },
      { matric: "250201338", name: "AJIBOLA, Peace Oluwanifemi Oluwatobi", grade: "B" },
      { matric: "250201339", name: "IBRAHIM, Aleeyat Kofoworola", grade: "C" },
      { matric: "250201340", name: "BATULA, Oluwaranti Janet", grade: "B" },
      { matric: "250201341", name: "AJADI, Fathia Arike", grade: "B" },
      { matric: "250201342", name: "OYEBADEJO, Tobiloba Peter", grade: "B" },
      { matric: "250201343", name: "AGBOOLA, Olabisi Anthonia", grade: "A" },
      { matric: "250201344", name: "NJOKU, Francis Ikechukwu", grade: "B" },
      { matric: "250201345", name: "ALABI, Emmanuel Oladimeji", grade: "A" },
      { matric: "250201346", name: "UGO, Onyekachi Tobiloba", grade: "B" },
      { matric: "250201347", name: "OLUWOLE, Oluwakayode John", grade: "A" },
      { matric: "250201348", name: "OLAITAN, Oluwanifemi Elizabeth", grade: "B" },
      { matric: "250201349", name: "EJIKE, Esther Chisom", grade: "B" },
      { matric: "250201353", name: "AMOSUN, Daniella Oluwatofarati", grade: "C" },
      { matric: "250201354", name: "OMEREME, Ifeanyi", grade: "C" },
      { matric: "250201356", name: "AYESORO, Eniola Ajoke", grade: "D" },
      { matric: "250201357", name: "SALAMADE, Adesola Abosede", grade: "A" },
      { matric: "250201358", name: "AJENIFUJA, Anuoluwapo Temilola", grade: "C" },
      { matric: "250201359", name: "BUSARI, Abdullah Adesola", grade: "C" },
      { matric: "250201360", name: "OPEYEMI, Faithful Opemipo", grade: "B" },
      { matric: "250201361", name: "ISOGUN, Oluwasegun Moses", grade: "A" },
      { matric: "250201362", name: "ODIO, Esther Ogbedafe", grade: "B" },
      { matric: "250201363", name: "OYENIYI-OKEDUN, Christiana Oluwanifemi", grade: "A" },
      { matric: "250201364", name: "OLASUNKANMI, Mariam Abiola", grade: "B" },
      { matric: "250201365", name: "AKINBODE, Hameedat Morenikeji", grade: "C" },
      { matric: "250201366", name: "EHIREMEN, Mercy Elomeseh", grade: "B" },
      { matric: "250201367", name: "AKAPO, David Toluwalase", grade: "B" },
      { matric: "250201368", name: "ABUBAKAR, Kehinde Fatimah", grade: "B" },
      { matric: "250201369", name: "AYINLA, Abosede Morayo", grade: "D" },
      { matric: "250201371", name: "OYEBULU, Olayiwola Damilare", grade: "C" },
      { matric: "250201372", name: "SAJOWA, Kehinde Oluwatosin", grade: "A" },
      { matric: "250201373", name: "CHUKWU, Esther Chidinma", grade: "B" },
      { matric: "250201374", name: "BENA, Elizabeth Teniola", grade: "B" },
      { matric: "250201375", name: "OLAJIRE, Quam Akinola", grade: "B" },
      { matric: "250201376", name: "BASSEY, Favour Temiloluwa", grade: "B" },
      { matric: "250201378", name: "ADENIYI, Temitope Victoria", grade: "D" },
      { matric: "250201379", name: "ADEBOWALE-DAVID, Oluwaranolasimi Joshua", grade: "B" },
      { matric: "250201380", name: "OLATOYE, Emmanuel Chukwuebuka", grade: "C" },
      { matric: "250201381", name: "HUSSEIN, Mutmainnah Damilola", grade: "C" },
      { matric: "250201382", name: "GARUBA, Aishat Eniola-Olubukola", grade: "A" },
      { matric: "250201383", name: "MOBOLADE, Zainab Morenikeji", grade: "B" },
      { matric: "250201384", name: "FADAIRO, Oluwaferanmi Elizabeth", grade: "B" },
      { matric: "250201385", name: "KUDEHINBU, Lateef Aremu", grade: "C" },
      { matric: "250201386", name: "SAMUEL, Eniola Omotoyosi", grade: "A" },
      { matric: "250201387", name: "BELLO, Mohammed Oladokun", grade: "B" },
      { matric: "250201389", name: "IMRAN, Al-Ameen Ayomide", grade: "A" },
      { matric: "250201390", name: "ODUWAYE, Toluwalase Isaac", grade: "C" },
      { matric: "250201391", name: "ADEDEJI, Tosin Christianah", grade: "C" },
      { matric: "250201393", name: "ADIGUN, Mosopefoluwa Anjolaoluwa", grade: "B" },
      { matric: "250201394", name: "OLA, Selimot Tolani", grade: "A" },
      { matric: "250201395", name: "OLULANA, Ibukunoluwa Bukola", grade: "B" },
      { matric: "250201396", name: "AJIBADE, Fathia Olamide", grade: "D" },
      { matric: "250201397", name: "MAKANJUOLA, Halleluyah Israel", grade: "A" },
      { matric: "250201398", name: "COLLINS, Victoria Vobi", grade: "A" },
      { matric: "250201399", name: "MUSTAPHA, Abdulbasit Olaide", grade: "C" },
      { matric: "250201400", name: "ADELEKE, Ayodeji Emmanuel", grade: "C" },
      { matric: "250201401", name: "OGUNFOWOKAN, Oluwatetisimi Ajoke", grade: "B" },
      { matric: "250201402", name: "ADENIRAN, Abdullahi Adedamola", grade: "C" },
      { matric: "250201404", name: "ADEYANJU, Mulikat Kehinde", grade: "B" },
      { matric: "250201405", name: "UTHMAN, Omonifemi Daniella", grade: "A" },
      { matric: "250201406", name: "FARAYIBI, Daniel Obaloluwa", grade: "C" },
      { matric: "250201407", name: "ADEKUNLE, Enoch Fiadeshola", grade: "C" },
      { matric: "250201408", name: "ADEBAYO, Oluwatofunmi Lydia", grade: "C" }
    ],
    "PSY 101": [
      { matric: "210201562", name: "OKOROAFOR CHUKWUEMEKA IKECHUKWU", ca: 0, exam: 58 },
      { matric: "240201145", name: "Owolabi Shulamite Oreoluwa", ca: 0, exam: 60 },
      { matric: "250201001", name: "Olaosun Isaac Ayoola", ca: 0, exam: 76 },
      { matric: "250201002", name: "Quadri Oluwaseni Adekunle", ca: 0, exam: 71 },
      { matric: "250201003", name: "Okunubi Mujeeb Oyindamola", ca: 0, exam: 78 },
      { matric: "250201004", name: "Yusuph Aishat Tunmise", ca: 0, exam: 72 },
      { matric: "250201005", name: "Anene Deborah Ndubuisior", ca: 0, exam: 79 },
      { matric: "250201006", name: "Ayantola Daniella Oluwapelumi", ca: 0, exam: 79 },
      { matric: "250201007", name: "Adukanie Precious Oluwanifemi", ca: 0, exam: 56 },
      { matric: "250201008", name: "Ambelly Aleeyah Ochuware", ca: 0, exam: 87 },
      { matric: "250201009", name: "Dike Joy Nkemjika", ca: 0, exam: 74 },
      { matric: "250201010", name: "Kelani Victor Abiola", ca: 0, exam: 80 },
      { matric: "250201011", name: "Ajibade Adeola Victoria", ca: 0, exam: 86 },
      { matric: "250201012", name: "Bode-Adams Ireoluwa Olusola", ca: 0, exam: 81 },
      { matric: "250201013", name: "Abidekun Elizabeth Opeyemi", ca: 0, exam: 65 },
      { matric: "250201014", name: "Chiegwu Wilson Kenechukwu", ca: 0, exam: 85 },
      { matric: "250201015", name: "Fakorede Aliyah Abike", ca: 0, exam: 66 },
      { matric: "250201016", name: "Nnadi Francis Ikem", ca: 0, exam: 71 },
      { matric: "250201017", name: "Borokinni Precious Oyinkansola", ca: 0, exam: 79 },
      { matric: "250201018", name: "Adenekan Sharon Tomiwa", ca: 0, exam: 63 },
      { matric: "250201019", name: "Omeje Somfe Benedicta", ca: 0, exam: 78 },
      { matric: "250201020", name: "Ogunbayo Anuoluwapo Ayomikun", ca: 0, exam: 70 },
      { matric: "250201021", name: "Adefalujo Oluwafunmilayo Hannah", ca: 0, exam: 66 },
      { matric: "250201022", name: "Ilori Oluwatofunmi Olamide", ca: 0, exam: 78 },
      { matric: "250201023", name: "Folorunsho Mosunmola Elizabeth", ca: 0, exam: 69 },
      { matric: "250201024", name: "Ogunkoya Oluwademilade Opeyemi", ca: 0, exam: 76 },
      { matric: "250201025", name: "Adebakin Yusuf Kayode", ca: 0, exam: 73 },
      { matric: "250201026", name: "Shittu Olamiposi Emmanuel", ca: 0, exam: 73 },
      { matric: "250201027", name: "Sani Mubarak Yakubu", ca: 0, exam: 76 },
      { matric: "250201028", name: "Agbalaya Hiqmat Olamide", ca: 0, exam: 64 },
      { matric: "250201029", name: "Adio Oluwanifemi Favour", ca: 0, exam: 63 },
      { matric: "250201030", name: "Kalu Glory Virginia", ca: 0, exam: 65 },
      { matric: "250201031", name: "John Chisom Gift", ca: 0, exam: 66 },
      { matric: "250201032", name: "Bankole Ibukun Victor", ca: 0, exam: 62 },
      { matric: "250201033", name: "Nwofia Jedidah Eziaha", ca: 0, exam: 76 },
      { matric: "250201035", name: "Alawode Praise Abimbola", ca: 0, exam: 66 },
      { matric: "250201036", name: "Olajide-Gafaar Feranmi Mary", ca: 0, exam: 60 },
      { matric: "250201037", name: "Aina Oluwatimileyin Samuel", ca: 0, exam: 80 },
      { matric: "250201038", name: "Da-Silva Precious Oluwatayo", ca: 0, exam: 77 },
      { matric: "250201042", name: "Akintan Jamal Olanrewaju", ca: 0, exam: 75 },
      { matric: "250201043", name: "Oluwalajiki Deborah Taiwo", ca: 0, exam: 67 },
      { matric: "250201044", name: "Hassan Eniola Oluwadamilola", ca: 0, exam: 60 },
      { matric: "250201045", name: "Olanrewaju Daniel Success", ca: 0, exam: 76 },
      { matric: "250201046", name: "Akinola Olusolape Vivian", ca: 0, exam: 68 },
      { matric: "250201047", name: "Bakare Gold Moriseninuola", ca: 0, exam: 64 },
      { matric: "250201048", name: "Uzoechi Chika Michal", ca: 0, exam: 78 },
      { matric: "250201049", name: "Akinrefon Eniola Priscilla", ca: 0, exam: 73 },
      { matric: "250201050", name: "Ajisegiri Eniola Samuel", ca: 0, exam: 73 },
      { matric: "250201051", name: "Omeke Precious Anuoluwapo", ca: 0, exam: 67 },
      { matric: "250201052", name: "Ademola Elijah Ayomide", ca: 0, exam: 75 },
      { matric: "250201053", name: "Bakare Sulhaa Temilola", ca: 0, exam: 73 },
      { matric: "250201054", name: "Fakayode Samuel Oluwasemilore", ca: 0, exam: 58 },
      { matric: "250201055", name: "Fadare Fadeshola Joyce", ca: 0, exam: 74 },
      { matric: "250201063", name: "Fashina Ifeoluwa Elizabeth", ca: 0, exam: 63 },
      { matric: "250201064", name: "Oladiran Praise Opemipo", ca: 0, exam: 69 },
      { matric: "250201065", name: "Olufade Oluwaseyi Olaitan", ca: 0, exam: 58 },
      { matric: "250201066", name: "Akinbode Precious Ifeoluwa", ca: 0, exam: 59 },
      { matric: "250201067", name: "Princewill Joy-Abasi Idara", ca: 0, exam: 71 },
      { matric: "250201068", name: "Kazeem Abdullateef Opeyemi", ca: 0, exam: 62 },
      { matric: "250201069", name: "Afolabiozua Ebubechukwu Melchizedek", ca: 0, exam: 71 },
      { matric: "250201070", name: "Ajayi Isaac Aduragbemi", ca: 0, exam: 69 },
      { matric: "250201071", name: "Kila Khadijah Titilope", ca: 0, exam: 67 },
      { matric: "250201079", name: "Asaolu Babatope Christopher", ca: 0, exam: 64 },
      { matric: "250201081", name: "Emmanuel Okon Emmanuella Atinmma Ayomide", ca: 0, exam: 57 },
      { matric: "250201105", name: "Olasunmiboye Adedamola Faith", ca: 0, exam: 68 },
      { matric: "250201106", name: "Ibitoye Olawumi Peace", ca: 0, exam: 60 },
      { matric: "250201107", name: "Afolabi Daniel Olanrewaju", ca: 0, exam: 70 },
      { matric: "250201108", name: "Olabamerun Inioluwa Mercy", ca: 0, exam: 60 },
      { matric: "250201109", name: "Chukwudi Okeh-Chidera Gift", ca: 0, exam: 55 },
      { matric: "250201110", name: "Yusuf Abdul-Azeez Ajadi", ca: 0, exam: 75 },
      { matric: "250201111", name: "Amole Abdulsamad Kolade", ca: 0, exam: 62 },
      { matric: "250201112", name: "Hamzah Fareedah Damilola", ca: 0, exam: 70 },
      { matric: "250201113", name: "Odusola Moyinoluwa Dorcas", ca: 0, exam: 69 },
      { matric: "250201114", name: "Salau Mistura Eniola", ca: 0, exam: 73 },
      { matric: "250201115", name: "Martins Adefunke Dorcas", ca: 0, exam: 66 },
      { matric: "250201117", name: "Badewole Prosper Oluwatoorese", ca: 0, exam: 74 },
      { matric: "250201288", name: "Huthman Sheriffdeen Omogbolahan", ca: 0, exam: 50 },
      { matric: "250201289", name: "Oladunjoye Opemipo Dorcas", ca: 0, exam: 70 },
      { matric: "250201290", name: "Bankole Jason Oluwafayokunmi", ca: 0, exam: 79 },
      { matric: "250201291", name: "Odughu Gift Oseremien", ca: 0, exam: 72 },
      { matric: "250201292", name: "Adewole Habeeb Gbolahan", ca: 0, exam: 68 },
      { matric: "250201293", name: "Ajayi Ifeoluwa Uziezi", ca: 0, exam: 68 },
      { matric: "250201294", name: "Ajayi Motunrayo Eloho", ca: 0, exam: 56 },
      { matric: "250201295", name: "Lamidi Emmanuel Olaoluwa", ca: 0, exam: 77 },
      { matric: "250201296", name: "Oladuntoye Oluwatimilehin Lydia", ca: 0, exam: 70 },
      { matric: "250201297", name: "Kotun Sobur Olamiji", ca: 0, exam: 60 },
      { matric: "250201299", name: "Olaleye Mopelola Grace", ca: 0, exam: 78 },
      { matric: "250201300", name: "Ekeopara Chibuike Francis", ca: 0, exam: 40 },
      { matric: "250201301", name: "Afolabi Hezekiah Tope", ca: 0, exam: 63 },
      { matric: "250201302", name: "Adaramola Bisola Favour", ca: 0, exam: 73 },
      { matric: "250201303", name: "Olanrewaju Juliet Oluwadamilola", ca: 0, exam: 51 },
      { matric: "250201304", name: "Eniafe Abdulwahab Alabi", ca: 0, exam: 62 },
      { matric: "250201305", name: "Bakare Idris Abayomi", ca: 0, exam: 72 },
      { matric: "250201306", name: "Adebayo Ife Kassium", ca: 0, exam: 70 },
      { matric: "250201308", name: "Adesanya Adetutu Adebimpe", ca: 0, exam: 75 },
      { matric: "250201316", name: "Shobayo Malik Ramadan", ca: 0, exam: 63 },
      { matric: "250201317", name: "Oviawe Faith Orobosa", ca: 0, exam: 58 },
      { matric: "250201318", name: "Oni Victoria Oluwaseyi", ca: 0, exam: 53 },
      { matric: "250201319", name: "Mustapha Amirat Temilade", ca: 0, exam: 83 },
      { matric: "250201320", name: "Obasesan-Yusuf Jafar Akanbi", ca: 0, exam: 76 },
      { matric: "250201321", name: "Ogbeide Serena Orobosa", ca: 0, exam: 78 },
      { matric: "250201322", name: "Akinyemi Faith Oluwadamilola", ca: 0, exam: 69 },
      { matric: "250201323", name: "Ojora Roheem Adeola", ca: 0, exam: 43 },
      { matric: "250201324", name: "Osebayo Emmanuel Ayomide", ca: 0, exam: 67 },
      { matric: "250201325", name: "Adeniran Oluwadamilola Mercy", ca: 0, exam: 82 },
      { matric: "250201328", name: "Coker Omogbemisola Adedoyin", ca: 0, exam: 51 },
      { matric: "250201330", name: "Oni Daniel Oluwadamilare", ca: 0, exam: 71 },
      { matric: "250201331", name: "Olomo Adeshina Emmanuel", ca: 0, exam: 58 },
      { matric: "250201332", name: "Shiyanbade Faderera Oluwanifemi", ca: 0, exam: 70 },
      { matric: "250201333", name: "Nwankwo Favour Uchechi", ca: 0, exam: 60 },
      { matric: "250201334", name: "Monsuru Abdul-Quadri Gbolahan", ca: 0, exam: 60 },
      { matric: "250201335", name: "Oladimeji Isaac Ayomikun", ca: 0, exam: 41 },
      { matric: "250201336", name: "Oyeniran Olamide Jeremiah", ca: 0, exam: 60 },
      { matric: "250201337", name: "Agbasi Chimamanda Valerie", ca: 0, exam: 70 },
      { matric: "250201338", name: "Ajibola Peace Oluwanifemi Oluwatobi", ca: 0, exam: 71 },
      { matric: "250201339", name: "Ibrahim Aleeyat Kofoworola", ca: 0, exam: 64 },
      { matric: "250201340", name: "Batula Oluwaranti Janet", ca: 0, exam: 57 },
      { matric: "250201341", name: "Ajadi Fathia Arike", ca: 0, exam: 73 },
      { matric: "250201342", name: "Oyebadejo Tobiloba Peter", ca: 0, exam: 45 },
      { matric: "250201343", name: "Agboola Olabisi Anthonia", ca: 0, exam: 78 },
      { matric: "250201344", name: "Njoku Francis Ikechukwu", ca: 0, exam: 67 },
      { matric: "250201345", name: "Alabi Emmanuel Oladimeji", ca: 0, exam: 74 },
      { matric: "250201346", name: "Ugo Onyekachi Tobiloba", ca: 0, exam: 41 },
      { matric: "250201347", name: "Oluwole Oluwakayode John", ca: 0, exam: 82 },
      { matric: "250201348", name: "Olaitan Oluwanifemi Elizabeth", ca: 0, exam: 80 },
      { matric: "250201349", name: "Ejike Esther Chisom", ca: 0, exam: 58 },
      { matric: "250201353", name: "Amosun Daniella Oluwatofarati", ca: 0, exam: 35 },
      { matric: "250201354", name: "Omereme Ifeanyi", ca: 0, exam: 37 },
      { matric: "250201355", name: "Tiamiyu Ayomide Deborah", ca: 0, exam: 30 },
      { matric: "250201356", name: "Ayesoro Eniola Ajoke", ca: 0, exam: 40 },
      { matric: "250201357", name: "Salamade Adesola Abosede", ca: 0, exam: 69 },
      { matric: "250201358", name: "Ajenifuja Anuoluwapo Temilola", ca: 0, exam: 32 },
      { matric: "250201359", name: "Busari Abdullah Adesola", ca: 0, exam: 56 },
      { matric: "250201360", name: "Opeyemi Faithful Opemipo", ca: 0, exam: 60 },
      { matric: "250201361", name: "Isogun Oluwasegun Moses", ca: 0, exam: 77 },
      { matric: "250201362", name: "Odio Esther Ogbedafe", ca: 0, exam: 48 },
      { matric: "250201363", name: "Oyeniyi-Okedun Christiana Oluwanifemi", ca: 0, exam: 79 },
      { matric: "250201364", name: "Olasunkanmi Mariam Abiola", ca: 0, exam: 72 },
      { matric: "250201365", name: "Akinbode Hameedat Morenikeji", ca: 0, exam: 32 },
      { matric: "250201366", name: "Ehiremen Mercy Elomeseh", ca: 0, exam: 53 },
      { matric: "250201367", name: "Akapo David Toluwalase", ca: 0, exam: 67 },
      { matric: "250201368", name: "Abubakar Kehinde Fatimah", ca: 0, exam: 63 },
      { matric: "250201369", name: "Ayinla Abosede Morayo", ca: 0, exam: 53 },
      { matric: "250201371", name: "Oyebulu Olayiwola Damilare", ca: 0, exam: 67 },
      { matric: "250201372", name: "Sajowa Kehinde Oluwatosin", ca: 0, exam: 82 },
      { matric: "250201373", name: "Chukwu Esther Chidinma", ca: 0, exam: 75 },
      { matric: "250201374", name: "Bena Elizabeth Teniola", ca: 0, exam: 68 },
      { matric: "250201375", name: "Olajire Quam Akinola", ca: 0, exam: 42 },
      { matric: "250201376", name: "Bassey Favour Temiloluwa", ca: 0, exam: 75 },
      { matric: "250201378", name: "Adeniyi Temitope Victoria", ca: 0, exam: 46 },
      { matric: "250201379", name: "Adebowale-David Oluwaranolasimi Joshua", ca: 0, exam: 69 },
      { matric: "250201380", name: "Olatoye Emmanuel Chukwuebuka", ca: 0, exam: 51 },
      { matric: "250201381", name: "Hussein Mutmainnah Damilola", ca: 0, exam: 72 },
      { matric: "250201382", name: "Garuba Aishat Eniola-Olubukola", ca: 0, exam: 73 },
      { matric: "250201383", name: "Mobolade Zainab Morenikeji", ca: 0, exam: 68 },
      { matric: "250201384", name: "Fadairo Oluwaferanmi Elizabeth", ca: 0, exam: 58 },
      { matric: "250201385", name: "Kudehinbu Lateef Aremu", ca: 0, exam: 67 },
      { matric: "250201386", name: "Samuel Eniola Omotoyosi", ca: 0, exam: 75 },
      { matric: "250201387", name: "Bello Mohammed Oladokun", ca: 0, exam: 58 },
      { matric: "250201389", name: "Imran Al-Ameen Ayomide", ca: 0, exam: 81 },
      { matric: "250201390", name: "Oduwaye Toluwalase Isaac", ca: 0, exam: 42 },
      { matric: "250201391", name: "Adedeji Tosin Christianah", ca: 0, exam: 40 },
      { matric: "250201392", name: "Lawal Opeyemi Maryam", ca: 0, exam: 41 },
      { matric: "250201393", name: "Adigun Mosopefoluwa Anjolaoluwa", ca: 0, exam: 53 },
      { matric: "250201394", name: "Ola Selimot Tolani", ca: 0, exam: 76 },
      { matric: "250201395", name: "Olulana Ibukunoluwa Bukola", ca: 0, exam: 65 },
      { matric: "250201396", name: "Ajibade Fathia Olamide", ca: 0, exam: 62 },
      { matric: "250201397", name: "Makanjuola Halleluyah Israel", ca: 0, exam: 72 },
      { matric: "250201398", name: "Collins Victoria Vobi", ca: 0, exam: 63 },
      { matric: "250201399", name: "Mustapha Abdulbasit Olaide", ca: 0, exam: 74 },
      { matric: "250201400", name: "Adeleke Ayodeji Emmanuel", ca: 0, exam: 54 },
      { matric: "250201401", name: "Ogunfowokan Oluwatofunmi Ajoke", ca: 0, exam: 71 },
      { matric: "250201402", name: "Adeniran Abdullahi Adedamola", ca: 0, exam: 51 },
      { matric: "250201403", name: "Adeniji Tanitoluwa Moyosore", ca: 0, exam: 53 },
      { matric: "250201404", name: "Adeyanju Mulikat Kehinde", ca: 0, exam: 74 },
      { matric: "250201405", name: "Uthman Omonifemi Daniella", ca: 0, exam: 82 },
      { matric: "250201406", name: "Farayibi Daniel Obaloluwa", ca: 0, exam: 32 },
      { matric: "250201407", name: "Adekunle Enoch Piadesola", ca: 0, exam: 70 },
      { matric: "250201408", name: "Adebayo Oluwatofunmi Lydia", ca: 0, exam: 60 }
    ],
    "GST 111": [
      { matric: "250201043", name: "Oluwalajiki Deborah Taiwo", ca: 32, exam: 38 },
      { matric: "250201044", name: "Hassan Eniola Oluwadamilola", ca: 35, exam: 25 },
      { matric: "250201045", name: "Olanrewaju Daniel Success", ca: 36, exam: 42 },
      { matric: "250201046", name: "Akinola Olusolape Vivian", ca: 35, exam: 30 },
      { matric: "250201047", name: "Bakare Gold Moriseninuola", ca: 36, exam: 40 },
      { matric: "250201048", name: "Uzoechi Chika Michal", ca: 35, exam: 44 },
      { matric: "250201049", name: "Akinrefon Eniola Priscilla", ca: 24, exam: 46 },
      { matric: "250201050", name: "Ajisegiri Eniola Samuel", ca: 39, exam: 43 },
      { matric: "250201051", name: "Omeke Precious Anuoluwapo", ca: 40, exam: 41 },
      { matric: "250201052", name: "Ademola Elijah Ayomide", ca: 40, exam: 42 },
      { matric: "250201053", name: "Bakare Sulhaa Temilola", ca: 37, exam: 39 },
      { matric: "250201054", name: "Fakayode Samuel Oluwasemilore", ca: 32, exam: 33 },
      { matric: "250201055", name: "Fadare Fadeshola Joyce", ca: 37, exam: 46 },
      { matric: "250201063", name: "Fashina Ifeoluwa Elizabeth", ca: 36, exam: 36 },
      { matric: "250201064", name: "Oladiran Praise Opemipo", ca: 37, exam: 39 },
      { matric: "250201065", name: "Olufade Oluwaseyi Olaitan", ca: 31, exam: 24 },
      { matric: "250201066", name: "Akinbode Precious Ifeoluwa", ca: 30, exam: 34 },
      { matric: "250201067", name: "Princewill Joy-Abasi Idara", ca: 36, exam: 46 },
      { matric: "250201068", name: "Kazeem Abdullateef Opeyemi", ca: 30, exam: 29 },
      { matric: "250201069", name: "Afolabiozua Ebubechukwu Melchizedek", ca: 38, exam: 39 },
      { matric: "250201070", name: "Ajayi Isaac Aduragbemi", ca: 36, exam: 42 },
      { matric: "250201071", name: "Kila Khadijah Titilope", ca: 31, exam: 33 },
      { matric: "250201079", name: "Asaolu Babatope Christopher", ca: 36, exam: 30 },
      { matric: "250201081", name: "Emmanuel Okon Emmanuella Atinmme Ayomide", ca: 37, exam: 34 },
      { matric: "250201105", name: "Olasunmiboye Adedamola Faith", ca: 33, exam: 43 },
      { matric: "250201106", name: "Ibitoye Olawumi Peace", ca: 31, exam: 27 },
      { matric: "250201107", name: "Afolabi Daniel Olanrewaju", ca: 34, exam: 37 },
      { matric: "250201108", name: "Olabamerun Inioluwa Mercy", ca: 34, exam: 29 },
      { matric: "250201109", name: "Chukwudi Okeh-Chidera Gift", ca: 30, exam: 30 },
      { matric: "250201110", name: "Yusuf Abdul-Azeez Ajadi", ca: 36, exam: 40 },
      { matric: "250201111", name: "Amole Abdulsamad Kolade", ca: 30, exam: 36 },
      { matric: "250201112", name: "Hamzah Fareedah Damilola", ca: 36, exam: 36 },
      { matric: "250201113", name: "Odusola Moyinoluwa Dorcas", ca: 37, exam: 35 },
      { matric: "250201114", name: "Salau Mistura Eniola", ca: 35, exam: 37 },
      { matric: "250201115", name: "Martins Adefunke Dorcas", ca: 33, exam: 40 },
      { matric: "250201117", name: "Badewole Prosper Oluwatoorese", ca: 36, exam: 34 },
      { matric: "250201288", name: "Huthman Sheriffdeen Omogbolahan", ca: 30, exam: 25 },
      { matric: "250201289", name: "Oladunjoye Opemipo Dorcas", ca: 35, exam: 38 },
      { matric: "250201290", name: "Bankole Jason Oluwafayokunmi", ca: 40, exam: 44 },
      { matric: "250201291", name: "Odughu Gift Oseremien", ca: 39, exam: 39 },
      { matric: "250201292", name: "Adewole Habeeb Gbolahan", ca: 31, exam: 26 },
      { matric: "250201293", name: "Ajayi Ifeoluwa Uziezi", ca: 39, exam: 36 },
      { matric: "250201294", name: "Ajayi Motunrayo Eloho", ca: 33, exam: 30 },
      { matric: "250201295", name: "Lamidi Emmanuel Olaoluwa", ca: 37, exam: 42 },
      { matric: "250201296", name: "Oladuntoye Oluwatimilehin Lydia", ca: 33, exam: 37 },
      { matric: "250201297", name: "Kotun Sobur Olamiji", ca: 32, exam: 32 },
      { matric: "250201299", name: "Olaleye Mopelola Grace", ca: 39, exam: 41 },
      { matric: "250201300", name: "Ekeopara Chibuike Francis", ca: 28, exam: 24 },
      { matric: "250201301", name: "Afolabi Hezekiah Taiwo", ca: 35, exam: 37 },
      { matric: "250201302", name: "Adaramola Bisola Favour", ca: 35, exam: 44 },
      { matric: "250201303", name: "Olanrewaju Juliet Oluwadamilola", ca: 33, exam: 28 },
      { matric: "250201304", name: "Eniafe Abdulwahab Alabi", ca: 31, exam: 31 },
      { matric: "250201305", name: "Bakare Idris Abayomi", ca: 37, exam: 36 },
      { matric: "250201306", name: "Adebayo Ife Kassium", ca: 38, exam: 40 },
      { matric: "250201308", name: "Adesanya Adetutu Adebimpe", ca: 34, exam: 38 },
      { matric: "250201316", name: "Shobayo Malik Ramadan", ca: 33, exam: 33 },
      { matric: "250201317", name: "Oviawe Faith Orobosa", ca: 33, exam: 39 },
      { matric: "250201318", name: "Oni Victoria Oluwaseyi", ca: 27, exam: 30 },
      { matric: "250201319", name: "Mustapha Amirat Temilade", ca: 37, exam: 44 },
      { matric: "250201320", name: "Obasesan-Yusuf Jafar Akanbi", ca: 31, exam: 36 },
      { matric: "250201321", name: "Ogbeide Serena Orobosa", ca: 37, exam: 42 },
      { matric: "250201322", name: "Akinyemi Faith Oluwadamilola", ca: 31, exam: 34 },
      { matric: "250201323", name: "Ojora Raheem Adeola", ca: 31, exam: 24 },
      { matric: "250201324", name: "Osebeyo Emmanuel Ayomide", ca: 31, exam: 52 },
      { matric: "250201325", name: "Adeniran Oluwadamilola Mercy", ca: 36, exam: 44 },
      { matric: "250201328", name: "Coker Omogbemisola Adedoyin", ca: 34, exam: 36 },
      { matric: "250201330", name: "Oni Daniel Oluwadamilare", ca: 27, exam: 31 },
      { matric: "250201331", name: "Olomo Adeshina Emmanuel", ca: 24, exam: 26 },
      { matric: "250201332", name: "Shiyanbade Faderera Oluwanifemi", ca: 35, exam: 33 },
      { matric: "250201333", name: "Nwankwo Favour Uchechi", ca: 33, exam: 36 },
      { matric: "250201334", name: "Morisuru Abdul-Quadri Gbolahan", ca: 34, exam: 35 },
      { matric: "250201335", name: "Oladimeji Isaac Ayomikun", ca: 25, exam: 25 },
      { matric: "250201336", name: "Oyeniran Olamide Jeremiah", ca: 33, exam: 33 },
      { matric: "250201337", name: "Agbasi Chimamanda Valerie", ca: 37, exam: 38 },
      { matric: "250201338", name: "Ajibola Peace Oluwanifemi Oluwatobi", ca: 36, exam: 36 },
      { matric: "250201339", name: "Ibrahim Aleeyat Kofoworola", ca: 30, exam: 28 },
      { matric: "250201340", name: "Batula Oluwaranti Janet", ca: 28, exam: 24 },
      { matric: "250201341", name: "Ajadi Fathia Arike", ca: 38, exam: 40 },
      { matric: "250201342", name: "Oyebadejo Tobiloba Peter", ca: 26, exam: 19 },
      { matric: "250201343", name: "Agboola Olabisi Anthonia", ca: 34, exam: 32 },
      { matric: "250201344", name: "Njoku Francis Ikechukwu", ca: 37, exam: 36 },
      { matric: "250201345", name: "Alabi Emmanuel Oladimeji", ca: 36, exam: 42 },
      { matric: "250201346", name: "Ugo Onyekachi Tobiloba", ca: 27, exam: 24 },
      { matric: "250201347", name: "Oluwole Oluwakayode John", ca: 37, exam: 41 },
      { matric: "250201348", name: "Olaitan Oluwanifemi Elizabeth", ca: 37, exam: 40 },
      { matric: "250201349", name: "Ejike Esther Chisom", ca: 36, exam: 41 },
      { matric: "250201353", name: "Amosun Daniella Oluwatofarati", ca: 22, exam: 18 },
      { matric: "250201354", name: "Omereme Ifeanyi", ca: 26, exam: 16 },
      { matric: "250201355", name: "Adebamowo Emmanuel Oluwaponmile", ca: 34, exam: 31 },
      { matric: "250201356", name: "Ayesoro Eniola Ajoke", ca: 22, exam: 18 },
      { matric: "250201357", name: "Salamade Adesola Abosede", ca: 30, exam: 35 },
      { matric: "250201358", name: "Ajenifuja Anuoluwapo Temilola", ca: 35, exam: 35 },
      { matric: "250201359", name: "Busari Abdullah Adesola", ca: 33, exam: 30 },
      { matric: "250201360", name: "Opeyemi Faithful Opemipo", ca: 37, exam: 39 },
      { matric: "250201361", name: "Isogun Oluwasegun Moses", ca: 33, exam: 36 },
      { matric: "250201362", name: "Odio Esther Ogbedefe", ca: 32, exam: 32 },
      { matric: "250201363", name: "Oyeniyi-Okedun Christiana Oluwanifemi", ca: 34, exam: 38 },
      { matric: "250201364", name: "Olasunkanmi Mariam Abiola", ca: 28, exam: 24 },
      { matric: "250201365", name: "Akinbode Hameedat Morenikeji", ca: 26, exam: 20 },
      { matric: "250201366", name: "Ehiremen Mercy Elomeseh", ca: 32, exam: 33 },
      { matric: "250201367", name: "Akapo David Toluwalase", ca: 37, exam: 38 },
      { matric: "250201368", name: "Abubakar Kehinde Fatimah", ca: 37, exam: 41 },
      { matric: "250201369", name: "Ayinla Abosede Morayo", ca: 35, exam: 34 },
      { matric: "250201371", name: "Oyebulu Olayiwola Damilare", ca: 34, exam: 30 },
      { matric: "250201372", name: "Sajowa Kehinde Oluwatosin", ca: 38, exam: 42 },
      { matric: "250201373", name: "Chukwu Esther Chidinma", ca: 36, exam: 42 },
      { matric: "250201374", name: "Bena Elizabeth Teniola", ca: 35, exam: 37 },
      { matric: "250201375", name: "Olajire Quam Akinola", ca: 33, exam: 35 },
      { matric: "250201376", name: "Bassey Favour Temiloluwa", ca: 35, exam: 37 },
      { matric: "250201378", name: "Adeniyi Temitope Victoria", ca: 30, exam: 28 },
      { matric: "250201379", name: "Adebawale-David Oluwaranolasimi Joshua", ca: 33, exam: 34 },
      { matric: "250201380", name: "Olatoye Emmanuel Chukwuebuka", ca: 32, exam: 30 },
      { matric: "250201381", name: "Hussain Mutmainnah Damilola", ca: 33, exam: 32 },
      { matric: "250201382", name: "Garuba Aishat Eniola-Olubukola", ca: 35, exam: 35 },
      { matric: "250201383", name: "Mobolade Zainab Morenikeji", ca: 32, exam: 34 },
      { matric: "250201384", name: "Fadairo Oluwaferanmi Elizabeth", ca: 25, exam: 25 },
      { matric: "250201385", name: "Kudehinbu Lateef Aremu", ca: 27, exam: 23 },
      { matric: "250201386", name: "Samuel Eniola Omotoyosi", ca: 39, exam: 43 },
      { matric: "250201387", name: "Bello Mohammed Oladokun", ca: 36, exam: 38 },
      { matric: "250201389", name: "Imran Al-Ameen Ayomide", ca: 30, exam: 30 },
      { matric: "250201390", name: "Oduwaye Toluwalase Isaac", ca: 35, exam: 35 },
      { matric: "250201391", name: "Adedeji Tosin Christianah", ca: 25, exam: 25 },
      { matric: "250201392", name: "Lisa Adam Alabi", ca: 25, exam: 25 },
      { matric: "250201393", name: "Adigun Mosopefoluwa Anjolaoluwa", ca: 38, exam: 41 },
      { matric: "250201394", name: "Ola Selimot Tolani", ca: 38, exam: 41 },
      { matric: "250201395", name: "Olulana Ibukunoluwa Bukola", ca: 32, exam: 30 },
      { matric: "250201396", name: "Ajibade Fathia Olamide", ca: 35, exam: 37 },
      { matric: "250201397", name: "Makanjuola Halleluyah Israel", ca: 37, exam: 40 },
      { matric: "250201398", name: "Collins Victoria Vobi", ca: 28, exam: 25 },
      { matric: "250201399", name: "Mustapha Abdulbasit Olaide", ca: 37, exam: 37 },
      { matric: "250201400", name: "Adeleke Ayodeji Emmanuel", ca: 29, exam: 25 },
      { matric: "250201401", name: "Ogunfowokan Oluwatofunmi Ajoke", ca: 35, exam: 36 },
      { matric: "250201402", name: "Adeniran Abdullahi Adedamola", ca: 27, exam: 24 },
      { matric: "250201403", name: "Adeniji Tanitoluwa Moyosore", ca: 28, exam: 25 },
      { matric: "250201404", name: "Adeyanju Mulikat Kehinde", ca: 37, exam: 37 },
      { matric: "250201405", name: "Uthman Omonifemi Daniella", ca: 40, exam: 42 },
      { matric: "250201406", name: "Farayibi Daniel Obaloluwa", ca: 18, exam: 14 },
      { matric: "250201407", name: "Adekunle Enoch Piadesola", ca: 35, exam: 35 },
      { matric: "250201408", name: "Adebayo Oluwatofunmi Lydia", ca: 30, exam: 30 },
      { matric: "210201083", name: "Quadri Kabeer Abiodun", ca: 36, exam: 35 },
      { matric: "210201155", name: "Adeleke Marvelous Joy", ca: 32, exam: 40 },
      { matric: "210201562", name: "Okoroafor Chukwuemeka Ikechukwu", ca: 37, exam: 35 },
      { matric: "240201017", name: "Folami Roqib Adebola", ca: 31, exam: 46 },
      { matric: "240201026", name: "Bakare Barakat Oluwatoyin", ca: 34, exam: 40 },
      { matric: "240201037", name: "Nwakuna Maryann Oluchukwu", ca: 37, exam: 47 },
      { matric: "240201061", name: "Kassim Halimah Omowunmi", ca: 33, exam: 38 },
      { matric: "240201066", name: "Badmus Zainab Eniola", ca: 36, exam: 42 },
      { matric: "240201084", name: "Oyenuga Victor Inioluwa", ca: 36, exam: 42 },
      { matric: "240201099", name: "Adeleke Demilade Peace", ca: 36, exam: 37 },
      { matric: "240201119", name: "Sanusi Rodiat Moyosore", ca: 35, exam: 37 },
      { matric: "240201145", name: "Owolabi Shulamite Oreoluwa", ca: 38, exam: 42 },
      { matric: "240201150", name: "Anosike Mary Chiemela", ca: 36, exam: 38 },
      { matric: "250201001", name: "Olaosun Isaac Ayoola", ca: 34, exam: 40 },
      { matric: "250201002", name: "Quadri Oluwaseni Adekunle", ca: 32, exam: 36 },
      { matric: "250201003", name: "Okunubi Mujeeb Oyindamola", ca: 36, exam: 43 },
      { matric: "250201004", name: "Yusuph Aishat Tunmise", ca: 34, exam: 39 },
      { matric: "250201005", name: "Anene Deborah Ndubuisior", ca: 35, exam: 42 },
      { matric: "250201006", name: "Ayantola Daniella Oluwapelumi", ca: 35, exam: 42 },
      { matric: "250201007", name: "Adukanie Precious Oluwanifemi", ca: 28, exam: 32 },
      { matric: "250201008", name: "Ambelly Aleeyah Ochuware", ca: 40, exam: 49 },
      { matric: "250201009", name: "Dike Joy Nkemjika", ca: 32, exam: 35 },
      { matric: "250201010", name: "Kelani Victor Abiola", ca: 36, exam: 43 },
      { matric: "250201011", name: "Bode-Adeola Victoria", ca: 38, exam: 47 },
      { matric: "250201012", name: "Bode-Adams Ireoluwa Olusola", ca: 38, exam: 43 },
      { matric: "250201013", name: "Abidekun Elizabeth Opeyemi", ca: 34, exam: 35 },
      { matric: "250201014", name: "Chiegwu Wilson Kenechukwu", ca: 40, exam: 46 },
      { matric: "250201015", name: "Fakorede Aliyah Abike", ca: 35, exam: 35 },
      { matric: "250201016", name: "Nnadi Francis Ikem", ca: 33, exam: 38 },
      { matric: "250201017", name: "Borokinni Precious Oyinkansola", ca: 36, exam: 43 },
      { matric: "250201018", name: "Akande Olamide Olamilekan", ca: 32, exam: 33 },
      { matric: "250201019", name: "Omeje Somfe Benedicta", ca: 36, exam: 42 },
      { matric: "250201020", name: "Ogunbayo Anuoluwapo Ayomikun", ca: 36, exam: 37 },
      { matric: "250201021", name: "Adefalujo Oluwafunmilayo Hannah", ca: 34, exam: 35 },
      { matric: "250201022", name: "Ilori Oluwatofunmi Olamide", ca: 36, exam: 43 },
      { matric: "250201023", name: "Folorunsho Mosunmola Elizabeth", ca: 35, exam: 37 },
      { matric: "250201024", name: "Ogunkoya Oluwademilade Opeyemi", ca: 34, exam: 41 },
      { matric: "250201025", name: "Adebakin Yusuf Kayode", ca: 37, exam: 40 },
      { matric: "250201026", name: "Shittu Olamiposi Emmanuel", ca: 36, exam: 40 },
      { matric: "250201027", name: "Sani Mubarak Yakubu", ca: 36, exam: 41 },
      { matric: "250201028", name: "Agbalaya Hiqmat Olamide", ca: 31, exam: 34 },
      { matric: "250201029", name: "Adio Oluwanifemi Favour", ca: 32, exam: 34 },
      { matric: "250201030", name: "Kalu Glory Virginia", ca: 34, exam: 35 },
      { matric: "250201031", name: "John Chisom Gift", ca: 34, exam: 35 },
      { matric: "250201032", name: "Bankole Ibukun Victor", ca: 32, exam: 33 },
      { matric: "250201033", name: "Nwofia Jedidiah Eziaha", ca: 36, exam: 41 },
      { matric: "250201035", name: "Alawode Praise Abimbola", ca: 34, exam: 35 },
      { matric: "250201036", name: "Morowo Adedayo Samuel", ca: 31, exam: 31 },
      { matric: "250201037", name: "Aladetohun Oluwakamimayo Enoch", ca: 37, exam: 43 },
      { matric: "250201038", name: "Da-Silva Precious Oluwatoyo", ca: 36, exam: 41 },
      { matric: "250204001", name: "Bello Aminat Opeyemi", ca: 34, exam: 39 },
      { matric: "250204002", name: "Ojo Temitope Isaac", ca: 32, exam: 32 },
      { matric: "250204003", name: "Adeyemi Daniel Oluwaseun", ca: 34, exam: 40 },
      { matric: "250204004", name: "Nwosu Chinedu Paul", ca: 31, exam: 28 },
      { matric: "250204005", name: "Ogunleye Favour Blessing", ca: 36, exam: 37 },
      { matric: "250204006", name: "Alabi Kehinde Francis", ca: 33, exam: 33 },
      { matric: "250204007", name: "Akinyemi Joy Oluwatosin", ca: 35, exam: 41 },
      { matric: "250204008", name: "Eze Grace Chidimma", ca: 36, exam: 43 },
      { matric: "250204009", name: "Olatunji Samuel Ayomide", ca: 32, exam: 30 },
      { matric: "250204010", name: "Ibrahim Zainab Abiske", ca: 35, exam: 38 },
      { matric: "250204011", name: "Lawal Tobi Emmanuel", ca: 34, exam: 35 },
      { matric: "250204012", name: "Chukwuma David Ebube", ca: 37, exam: 42 },
      { matric: "250204013", name: "Adeleke Favour Eniola", ca: 35, exam: 39 },
      { matric: "250204014", name: "Yusuf Mariam Olamide", ca: 36, exam: 41 },
      { matric: "250204015", name: "Olayiwola Victor Toluwalase", ca: 34, exam: 37 },
      { matric: "250204016", name: "Okeke Sandra Chioma", ca: 35, exam: 40 },
      { matric: "250204017", name: "Afolabi Timothy Olawale", ca: 33, exam: 34 },
      { matric: "250204018", name: "Dada Esther Funmilayo", ca: 36, exam: 42 },
      { matric: "250204019", name: "Popoola Joshua Adedamola", ca: 32, exam: 31 },
      { matric: "250204020", name: "Adegbite Sarah Oluwaseun", ca: 37, exam: 43 },
      { matric: "250204120", name: "Babalola Deborah Temitope", ca: 34, exam: 36 },
      { matric: "250204121", name: "Salami Rilwan Gbolahan", ca: 32, exam: 29 },
      { matric: "250204122", name: "Mustapha Hameed Olamilekan", ca: 35, exam: 38 },
      { matric: "250204123", name: "Akinola Ruth Oluwabukola", ca: 36, exam: 41 },
      { matric: "250204124", name: "Ojo Michael Ayomide", ca: 33, exam: 33 },
      { matric: "250204125", name: "Olubodun Precious Eniola", ca: 37, exam: 44 },
      { matric: "250204126", name: "Adewumi Faith Ayomikun", ca: 35, exam: 39 },
      { matric: "250204127", name: "Chukwudi Blessing Nkechi", ca: 36, exam: 40 },
      { matric: "250204128", name: "Falana Samuel Oluwatishe", ca: 32, exam: 30 },
      { matric: "250204129", name: "Olowu Peace Abiola", ca: 37, exam: 43 },
      { matric: "250204130", name: "Odunaiya Shakirat Motunrayo", ca: 36, exam: 38 },
      { matric: "250204131", name: "Ogunbenro Dorcas Tunmise", ca: 35, exam: 27 },
      { matric: "250204132", name: "Ehinmisan Marvellous Eniola", ca: 36, exam: 29 },
      { matric: "250204133", name: "Adejumola Kolapo Marvellous", ca: 40, exam: 26 },
      { matric: "250204134", name: "Odiete Favour Ngozi", ca: 36, exam: 28 }
    ],
    "ECN 101": [
      { matric: "230915246", ca: 24, exam: 34 },
      { matric: "240204015", ca: 24, exam: 23 },
      { matric: "250201001", ca: 17, exam: 30 },
      { matric: "250201002", ca: 17, exam: 43 },
      { matric: "250201003", ca: 17, exam: 46 },
      { matric: "250201004", ca: 16, exam: 34 },
      { matric: "250201005", ca: 17, exam: 51 },
      { matric: "250201006", ca: 17, exam: 45 },
      { matric: "250201007", ca: 17, exam: 39 },
      { matric: "250201008", ca: 17, exam: 51 },
      { matric: "250201009", ca: 18, exam: 37 },
      { matric: "250201010", ca: 18, exam: 36 },
      { matric: "250201011", ca: 18, exam: 49 },
      { matric: "250201012", ca: 17, exam: 47 },
      { matric: "250201013", ca: 17, exam: 34 },
      { matric: "250201014", ca: 17, exam: 48 },
      { matric: "250201015", ca: 18, exam: 36 },
      { matric: "250201016", ca: 17, exam: 37 },
      { matric: "250201017", ca: 17, exam: 39 },
      { matric: "250201018", ca: 17, exam: 33 },
      { matric: "250201019", ca: 17, exam: 45 },
      { matric: "250201020", ca: 17, exam: 36 },
      { matric: "250201021", ca: 18, exam: 33 },
      { matric: "250201022", ca: 18, exam: 45 },
      { matric: "250201023", ca: 17, exam: 37 },
      { matric: "250201024", ca: 17, exam: 37 },
      { matric: "250201025", ca: 18, exam: 40 },
      { matric: "250201026", ca: 18, exam: 41 },
      { matric: "250201027", ca: 18, exam: 44 },
      { matric: "250201028", ca: 17, exam: 24 },
      { matric: "250201029", ca: 18, exam: 27 },
      { matric: "250201030", ca: 18, exam: 35 },
      { matric: "250201031", ca: 18, exam: 31 },
      { matric: "250201032", ca: 17, exam: 28 },
      { matric: "250201033", ca: 17, exam: 39 },
      { matric: "250201035", ca: 18, exam: 32 },
      { matric: "250201036", ca: 18, exam: 28 },
      { matric: "250201037", ca: 18, exam: 41 },
      { matric: "250201038", ca: 18, exam: 39 },
      { matric: "250201042", ca: 18, exam: 41 },
      { matric: "250201043", ca: 18, exam: 34 },
      { matric: "250201044", ca: 17, exam: 33 },
      { matric: "250201045", ca: 17, exam: 44 },
      { matric: "250201046", ca: 18, exam: 35 },
      { matric: "250201047", ca: 18, exam: 33 },
      { matric: "250201048", ca: 17, exam: 42 },
      { matric: "250201049", ca: 18, exam: 40 },
      { matric: "250201050", ca: 18, exam: 44 },
      { matric: "250201051", ca: 18, exam: 36 },
      { matric: "250201052", ca: 17, exam: 36 },
      { matric: "250201053", ca: 18, exam: 36 },
      { matric: "250201054", ca: 17, exam: 27 },
      { matric: "250201055", ca: 18, exam: 41 },
      { matric: "250201063", ca: 18, exam: 37 },
      { matric: "250201064", ca: 18, exam: 43 },
      { matric: "250201065", ca: 18, exam: 30 },
      { matric: "250201066", ca: 17, exam: 33 },
      { matric: "250201067", ca: 18, exam: 38 },
      { matric: "250201068", ca: 17, exam: 31 },
      { matric: "250201069", ca: 18, exam: 33 },
      { matric: "250201070", ca: 18, exam: 41 },
      { matric: "250201071", ca: 17, exam: 37 },
      { matric: "250201079", ca: 18, exam: 32 },
      { matric: "250201081", ca: 18, exam: 26 },
      { matric: "250201105", ca: 17, exam: 36 },
      { matric: "250201106", ca: 18, exam: 27 },
      { matric: "250201107", ca: 18, exam: 38 },
      { matric: "250201108", ca: 17, exam: 26 },
      { matric: "250201109", ca: 17, exam: 28 },
      { matric: "250201110", ca: 18, exam: 41 },
      { matric: "250201111", ca: 18, exam: 32 },
      { matric: "250201112", ca: 17, exam: 35 },
      { matric: "250201113", ca: 18, exam: 38 },
      { matric: "250201114", ca: 18, exam: 38 },
      { matric: "250201115", ca: 18, exam: 35 },
      { matric: "250201117", ca: 18, exam: 41 },
      { matric: "250201288", ca: 17, exam: 29 },
      { matric: "250201289", ca: 17, exam: 37 },
      { matric: "250201290", ca: 18, exam: 47 },
      { matric: "250201291", ca: 18, exam: 41 },
      { matric: "250201292", ca: 17, exam: 23 },
      { matric: "250201293", ca: 18, exam: 36 },
      { matric: "250201294", ca: 17, exam: 29 },
      { matric: "250201295", ca: 18, exam: 41 },
      { matric: "250201296", ca: 18, exam: 32 },
      { matric: "250201297", ca: 17, exam: 28 },
      { matric: "250201299", ca: 18, exam: 42 },
      { matric: "250201300", ca: 17, exam: 23 },
      { matric: "250201301", ca: 18, exam: 36 },
      { matric: "250201302", ca: 18, exam: 37 },
      { matric: "250201303", ca: 17, exam: 28 },
      { matric: "250201304", ca: 18, exam: 32 },
      { matric: "250201305", ca: 18, exam: 38 },
      { matric: "250201306", ca: 18, exam: 42 },
      { matric: "250201308", ca: 18, exam: 40 },
      { matric: "250201316", ca: 18, exam: 32 },
      { matric: "250201317", ca: 18, exam: 34 },
      { matric: "250201318", ca: 17, exam: 27 },
      { matric: "250201319", ca: 18, exam: 44 },
      { matric: "250201320", ca: 17, exam: 39 },
      { matric: "250201321", ca: 18, exam: 43 },
      { matric: "250201322", ca: 18, exam: 33 },
      { matric: "250201323", ca: 17, exam: 25 },
      { matric: "250201324", ca: 18, exam: 46 },
      { matric: "250201325", ca: 18, exam: 44 },
      { matric: "250201328", ca: 17, exam: 26 },
      { matric: "250201330", ca: 18, exam: 33 },
      { matric: "250201331", ca: 17, exam: 25 },
      { matric: "250201332", ca: 18, exam: 34 },
      { matric: "250201333", ca: 18, exam: 33 },
      { matric: "250201334", ca: 17, exam: 31 },
      { matric: "250201335", ca: 17, exam: 23 },
      { matric: "250201336", ca: 18, exam: 31 },
      { matric: "250201337", ca: 18, exam: 39 },
      { matric: "250201338", ca: 18, exam: 37 },
      { matric: "250201339", ca: 17, exam: 28 },
      { matric: "250201340", ca: 17, exam: 27 },
      { matric: "250201341", ca: 18, exam: 41 },
      { matric: "250201342", ca: 17, exam: 21 },
      { matric: "250201343", ca: 18, exam: 39 },
      { matric: "250201344", ca: 18, exam: 36 },
      { matric: "250201345", ca: 18, exam: 42 },
      { matric: "250201346", ca: 17, exam: 24 },
      { matric: "250201347", ca: 18, exam: 43 },
      { matric: "250201348", ca: 18, exam: 43 },
      { matric: "250201349", ca: 18, exam: 37 },
      { matric: "250201353", ca: 17, exam: 20 },
      { matric: "250201354", ca: 17, exam: 19 },
      { matric: "250201355", ca: 17, exam: 23 },
      { matric: "250201356", ca: 17, exam: 20 },
      { matric: "250201357", ca: 18, exam: 32 },
      { matric: "250201358", ca: 17, exam: 25 },
      { matric: "250201359", ca: 17, exam: 29 },
      { matric: "250201360", ca: 18, exam: 33 },
      { matric: "250201361", ca: 18, exam: 40 },
      { matric: "250201362", ca: 17, exam: 26 },
      { matric: "250201363", ca: 18, exam: 42 },
      { matric: "250201364", ca: 18, exam: 34 },
      { matric: "250201365", ca: 17, exam: 20 },
      { matric: "250201366", ca: 18, exam: 31 },
      { matric: "250201367", ca: 18, exam: 38 },
      { matric: "250201368", ca: 18, exam: 37 },
      { matric: "250201369", ca: 17, exam: 26 },
      { matric: "250201371", ca: 18, exam: 32 },
      { matric: "250201372", ca: 18, exam: 44 },
      { matric: "250201373", ca: 18, exam: 40 },
      { matric: "250201374", ca: 18, exam: 36 },
      { matric: "250201375", ca: 17, exam: 28 },
      { matric: "250201376", ca: 18, exam: 42 },
      { matric: "250201378", ca: 17, exam: 25 },
      { matric: "250201379", ca: 18, exam: 33 },
      { matric: "250201380", ca: 17, exam: 28 },
      { matric: "250201381", ca: 18, exam: 32 },
      { matric: "250201382", ca: 18, exam: 39 },
      { matric: "250201383", ca: 18, exam: 34 },
      { matric: "250201384", ca: 17, exam: 26 },
      { matric: "250201385", ca: 17, exam: 25 },
      { matric: "250201386", ca: 18, exam: 42 },
      { matric: "250201387", ca: 18, exam: 36 },
      { matric: "250201389", ca: 18, exam: 40 },
      { matric: "250201390", ca: 17, exam: 24 },
      { matric: "250201391", ca: 17, exam: 23 },
      { matric: "250201392", ca: 17, exam: 23 },
      { matric: "250201393", ca: 18, exam: 33 },
      { matric: "250201394", ca: 18, exam: 43 },
      { matric: "250201395", ca: 18, exam: 32 },
      { matric: "250201396", ca: 18, exam: 35 },
      { matric: "250201397", ca: 18, exam: 41 },
      { matric: "250201398", ca: 17, exam: 28 },
      { matric: "250201399", ca: 18, exam: 36 },
      { matric: "250201400", ca: 17, exam: 27 },
      { matric: "250201401", ca: 18, exam: 35 },
      { matric: "250201402", ca: 17, exam: 25 },
      { matric: "250201403", ca: 17, exam: 26 },
      { matric: "250201404", ca: 18, exam: 38 },
      { matric: "250201405", ca: 18, exam: 45 },
      { matric: "250201406", ca: 15, exam: 15 },
      { matric: "250201407", ca: 18, exam: 37 },
      { matric: "250201408", ca: 18, exam: 30 },
      { matric: "250204101", ca: 24, exam: 48 },
      { matric: "250204102", ca: 24, exam: 25 },
      { matric: "250204103", ca: 24, exam: 38 },
      { matric: "250204104", ca: 24, exam: 28 },
      { matric: "250204105", ca: 24, exam: 36 },
      { matric: "250204106", ca: 24, exam: 31 },
      { matric: "250204107", ca: 24, exam: 39 },
      { matric: "250204108", ca: 24, exam: 41 },
      { matric: "250204109", ca: 24, exam: 29 },
      { matric: "250204110", ca: 24, exam: 35 },
      { matric: "250204111", ca: 24, exam: 33 },
      { matric: "250204112", ca: 24, exam: 40 },
      { matric: "250204113", ca: 24, exam: 36 },
      { matric: "250204114", ca: 24, exam: 38 },
      { matric: "250204115", ca: 24, exam: 37 },
      { matric: "250204116", ca: 24, exam: 41 },
      { matric: "250204117", ca: 24, exam: 33 },
      { matric: "250204118", ca: 24, exam: 51 },
      { matric: "250204119", ca: 24, exam: 35 },
      { matric: "250204120", ca: 24, exam: 35 },
      { matric: "250204121", ca: 24, exam: 28 },
      { matric: "250204122", ca: 24, exam: 36 },
      { matric: "250204123", ca: 24, exam: 39 },
      { matric: "250204124", ca: 24, exam: 31 },
      { matric: "250204125", ca: 24, exam: 22 },
      { matric: "250204126", ca: 24, exam: 27 },
      { matric: "250204127", ca: 24, exam: 35 },
      { matric: "250204128", ca: 24, exam: 32 },
      { matric: "250204129", ca: 24, exam: 41 },
      { matric: "250204130", ca: 24, exam: 36 },
      { matric: "250204131", ca: 24, exam: 25 },
      { matric: "250204132", ca: 24, exam: 27 },
      { matric: "250204133", ca: 24, exam: 24 },
      { matric: "250204134", ca: 24, exam: 26 },
      { matric: "250204135", ca: 24, exam: 28 },
      { matric: "250204136", ca: 24, exam: 32 },
      { matric: "250204137", ca: 24, exam: 39 },
      { matric: "250204138", ca: 24, exam: 36 },
      { matric: "250204139", ca: 24, exam: 26 },
      { matric: "250204140", ca: 24, exam: 32 },
      { matric: "250204141", ca: 24, exam: 37 },
      { matric: "250204142", ca: 24, exam: 30 },
      { matric: "250204143", ca: 24, exam: 38 },
      { matric: "250204144", ca: 24, exam: 33 },
      { matric: "250204145", ca: 24, exam: 40 },
      { matric: "250204146", ca: 24, exam: 24 },
      { matric: "250204147", ca: 24, exam: 40 },
      { matric: "250204148", ca: 24, exam: 41 },
      { matric: "250204149", ca: 24, exam: 35 },
      { matric: "250204150", ca: 24, exam: 21 },
      { matric: "250204151", ca: 24, exam: 20 },
      { matric: "250204152", ca: 24, exam: 22 },
      { matric: "250204153", ca: 24, exam: 22 },
      { matric: "250204154", ca: 24, exam: 30 },
      { matric: "250204155", ca: 24, exam: 31 },
      { matric: "250204156", ca: 24, exam: 23 },
      { matric: "250204157", ca: 24, exam: 32 },
      { matric: "250204158", ca: 24, exam: 26 },
      { matric: "250204159", ca: 24, exam: 30 },
      { matric: "250204160", ca: 24, exam: 34 },
      { matric: "250204161", ca: 24, exam: 38 },
      { matric: "250204162", ca: 24, exam: 31 },
      { matric: "250204163", ca: 24, exam: 39 },
      { matric: "250204164", ca: 24, exam: 33 },
      { matric: "250204165", ca: 24, exam: 20 },
      { matric: "250204166", ca: 24, exam: 29 },
      { matric: "250204167", ca: 24, exam: 35 },
      { matric: "250204168", ca: 24, exam: 34 },
      { matric: "250204169", ca: 24, exam: 25 },
      { matric: "250204170", ca: 24, exam: 24 },
      { matric: "250204171", ca: 24, exam: 30 },
      { matric: "250204172", ca: 24, exam: 33 },
      { matric: "250204173", ca: 24, exam: 40 },
      { matric: "250204174", ca: 24, exam: 31 },
      { matric: "250204175", ca: 24, exam: 26 },
      { matric: "250204176", ca: 24, exam: 20 },
      { matric: "250204177", ca: 24, exam: 20 },
      { matric: "250204178", ca: 24, exam: 29 },
      { matric: "250204179", ca: 24, exam: 30 }
    ]
  },
  "2nd": {
    "ACC 102": [],
    "ECO 102": []
  }
};

let activeSemester = "1st";
let currentActiveCourseScores = [];

function calculateGrade(total) {
  if (total >= 70) return { grade: 'A', point: 5 };
  if (total >= 60) return { grade: 'B', point: 4 };
  if (total >= 50) return { grade: 'C', point: 3 };
  if (total >= 45) return { grade: 'D', point: 2 };
  if (total >= 40) return { grade: 'E', point: 1 };
  return { grade: 'F', point: 0 };
}

window.switchSemester = function(semester) {
  activeSemester = semester;
  const btn1st = document.getElementById('btnFirstSemester');
  const btn2nd = document.getElementById('btnSecondSemester');

  if (semester === '1st') {
    if (btn1st) { btn1st.style.background = '#1d9bf0'; btn1st.style.color = '#fff'; }
    if (btn2nd) { btn2nd.style.background = 'transparent'; btn2nd.style.color = '#8fa5c3'; }
  } else {
    if (btn2nd) { btn2nd.style.background = '#1d9bf0'; btn2nd.style.color = '#fff'; }
    if (btn1st) { btn1st.style.background = 'transparent'; btn1st.style.color = '#8fa5c3'; }
  }

  document.querySelectorAll('.results-course-card').forEach(card => {
    if (card.dataset.semester === semester) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  if (courseScoresDetailView) courseScoresDetailView.style.display = 'none';
  if (resultsCourseListView) resultsCourseListView.style.display = 'block';
};

// =======================================================
// 7. SCORESHEET RENDERER & SEARCH (GRADE-ONLY & NUMERIC SAFE)
// =======================================================
const resultsCourseListView = document.getElementById('resultsCourseListView');
const courseScoresDetailView = document.getElementById('courseScoresDetailView');
const activeCourseTitle = document.getElementById('activeCourseTitle');
const studentScoresTbody = document.getElementById('studentScoresTbody');
const studentSearchInput = document.getElementById('studentSearchInput');

function renderScoresTable(dataList) {
  if (!studentScoresTbody) return;
  studentScoresTbody.innerHTML = '';

  if (dataList.length === 0) {
    studentScoresTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#8fa5c3;">No matching student results found.</td></tr>`;
    return;
  }

  const pointMap = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };

  dataList.forEach((item, index) => {
    const hasNumericScores = (item.ca !== undefined && item.exam !== undefined);
    const caVal = hasNumericScores ? item.ca : "N/A";
    const examVal = hasNumericScores ? item.exam : "N/A";
    const totalVal = hasNumericScores ? (item.ca + item.exam) : "N/A";

    let gradeLetter = item.grade;
    let gradePoint = 0;

    if (!gradeLetter && hasNumericScores) {
      const gradeObj = calculateGrade(totalVal);
      gradeLetter = gradeObj.grade;
      gradePoint = gradeObj.point;
    } else {
      gradePoint = pointMap[gradeLetter] || 0;
    }

    const badgeClass = gradeLetter ? `grade-${gradeLetter.toLowerCase()}` : (gradePoint >= 4 ? 'grade-a' : 'grade-b');

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td class="course-code-tag">${item.matric}</td>
        <td>${caVal}</td>
        <td>${examVal}</td>
        <td><strong>${totalVal}</strong></td>
        <td><span class="grade-badge ${badgeClass}">${gradeLetter}</span></td>
      </tr>
    `;
    studentScoresTbody.insertAdjacentHTML('beforeend', row);
  });
}

document.querySelectorAll('.course-score-trigger').forEach(card => {
  card.addEventListener('click', () => {
    const code = card.dataset.code;
    const title = card.dataset.title;

    currentActiveCourseScores = (mockDepartmentResults[activeSemester] && mockDepartmentResults[activeSemester][code]) || [];
    if (activeCourseTitle) activeCourseTitle.textContent = `${code} - ${title} (${activeSemester === '1st' ? '1st Semester' : '2nd Semester'})`;

    renderScoresTable(currentActiveCourseScores);

    if (resultsCourseListView) resultsCourseListView.style.display = 'none';
    if (courseScoresDetailView) courseScoresDetailView.style.display = 'block';
  });
});

const backToCoursesBtn = document.getElementById('backToCoursesBtn');
if (backToCoursesBtn) {
  backToCoursesBtn.addEventListener('click', () => {
    if (courseScoresDetailView) courseScoresDetailView.style.display = 'none';
    if (resultsCourseListView) resultsCourseListView.style.display = 'block';
    if (studentSearchInput) studentSearchInput.value = '';
  });
}

if (studentSearchInput) {
  studentSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = currentActiveCourseScores.filter(s => 
      s.matric.toLowerCase().includes(query) || (s.name && s.name.toLowerCase().includes(query))
    );
    renderScoresTable(filtered);
  });
}

// =======================================================
// 8. GPA CALCULATOR & MATRIC NO AUTO-FILL LOGIC
// =======================================================
const gpaMatricLookupInput = document.getElementById('gpaMatricLookupInput');
const autoFillGradesBtn = document.getElementById('autoFillGradesBtn');
const calculateGpaBtn = document.getElementById('calculateGpaBtn');
const computedGpaValue = document.getElementById('computedGpaValue');

if (autoFillGradesBtn) {
  autoFillGradesBtn.addEventListener('click', () => {
    let rawInput = gpaMatricLookupInput ? gpaMatricLookupInput.value.trim().toLowerCase() : '';
    const searchMatric = rawInput.split('@')[0];

    if (!searchMatric) {
      alert("Please enter a Matriculation Number to look up.");
      return;
    }

    const selects = document.querySelectorAll('.grade-select');
    let matchesFound = 0;
    const pointMap = { 'A': '5', 'B': '4', 'C': '3', 'D': '2', 'E': '1', 'F': '0' };

    selects.forEach(select => {
      const tr = select.closest('tr');
      const courseText = tr ? tr.querySelector('td')?.textContent || '' : '';

      Object.keys(mockDepartmentResults).forEach(sem => {
        Object.keys(mockDepartmentResults[sem]).forEach(code => {
          if (courseText.includes(code)) {
            const studentRecord = mockDepartmentResults[sem][code].find(s => s.matric.toLowerCase() === searchMatric);
            if (studentRecord) {
              let pointStr = '0';
              if (studentRecord.grade) {
                pointStr = pointMap[studentRecord.grade] || '0';
              } else if (studentRecord.ca !== undefined && studentRecord.exam !== undefined) {
                const total = studentRecord.ca + studentRecord.exam;
                const gradeObj = calculateGrade(total);
                pointStr = gradeObj.point.toString();
              }
              select.value = pointStr;
              matchesFound++;
            }
          }
        });
      });
    });

    if (matchesFound > 0) {
      alert(`Grades auto-filled successfully for Matric No: ${searchMatric.toUpperCase()}`);
      computeGPA();
    } else {
      alert(`No results found for Matric No: ${searchMatric.toUpperCase()}`);
    }
  });
}

function computeGPA() {
  const selects = document.querySelectorAll('.grade-select');
  let totalGradePoints = 0;
  let totalUnits = 0;

  selects.forEach(select => {
    const val = select.value;
    const units = parseFloat(select.dataset.units) || 0;

    if (val !== "") {
      totalGradePoints += parseFloat(val) * units;
      totalUnits += units;
    }
  });

  if (totalUnits === 0) {
    if (computedGpaValue) computedGpaValue.textContent = "0.00";
    return;
  }

  const gpa = (totalGradePoints / totalUnits).toFixed(2);
  if (computedGpaValue) computedGpaValue.textContent = gpa;
}

if (calculateGpaBtn) {
  calculateGpaBtn.addEventListener('click', computeGPA);
}
document.addEventListener("DOMContentLoaded", () => {
    const toggleButtons = document.querySelectorAll(".gpa-toggle-btn");
    const tableRows = document.querySelectorAll("#gpaTableBody tr");
    const gpaLabel = document.getElementById("gpaLabel");
    const gpaDisplay = document.getElementById("gpaResultDisplay");
    const calcBtn = document.getElementById("calcGpaBtn");

    let currentFilter = "1st";

    // Toggle button handler
    toggleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            toggleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentFilter = btn.dataset.filter;

            // Filter row visibility
            tableRows.forEach(row => {
                const semester = row.dataset.semester;
                if (currentFilter === "all" || semester === currentFilter) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });

            // Update label based on active view
            if (currentFilter === "1st") {
                gpaLabel.textContent = "1st Semester GPA:";
            } else if (currentFilter === "2nd") {
                gpaLabel.textContent = "2nd Semester GPA:";
            } else {
                gpaLabel.textContent = "Cumulative GPA (CGPA):";
            }

            calculateGPA();
        });
    });

    // GPA / CGPA Calculation Function
    function calculateGPA() {
        let totalQualityPoints = 0;
        let totalUnits = 0;

        tableRows.forEach(row => {
            // Only include visible rows in the current tab
            if (row.style.display !== "none") {
                const select = row.querySelector(".grade-select");
                const gradeValue = select.value;
                const units = parseFloat(select.dataset.units);

                if (gradeValue !== "" && !isNaN(gradeValue)) {
                    const gradePoint = parseFloat(gradeValue);
                    totalQualityPoints += gradePoint * units;
                    totalUnits += units;
                }
            }
        });

        if (totalUnits > 0) {
            const calculated = (totalQualityPoints / totalUnits).toFixed(2);
            gpaDisplay.textContent = calculated;
        } else {
            gpaDisplay.textContent = "0.00";
        }
    }

    // Recalculate whenever a dropdown changes
    document.querySelectorAll(".grade-select").forEach(select => {
        select.addEventListener("change", calculateGPA);
    });

    if (calcBtn) {
        calcBtn.addEventListener("click", calculateGPA);
    }
});

// =======================================================
// 9. CLASS DUES DATABASE & ADMIN TOGGLE ENGINE
// =======================================================
const studentDuesRegistry = [
  { matric: "230901001", name: "ADEBAYO Emmanuel", paid: true },
  { matric: "230901002", name: "BELLO Folake", paid: false },
  { matric: "230901003", name: "CHUKWU David", paid: true },
  { matric: "230901004", name: "DANJUMA Fatima", paid: false },
  { matric: "230901005", name: "EZE Promise", paid: true }
];

function renderAdminDuesTable(filterQuery = '') {
  const adminDuesTbody = document.getElementById('adminDuesTbody');
  if (!adminDuesTbody) return;

  adminDuesTbody.innerHTML = '';
  const filtered = studentDuesRegistry.filter(s => 
    s.name.toLowerCase().includes(filterQuery) || s.matric.toLowerCase().includes(filterQuery)
  );

  if (filtered.length === 0) {
    adminDuesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8fa5c3;">No students found.</td></tr>`;
    return;
  }

  filtered.forEach((student, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td class="course-code-tag">${student.matric}</td>
      <td><strong>${student.name}</strong></td>
      <td>
        <span class="grade-badge ${student.paid ? 'grade-a' : 'grade-b'}">
          ${student.paid ? 'Paid' : 'Pending'}
        </span>
      </td>
      <td>
        <label class="status-toggle-label">
          <input type="checkbox" class="dues-toggle-checkbox" data-matric="${student.matric}" ${student.paid ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
    `;
    adminDuesTbody.appendChild(row);
  });

  document.querySelectorAll('.dues-toggle-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const targetMatric = e.target.dataset.matric;
      const targetStudent = studentDuesRegistry.find(s => s.matric === targetMatric);
      if (targetStudent) {
        targetStudent.paid = e.target.checked;
        const currentSearch = duesAdminSearchInput ? duesAdminSearchInput.value.toLowerCase().trim() : '';
        renderAdminDuesTable(currentSearch);
      }
    });
  });
}

const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');
if (duesAdminSearchInput) {
  duesAdminSearchInput.addEventListener('input', (e) => {
    renderAdminDuesTable(e.target.value.toLowerCase().trim());
  });
}

const downloadDuesReceiptBtn = document.getElementById('downloadDuesReceiptBtn');
if (downloadDuesReceiptBtn) {
  downloadDuesReceiptBtn.addEventListener('click', () => {
    alert("Downloading official ACC '29 Class Dues payment receipt...");
  });
}

// 1. Open Upload Modal & pre-fill Course Code
function openUploadModal(courseCode) {
    document.getElementById('uploadTargetCourse').value = courseCode;
    const modal = document.getElementById('uploadNotesModal');
    if (modal.showModal) {
        modal.showModal();
    } else {
        modal.style.display = 'block';
    }
}

// 2. Handle File Upload Form Submission
document.getElementById('uploadMaterialForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const courseCode = document.getElementById('uploadTargetCourse').value;
    const topicTitle = document.getElementById('uploadTargetTopic').value;
    const fileInput = document.getElementById('materialFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = 'Uploading...';
    submitBtn.disabled = true;

    try {
        // Generate a clean, unique file path inside the bucket
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
        const filePath = `${courseCode}/${fileName}`;

        // Upload file to Supabase Storage Bucket
        const { data: storageData, error: storageError } = await supabase.storage
            .from('course-materials')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (storageError) throw storageError;

        // Get Public Download URL
        const { data: publicUrlData } = supabase.storage
            .from('course-materials')
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        // Save metadata record in Supabase Database
        const { error: dbError } = await supabase
            .from('study_materials')
            .insert([
                {
                    course_code: courseCode,
                    topic_title: topicTitle,
                    file_name: file.name,
                    file_url: publicUrl
                }
            ]);

        if (dbError) throw dbError;

        alert('Material uploaded successfully!');
        document.getElementById('uploadNotesModal').close();
        document.getElementById('uploadMaterialForm').reset();
        
        // Refresh materials list dynamically
        fetchCourseMaterials(courseCode);

    } catch (err) {
        console.error('Upload failed:', err);
        alert(`Upload failed: ${err.message}`);
    } finally {
        submitBtn.innerText = 'Upload to Cloud';
        submitBtn.disabled = false;
    }
});

// 3. Toggle Accordion Display
function toggleCourseTopics(elementId) {
    const wrapper = document.getElementById(elementId);
    if (wrapper) {
        wrapper.style.display = (wrapper.style.display === 'none' || wrapper.style.display === '') ? 'block' : 'none';
    }
}