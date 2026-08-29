import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
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
const matricInput = document.querySelector('input[name="matriculation-number"]');
const passwordInput = document.querySelector('input[name="password"]');
const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('LoggedInView');

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

// Toggle course topics accordion and fetch uploaded materials from Firestore
window.toggleCourseTopics = async function(topicContainerId, courseCode) {
  const container = document.getElementById(topicContainerId);
  if (!container) return;

  const isHidden = container.style.display === 'none' || container.style.display === '';
  container.style.display = isHidden ? 'block' : 'none';

  if (isHidden && courseCode) {
    await fetchTopicMaterials(courseCode, topicContainerId);
  }
};

// Fetch uploaded course materials from Cloud Firestore
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
            <i class="${getFileIconClass(file.fileType)}" style="margin-right: 6px;"></i> ${file.fileName}
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
  if (fileType.includes('pdf')) return 'fa-solid fa-file-pdf style="color: #ff4d4d;"';
  if (fileType.includes('image')) return 'fa-solid fa-file-image style="color: #4ade80;"';
  if (fileType.includes('video') || fileType.includes('mp4')) return 'fa-solid fa-file-video style="color: #4f8bff;"';
  return 'fa-solid fa-file-lines style="color: var(--gold-glow);"';
}

window.printDocument = function(fileUrl) {
  const printWindow = window.open(fileUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
    printWindow.print();
  }
};

window.openUploadModal = function(courseCode) {
  const modal = document.getElementById('uploadNotesModal');
  const courseInput = document.getElementById('uploadTargetCourse');
  if (courseInput) courseInput.value = courseCode;
  if (modal) modal.showModal();
};

