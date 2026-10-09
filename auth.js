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
  "emmanuelosebeyo2@gmail.com",
  "lamidiemmanuel08@gmail.com",
  "okunubimujeeb@gmail.com",
  "yusuphaishat14@gmail.com",
  "nnafrancis5@gmail.com" 
];
// Course Topics Map for Upload Modal Dropdowns
const courseTopicsMap = {
    'ACC 210': [
        'Topic 1: IASB Framework for the Preparation and Presentation of Financial Statements',
        'Topic 2: Introduction to IFRS 15 - Revenue',
        'Topic 3: IAS 1 - Presentation of Financial Statements',
        'Topic 4: IAS 2 - Accounting for Inventory',
        'Topic 5: Introduction to IAS 8 - Accounting Policies, Changes in Estimates & Errors',
        'Topic 6: IAS 16 - Property, Plant and Equipment',
        'Topic 7: IAS 20 - Accounting for Government Grants',
        'Topic 8: IAS 23 - Borrowing Costs'
    ],
    'ACC-CM 203': [
        'Topic 1: Concepts, Theory and Practice of Corporate Governance',
        'Topic 2: Codes of Corporate Governance (OECD & International Codes)',
        'Topic 3: Governance Structure of a Company (Shareholders, Board & Management)',
        'Topic 4: Ethical Codes of Internal and External Auditors',
        'Topic 5: Roles, Types and Protection of Shareholders Rights',
        'Topic 6: Role of Board of Directors and Board Committees',
        'Topic 7: Internal Control and Internal Audit Procedures',
        'Topic 8: FRC Nigeria Corporate Governance & IFAC Ethical Codes'
    ],
    'ECO 201': [
        'Topic 1: Foundational Concepts of Microeconomics',
        'Topic 2: Consumer Behaviour I (Cardinal Utility)',
        'Topic 3: Consumer Behaviour II (Ordinal Utility)',
        'Topic 4: Consumer Surplus Analysis (Hicks & Slutsky Model)',
        'Topic 5: Demand Theory & Demand Schedules',
        'Topic 6: Supply Theory & Law of Supply',
        'Topic 7: Market Equilibrium & Price Adjustments',
        'Topic 8: Market Dynamics & Government Intervention (Price Ceilings & Floors)',
        'Topic 9: Elasticity of Demand (Price, Arc, Point, Income & Cross)',
        'Topic 10: Producer Behaviour I (Short-Run Production Analysis)',
        'Topic 11: Producer Behaviour II (Long-Run Production Analysis & Isoquants)',
        'Topic 12: Costs of Production (Short-Run & Long-Run Cost Curves)'
    ],
    'ENT 211': [
        'Topic 1: Concept, Scope and Dimensions of Entrepreneurship',
        'Topic 2: Entrepreneurial Traits and Profile Assessment',
        'Topic 3: Innovation and Change Management (Kurt Lewin 3-Stage Model)',
        'Topic 4: Enterprise Formation & Business Plan Components',
        'Topic 5: Business Registration Process in Nigeria (CAC & iCRP Portal)',
        'Topic 6: Importance & Characteristics of Micro and Small Enterprises (MSEs)',
        'Topic 7: Digital Entrepreneurship & E-Commerce Strategies'
    ],
    'FIN 101': [
        'Topic 1: Overview of Finance',
        'Topic 2: Objectives of a Business Firm',
        'Topic 3: Mathematics of Finance',
        'Topic 4: Forms of Business Enterprise',
        'Topic 5: Analysis of Risk',
        'Topic 6: Financial Markets',
        'Topic 7: Financial Statement Analysis'
    ],
    'LAG-ACS 209': [
        'Topic 1: Introduction to Statistics, Data & Methods of Data Collection',
        'Topic 2: Tabulation and Graphical Representation of Data',
        'Topic 3: Descriptive Statistics (Location, Dispersion, Skewness & Kurtosis)',
        'Topic 4: Introduction to Probability, Random Variables and Expectations',
        'Topic 5: Discrete & Continuous Probability Distributions'
    ],
    'TX-CM 313': [
        'Topic 1: Introduction to the Nigerian Legal System & Sources of Law',
        'Topic 2: Law of Contract (Formation, Terms, Vitiating Elements & Remedies)',
        'Topic 3: Sale of Goods (Implied Terms, Passing of Property & Remedies)',
        'Topic 4: Law of Agency (Creation, Types, Rights & Duties)',
        'Topic 5: Hire Purchase (Legal Framework, Formation & Remedies)'
    ]
};

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
    const { data: materials, error } = await supabase
  .from('course_materials')
  .select('*')
  .eq('courseCode', courseCode);

if (error) {
  console.error('Error fetching materials from Supabase:', error);
  return;
}

