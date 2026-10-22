import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  browserPopupRedirectResolver
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm";

// =======================================================
// 1. EMBEDDED API KEYS & CONFIGURATION
// =======================================================
// Firebase web API keys are public by design (base64 gave no protection).
// Restrict this key by HTTP referrer in Google Cloud Console instead.
const GOOGLE_API_KEY = "AIzaSyC20zpfioe0C7iyzSmt5ex5h8X4pQy5rc4";
const SUPABASE_URL = "https://yuebmlmamkclsfizurkp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWJtbG1hbWtjbHNmaXp1cmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDIyMzksImV4cCI6MjEwMzQ3ODIzOX0.eWDugNSs0GD0Mx-eWaDjkiLx07B_oqjm-xVTdB39zpI";

// Set to true ONLY after Supabase third-party auth (Firebase) + RLS are set up (see supabase_security.sql).
const USE_FIREBASE_JWT_FOR_SUPABASE = false;
// Anyone who knows a matric (they are all visible in app.js) could claim it first. Keep false and
// create student accounts as <matric>@student.local in the Firebase console (or Admin SDK).
const ALLOW_SELF_REGISTRATION = false;

const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
  authDomain: "trailblazers--29.firebaseapp.com",
  projectId: "trailblazers--29",
  storageBucket: "trailblazers--29.firebasestorage.app",
  messagingSenderId: "256240620470",
  appId: "1:256240620470:web:d727943d940d5366f1a717"
};

const app = initializeApp(firebaseConfig);
// Safari/iOS (WebKit) can hang while opening IndexedDB, which is where Firebase keeps the login by
// default. When that happens onAuthStateChanged never fires and the page stays blank. Private tabs work
// because they start with fresh storage. On WebKit we therefore skip IndexedDB and use localStorage.
// (iPhone users are asked to sign in once more after this change; other browsers are untouched.)
const ua = navigator.userAgent || '';
const isWebKit = /iPad|iPhone|iPod/.test(ua) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
  (/Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua));
let auth;
try {
  auth = isWebKit
    ? initializeAuth(app, {
        persistence: [browserLocalPersistence, browserSessionPersistence],
        popupRedirectResolver: browserPopupRedirectResolver
      })
    : getAuth(app);
} catch (e) {
  console.warn('initializeAuth failed, using getAuth:', e);
  auth = getAuth(app);
}
const googleProvider = new GoogleAuthProvider();

// SUPABASE STORAGE INITIALIZATION
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  USE_FIREBASE_JWT_FOR_SUPABASE
    ? { accessToken: async () => (auth.currentUser ? await auth.currentUser.getIdToken() : null) }
    : undefined
);
window.tbSupabase = supabase;
window.supabaseClient = supabase;
window.tbGetIdToken = async () => (auth.currentUser ? auth.currentUser.getIdToken() : null);

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
  "nnafrancis5@gmail.com",
  "debbynene25@gmail.com",
  "isaacajayi411@gmail.com"
];