// Form Upload Handler via Supabase Storage
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

      // 1. Upload raw binary file to Supabase Storage bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('course_materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 2. Fetch the public CDN URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('course_materials')
        .getPublicUrl(filePath);

      const downloadURL = urlData.publicUrl;

      // 3. Store file record metadata in Firestore Database
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
// 3. LOGIN & LOGOUT FLOWS
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

    if (!rawMatric.includes('@')) rawMatric = `${rawMatric}${MATRIC_SUFFIX}`;

    try {
      await signInWithEmailAndPassword(auth, rawMatric, password);
    } catch (error) {
      displayError("Invalid credentials. Verify your matric number and password.");
    }
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider).catch((error) => {
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
  const homeView = document.getElementById('dashboardHomeView');
  const coursesView = document.getElementById('coursesView');
  const timetableView = document.getElementById('timetableView');
  const resultsView = document.getElementById('resultsView');
  const feesView = document.getElementById('feesView');
  const noticesView = document.getElementById('noticesView');
  const documentsView = document.getElementById('documentsView');

  menuItems.forEach((item) => {
    const itemText = item.querySelector('span')?.textContent.trim();
    if (itemText === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  if (homeView) homeView.style.display = 'none';
  if (coursesView) coursesView.style.display = 'none';
  if (timetableView) timetableView.style.display = 'none';
  if (resultsView) resultsView.style.display = 'none';
  if (feesView) feesView.style.display = 'none';
  if (noticesView) noticesView.style.display = 'none';
  if (documentsView) documentsView.style.display = 'none';

  if (tabName === 'Courses' && coursesView) {
    coursesView.style.display = 'block';
  } else if (tabName === 'Timetable' && timetableView) {
    timetableView.style.display = 'block';
  } else if (tabName === 'Results' && resultsView) {
    resultsView.style.display = 'block';
  } else if (tabName === 'Fees' && feesView) {
    feesView.style.display = 'block';
  } else if (tabName === 'Notices' && noticesView) {
    noticesView.style.display = 'block';
  } else if (tabName === 'Documents' && documentsView) {
    documentsView.style.display = 'block';
  } else if (homeView) {
    homeView.style.display = 'block';
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
// 6. COMPLETE DEPARTMENT SCORESHEET DATABASE (ACC 101, AMS 101, SOC 101)
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
      { matric: "250201408", ca: 19, exam: 34 },
      { matric: "250204001", ca: 20, exam: 43 },
      { matric: "250204002", ca: 20, exam: 51 },
      { matric: "250204003", ca: 20, exam: 47 },
      { matric: "250204004", ca: 19, exam: 47 },
      { matric: "250204005", ca: 20, exam: 45 },
      { matric: "250204006", ca: 18, exam: 36 },
      { matric: "250204010", ca: 19, exam: 49 },
      { matric: "250204011", ca: 19, exam: 32 },
      { matric: "250204012", ca: 0, exam: 44 },
      { matric: "250204013", ca: 19, exam: 44 },
      { matric: "250204014", ca: 20, exam: 40 },
      { matric: "250204015", ca: 19, exam: 49 },
      { matric: "250204016", ca: 19, exam: 50 },
      { matric: "250204018", ca: 19, exam: 41 },
      { matric: "250204019", ca: 18, exam: 36 },
      { matric: "250204020", ca: 19, exam: 49 },
      { matric: "250204111", ca: 20, exam: 45 },
      { matric: "250204112", ca: 18, exam: 35 },
      { matric: "250204113", ca: 19, exam: 47 },
      { matric: "250204114", ca: 20, exam: 49 },
      { matric: "250204115", ca: 19, exam: 43 },
      { matric: "250204116", ca: 20, exam: 49 },
      { matric: "250204117", ca: 20, exam: 39 },
      { matric: "250204119", ca: 20, exam: 36 },
      { matric: "250204120", ca: 20, exam: 46 },
      { matric: "250204125", ca: 20, exam: 29 },
      { matric: "250204126", ca: 18, exam: 31 },
      { matric: "250204127", ca: 20, exam: 45 },
      { matric: "250204128", ca: 19, exam: 43 },
      { matric: "250204129", ca: 20, exam: 39 },
      { matric: "250204130", ca: 19, exam: 48 },
      { matric: "250204131", ca: 19, exam: 38 },
      { matric: "250204132", ca: 19, exam: 31 },
      { matric: "250204133", ca: 19, exam: 44 },
      { matric: "250204134", ca: 20, exam: 41 },
      { matric: "250204135", ca: 18, exam: 46 },
      { matric: "250204136", ca: 20, exam: 25 },
      { matric: "250204137", ca: 18, exam: 45 },
      { matric: "250204138", ca: 19, exam: 44 },
      { matric: "250204139", ca: 20, exam: 44 },
      { matric: "250204140", ca: 20, exam: 48 },
      { matric: "250204141", ca: 20, exam: 46 },
      { matric: "250204142", ca: 19, exam: 54 },
      { matric: "250204146", ca: 19, exam: 35 },
      { matric: "250204147", ca: 20, exam: 45 },
      { matric: "250204148", ca: 20, exam: 47 },
      { matric: "250204149", ca: 19, exam: 32 },
      { matric: "250204150", ca: 19, exam: 33 },
      { matric: "250204151", ca: 20, exam: 44 },
      { matric: "250204152", ca: 19, exam: 48 },
      { matric: "250204153", ca: 19, exam: 47 },
      { matric: "250204154", ca: 19, exam: 44 },
      { matric: "250204155", ca: 19, exam: 50 },
      { matric: "250204156", ca: 19, exam: 46 },
      { matric: "250204157", ca: 19, exam: 38 },
      { matric: "250204158", ca: 19, exam: 46 },
      { matric: "250204159", ca: 20, exam: 27 },
      { matric: "250204160", ca: 20, exam: 39 },
      { matric: "250204161", ca: 20, exam: 44 },
      { matric: "250204162", ca: 20, exam: 48 },
      { matric: "250204163", ca: 18, exam: 42 },
      { matric: "250204164", ca: 20, exam: 40 },
      { matric: "250204165", ca: 20, exam: 41 },
      { matric: "250204166", ca: 20, exam: 37 },
      { matric: "250204167", ca: 19, exam: 43 },
      { matric: "250204168", ca: 20, exam: 28 },
      { matric: "250204170", ca: 0, exam: 0 },
      { matric: "250204171", ca: 19, exam: 43 },
      { matric: "250204172", ca: 19, exam: 50 },
      { matric: "250204173", ca: 18, exam: 55 },
      { matric: "250204174", ca: 19, exam: 44 },
      { matric: "250204175", ca: 20, exam: 47 },
      { matric: "250204176", ca: 19, exam: 27 },
      { matric: "250204177", ca: 18, exam: 29 },
      { matric: "250204178", ca: 20, exam: 32 },
      { matric: "250204179", ca: 19, exam: 28 }
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
};

// =======================================================
// 7. SCORESHEET RENDERER & SEARCH (EXCLUDING NAME COLUMN)
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

  dataList.forEach((item, index) => {
    const total = item.ca + item.exam;
    const gradeObj = calculateGrade(total);
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td class="course-code-tag">${item.matric}</td>
        <td>${item.ca}</td>
        <td>${item.exam}</td>
        <td><strong>${total}</strong></td>
        <td><span class="grade-badge ${gradeObj.point >= 4 ? 'grade-a' : 'grade-b'}">${gradeObj.grade}</span></td>
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
      s.matric.toLowerCase().includes(query)
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
    const searchMatric = gpaMatricLookupInput ? gpaMatricLookupInput.value.trim().toLowerCase() : '';
    if (!searchMatric) {
      alert("Please enter a Matriculation Number to look up.");
      return;
    }

    const selects = document.querySelectorAll('.grade-select');
    let matchesFound = 0;

    selects.forEach(select => {
      const tr = select.closest('tr');
      const courseText = tr ? tr.querySelector('td')?.textContent : '';

      Object.keys(mockDepartmentResults).forEach(sem => {
        Object.keys(mockDepartmentResults[sem]).forEach(code => {
          if (courseText.includes(code)) {
            const studentRecord = mockDepartmentResults[sem][code].find(s => s.matric.toLowerCase() === searchMatric);
            if (studentRecord) {
              const total = studentRecord.ca + studentRecord.exam;
              const gradeObj = calculateGrade(total);
              select.value = gradeObj.point.toString();
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
        renderAdminDuesTable(filterQuery);
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