const topicMap = {};
(materials || []).forEach((data) => {
  if (!topicMap[data.topicName]) {
    topicMap[data.topicName] = [];
  }
  topicMap[data.topicName].push(data);
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
  const topicSelect = document.getElementById('uploadTargetTopic');

  if (courseInput) courseInput.value = courseCode;

  if (topicSelect) {
    topicSelect.innerHTML = '';
    const topics = courseTopicsMap[courseCode] || [
      'Topic 1: Introduction & Fundamentals',
      'Topic 2: Core Principles & Practice'
    ];
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic;
      option.textContent = topic;
      topicSelect.appendChild(option);
    });
  }

  if (modal) {
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.style.display = 'block';
    }
  }
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

    const submitBtn = uploadMaterialForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerText = 'Uploading...';
      submitBtn.disabled = true;
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

      const { error: dbError } = await supabase
  .from('course_materials')
  .insert([
    {
      courseCode: course,
      topicName: topic,
      fileName: file.name,
      fileType: file.type,
      fileUrl: downloadURL,
      uploadedAt: new Date().toISOString(),
      uploaderEmail: auth.currentUser ? auth.currentUser.email : 'anonymous'
    }
  ]);

if (dbError) throw dbError;

      alert('Material uploaded successfully to Supabase Storage!');
      document.getElementById('uploadNotesModal')?.close();
      uploadMaterialForm.reset();

      const targetAccordionId = `${course.toLowerCase().replace(/\s+/g, '')}-topics`;
      fetchTopicMaterials(course, targetAccordionId);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.innerText = 'Upload to Cloud';
        submitBtn.disabled = false;
      }
    }
  });
}

// 2. AUTH OBSERVER + DYNAMIC GREETING & ADMIN CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');
    if (isGoogleUser && !ALLOWED_GOOGLE_EMAILS.includes(user.email)) {
      displayError("This Google account does not have access to this portal.");
      signOut(auth);
      return;
    }
    let cleanMatric = user.email ? user.email.replace(MATRIC_SUFFIX, '').replace('@gmail.com', '').replace(/[^0-9]/g, '').trim() : '';
    window.currentLoggedInMatric = cleanMatric;
   
    // Save to LocalStorage for Profile & Receipt modules
    localStorage.setItem('logged_in_user_email', user.email || '');
    localStorage.setItem('logged_in_user_matric', cleanMatric);
    let displayName = (window.studentDirectory && window.studentDirectory[cleanMatric]) || user.displayName || 'Trailblazer';
   
    const greetingHeader = document.querySelector('.welcome-greeting h2');
    if (greetingHeader) {
      greetingHeader.innerHTML = `${displayName} <i class="fa-solid fa-circle-check verified-badge-icon" style="color: #1d9bf0;"></i>`;
    }
    const dropdownNameLabel = document.getElementById("dropdownUserName");
    if (dropdownNameLabel) {
      dropdownNameLabel.textContent = displayName;
    }
    if (typeof window.updateStudentDuesUI === 'function') {
      window.updateStudentDuesUI(cleanMatric);
    }
    const adminPanel = document.getElementById('adminFeesControl');
    if (adminPanel) {
      if (user.email && ALLOWED_GOOGLE_EMAILS.includes(user.email)) {
        adminPanel.style.display = 'block';
        if (typeof window.renderAdminDuesTable === 'function') {
          window.renderAdminDuesTable();
        }
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
// 3A. EMAIL / MATRICULATION LOGIN FORM
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none'; 

    const matricInput = loginForm.querySelector('input[name="matriculation-number"]') || document.getElementById('email-input');
    const passwordInput = loginForm.querySelector('input[name="password"]');

    let rawMatric = matricInput ? matricInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!rawMatric || !password) {
      displayError("Please enter your matriculation number and password.");
      return;
    }

    const extractedMatric = rawMatric.replace(/[^0-9]/g, '');
    if (typeof window.setStudentDisplayName === 'function') {
      window.setStudentDisplayName(extractedMatric);
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
          if (createErr.code === 'auth/weak-password') {
            displayError("Password must be at least 6 characters long.");
          } else if (createErr.code === 'auth/email-already-in-use') {
            displayError("Incorrect password for this account. Please try again.");
          } else {
            displayError("Authentication failed. Please verify your details.");
          }
        }
      } else if (error.code === 'auth/wrong-password') {
        displayError("Invalid matriculation number/email or password.");
      } else {
        displayError(`Authentication failed: ${error.message}`);
      }
    }
  });
}
// =======================================================
// 3. LOGIN & LOGOUT FLOWS
// =======================================================
// 3B. GOOGLE SIGN-IN BUTTON
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      displayError("Google sign-in failed. Please try again.");
    }
  });
}