const onReady = (fn) => (document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', fn) : fn());

const isGoogleUser = (user) => !!user && user.providerData.some(p => p.providerId === 'google.com');

// Admin = verified Google sign-in on the allowlist. A password account that merely uses an admin
// email address is NOT admin. The Edge function must enforce the same rule (see supabase_security.sql).
function isAdminUser(user) {
  return !!(user && user.email && user.emailVerified && isGoogleUser(user) &&
    ALLOWED_GOOGLE_EMAILS.includes(user.email.toLowerCase()));
}

// Matric only comes from our own <matric>@student.local accounts, never from arbitrary emails.
function matricFromUser(user) {
  if (!user || !user.email) return '';
  const email = user.email.toLowerCase();
  if (!email.endsWith(MATRIC_SUFFIX)) return '';
  return email.slice(0, -MATRIC_SUFFIX.length).replace(/[^0-9a-z]/gi, '').toUpperCase();
}
window.tbIsAdmin = () => isAdminUser(auth.currentUser);

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

// Course -> id of its accordion container in index.html (used to refresh the list after an upload).
const courseContainerIds = {
  'ACC 210': 'acc210-topics',
  'ACC-CM 203': 'acc-cm203-topics',
  'ECO 201': 'eco-201-topics',
  'ENT 211': 'ent-211-topics',
  'FIN 101': 'fin-101-topics',
  'TX-CM 313': 'tx-cm-313-topics',
  'LAG-ACS 209': 'lag-acs-209-topics'
};

// Client-side upload limits. Set the same limits on the Supabase bucket (file size limit + allowed
// MIME types): anything checked only in the browser can be bypassed.
const MAX_UPLOAD_MB = 25;
const ALLOWED_UPLOAD_TYPES = {
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg'
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

function safeFileUrl(raw) {
  try {
    const u = new URL(raw);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u : null;
  } catch (_) { return null; }
}

function getFileIconClass(fileType = '') {
  fileType = fileType || '';
  if (fileType.includes('pdf')) return 'fa-solid fa-file-pdf';
  if (fileType.includes('image')) return 'fa-solid fa-file-image';
  if (fileType.includes('video') || fileType.includes('mp4')) return 'fa-solid fa-file-video';
  return 'fa-solid fa-file-lines';
}

function getFileIconStyle(fileType = '') {
  fileType = fileType || '';
  if (fileType.includes('pdf')) return 'color: #ff4d4d;';
  if (fileType.includes('image')) return 'color: #4ade80;';
  if (fileType.includes('video') || fileType.includes('mp4')) return 'color: #4f8bff;';
  return 'color: var(--gold-glow);';
}

function styleAction(el, iconClass, text) {
  el.className = 'btn-outline';
  el.style.cssText = 'padding: 4px 8px; font-size: 0.75rem;';
  const i = document.createElement('i');
  i.className = iconClass;
  el.append(i, ' ' + text);
  return el;
}

function buildMaterialRow(file) {
  const url = safeFileUrl(file.fileUrl);
  if (!url) return null;

  const row = document.createElement('div');
  row.className = 'material-file-row';
  row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);';

  const label = document.createElement('span');
  label.style.cssText = 'color: #8fa5c3; font-size: 0.85rem;';
  const icon = document.createElement('i');
  icon.className = getFileIconClass(file.fileType);
  icon.style.cssText = getFileIconStyle(file.fileType) + ' margin-right: 6px;';
  label.append(icon, ' ' + (file.fileName || 'Untitled'));

  const actions = document.createElement('div');
  actions.style.cssText = 'display: flex; gap: 6px;';

  const view = styleAction(document.createElement('a'), 'fa-solid fa-eye', 'View');
  view.href = url.href;
  view.target = '_blank';
  view.rel = 'noopener noreferrer';

  // The HTML "download" attribute is ignored cross-origin; Supabase honours ?download=<name>.
  const dlUrl = new URL(url.href);
  dlUrl.searchParams.set('download', file.fileName || 'file');
  const dl = styleAction(document.createElement('a'), 'fa-solid fa-download', 'Download');
  dl.href = dlUrl.href;
  dl.rel = 'noopener noreferrer';

  const print = styleAction(document.createElement('button'), 'fa-solid fa-print', 'Print');
  print.type = 'button';
  print.addEventListener('click', () => window.printDocument(url.href));

  actions.append(view, dl, print);
  row.append(label, actions);
  return row;
}

const normText = (v) => String(v || '').replace(/\s+/g, ' ').trim().toLowerCase();

// The topic headings actually on the page for a course, in order.
function topicHeadings(courseCode) {
  const container = document.getElementById(courseContainerIds[courseCode]);
  if (!container) return [];
  return Array.from(container.querySelectorAll('.topic-expandable summary'))
    .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

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

    const all = materials || [];
    const placed = new Set();

    topicContainer.querySelectorAll('.topic-expandable').forEach((topicEl) => {
      const summaryText = normText(topicEl.querySelector('summary')?.textContent);
      const materialsList = topicEl.querySelector('.materials-list');
      if (!materialsList) return;

      const rows = all
        .filter((m) => {
          const key = normText(m.topicName);
          return key && summaryText.includes(key);
        })
        .map((m) => { placed.add(m); return buildMaterialRow(m); })
        .filter(Boolean);

      if (rows.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = 'color: #8fa5c3; font-size: 0.8rem;';
        p.textContent = 'No uploaded notes yet. Be the first to upload!';
        materialsList.replaceChildren(p);
        return;
      }
      materialsList.replaceChildren(...rows);
    });

    // Anything whose saved topic name matches no heading (older uploads) is listed here instead of vanishing.
    topicContainer.querySelector('.materials-other')?.remove();
    const orphans = all.filter((m) => !placed.has(m)).map(buildMaterialRow).filter(Boolean);
    if (orphans.length) {
      const box = document.createElement('div');
      box.className = 'materials-other';
      box.style.cssText = 'margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);';
      const title = document.createElement('p');
      title.style.cssText = 'color: #8fa5c3; font-size: 0.8rem; margin: 0 0 6px;';
      title.textContent = 'Other uploads';
      box.append(title, ...orphans);
      topicContainer.appendChild(box);
    }
  } catch (error) {
    console.error('Error fetching materials:', error);
  }
}

