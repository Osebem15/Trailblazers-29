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
// 6. SAMPLE STUDENT SCORESHEET DATABASE (MOCK DATA)
// =======================================================
const mockDepartmentResults = {
  "ACC 101": [
    { matric: "230901001", name: "ADEBAYO Emmanuel", ca: 26, exam: 62 },
    { matric: "230901002", name: "BELLO Folake", ca: 22, exam: 54 },
    { matric: "230901003", name: "CHUKWU David", ca: 18, exam: 45 },
    { matric: "230901004", name: "DANJUMA Fatima", ca: 28, exam: 65 },
    { matric: "230901005", name: "EZE Promise", ca: 24, exam: 58 }
  ],
  "ACC 102": [
    { matric: "230901001", name: "ADEBAYO Emmanuel", ca: 25, exam: 60 },
    { matric: "230901002", name: "BELLO Folake", ca: 20, exam: 50 },
    { matric: "230901003", name: "CHUKWU David", ca: 16, exam: 40 },
    { matric: "230901004", name: "DANJUMA Fatima", ca: 27, exam: 63 }
  ],
  "ECO 102": [
    { matric: "230901001", name: "ADEBAYO Emmanuel", ca: 22, exam: 51 },
    { matric: "230901002", name: "BELLO Folake", ca: 24, exam: 58 }
  ],
  "AMS 104": [
    { matric: "230901001", name: "ADEBAYO Emmanuel", ca: 20, exam: 46 }
  ]
};

let currentActiveCourseScores = [];

function calculateGrade(total) {
  if (total >= 70) return { grade: 'A', point: 5 };
  if (total >= 60) return { grade: 'B', point: 4 };
  if (total >= 50) return { grade: 'C', point: 3 };
  if (total >= 45) return { grade: 'D', point: 2 };
  if (total >= 40) return { grade: 'E', point: 1 };
  return { grade: 'F', point: 0 };
}

// =======================================================
// 7. COURSE SCORESHEET DISPLAY & SEARCH FILTER
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
    studentScoresTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#8fa5c3;">No matching student results found.</td></tr>`;
    return;
  }

  dataList.forEach((item, index) => {
    const total = item.ca + item.exam;
    const gradeObj = calculateGrade(total);
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td class="course-code-tag">${item.matric}</td>
        <td><strong>${item.name}</strong></td>
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

    currentActiveCourseScores = mockDepartmentResults[code] || [];
    if (activeCourseTitle) activeCourseTitle.textContent = `${code} - ${title}`;

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
      s.name.toLowerCase().includes(query) || s.matric.toLowerCase().includes(query)
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

      Object.keys(mockDepartmentResults).forEach(code => {
        if (courseText.includes(code)) {
          const studentRecord = mockDepartmentResults[code].find(s => s.matric.toLowerCase() === searchMatric);
          if (studentRecord) {
            const total = studentRecord.ca + studentRecord.exam;
            const gradeObj = calculateGrade(total);
            select.value = gradeObj.point.toString();
            matchesFound++;
          }
        }
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