// 3C. LOGOUT BUTTON
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  });
}
// Function to handle full user logout
function performLogout() {
    // 1. Hide profile popup modal immediately
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.style.display = 'none';
    }
    // 2. Hide dashboard and display login screen
    const loggedInView = document.getElementById('LoggedInView');
    const loggedOutView = document.getElementById('loggedOutView');
   
    if (loggedInView) loggedInView.style.display = 'none';
    if (loggedOutView) loggedOutView.style.display = 'block';
    // 3. Clear session storage
    localStorage.removeItem('trailblazers_user');
    sessionStorage.clear();
}
// Bind both logout buttons
document.getElementById('modalLogoutBtn')?.addEventListener('click', performLogout);
document.getElementById('logoutBtn')?.addEventListener('click', performLogout);

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
// ======================================================= 
// SUPABASE RESULTS & CGPA CALCULATOR DATABASE HELPERS 
// ======================================================= 
 
// =======================================================
// HYBRID RESULTS DATABASE: SUPABASE + LOCAL JS FALLBACK
// Used when Supabase queries fail, or return empty results
// (e.g. AMS 103 records missing / schema errors)
// =======================================================
const localCourseResultsFallback = {
    "AMS 103": [
         { matric: "250201001", name: "OLAOSUN, Isaac Ayoola", grade: "B" }, 
  { matric: "250201002", name: "QUADRI, Oluwaseni Adekunle", grade: 
"B" }, 
  { matric: "250201003", name: "OKUNUBI, Mujeeb Oyindamola", grade: 
"A" }, 
  { matric: "250201004", name: "YUSUPH, Aishat Tunmise", grade: "B" }, 
  { matric: "250201005", name: "ANENE, Deborah Ndubuisi", grade: "A" 
}, 
  { matric: "250201006", name: "AYANTOLA, Daniella Oluwapelumi", 
grade: "A" }, 
  { matric: "250201007", name: "ADUKANLE, Precious Oluwanifemi", 
grade: "B" }, 
  { matric: "250201008", name: "AMBELLY, Aleeyah Ochuware", grade: "A" 
}, 
  { matric: "250201009", name: "DIKE, Joy Nkemjika", grade: "B" }, 
  { matric: "250201010", name: "KELANI, Victor Abiola", grade: "A" }, 
  { matric: "250201011", name: "AJIBADE, Adeola Victoria", grade: "A" 
}, 
  { matric: "250201012", name: "BODE-ADAMS, Ireoluwa Olusola", grade: 
"A" }, 
  { matric: "250201013", name: "ABIDEKUN, Elizabeth Opeyemi", grade: 
"B" }, 
  { matric: "250201014", name: "CHIEGWU, Wilson Kenechukwu", grade: 
"A" }, 
  { matric: "250201015", name: "FAKOREDE, Aliyah Abike", grade: "C" }, 
  { matric: "250201016", name: "NNADI, Francis Ikem", grade: "B" }, 
  { matric: "250201017", name: "BOROKINNI, Precious Oyinkansola", 
grade: "B" }, 
  { matric: "250201019", name: "OMEJE, Somfe Benedicta", grade: "A" }, 
  { matric: "250201020", name: "OGUNBAYO, Anuoluwapo Ayomikun", grade: 
"A" }, 
  { matric: "250201021", name: "ADEFALUJO, Oluwafunmilayo Hannah", 
grade: "B" }, 
  { matric: "250201022", name: "ILORI, Oluwatofunmi Olamide", grade: 
"A" }, 
  { matric: "250201023", name: "FOLORUNSHO, Mosunmola Elizabeth", 
grade: "B" }, 
  { matric: "250201024", name: "OGUNKOYA, Oluwademilade Opeyemi", 
grade: "A" }, 
  { matric: "250201025", name: "ADEBAKIN, Yusuf Kayode", grade: "A" }, 
  { matric: "250201026", name: "SHITTU, Olamiposi Emmanuel", grade: 
"A" }, 
  { matric: "250201027", name: "SANI, Mubarak Yakubu", grade: "A" }, 
  { matric: "250201028", name: "AGBALAYA, Hiqmat Olamide", grade: "B" 
}, 
  { matric: "250201029", name: "ADIO, Oluwanifemi Favour", grade: "C" 
}, 
  { matric: "250201030", name: "KALU, Glory Virginia", grade: "B" }, 
  { matric: "250201031", name: "JOHN, Chisom Gift", grade: "B" }, 
  { matric: "250201032", name: "BANKOLE, Ibukun Victor", grade: "C" }, 
  { matric: "250201033", name: "NWOFIA, Jedidah Eziaha", grade: "A" }, 
  { matric: "250201035", name: "ALAWODE, Praise Abimbola", grade: "B" 
}, 
  { matric: "250201038", name: "DA-SILVA, Precious Oluwatayo", grade: 
"A" }, 
  { matric: "250201042", name: "AKINTAN, Jamal Olanrewaju", grade: "A" 
}, 
  { matric: "250201043", name: "OLUWALAJIKI, Deborah Taiwo", grade: 
"B" }, 
  { matric: "250201044", name: "HASSAN, Eniola Oluwadamilola", grade: 
"C" }, 
  { matric: "250201045", name: "OLANREWAJU, Daniel Success", grade: 
"B" }, 
  { matric: "250201046", name: "AKINOLA, Olusolape Vivian", grade: "C" 
}, 
  { matric: "250201047", name: "BAKARE, Gold Moriseninuola", grade: 
"B" }, 
  { matric: "250201048", name: "UZOECHI, Chika Michal", grade: "A" }, 
  { matric: "250201049", name: "AKINREFON, Eniola Priscilla", grade: 
"A" }, 
  { matric: "250201050", name: "AJISEGIRI, Eniola Samuel", grade: "A" 
}, 
  { matric: "250201051", name: "OMEKE, Precious Anuoluwapo", grade: 
"B" }, 
  { matric: "250201052", name: "ADEMOLA, Elijah Ayomide", grade: "A" 
}, 
  { matric: "250201053", name: "BAKARE, Sulhaa Temilola", grade: "A" 
}, 
  { matric: "250201054", name: "FAKAYODE, Samuel Oluwasemilore", 
grade: "C" }, 
  { matric: "250201055", name: "FADARE, Fadeshola Joyce", grade: "A" 
}, 
  { matric: "250201063", name: "FASHINA, Ifeoluwa Elizabeth", grade: 
"B" }, 
  { matric: "250201064", name: "OLADIRAN, Praise Opemipo", grade: "B" 
}, 
  { matric: "250201065", name: "OLUFADE, Oluwaseyi Olaitan", grade: 
"C" }, 
  { matric: "250201066", name: "AKINBODE, Precious Ifeoluwa", grade: 
"C" }, 
  { matric: "250201067", name: "PRINCEWILL, Joy-Abasi Idara", grade: 
"A" }, 
  { matric: "250201068", name: "KAZEEM, Abdullateef Opeyemi", grade: 
"B" }, 
  { matric: "250201069", name: "AFOLABIOZUA, Ebubechukwu Melchizedek", 
grade: "A" }, 
  { matric: "250201070", name: "AJAYI, Isaac Aduragbemi", grade: "B" 
}, 
  { matric: "250201071", name: "KILA, Khadijah Titilope", grade: "B" 
}, 
  { matric: "250201079", name: "ASAOLU, Babatope Christopher", grade: 
"B" }, 
  { matric: "250201081", name: "EMMANUEL, Okon Emmanuella Atinmma Ayomide", grade: "B" }, 
  { matric: "250201105", name: "OLASUNMIBOYE, Adedamola Faith", grade: 
"B" }, 
  { matric: "250201106", name: "IBITOYE, Olawumi Peace", grade: "B" }, 
  { matric: "250201107", name: "AFOLABI, Daniel Olanrewaju", grade: 
"B" }, 
  { matric: "250201108", name: "OLABAMERUN, Inioluwa Mercy", grade: 
"B" }, 
  { matric: "250201109", name: "CHUKWUDI, Okeh-Chidera Gift", grade: 
"C" }, 
  { matric: "250201110", name: "YUSUF, Abdul-Azeez Ajadi", grade: "A" 
}, 
  { matric: "250201111", name: "AMOLE, Abdulsamad Kolade", grade: "B" 
}, 
  { matric: "250201112", name: "HAMZAH, Fareedah Damilola", grade: "A" 
}, 
  { matric: "250201113", name: "ODUSOLA, Moyinoluwa Dorcas", grade: 
"B" }, 
  { matric: "250201114", name: "SALAU, Mistura Eniola", grade: "A" }, 
  { matric: "250201115", name: "MARTINS, Adefunke Dorcas", grade: "B" 
}, 
  { matric: "250201117", name: "BADEWOLE, Prosper Oluwatoorese", 
grade: "A" }, 
  { matric: "250201288", name: "HUTHMAN, Sheriffdeen Omogbolahan", 
grade: "B" }, 
  { matric: "250201289", name: "OLADUNJOYE, Opemipo Dorcas", grade: 
"B" }, 
  { matric: "250201290", name: "BANKOLE, Jason Oluwafayokunmi", grade: 
"A" }, 
  { matric: "250201291", name: "ODUGHU, Gift Oseremien", grade: "B" }, 
  { matric: "250201292", name: "ADEWOLE, Habeeb Gbolahan", grade: "B" 
}, 
  { matric: "250201293", name: "AJAYI, Ifeoluwa Uziezi", grade: "A" }, 
  { matric: "250201294", name: "AJAYI, Motunrayo Eloho", grade: "B" }, 
  { matric: "250201295", name: "LAMIDI, Emmanuel Olaoluwa", grade: "A" 
}, 
  { matric: "250201296", name: "OLADUNTOYE, Oluwatimilehin Lydia", 
grade: "B" }, 
  { matric: "250201297", name: "KOTUN, Sobur Olamiji", grade: "C" }, 
  { matric: "250201299", name: "OLALEYE, Mopelola Grace", grade: "A" 
}, 
  { matric: "250201300", name: "EKEOPARA, Chibuike Francis", grade: 
"C" }, 
  { matric: "250201301", name: "AFOLABI, Hezekiah Tope", grade: "B" }, 
  { matric: "250201302", name: "ADARAMOLA, Bisola Favour", grade: "B" 
}, 
  { matric: "250201303", name: "OLANREWAJU, Juliet Oluwadamilola", 
grade: "B" }, 
  { matric: "250201304", name: "ENIAFE, Abdulwahab Alabi", grade: "B" 
}, 
  { matric: "250201305", name: "BAKARE, Idris Abayomi", grade: "B" }, 
  { matric: "250201306", name: "ADEBAYO, Ife Kassium", grade: "A" }, 
  { matric: "250201308", name: "ADESANYA, Adetutu Adebimpe", grade: 
"A" }, 
  { matric: "250201316", name: "SHOBAYO, Malik Ramadan", grade: "B" }, 
  { matric: "250201317", name: "OVIAWE, Faith Orobosa", grade: "B" }, 
  { matric: "250201318", name: "ONI, Victoria Oluwaseyi", grade: "B" 
}, 
  { matric: "250201319", name: "MUSTAPHA, Amirat Temilade", grade: "A" 
}, 
  { matric: "250201320", name: "OBASESAN-YUSUF, Jafar Akanbi", grade: 
"A" }, 
  { matric: "250201321", name: "OGBEIDE, Serena Orobosa", grade: "B" 
}, 
  { matric: "250201322", name: "AKINYEMI, Faith Oluwadamilola", grade: 
"C" }, 
  { matric: "250201323", name: "OJORA, Roheem Adeola", grade: "D" }, 
  { matric: "250201324", name: "OSEBEYO, Emmanuel Ayomide", grade: "B" 
}, 
  { matric: "250201325", name: "ADENIRAN, Oluwadamilola Mercy", grade: 
"B" }, 
  { matric: "250201328", name: "COKER, Omogbemisola Adedoyin", grade: 
"C" }, 
  { matric: "250201330", name: "ONI, Daniel Oluwadamilare", grade: "A" 
}, 
  { matric: "250201331", name: "OLOMO, Adeshina Emmanuel", grade: "B" 
}, 
  { matric: "250201332", name: "SHIYANBADE, Faderera Oluwanifemi", 
grade: "B" }, 
  { matric: "250201333", name: "NWANKWO, Favour Uchechi", grade: "C" 
}, 
  { matric: "250201334", name: "MONSURU, Abdul-Quadri Gbolahan", 
grade: "B" }, 
  { matric: "250201335", name: "OLADIMEJI, Isaac Ayomikun", grade: "D" 
}, 
  { matric: "250201336", name: "OYENIRAN, Olamide Jeremiah", grade: 
"B" }, 
  { matric: "250201337", name: "AGBASI, Chimamanda Valerie", grade: 
"B" }, 
  { matric: "250201338", name: "AJIBOLA, Peace Oluwanifemi Oluwatobi", 
grade: "B" }, 
  { matric: "250201339", name: "IBRAHIM, Aleeyat Kofoworola", grade: 
"C" }, 
  { matric: "250201340", name: "BATULA, Oluwaranti Janet", grade: "B" 
}, 
  { matric: "250201341", name: "AJADI, Fathia Arike", grade: "B" }, 
  { matric: "250201342", name: "OYEBADEJO, Tobiloba Peter", grade: "B" 
}, 
  { matric: "250201343", name: "AGBOOLA, Olabisi Anthonia", grade: "A" 
}, 
  { matric: "250201344", name: "NJOKU, Francis Ikechukwu", grade: "B" 
}, 
  { matric: "250201345", name: "ALABI, Emmanuel Oladimeji", grade: "A" 
}, 
  { matric: "250201346", name: "UGO, Onyekachi Tobiloba", grade: "B" 
}, 
  { matric: "250201347", name: "OLUWOLE, Oluwakayode John", grade: "A" 
}, 
  { matric: "250201348", name: "OLAITAN, Oluwanifemi Elizabeth", 
grade: "B" }, 
  { matric: "250201349", name: "EJIKE, Esther Chisom.", grade: "B" }, 
  { matric: "250201353", name: "AMOSUN, Daniella Oluwatofarati", 
grade: "C" }, 
  { matric: "250201354", name: "OMEREME, Ifeanyi", grade: "C" }, 
  { matric: "250201356", name: "AYESORO, Eniola Ajoke", grade: "D" }, 
  { matric: "250201357", name: "SALAMADE, Adesola Abosede", grade: "A" 
}, 
  { matric: "250201358", name: "AJENIFUJA, Anuoluwapo Temilola", 
grade: "C" }, 
  { matric: "250201359", name: "BUSARI, Abdullah Adesola", grade: "C" 
}, 
  { matric: "250201360", name: "OPEYEMI, Faithful Opemipo", grade: "B" 
}, 
  { matric: "250201361", name: "ISOGUN, Oluwasegun Moses", grade: "A" 
}, 
  { matric: "250201362", name: "ODIO, Esther Ogbedafe", grade: "B" }, 
  { matric: "250201363", name: "OYENIYI-OKEDUN, Christiana Oluwanifemi", grade: "A" }, 
  { matric: "250201364", name: "OLASUNKANMI, Mariam Abiola", grade: 
"B" }, 
  { matric: "250201365", name: "AKINBODE, Hameedat Morenikeji", grade: 
"C" }, 
  { matric: "250201366", name: "EHIREMEN, Mercy Elomeseh", grade: "B" 
}, 
  { matric: "250201367", name: "AKAPO, David Toluwalase", grade: "B" 
}, 
  { matric: "250201368", name: "ABUBAKAR, Kehinde Fatimah", grade: "B" 
}, 
  { matric: "250201369", name: "AYINLA, Abosede Morayo", grade: "D" }, 
  { matric: "250201371", name: "OYEBULU, Olayiwola Damilare", grade: 
"C" }, 
  { matric: "250201372", name: "SAJOWA, Kehinde Oluwatosin", grade: 
"A" }, 
  { matric: "250201373", name: "CHUKWU, Esther Chidinma", grade: "B" 
}, 
  { matric: "250201374", name: "BENA, Elizabeth Teniola", grade: "B" 
}, 
  { matric: "250201375", name: "OLAJIRE, Quam Akinola", grade: "B" }, 
  { matric: "250201376", name: "BASSEY, Favour Temiloluwa", grade: "B" 
}, 
  { matric: "250201378", name: "ADENIYI, Temitope Victoria", grade: 
"D" }, 
  { matric: "250201379", name: "ADEBOWALE-DAVID, Oluwaranolasimi Joshua", grade: "B" }, 
  { matric: "250201380", name: "OLATOYE, Emmanuel Chukwuebuka", grade: 
"C" }, 
  { matric: "250201381", name: "HUSSEIN, Mutmainnah Damilola", grade: 
"C" }, 
  { matric: "250201382", name: "GARUBA, Aishat Eniola-Olubukola", 
grade: "A" }, 
  { matric: "250201383", name: "MOBOLADE, Zainab Morenikeji", grade: 
"B" }, 
  { matric: "250201384", name: "FADAIRO, Oluwaferanmi Elizabeth", 
grade: "B" }, 
  { matric: "250201385", name: "KUDEHINBU, Lateef Aremu", grade: "C" 
}, 
  { matric: "250201386", name: "SAMUEL, Eniola Omotoyosi", grade: "A" 
}, 
  { matric: "250201387", name: "BELLO, Mohammed Oladokun", grade: "B" 
}, 
  { matric: "250201389", name: "IMRAN, Al-Ameen Ayomide", grade: "A" 
}, 
  { matric: "250201390", name: "ODUWAYE, Toluwalase Isaac", grade: "C" 
}, 
  { matric: "250201391", name: "ADEDEJI, Tosin Christianah", grade: 
"C" }, 
  { matric: "250201393", name: "ADIGUN, Mosopefoluwa Anjolaoluwa", 
grade: "B" }, 
  { matric: "250201394", name: "OLA, Selimot Tolani", grade: "A" }, 
  { matric: "250201395", name: "OLULANA, Ibukunoluwa Bukola", grade: 
"B" }, 
  { matric: "250201396", name: "AJIBADE, Fathia Olamide", grade: "D" 
}, 
  { matric: "250201397", name: "MAKANJUOLA, Halleluyah Israel", grade: 
"A" }, 
{ matric: "250201398", name: "COLLINS, Victoria Vobi", grade: "A" }, 
{ matric: "250201399", name: "MUSTAPHA, Abdulbasit Olaide", grade: 
"C" }, 
{ matric: "250201400", name: "ADELEKE, Ayodeji Emmanuel", grade: "C" 
}, 
{ matric: "250201401", name: "OGUNFOWOKAN, Oluwatetisimi Ajoke", 
grade: "B" }, 
{ matric: "250201402", name: "ADENIRAN, Abdullahi Adedamola", grade: 
"C" }, 
{ matric: "250201404", name: "ADEYANJU, Mulikat Kehinde", grade: "B" 
}, 
{ matric: "250201405", name: "UTHMAN, Omonifemi Daniella", grade: 
"A" }, 
{ matric: "250201406", name: "FARAYIBI, Daniel Obaloluwa", grade: 
"C" }, 
{ matric: "250201407", name: "ADEKUNLE, Enoch Fiadeshola", grade: 
"C" }, 
{ matric: "250201408", name: "ADEBAYO, Oluwatofunmi Lydia", grade: 
"C" } 

    ]
};