// window.print() on a cross-origin window throws, so fetch the file and print it from a same-origin blob.
window.printDocument = async function (fileUrl) {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blobUrl = URL.createObjectURL(await res.blob());
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    frame.onload = () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (_) {
        window.open(blobUrl, '_blank');
      }
      setTimeout(() => { URL.revokeObjectURL(blobUrl); frame.remove(); }, 60000);
    };
    frame.src = blobUrl;
    document.body.appendChild(frame);
  } catch (err) {
    console.warn('Print fallback (opening file):', err);
    window.open(fileUrl, '_blank', 'noopener');
  }
};

window.openUploadModal = function(courseCode) {
  const modal = document.getElementById('uploadNotesModal');
  const courseInput = document.getElementById('uploadTargetCourse');
  const topicSelect = document.getElementById('uploadTargetTopic');

  if (courseInput) courseInput.value = courseCode;

  if (topicSelect) {
    topicSelect.innerHTML = '';
    // Use the headings that are really on the page, so an upload always lands under a heading that exists.
    const pageTopics = topicHeadings(courseCode);
    const topics = pageTopics.length ? pageTopics : (courseTopicsMap[courseCode] || [
      'Topic 1: Introduction & Fundamentals',
      'Topic 2: Core Principles & Practice'
    ]);
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
    if (!auth.currentUser) {
      alert('Please log in before uploading.');
      return;
    }
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_UPLOAD_TYPES[ext]) {
      alert('Only PDF, MP4, PNG and JPG files can be uploaded.');
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      alert(`That file is too large. The limit is ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    const mimeType = file.type || ALLOWED_UPLOAD_TYPES[ext];

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
          contentType: mimeType,
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
      fileType: mimeType,
      fileUrl: downloadURL,
      uploadedAt: new Date().toISOString(),
      uploaderEmail: auth.currentUser ? auth.currentUser.email : 'anonymous'
    }
  ]);

if (dbError) throw dbError;

      alert('Material uploaded successfully to Supabase Storage!');
      const uploadModal = document.getElementById('uploadNotesModal');
      if (uploadModal) {
        if (typeof uploadModal.close === 'function') uploadModal.close();
        else uploadModal.style.display = 'none';
      }
      uploadMaterialForm.reset();

      const targetAccordionId = courseContainerIds[course];
      if (targetAccordionId) fetchTopicMaterials(course, targetAccordionId);
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
// Puts the name in the greeting with the blue tick right beside it. The last word and the tick sit in one
// no-wrap span, so a long name that wraps onto two lines can never leave the tick stranded on its own.
window.tbRenderGreetingName = function (h, name) {
  if (!h) return;
  const words = String(name || 'Trailblazer').trim().split(/\s+/);
  const last = words.pop();
  const badge = document.createElement('i');
  badge.className = 'fa-solid fa-circle-check verified-badge-icon';
  badge.setAttribute('aria-label', 'Verified');
  const tail = document.createElement('span');
  tail.className = 'greeting-name-tail';
  tail.append(document.createTextNode(last), badge);
  h.replaceChildren();
  if (words.length) h.append(document.createTextNode(words.join(' ') + ' '));
  h.appendChild(tail);
};

function setGreeting(name) {
  const h = document.querySelector('.welcome-greeting h2');
  window.tbRenderGreetingName(h, name);
  const label = document.getElementById('dropdownUserName');
  if (label) label.textContent = name;
}

// Everything tied to a signed-in user is wiped here, whichever way the session ended.
function clearSessionState() {
  // Unwind the in-app history so the phone's back button does not step through dead screens after logout.
  if (typeof window.tbNavStop === 'function') window.tbNavStop();
  window.currentLoggedInMatric = '';
  window.tbUid = null;
  window.forumIsAdmin = undefined;
  // Safari can throw here (blocked cookies, Lockdown Mode); that must never stop the login screen showing.
  try {
    ['logged_in_user_email', 'logged_in_user_matric', 'trailblazers_user'].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch (_) { /* storage blocked */ }
  if (Array.isArray(window.studentDuesRegistry)) window.studentDuesRegistry.forEach(s => { s.paid = false; });
  if (typeof window.tbFeesReset === 'function') window.tbFeesReset();
  ['adminFeesControl', 'forumAdmin', 'profileModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

onAuthStateChanged(auth, (user) => {
  window.tbAuthReady = true;
  document.getElementById('tbSlowStartNote')?.remove();
  // Show the right screen first, so a failure in the extra set-up below can never leave a blank page.
  if (!user) {
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
  if (user) {
    if (isGoogleUser(user) && !isAdminUser(user)) {
      displayError("This Google account does not have access to this portal.");
      signOut(auth);
      return;
    }
    if (!isGoogleUser(user) && !matricFromUser(user)) {
      displayError("This account is not a recognised student account.");
      signOut(auth);
      return;
    }

    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "flex";

    const cleanMatric = matricFromUser(user);
    window.currentLoggedInMatric = cleanMatric;
    window.tbUid = user.uid;
    try {
      localStorage.setItem('logged_in_user_email', user.email || '');
      localStorage.setItem('logged_in_user_matric', cleanMatric);
    } catch (_) { /* storage blocked */ }

    setGreeting((window.studentDirectory && window.studentDirectory[cleanMatric]) || user.displayName || 'Trailblazer');

    if (typeof window.refreshStudentDues === 'function') window.refreshStudentDues();
    else if (typeof window.updateStudentDuesUI === 'function') window.updateStudentDuesUI(cleanMatric);
    // Re-register this device for push (keeps it current if the browser renewed it).
    if (typeof window.syncPushSubscription === 'function') window.syncPushSubscription();

    const adminPanel = document.getElementById('adminFeesControl');
    if (adminPanel) {
      if (isAdminUser(user)) {
        adminPanel.style.display = 'block';
        if (typeof window.renderAdminDuesTable === 'function') window.renderAdminDuesTable();
      } else {
        adminPanel.style.display = 'none';
      }
    }
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "flex";
    if (loginForm) loginForm.reset();
    authError.style.display = "none";

    // Back-button handling, and an alert for any announcement posted while the app was closed.
    if (typeof window.tbNavStart === 'function') window.tbNavStart();
    if (typeof window.tbCatchUpNotices === 'function') window.tbCatchUpNotices();
  } else {
    clearSessionState();
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
  }
  // The install button lives in different places on the two screens, so look again after each switch.
  window.dispatchEvent(new Event('tb-auth-change'));
});

// 3A. MATRICULATION LOGIN FORM
// The matric box must accept letters (newer students have letters in their numbers). The page may set the
// box up for digits only (type=number, a numeric keypad, a pattern, or a key filter written in index.html or
// another script), so this does three things: it finds the box whatever its name/id is, resets its attributes,
// and blocks any digits-only key/input filter from running on it.
const MATRIC_FIELD_SELECTOR = 'input[name="matriculation-number"], #email-input';

function findMatricInput() {
  if (!loginForm) return null;
  return loginForm.querySelector(MATRIC_FIELD_SELECTOR) ||
    // Fallback: the first plain field in the form that is not the password box.
    loginForm.querySelector('input:not([type="password"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="hidden"])');
}

function unlockMatricInput() {
  const el = findMatricInput();
  if (!el) return null;
  ['pattern', 'oninput', 'onkeypress', 'onkeydown', 'onbeforeinput', 'maxlength', 'min', 'max', 'step'].forEach(n => el.removeAttribute(n));
  el.setAttribute('type', 'text');
  el.setAttribute('inputmode', 'text');
  el.setAttribute('autocapitalize', 'characters');
  el.setAttribute('autocomplete', 'username');
  el.setAttribute('autocorrect', 'off');
  el.setAttribute('spellcheck', 'false');
  el.setAttribute('maxlength', '24');
  return el;
}

(function guardMatricInput() {
  if (!loginForm) return;
  // Capture-phase listeners on window run before any listener on the field itself. Stopping propagation
  // here means a digits-only filter attached by another script (now or later) never gets to run.
  ['keydown', 'keypress', 'beforeinput', 'input', 'paste'].forEach((type) => {
    window.addEventListener(type, (e) => {
      const t = e.target;
      if (t && t.matches && t.matches('input') && loginForm.contains(t) && t.type !== 'password') {
        e.stopPropagation();
      }
    }, true);
  });
  unlockMatricInput();
  onReady(unlockMatricInput);
  window.addEventListener('load', unlockMatricInput);
  // If anything flips the box back (type=number, a pattern...), undo it straight away.
  const el = findMatricInput();
  if (el && 'MutationObserver' in window) {
    new MutationObserver(() => {
      if (el.type !== 'text' || el.getAttribute('pattern') || el.getAttribute('inputmode') !== 'text') unlockMatricInput();
    }).observe(el, { attributes: true, attributeFilter: ['type', 'pattern', 'inputmode', 'maxlength'] });
  }
})();

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none';

    const matricInput = findMatricInput();
    const passwordInput = loginForm.querySelector('input[name="password"]');
    // Letters and numbers are both fine ("/", "-" and spaces are ignored). Upper-case keeps lookups consistent.
    const matric = (matricInput ? matricInput.value : '')
      .replace(/@student\.local$/i, '')
      .replace(/[\s\/\-]+/g, '')
      .toUpperCase();
    const password = passwordInput ? passwordInput.value : '';

    if (!matric || !password) {
      displayError("Please enter your matriculation number and password.");
      return;
    }
    // Letters and digits only: "250201001@anything.com" used to resolve to the same account.
    if (!/^[A-Z0-9]{4,20}$/.test(matric)) {
      displayError("Enter your matriculation number (letters and numbers only).");
      return;
    }
    // The built-in class list only holds all-digit numbers. A number with letters is a newer student,
    // so let the account check decide instead of rejecting it here.
    if (/^\d+$/.test(matric) && window.studentDirectory && !window.studentDirectory[matric]) {
      displayError("Matriculation number not recognised.");
      return;
    }

    const email = `${matric.toLowerCase()}${MATRIC_SUFFIX}`;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Firebase Auth Sign-In Error:", error.code, error.message);
      const code = error.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        if (ALLOW_SELF_REGISTRATION && code !== 'auth/wrong-password') {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (createErr) {
            if (createErr.code === 'auth/weak-password') displayError("Password must be at least 6 characters long.");
            else if (createErr.code === 'auth/email-already-in-use') displayError("Incorrect password for this account. Please try again.");
            else displayError("Authentication failed. Please verify your details.");
          }
        } else {
          displayError("Incorrect matriculation number or password. First time here, or forgot your password? Ask the class admin to activate or reset your account.");
        }
      } else if (code === 'auth/too-many-requests') {
        displayError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        displayError("Sign-in failed. Please try again.");
      }
    }
  });
}

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

// 3C. LOGOUT (one handler for the header button and the profile-modal button)
async function doLogout() {
  // Stop alerts on this phone for the account that is leaving (shared phones).
  if (typeof window.tbPushUnsubscribe === 'function') {
    try { await window.tbPushUnsubscribe(); } catch (_) { /* best effort */ }
  }
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
  clearSessionState();
  if (loggedInView) loggedInView.style.display = 'none';
  if (loggedOutView) loggedOutView.style.display = 'block';
}
if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
document.getElementById('modalLogoutBtn')?.addEventListener('click', doLogout);

// NOTE: the mobile sidebar controller and the tab/view switcher live in app.js only.
// (The old copies here fought with them and did not know about the Gallery/Forum views.)

// =======================================================
// 6. COMPLETE DEPARTMENT SCORESHEET DATABASE
// =======================================================
// ======================================================= 
// SUPABASE RESULTS & CGPA CALCULATOR DATABASE HELPERS 
// ======================================================= 
 
// 1. Fetch scores for a single course (Used by Results view)
// Tolerant matching: uploads may say "Second Semester" / "2nd", and "PSY136" / "PSY 136".
function semesterFilter(semester) {
    return semester === '2nd'
        ? 'semester.ilike.second*,semester.ilike.2nd*'
        : 'semester.ilike.first*,semester.ilike.1st*';
}
// "LAG-PSY 136" -> "PSY%136", "ACC 102" -> "ACC%102" (the % matches with or without a space)
function courseCodePattern(code) {
    const clean = String(code).toUpperCase().replace(/^[A-Z]+-/, '').replace(/[^0-9A-Z]/g, '');
    const m = clean.match(/^([A-Z]+)(\d+)$/);
    return m ? `${m[1]}%${m[2]}` : clean;
}
const normCode = (c) => String(c || '').toUpperCase().replace(/^[A-Z]+-/, '').replace(/[^0-9A-Z]/g, '');

async function fetchCourseResultsFromSupabase(semester, courseCode) {
    try {
        const { data, error } = await supabase
            .from('student_results')
            .select('*')
            .or(semesterFilter(semester))
            .ilike('course_code', courseCodePattern(courseCode))
            .order('matric', { ascending: true })
            .limit(2000);
        if (error) {
            console.warn(`[Supabase] ${courseCode}:`, error.message);
            return [];
        }
        return data || [];
    } catch (err) {
        console.warn(`[Supabase] ${courseCode} fetch failed:`, err.message);
        return [];
    }
}

// 2. Fetch all course grades for a single student (Used by CGPA Calculator)
async function fetchStudentGradesForCGPA(matricNo) {
    const cleanMatric = String(matricNo).replace(/[^0-9a-z]/gi, '').toUpperCase();
    try {
        const { data, error } = await supabase
            .from('student_results')
            .select('course_code, ca, exam, grade')
            .eq('matric', cleanMatric);
        if (error) {
            console.warn('[Supabase GPA Lookup]:', error.message);
            return [];
        }
        return data || [];
    } catch (err) {
        console.warn('[Supabase GPA Lookup] failed:', err.message);
        return [];
    }
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

const hasNumber = (v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));

function renderScoresTable(dataList) {
  if (!studentScoresTbody) return;
  studentScoresTbody.replaceChildren();

  dataList.forEach((item, index) => {
    // Supabase returns null (not undefined) for missing scores; null + null === 0 used to show as an F.
    const hasScores = hasNumber(item.ca) && hasNumber(item.exam);
    const total = hasScores ? Number(item.ca) + Number(item.exam) : null;
    const gradeLetter = item.grade || (hasScores ? calculateGrade(total).grade : '');
    const validGrade = /^[A-F]$/.test(gradeLetter);

    const tr = document.createElement('tr');
    const addCell = (text, cls) => {
      const td = document.createElement('td');
      if (cls) td.className = cls;
      td.textContent = text;
      tr.appendChild(td);
      return td;
    };
    addCell(index + 1);
    addCell(item.matric, 'course-code-tag');
    addCell(hasScores ? Number(item.ca) : 'N/A');
    addCell(hasScores ? Number(item.exam) : 'N/A');
    const totalTd = addCell('');
    const strong = document.createElement('strong');
    strong.textContent = hasScores ? total : 'N/A';
    totalTd.appendChild(strong);
    const gradeTd = addCell('');
    const badge = document.createElement('span');
    badge.className = 'grade-badge' + (validGrade ? ` grade-${gradeLetter.toLowerCase()}` : '');
    badge.textContent = validGrade ? gradeLetter : '—';
    gradeTd.appendChild(badge);
    studentScoresTbody.appendChild(tr);
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
  return isAdminUser(auth.currentUser);
}

window.tbIsAdmin = isCurrentUserAdmin;
 
function getLoggedInMatric() {
  return matricFromUser(auth.currentUser);
}
// =======================================================
// 8. GPA CALCULATOR & PRIVATE MATRIC AUTO-FILL (single implementation)
// =======================================================
const gpaMatricLookupInput = document.getElementById('gpaMatricLookupInput');
const autoFillGradesBtn = document.getElementById('autoFillGradesBtn');
// The page has used two sets of ids; support both so whichever exists gets updated.
const GPA_BUTTON_IDS = ['calculateGpaBtn', 'calcGpaBtn'];
const GPA_OUTPUT_IDS = ['computedGpaValue', 'gpaResultDisplay'];

function computeGPA() {
  let points = 0;
  let units = 0;
  document.querySelectorAll('.grade-select').forEach(select => {
    const row = select.closest('tr');
    if (row && row.style.display === 'none') return; // only the semester being shown
    const value = parseFloat(select.value);
    const u = parseFloat(select.dataset.units);
    if (Number.isNaN(value) || !(u > 0)) return;
    points += value * u;
    units += u;
  });
  const text = units > 0 ? (points / units).toFixed(2) : '0.00';
  GPA_OUTPUT_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

if (autoFillGradesBtn) {
  autoFillGradesBtn.addEventListener('click', async () => {
    const rawInput = gpaMatricLookupInput ? gpaMatricLookupInput.value.trim().toLowerCase() : '';
    const searchMatric = rawInput.split('@')[0].replace(/[^0-9a-z]/gi, '').toUpperCase();

    if (!searchMatric) {
      alert("Please enter a Matriculation Number to look up.");
      return;
    }

    const loggedInMatric = getLoggedInMatric();
    // UI-level check only: real enforcement must be RLS on student_results (see supabase_security.sql).
    if (!isCurrentUserAdmin() && searchMatric !== loggedInMatric) {
      alert("Access Restricted: You can only view and auto-fill your own CGPA.");
      if (gpaMatricLookupInput) gpaMatricLookupInput.value = loggedInMatric;
      return;
    }

    const studentRecords = await fetchStudentGradesForCGPA(searchMatric);
    if (!studentRecords || studentRecords.length === 0) {
      alert(`No results found in database for Matric No: ${searchMatric.toUpperCase()}`);
      return;
    }

    const pointMap = { 'A': '5', 'B': '4', 'C': '3', 'D': '2', 'E': '1', 'F': '0' };
    let matchesFound = 0;

    document.querySelectorAll('.grade-select').forEach(select => {
      const tr = select.closest('tr');
      if (tr && tr.style.display === 'none') return;
      const courseText = tr ? tr.querySelector('td')?.textContent || '' : '';
      const rowCode = normCode(courseText.split(' - ')[0]);
      const record = studentRecords.find(r => r.course_code && normCode(r.course_code) === rowCode);
      if (!record) return;

      let pointStr = null;
      if (record.grade && pointMap[record.grade] !== undefined) {
        pointStr = pointMap[record.grade];
      } else if (hasNumber(record.ca) && hasNumber(record.exam)) {
        pointStr = String(calculateGrade(Number(record.ca) + Number(record.exam)).point);
      }
      if (pointStr === null) return; // no usable result: leave the dropdown alone instead of forcing an F
      select.value = pointStr;
      matchesFound++;
    });

    if (matchesFound > 0) {
      alert(`Grades auto-filled successfully for Matric No: ${searchMatric.toUpperCase()}`);
      computeGPA();
    } else {
      alert(`No matching course entries found for Matric No: ${searchMatric.toUpperCase()}`);
    }
  });
}

onReady(() => {
  GPA_BUTTON_IDS.forEach(id => document.getElementById(id)?.addEventListener('click', computeGPA));
  document.querySelectorAll('.grade-select').forEach(select => select.addEventListener('change', computeGPA));

  const toggleButtons = document.querySelectorAll('.gpa-toggle-btn');
  const tableRows = document.querySelectorAll('#gpaTableBody tr');
  const gpaLabel = document.getElementById('gpaLabel');
  const labels = { '1st': '1st Semester GPA:', '2nd': '2nd Semester GPA:' };

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      tableRows.forEach(row => {
        row.style.display = (filter === 'all' || row.dataset.semester === filter) ? '' : 'none';
      });
      if (gpaLabel) gpaLabel.textContent = labels[filter] || 'Cumulative GPA:';
      computeGPA();
    });
  });
});

// =======================================================
// LIVE "STUDENTS RECORDED" COUNTS ON THE RESULTS CARDS
// =======================================================
// Replaces the hardcoded footer text. A course with no rows in Supabase shows "Pending Results".
async function countCourseRows(semester, code) {
  try {
    const { count, error } = await supabase
      .from('student_results')
      .select('*', { count: 'exact', head: true })
      .or(semesterFilter(semester))
      .ilike('course_code', courseCodePattern(code));
    if (error) {
      console.warn(`[Supabase count] ${code}:`, error.message);
      return null;
    }
    return count;
  } catch (err) {
    console.warn(`[Supabase count] ${code} failed:`, err.message);
    return null;
  }
}

async function refreshResultCounts() {
  const cards = document.querySelectorAll('.results-course-card');
  await Promise.all(Array.from(cards).map(async (card) => {
    const label = card.querySelector('.result-card-footer span:first-child');
    if (!label) return;
    const n = await countCourseRows(card.dataset.semester, card.dataset.code);
    if (n === null) return; // lookup failed: leave whatever text is already there
    label.textContent = n > 0 ? `${n} ${n === 1 ? 'Student' : 'Students'} Recorded` : 'Pending Results';
  }));
}
window.refreshResultCounts = refreshResultCounts;

onReady(refreshResultCounts);