// 1. Fetch scores for a single course (Used by Results view) 
async function fetchCourseResultsFromSupabase(semester, courseCode) {
    try {
        const { data, error } = await supabase
            .from('student_results')
            .select('*')
            .eq('semester', semester)
            .eq('course_code', courseCode)
            .order('matric', { ascending: true });

        if (!error && data && data.length > 0) {
            return data;
        }
        if (error) console.warn(`[Supabase] ${courseCode}:`, error.message);
    } catch (err) {
        console.warn(`[Supabase] ${courseCode} fetch failed, using local fallback:`, err.message);
    }
    // Fallback: serve local JS dataset if DB query failed or returned nothing
    return localCourseResultsFallback[courseCode] || [];
}

// 2. Fetch all course grades for a single student (Used by CGPA Calculator) 
async function fetchStudentGradesForCGPA(matricNo) {
    const cleanMatric = matricNo.replace(/[^0-9]/g, '').trim();
    let combinedGrades = [];

    try {
        const { data, error } = await supabase
            .from('student_results')
            .select('course_code, ca, exam, grade')
            .eq('matric', cleanMatric);

        if (!error && data) {
            combinedGrades = data;
        } else if (error) {
            console.warn('[Supabase GPA Lookup]:', error.message);
        }
    } catch (err) {
        console.warn('[Supabase GPA Lookup] failed, searching local fallback...', err.message);
    }

    // Merge in any local fallback records not already returned by Supabase
    Object.keys(localCourseResultsFallback).forEach(courseCode => {
        const studentMatch = localCourseResultsFallback[courseCode].find(item => item.matric === cleanMatric);
        if (studentMatch) {
            const alreadyExists = combinedGrades.some(g => g.course_code === courseCode);
            if (!alreadyExists) {
                combinedGrades.push({
                    course_code: courseCode,
                    ca: studentMatch.ca,
                    exam: studentMatch.exam,
                    grade: studentMatch.grade
                });
            }
        }
    });

    return combinedGrades;
}

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
    card.style.display = (card.dataset.semester === semester) ? 'block' : 'none';
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

// Bind click events with strict view-switching prevention for 2nd semester
document.querySelectorAll('.course-score-trigger').forEach(card => {
    card.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const code = card.dataset.code;
        const title = card.dataset.title;
        const semester = card.dataset.semester || activeSemester;

        if (studentScoresTbody) {
            studentScoresTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #8fa5c3;">Loading scores from database...</td></tr>`;
        }

        // Fetch live results from Supabase for the selected course and semester
        currentActiveCourseScores = await fetchCourseResultsFromSupabase(semester, code);
        
        if (activeCourseTitle) {
            activeCourseTitle.textContent = `${code} - ${title} (${semester === '1st' ? '1st' : '2nd'} Semester)`;
        }

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
// PRIVACY & PERMISSION HELPERS
// =======================================================
function isCurrentUserAdmin() {
  const user = auth.currentUser;
  return user && user.email && ALLOWED_GOOGLE_EMAILS.includes(user.email);
}

function getLoggedInMatric() {
  const user = auth.currentUser;
  if (!user || !user.email) return '';
  return user.email.replace(MATRIC_SUFFIX, '').replace('@gmail.com', '').replace(/[^0-9]/g, '').trim().toLowerCase();
}
// =======================================================
// 8. GPA CALCULATOR & MATRIC NO AUTO-FILL LOGIC
// =======================================================
const gpaMatricLookupInput = document.getElementById('gpaMatricLookupInput');
const autoFillGradesBtn = document.getElementById('autoFillGradesBtn');
const calculateGpaBtn = document.getElementById('calculateGpaBtn');
const computedGpaValue = document.getElementById('computedGpaValue');

// =======================================================
// 8. PRIVATE GPA CALCULATOR & MATRIC NO AUTO-FILL LOGIC
// =======================================================
if (autoFillGradesBtn) { 
    autoFillGradesBtn.addEventListener('click', async () => { 
        let rawInput = gpaMatricLookupInput ? gpaMatricLookupInput.value.trim().toLowerCase() : 
''; 
        const searchMatric = rawInput.split('@')[0].replace(/[^0-9]/g, ''); 
 
        if (!searchMatric) { 
            alert("Please enter a Matriculation Number to look up."); 
            return; 
        } 
 
        const loggedInMatric = getLoggedInMatric(); 
        const isAdmin = isCurrentUserAdmin(); 
 
        if (!isAdmin && searchMatric !== loggedInMatric) { 
            alert("Access Restricted: You can only view and auto-fill your own CGPA."); 
            if (gpaMatricLookupInput) gpaMatricLookupInput.value = loggedInMatric; 
            return; 
        } 
 
        // Fetch student's overall results from Supabase 
        const studentRecords = await fetchStudentGradesForCGPA(searchMatric); 
 
        if (!studentRecords || studentRecords.length === 0) { 
            alert(`No results found in database for Matric No: ${searchMatric.toUpperCase()}`); 
            return; 
        } 
 
        const selects = document.querySelectorAll('.grade-select'); 
        let matchesFound = 0; 
        const pointMap = { 'A': '5', 'B': '4', 'C': '3', 'D': '2', 'E': '1', 'F': '0' }; 
 
        selects.forEach(select => { 
            const tr = select.closest('tr'); 
            if (tr && tr.style.display === 'none') return; 
 
            const courseText = tr ? tr.querySelector('td')?.textContent || '' : ''; 
 
            // Match course row against returned Supabase records 
            const matchingRecord = studentRecords.find(record => 
courseText.includes(record.course_code)); 
 
            if (matchingRecord) { 
                let pointStr = '0'; 
                if (matchingRecord.grade) { 
                    pointStr = pointMap[matchingRecord.grade] || '0'; 
                } else if (matchingRecord.ca !== undefined && matchingRecord.exam !== undefined) { 
                    const total = matchingRecord.ca + matchingRecord.exam; 
                    const gradeObj = calculateGrade(total); 
                    pointStr = gradeObj.point.toString(); 
                } 
                select.value = pointStr; 
                matchesFound++; 
            } 
        }); 
 
        if (matchesFound > 0) { 
            alert(`Grades auto-filled successfully for Matric No: ${searchMatric.toUpperCase()}`); 
            computeGPA(); 
        } else { 
            alert(`No matching course entries found for Matric No: ${searchMatric.toUpperCase()}`); 
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
    toggleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            toggleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            // Filter row visibility based on active tab selection
            tableRows.forEach(row => {
                const semester = row.dataset.semester;
                if (currentFilter === "all") {
                    row.style.display = "";
                } else {
                    row.style.display = (semester === currentFilter) ? "" : "none";
                }
            });
            if (currentFilter === "1st") {
                if (gpaLabel) gpaLabel.textContent = "1st Semester GPA:";
            } else if (currentFilter === "2nd") {
                if (gpaLabel) gpaLabel.textContent = "2nd Semester GPA:";
            } else {
                if (gpaLabel) gpaLabel.textContent = "Cumulative GPA:";
            }
            calculateGPA();
        });
    });
    function calculateGPA() {
        let totalQualityPoints = 0;
        let totalUnits = 0;
        tableRows.forEach(row => {
            if (row.style.display !== "none") {
                const select = row.querySelector(".grade-select");
                if (!select) return;
                const gradeValue = select.value;
                const units = parseFloat(select.dataset.units);
                if (gradeValue !== "" && !isNaN(gradeValue)) {
                    const gradePoint = parseFloat(gradeValue);
                    totalQualityPoints += gradePoint * units;
                    totalUnits += units;
                }
            }
        });
        if (gpaDisplay) {
            gpaDisplay.textContent = totalUnits > 0
              ? (totalQualityPoints / totalUnits).toFixed(2)
              : "0.00";
        }
    }
    document.querySelectorAll(".grade-select").forEach(select => {
        select.addEventListener("change", calculateGPA);
    });
    if (calcBtn) {
        calcBtn.addEventListener("click", calculateGPA);
    }
});
// Listen to real-time dues table updates from Supabase
function listenToDuesRealtime() {
    supabase
        .channel('dues_live_channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'dues_payments' },
            (payload) => {
                console.log('[Supabase Realtime] Payment updated:', payload);
                // Re-render student dues status & admin table instantly
                if (typeof loadStudentDuesStatus === 'function') loadStudentDuesStatus();
                if (typeof loadAdminDuesList === 'function') loadAdminDuesList();
            }
        )
        .subscribe();
}
// Initialize on app load
listenToDuesRealtime();