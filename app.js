// =======================================================
// 1. SHARED HELPERS & SUPABASE ACCESS
// =======================================================
// The Supabase client is created once in auth.js (window.tbSupabase). auth.js is an ES module, so it
// runs AFTER this classic script: never read the client at load time. Use window.tbSupabase inside
// functions, or wrap start-up work in onSupabaseReady().
// Re-apply the saved theme on load (the toggle saved it, but nothing ever read it back).
try {
    if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');
} catch (_) { /* storage blocked: stay on the default theme */ }

function onSupabaseReady(callback, tries = 50) {
    if (window.tbSupabase) return callback();
    if (tries <= 0) {
        console.error('Supabase client was not initialised by auth.js');
        return callback();
    }
    setTimeout(() => onSupabaseReady(callback, tries - 1), 100);
}

// Safety net: auth.js decides which screen to show. If it never reports back (a CDN script failed to load,
// Safari storage is stuck...), do not leave a blank page: show the login screen and a repair button.
window.tbResetApp = async function () {
    try {
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
        }
    } catch (_) { /* ignore */ }
    try {
        if (window.caches) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
        }
    } catch (_) { /* ignore */ }
    try { indexedDB.deleteDatabase('firebaseLocalStorageDb'); } catch (_) { /* ignore */ }
    location.reload();
};
setTimeout(function () {
    if (window.tbAuthReady) return;
    var out = document.getElementById('loggedOutView');
    var inn = document.getElementById('LoggedInView') || document.getElementById('loggedInView');
    var hidden = function (el) { return !el || getComputedStyle(el).display === 'none'; };
    if (!(hidden(out) && hidden(inn))) return;
    if (out) out.style.display = 'block';
    var note = document.createElement('button');
    note.id = 'tbSlowStartNote';
    note.type = 'button';
    note.textContent = 'Taking too long to load? Tap here to repair and reload.';
    note.style.cssText = 'display:block;margin:12px auto;padding:10px 14px;border-radius:8px;border:1px solid #888;background:#222;color:#fff;font-size:14px;';
    note.addEventListener('click', window.tbResetApp);
    (out || document.body).prepend(note);
}, 6000);

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function mk(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
}

const isAdminNow = () => typeof window.tbIsAdmin === 'function' && window.tbIsAdmin();

// Admin writes go through the admin-actions Edge function (verifies the admin, writes with the
// service key). The browser's public key is not allowed to write dues or announcements.
const ADMIN_FN_URL = "https://yuebmlmamkclsfizurkp.supabase.co/functions/v1/admin-actions";
window.adminCall = async function (payload) {
    const token = await window.tbGetIdToken();
    if (!token) throw new Error("Please log in again.");
    const res = await fetch(ADMIN_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload)
    });
    const raw = await res.text();
    let out = {};
    try { out = JSON.parse(raw); } catch (e) { out = { error: raw.slice(0, 120) }; }
    if (!res.ok) throw new Error(out.error || ("Error " + res.status));
    return out;
};

// ======================================================= 
// 2. STUDENT DIRECTORY MAPPING & DUES REGISTRY 
// ======================================================= 
const studentDirectory = {   
    "250201054": "Fakayode Oluwasemilore",   
    "250201013": "Abidekun Elizabeth",   
    "250201368": "Abubakar Kehinde",   
    "250201302": "Adaramola Bisola",   
    "250201355": "Adebamowo Emmanuel",   
    "250201306": "Adebayo Ife",   
    "250201408": "Adebayo Oluwatofunmi",   
    "250201379": "Adebowale-David Oluwaranolasimi",   
    "250201391": "Adedeji Tosin",   
    "250201021": "Adefalujo Oluwafunmilayo",   
    "250201407": "Adekunle Enoch",   
    "250201400": "Adeleke Ayodeji",   
    "250201052": "Ademola Elijah",   
    "250201403": "Adeniji Tanitoluwa",   
    "250201402": "Adeniran Abdullah",   
    "250201325": "Adeniran Oluwadamilola",   
    "250201378": "Adeniyi Temitope",   
    "250201308": "Adesanya Adetutu",   
    "250201292": "Adewole Habeeb",   
    "250201404": "Adeyanju Mulikat",   
    "250201393": "Adigun Mosopefoluwa",   
    "250201029": "Adio Oluwanifemi",   
    "250201007": "Adukanle Precious",   
    "250201107": "Afolabi Daniel",   
    "250201301": "Afolabi Hezekiah",   
    "250201069": "Afolabiozua Ebubechukwu",   
    "250201028": "Agbalaya Hiqmat",   
    "250201337": "Agbasi Chimamanda",   
    "250201343": "Agboola Olabisi",   
    "250201341": "Ajadi Fathia",   
    "250201293": "Ajayi Ifeoluwa",   
    "250201070": "Ajayi Isaac",   
    "250201294": "Ajayi Motunrayo",   
    "250201358": "Ajenifuja Anuoluwapo",   
    "250201011": "Ajibade Adeola",   
    "250201396": "Ajibade Fathia",   
    "250201338": "Ajibola Peace",   
    "250201050": "Ajisegiri Eniola",   
    "250201018": "Akande Olamide",   
    "250201367": "Akapo David",   
    "250201365": "Akinbode Hameedat",   
    "250201066": "Akinbode Precious",   
    "250201046": "Akinola Olusolape",   
    "250201049": "Akinrefon Eniola",   
    "250201042": "Akintan Jamal",   
    "250201322": "Akinyemi Faith",   
    "250201345": "Alabi Emmanuel",   
    "250201037": "Aladetohun Oluwakamimayo",   
    "250201035": "Alawode Praise",   
    "250201008": "Ambelly Aleeyah",   
    "250201111": "Amole Abdulsamad",   
    "250201353": "Amosun Daniella",   
    "250201005": "Anene Deborah",   
    "250201079": "Asaolu Babatope",   
    "250201356": "Ayesoro Eniola",   
    "250201369": "Ayinla Abosede",   
    "250201117": "Badewole Prosper",   
    "250201047": "Bakare Gold",   
    "250201305": "Bakare Idris",   
    "250201053": "Bakare Sulhaa",   
    "250201032": "Bankole Ibukun",   
    "250201290": "Bankole Jason",   
    "250201376": "Bassey Favour",   
    "250201340": "Batula Oluwaranti",   
    "250201387": "Bello Mohammed",   
    "250201374": "Bena Elizabeth",   
    "250201012": "Bode-Adams Ireoluwa",   
    "250201017": "Borokinni Precious",   
    "250201359": "Busari Abdullah",   
    "250201014": "Chiegwu Wilson",   
    "250201373": "Chukwu Esther",   
    "250201109": "Chukwudi Okeh-chidera",   
    "250201328": "Coker Omogbemisola",   
    "250201398": "Collins Victoria",   
    "250201038": "Da-silva Precious",   
    "250201009": "Dike Joy",   
    "250201366": "Ehiremen Mercy",   
    "250201349": "Ejike Esther",   
    "250201300": "Ekeopara Chibuike",   
    "250201081": "Emmanuel Okon",   
    "250201380": "Emmanuel Olatoye",   
    "250201304": "Eniafe Abdulwahab",   
    "250201384": "Fadairo Oluwaferanmi",   
    "250201055": "Fadare Fadeshola",   
    "250201015": "Fakorede Aliyah",   
    "250201406": "Farayibi Daniel",   
    "250201063": "Fashina Ifeoluwa",   
    "250201023": "Folorunsho Mosunmola",   
    "250201382": "Garuba Aishat",   
    "250201112": "Hamzah Fareedah",   
    "250201044": "Hassan Eniola",   
    "250201381": "Hussein Mutmainnah",   
    "250201288": "Huthman Sheriffdeen",   
    "250201106": "Ibitoye Olawumi",   
    "250201339": "Ibrahim Aleeyat",   
    "250201022": "Ilori Oluwatofunmi",   
    "250201389": "Imran Al-Ameen",   
    "250201361": "Isogun Oluwasegun",   
    "250201031": "John Chisom",   
    "250201030": "Kalu Glory",   
    "250201025": "Kayode Adebakin",   
    "250201068": "Kazeem Abdullateef",   
    "250201010": "Kelani Victor",   
    "250201071": "Kila Khadijah",   
    "250201295": "Lamidi Emmanuel",   
    "250201392": "Lisa Adam",   
    "250201397": "Makanjuola Halleluyah",   
    "250201383": "Mobolade Zainab",   
    "250201334": "Monsuru Abdul",   
    "250201036": "Morawo Adedayo",   
    "250201399": "Mustapha Abdul",   
    "250201319": "Mustapha Amirat",   
    "250201344": "Njoku Francis",   
    "250201016": "Nnadi Francis",   
    "250201333": "Nwankwo Favour",   
    "250201033": "Nwofia Jedidah",   
    "250201320": "Obasesan-Yusuf Jafar",   
    "250201362": "Odio Esther",   
    "250201291": "Odughu Gift",   
    "250201113": "Odusola Moyinoluwa",   
    "250201390": "Oduwaye Toluwalase",   
    "250201321": "Ogbeide Serena",   
    "250201020": "Ogunbayo Anuoluwapo",   
    "250201401": "Ogunfowokan Oluwatetisimi",   
    "250201024": "Ogunkoya Oluwademilade",   
    "250201323": "Ojora Roheem",   
    "250201003": "Okunubi Mujeeb",   
    "250201394": "Ola Selimot",   
    "250201108": "Olabamerun Inioluwa",   
    "250201335": "Oladimeji Isaac",   
    "250201064": "Oladiran Praise",   
    "250201289": "Oladunjoye Opemipo",   
    "250201296": "Oladuntoye Oluwatimilehin",   
    "250201348": "Olaitan Oluwanifemi",   
    "250201375": "Olajire Quam",   
    "250201299": "Olaleye Mopelola",   
    "250201045": "Olanrewaju Daniel",   
    "250201303": "Olanrewaju Juliet",   
    "250201001": "Olaosun Isaac",   
    "250201364": "Olasunkanmi Mariam",   
    "250201105": "Olasunmiboye Adedamola",   
    "250201331": "Olomo Adeshina",   
    "250201065": "Olufade Oluwaseyi",   
    "250201395": "Olulana Ibukunoluwa",   
    "250201043": "Oluwalajiki Deborah",   
    "250201347": "Oluwole Oluwakayode",   
    "250201019": "Omeje Somfe",   
    "250201051": "Omeke Precious",   
    "250201354": "Omereme Ifeanyi",   
    "250201330": "Oni Daniel",   
    "250201318": "Oni Victoria",   
    "250201360": "Opeyemi Faithful",   
    "250201324": "Osebeyo Emmanuel",   
    "250201317": "Oviawe Faith",   
    "250201342": "Oyebadejo Tobiloba",   
    "250201371": "Oyebulu Olayiwola",   
    "250201336": "Oyeniran Olamide",   
    "250201363": "Oyeniyi-Okedun Christiana",   
    "250201067": "Princewill Joy-Abasi",   
    "250201002": "Quadri Oluwaseni",   
    "250201372": "Sajowa Kehinde",   
    "250201357": "Salamade Adesola",   
    "250201114": "Salau Misturah",   
    "250201386": "Samuel Eniola",   
    "250201027": "Sani Mubarak",   
    "250201026": "Shittu Olamiposi",   
    "250201332": "Shiyanbade Faderera",   
    "250201316": "Shobayo Malik",   
    "250201297": "Sobur Kotun",   
    "250201346": "Ugo Onyekachi",   
    "250201405": "Uthman Omonifemi",   
    "250201048": "Uzoechi Chika",   
    "250201110": "Yusuf Abdul-azeez",   
    "250201004": "Yusuph Aishat",
    "250201006": "Ayantola Daniella",
    "250201115": "Martins Adefunke",
    "250201385": "Kudehinbu Lateef"   
};   
window.studentDirectory = studentDirectory;   
   
// Change these once per session: the receipt reads them.
const DUES_AMOUNT = 500;            // naira
const DUES_SESSION = '2026/2027';

const studentDuesRegistry = Object.keys(studentDirectory).map(matric => ({   
    matric: matric,   
    name: studentDirectory[matric],   
    paid: false   
}));   
window.studentDuesRegistry = studentDuesRegistry;  
 
// Fetch payment statuses from Supabase database
async function fetchInitialStudentDues() {
    if (typeof window.renderAdminDuesTable === 'function') window.renderAdminDuesTable();

    const supabase = window.tbSupabase;
    if (!supabase) return;

    try {
        const { data, error } = await supabase.from('student_dues').select('*');
        if (error) {
            console.error('Error fetching student dues:', error);
        } else if (data) {
            data.forEach(item => {
                const student = studentDuesRegistry.find(s => s.matric === item.matric);
                if (student) student.paid = item.paid;
            });
        }
    } catch (err) {
        console.error('Error fetching student dues:', err);
    }

    if (window.currentLoggedInMatric && typeof window.updateStudentDuesUI === 'function') {
        window.updateStudentDuesUI(window.currentLoggedInMatric);
    }
    const searchInput = document.getElementById('duesAdminSearchInput');
    if (typeof window.renderAdminDuesTable === 'function') {
        window.renderAdminDuesTable(searchInput ? searchInput.value.toLowerCase().trim() : '');
    }
}
// auth.js calls this after login so the registry is (re)loaded for the signed-in user.
window.refreshStudentDues = fetchInitialStudentDues;

function subscribeToRealtimeDues() {
    const supabase = window.tbSupabase;
    if (!supabase) return;
    supabase
        .channel('public:student_dues')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_dues' }, payload => {
            const updated = payload.new;
            if (!updated || !updated.matric) return;
            const student = studentDuesRegistry.find(s => s.matric === updated.matric);
            if (student) student.paid = updated.paid;
            if (window.currentLoggedInMatric === updated.matric && typeof window.updateStudentDuesUI === 'function') {
                window.updateStudentDuesUI(updated.matric);
            }
            const searchInput = document.getElementById('duesAdminSearchInput');
            if (typeof window.renderAdminDuesTable === 'function') {
                window.renderAdminDuesTable(searchInput ? searchInput.value.toLowerCase().trim() : '');
            }
        })
        .subscribe();
}

// ======================================================= 
// 3. GLOBAL UI NAVIGATION FUNCTIONS 
// ======================================================= 
window.setStudentDisplayName = function(matricNumber) {
    const displayName = studentDirectory[String(matricNumber).trim()] || "Trailblazer";

    const greetingHeader = document.querySelector(".welcome-greeting h2");
    if (greetingHeader) {
        if (typeof window.tbRenderGreetingName === 'function') {
            window.tbRenderGreetingName(greetingHeader, displayName);
        } else {
            greetingHeader.textContent = displayName;
            greetingHeader.appendChild(mk('i', 'fa-solid fa-circle-check verified-badge-icon'));
        }
    }

    const dropdownNameLabel = document.getElementById("dropdownUserName");
    if (dropdownNameLabel) dropdownNameLabel.textContent = displayName;
};

function showViewPanel(viewId) {   
    if (!viewId) return;   
   
    document.querySelectorAll('.view-panel').forEach(panel => {   
        panel.style.display = 'none';   
    });   
   
    const targetView = document.getElementById(viewId);
    if (viewId === 'forumView' && typeof window.loadForum === 'function') window.loadForum();   
    if (targetView) {   
        targetView.style.display = 'block';   
    }   
   
    document.querySelectorAll('.sidebar-grid-menu .menu-item').forEach(item => {   
        const label = item.querySelector('span')?.textContent.trim().toLowerCase();   
           
        const viewToLabel = {   
            "dashboardHomeView": "my profile",   
            "coursesView": "courses",   
            "timetableView": "timetable",   
            "resultsView": "results",   
            "feesView": "fees",   
            "noticesView": "notices",   
            "documentsView": "documents",
            "galleryView": "gallery",
            "forumView": "forum"   
        };   
   
        if (viewToLabel[viewId] && label === viewToLabel[viewId]) {   
            item.classList.add('active');   
        } else {   
            item.classList.remove('active');   
        }   
    });   
   
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const hook = window.tbViewHooks && window.tbViewHooks[viewId];
    if (typeof hook === 'function') { try { hook(); } catch (e) { console.warn('View hook failed:', e); } }
}

// -------------------------------------------------------
// BACK BUTTON / HISTORY
// -------------------------------------------------------
// The portal is one page, so the phone's back button used to leave the app. Every screen change now
// adds a history entry, and back first closes whatever is open on top (menu, search, photo, popup),
// then goes to the previous screen. On the home screen it asks for a second press before leaving.
window.tbViewHooks = window.tbViewHooks || {};
let currentView = 'dashboardHomeView';
let navOn = false;
let lastExitTap = 0;

function navToast(text) {
    let t = document.getElementById('tbNavToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'tbNavToast';
        t.setAttribute('role', 'status');
        document.body.appendChild(t);
    }
    t.textContent = text;
    t.className = 'tbx-toast show';
    clearTimeout(navToast._t);
    navToast._t = setTimeout(() => { t.className = 'tbx-toast'; }, 2200);
}

window.switchToView = function(viewId, opts) {
    if (!viewId) return;
    showViewPanel(viewId);
    if (!(opts && opts.fromHistory)) lastExitTap = 0;   // opening a screen cancels a pending "press back again"
    if (navOn && !(opts && opts.fromHistory) && viewId !== currentView) {
        const depth = ((history.state && history.state.d) || 0) + 1;
        history.pushState({ tbView: viewId, d: depth }, '');
    }
    currentView = viewId;
};

// Returns a function that closes the top-most open layer, or null when nothing is open.
function topLayerCloser() {
    const shown = (el) => !!el && getComputedStyle(el).display !== 'none';

    if (document.querySelector('.tbx-sheet.open') && typeof window.tbxCloseSearch === 'function') return window.tbxCloseSearch;

    const cal = document.querySelector('.tbx-cal:not([hidden])');
    if (cal) return () => { cal.hidden = true; };

    if (shown(document.getElementById('lightboxModal'))) {
        return () => { const b = document.getElementById('closeLightboxBtn'); if (b) b.click(); };
    }

    const dlg = document.getElementById('uploadNotesModal');
    if (dlg && dlg.open && typeof dlg.close === 'function') return () => dlg.close();

    const pm = document.getElementById('profileModal');
    if (shown(pm)) return () => { pm.style.display = 'none'; };

    const sb = document.querySelector('.dashboard-sidebar.mobile-open, .dashboard-sidebar.active');
    if (sb && window.matchMedia('(max-width: 1024px)').matches) {
        return () => {
            sb.classList.remove('mobile-open', 'active');
            const ov = document.getElementById('sidebar-overlay');
            if (ov) ov.classList.remove('active');
        };
    }

    // Results: the score list is a screen inside the Results tab
    const detail = document.getElementById('courseScoresDetailView');
    if (shown(detail)) return () => { const b = document.getElementById('backToCoursesBtn'); if (b) b.click(); };

    return null;
}

window.addEventListener('popstate', (e) => {
    if (!navOn || !window.tbUid) return;
    const st = e.state || {};

    // 1) Something is open on top: close it and stay on the current screen.
    const close = topLayerCloser();
    if (close) {
        close();
        history.pushState({ tbView: currentView, d: ((st.d || 0) + 1) }, '');
        return;
    }

    // 2) A normal step back through the screens.
    if (st.tbView) {
        window.switchToView(st.tbView, { fromHistory: true });
        return;
    }

    // 3) Back pressed on the home screen: the first press only warns, the second leaves.
    if (st.tbBase) {
        if (Date.now() - lastExitTap < 2500) {
            navOn = false;
            history.back();
            return;
        }
        lastExitTap = Date.now();
        navToast('Press back again to exit');
        history.pushState({ tbView: 'dashboardHomeView', d: 1 }, '');
        window.switchToView('dashboardHomeView', { fromHistory: true });
    }
});

// auth.js calls this once a student is signed in, and tbNavStop when the session ends.
window.tbNavStart = function () {
    if (navOn) return;
    navOn = true;
    const st = history.state || {};
    if (st.tbView) {
        // The page was reloaded (or came back from TB AI) in the middle of the app: show the same screen.
        window.switchToView(st.tbView, { fromHistory: true });
    } else {
        history.replaceState({ tbBase: true, d: 0 }, '');
        history.pushState({ tbView: 'dashboardHomeView', d: 1 }, '');
        currentView = 'dashboardHomeView';
    }
    // A tapped notification opens the app on ?open=<view>
    try {
        const q = new URLSearchParams(location.search).get('open');
        if (q && document.getElementById(q)) {
            window.switchToView(q);
            history.replaceState(history.state, '', location.pathname);
        }
    } catch (_) { /* ignore */ }
};
window.tbNavStop = function () {
    if (!navOn) return;
    navOn = false;
    const d = (history.state && history.state.d) || 0;
    currentView = 'dashboardHomeView';
    if (d > 0) { try { history.go(-d); } catch (_) { /* ignore */ } }
};
   
// switchSemester lives in auth.js (it also resets the scores detail view).

window.updateStudentDuesUI = function(matricNumber) {    
    if (!matricNumber) return;   
    const cleanMatric = String(matricNumber).replace(/[^0-9a-z]/gi, '').toUpperCase();    
    const student = studentDuesRegistry.find(s => s.matric === cleanMatric);    
   
    const statusText = document.getElementById('studentDuesStatusText');    
    const statusBadge = document.getElementById('duesStatusBadge');    
    const downloadBtn = document.getElementById('downloadDuesReceiptBtn');   
    const isPaid = student ? Boolean(student.paid) : false;    
   
    if (statusText) {    
        if (isPaid) {    
            statusText.className = "gpa-status status-success";    
            statusText.style.color = "#4ade80";   
            statusText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Status: Verified Paid`;    
        } else {    
            statusText.className = "gpa-status status-pending";    
            statusText.style.color = "#ff4d4d";    
            statusText.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Status: Pending 
Payment`;    
        }    
    }    
   
    if (statusBadge) {    
        if (isPaid) {    
            statusBadge.className = "grade-badge grade-a";    
            statusBadge.style.background = "";    
            statusBadge.style.color = "";    
            statusBadge.textContent = "Paid";    
        } else {    
            statusBadge.className = "grade-badge grade-b";    
            statusBadge.style.background = "rgba(255, 77, 77, 0.2)";    
            statusBadge.style.color = "#ff4d4d";    
            statusBadge.textContent = "Pending";    
        }    
    }    
   
    if (downloadBtn) {   
        if (isPaid) {   
            downloadBtn.disabled = false;   
            downloadBtn.style.opacity = "1";   
            downloadBtn.style.cursor = "pointer";   
        } else {   
            downloadBtn.disabled = true;   
            downloadBtn.style.opacity = "0.5";   
            downloadBtn.style.cursor = "not-allowed";   
        }   
    }   
};    
   
// The receipt shows when the paid switch was last changed. The dues table can carry that as paid_at and/or
// updated_at, so take whichever is newer. Returns { d: Date, hasTime: boolean } or null.
function latestDuesStamp(row) {
    if (!row) return null;
    let best = null;
    [row.paid_at, row.updated_at].forEach((v) => {
        if (!v) return;
        const text = String(v).trim();
        const d = new Date(text);
        if (isNaN(d.getTime())) return;
        if (!best || d.getTime() > best.d.getTime()) best = { d, hasTime: !/^\d{4}-\d{2}-\d{2}$/.test(text) };
    });
    return best;
}

window.printDuesReceipt = async function(matricNumber) {
    const cleanMatric = String(matricNumber).replace(/[^0-9a-z]/gi, '').toUpperCase();
    if (!isAdminNow() && cleanMatric !== window.currentLoggedInMatric) {
        alert("You can only print your own receipt.");
        return;
    }
    const studentName = esc(studentDirectory[cleanMatric] || "Trailblazer Student");

    // Open synchronously (popup blockers), then confirm payment with the database instead of
    // trusting the client-side flag, which anyone can flip in DevTools.
    const printWindow = window.open('', '_blank', 'width=800,height=750');
    if (!printWindow) {
        alert("Please allow popups to generate and print your receipt.");
        return;
    }

    let paid = false;
    let paidAt = null;
    const supabase = window.tbSupabase;
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('student_dues').select('*').eq('matric', cleanMatric).maybeSingle();
            paid = !error && !!(data && data.paid);
            paidAt = paid ? latestDuesStamp(data) : null;
        } catch (err) {
            console.error('Receipt verification failed:', err);
        }
    }
    if (!paid) {
        printWindow.close();
        alert("Receipt unavailable. Class dues are Pending, or payment could not be verified.");
        return;
    }

    const fmtDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const issuedDate = fmtDate(new Date());
    // Date and time of the most recent change of the paid switch, in Lagos time so every printout matches.
    let paymentDateRow = '';
    if (paidAt) {
        const when = paidAt.hasTime
            ? paidAt.d.toLocaleString('en-US', {
                timeZone: 'Africa/Lagos', year: 'numeric', month: 'long', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            }) + ' (WAT)'
            : paidAt.d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
        paymentDateRow = `<tr><td class="label">${paidAt.hasTime ? 'Payment Date &amp; Time:' : 'Payment Date:'}</td><td class="value">${when}</td></tr>`;
    }
    const receiptNo = `TB29-${DUES_SESSION.replace('/', '')}-${cleanMatric}`;

    const receiptHtml = `   
        <!DOCTYPE html>   
        <html>   
        <head>   
            <title>ACC '29 Class Dues Receipt - ${cleanMatric}</title>   
            <style>   
                body { font-family: 'Montserrat', Arial, sans-serif; padding: 40px; color: #111; 
background: #fff; }   
                .receipt-card { border: 2px solid #C5A059; padding: 30px; border-radius: 10px; 
max-width: 600px; margin: 0 auto; }   
                .receipt-header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 
15px; margin-bottom: 20px; }   
                .receipt-header h2 { margin: 0; color: #000b18; font-size: 22px; font-weight: 700; }   
                .receipt-header h4 { margin: 5px 0 0; color: #C5A059; font-weight: 600; }   
                .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }   
                .receipt-table td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }   
                .label { font-weight: 600; color: #555; width: 45%; }   
                .value { font-weight: 700; color: #111; }   
                .paid-stamp { display: inline-block; padding: 6px 16px; background: #e6f4ea; color: 
#137333; border-radius: 20px; font-weight: 700; font-size: 13px; }   
                .receipt-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; 
border-top: 1px solid #f0f0f0; padding-top: 15px; }   
            </style>   
        </head>   
        <body>   
            <div class="receipt-card">   
                <div class="receipt-header">   
                    <h2>UNIVERSITY OF LAGOS</h2>   
                    <h4>DEPARTMENT OF ACCOUNTING (ACC '29)</h4>   
                    <small>OFFICIAL CLASS DUES PAYMENT RECEIPT</small>   
                </div>   
                <table class="receipt-table">
                    <tr><td class="label">Receipt No:</td><td class="value">${receiptNo}</td></tr>   
                    <tr><td class="label">Student Name:</td><td 
class="value">${studentName}</td></tr>   
                    <tr><td class="label">Matriculation No:</td><td 
class="value">${cleanMatric}</td></tr>   
                    <tr><td class="label">Fee Description:</td><td class="value">ACC '29 
Departmental & Class Package Dues</td></tr>   
                    <tr><td class="label">Academic Session:</td><td class="value">${DUES_SESSION} Session</td></tr>   
                    <tr><td class="label">Amount Paid:</td><td class="value">₦ ${DUES_AMOUNT.toFixed(2)}</td></tr>   
                    <tr><td class="label">Verification Status:</td><td class="value"><span 
class="paid-stamp">VERIFIED PAID</span></td></tr>   
                    ${paymentDateRow}<tr><td class="label">Date Issued:</td><td class="value">${issuedDate}</td></tr>   
                </table>   
                <div class="receipt-footer">   
                    <p>Generated officially via Trailblazers '29 Student Departmental Portal.</p>   
                </div>   
            </div>   
            <script>   
                window.onload = function() { window.print(); }   
            </script>   
        </body>   
        </html>   
    `;   
   
    printWindow.document.write(receiptHtml);   
    printWindow.document.close();   
};   
 
window.generateDuesReceipt = function () {  
    const currentMatric = window.currentLoggedInMatric;  
    if (!currentMatric) {  
        alert("Please log in to access your receipt.");  
        return;  
    }  
    window.printDuesReceipt(currentMatric);  
};  
 
// ======================================================= 
// 4. ADMIN DUES TABLE RENDERING 
// ======================================================= 
window.renderAdminDuesTable = function(filterQuery = '') {
    const tbody = document.getElementById('adminDuesTbody');
    if (!tbody) return;

    tbody.replaceChildren();
    const q = String(filterQuery || '').toLowerCase();
    const filtered = studentDuesRegistry.filter(s =>
        s.name.toLowerCase().includes(q) || s.matric.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
        const tr = mk('tr');
        const td = mk('td', '', 'No students found.');
        td.colSpan = 5;
        td.style.cssText = 'text-align:center; color:#8fa5c3;';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    filtered.forEach((student, index) => {
        const tr = mk('tr');
        tr.appendChild(mk('td', '', String(index + 1)));
        tr.appendChild(mk('td', 'course-code-tag', student.matric));

        const nameTd = mk('td');
        nameTd.appendChild(mk('strong', '', student.name));
        tr.appendChild(nameTd);

        const badgeTd = mk('td');
        const badge = mk('span', `grade-badge ${student.paid ? 'grade-a' : 'grade-b'}`, student.paid ? 'Paid' : 'Pending');
        if (!student.paid) badge.style.cssText = 'background: rgba(255, 77, 77, 0.2); color: #ff4d4d;';
        badgeTd.appendChild(badge);
        tr.appendChild(badgeTd);

        const toggleTd = mk('td');
        const label = mk('label', 'status-toggle-label');
        const chk = mk('input', 'dues-toggle-checkbox');
        chk.type = 'checkbox';
        chk.dataset.matric = student.matric;
        chk.checked = !!student.paid;
        label.append(chk, mk('span', 'toggle-slider'));
        toggleTd.appendChild(label);
        tr.appendChild(toggleTd);

        chk.addEventListener('change', async () => {
            const isChecked = chk.checked;
            const previous = !isChecked;
            const refresh = () => {
                if (window.currentLoggedInMatric === student.matric && typeof window.updateStudentDuesUI === 'function') {
                    window.updateStudentDuesUI(student.matric);
                }
                window.renderAdminDuesTable(q);
            };
            const revert = () => { student.paid = previous; refresh(); };

            // UI-level guard only; the real rule is RLS on student_dues (see supabase_security.sql).
            if (!isAdminNow()) {
                alert("Only admins can change payment status.");
                revert();
                return;
            }
            student.paid = isChecked;
            try {
                await window.adminCall({ action: 'set_dues', matric: student.matric, paid: isChecked });
                refresh();
            } catch (err) {
                console.error('Error updating status in Supabase:', err);
                alert("Could not save the change: " + (err.message || err));
                revert();
            }
        });

        tbody.appendChild(tr);
    });
};

// ======================================================= 
// 5. ANNOUNCEMENTS & NOTIFICATIONS LOGIC 
// ======================================================= 
// =======================================================
// BROWSER NOTIFICATION PERMISSION & NATIVE PUSH
// =======================================================
// ---- Web Push: alerts that arrive even when the app is closed ----
// Paste your PUBLIC VAPID key between the quotes. Left empty, push stays off and nothing else changes.
const VAPID_PUBLIC_KEY = "BBusOtigU6hJi4igIF3OThkOcHmO-CZ_kJXKOQDCs7zle_PchTdJF9cGQAcTuZ5yPXJotbhN1_PwA21cO4gOdAI";
const PUSH_FN_URL = "https://yuebmlmamkclsfizurkp.supabase.co/functions/v1/push-subscribe";

function urlBase64ToUint8Array(b64) {
    const padded = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(padded);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function pushCall(payload) {
    const token = await window.tbGetIdToken();
    if (!token) throw new Error("Please log in again.");
    const res = await fetch(PUSH_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        let why = '';
        try { why = (await res.text()).slice(0, 160); } catch (_) { /* ignore */ }
        throw new Error("Push setup failed (" + res.status + ")" + (why ? ": " + why : ""));
    }
}

// A subscription created with an older VAPID key is silently rejected by the push service, so it must be replaced.
function subscriptionMatchesKey(sub) {
    try {
        const cur = sub.options && sub.options.applicationServerKey;
        if (!cur) return true;
        const a = new Uint8Array(cur), b = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        return a.length === b.length && a.every((v, i) => v === b[i]);
    } catch (_) { return true; }
}

// Registers this device for push. Returns true when it is registered.
// window.tbPushStatus says why it is not (open the console to read it).
async function ensurePushSubscription() {
    const fail = (why) => { window.tbPushStatus = why; return false; };
    if (!VAPID_PUBLIC_KEY) return fail('no VAPID key');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return fail('push not supported here');
    if (!('Notification' in window) || Notification.permission !== 'granted') return fail('permission not granted');
    if (!window.tbUid) return fail('not signed in');
    try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub && !subscriptionMatchesKey(sub)) {
            await sub.unsubscribe().catch(() => {});
            sub = null;
        }
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }
        await pushCall({ action: 'subscribe', subscription: sub.toJSON() });
        window.tbPushStatus = 'registered';
        lastPushSync = Date.now();
        return true;
    } catch (err) {
        console.warn('Push subscription failed:', err);
        return fail(String((err && err.message) || err));
    }
}
let lastPushSync = 0;
window.syncPushSubscription = ensurePushSubscription; // auth.js calls this after login

// Called on logout so a shared phone stops receiving the previous student's alerts.
window.tbPushUnsubscribe = async function () {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg && await reg.pushManager.getSubscription();
        if (!sub) return;
        await pushCall({ action: 'unsubscribe', endpoint: sub.endpoint });
        await sub.unsubscribe();
    } catch (err) {
        console.warn('Push unsubscribe failed:', err);
    }
};

window.requestNotificationPermission = async function() {
    if (!('Notification' in window)) {
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        alert(isIos
            ? "On iPhone, tap Share, then Add to Home Screen. Open the portal from your Home Screen, then enable notifications there."
            : "This browser does not support notifications.");
        return;
    }
    const permission = await Notification.requestPermission();
    const btn = document.getElementById('enableNotifBtn');
    if (permission === 'granted') {
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Notifications Enabled`;
            btn.style.background = '#22c55e';
        }

        // Register for push so alerts also arrive when the app is closed.
        const pushOn = await ensurePushSubscription();
        const body = pushOn
            ? "Notifications are on. You'll be alerted about new announcements, even when the app is closed."
            : "Notifications are on. You'll get an alert when a new announcement is posted while the app is open.";

        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification("Trailblazers '29 Portal", {
                body,
                icon: "./icon-192.jpg",
                badge: "./favicon-32.jpg"
            });
        } else {
            new Notification("Trailblazers '29 Portal", { body, icon: "./icon-192.jpg" });
        }
    } else {
        alert("Notification permission was denied. You can enable it in your browser settings.");
    }
};
let noticeAudioCtx = null;
function playNoticeChime() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        noticeAudioCtx = noticeAudioCtx || new Ctx();
        if (noticeAudioCtx.state === 'suspended') noticeAudioCtx.resume();
        const osc = noticeAudioCtx.createOscillator();
        const gain = noticeAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, noticeAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, noticeAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noticeAudioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(noticeAudioCtx.destination);
        osc.start();
        osc.stop(noticeAudioCtx.currentTime + 0.4);
    } catch (e) { /* audio is optional */ }
}

// The same announcement can arrive by the live connection, by push and by a catch-up fetch.
// These keep it to one alert. The OS tag is built from the title in BOTH app.js and sw.js, so a
// push and an in-app alert for the same announcement replace each other instead of doubling up.
const seenNotices = new Set();
const recentTitles = new Map();
const NOTICE_TS_KEY = 'tb_last_notice_ts';

function noticeKey(n) { return n.id != null ? 'id:' + n.id : 'k:' + (n.title || '') + '|' + (n.date || ''); }
function noticeTag(title) { return 'tb29-' + String(title || 'notice').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60); }
function rememberNoticeTime(ts) {
    const t = Date.parse(ts || '');
    if (!t) return;
    try {
        const cur = Date.parse(localStorage.getItem(NOTICE_TS_KEY) || '') || 0;
        if (t > cur) localStorage.setItem(NOTICE_TS_KEY, new Date(t).toISOString());
    } catch (_) { /* storage blocked */ }
}

// Returns false when this announcement was already alerted.
function announceNotice(notice, opts) {
    const key = noticeKey(notice);
    if (seenNotices.has(key)) return false;
    seenNotices.add(key);
    recentTitles.set(String(notice.title || '').trim().toLowerCase(), Date.now());
    rememberNoticeTime(notice.created_at);
    showNotificationToast(notice, opts);
    return true;
}

// opts.os === false: in-app toast only (used for catch-up and for push, where sw.js already showed the OS alert)
function showNotificationToast(notice, opts) {
    const showOs = !(opts && opts.os === false);
    const container = document.getElementById('toastContainer');
    if (container) {
        const isImportant = (notice.category || '').toUpperCase() === 'IMPORTANT';
        const toast = mk('div', `toast-card ${isImportant ? 'toast-important' : ''}`);

        const iconWrap = mk('div', 'toast-icon');
        iconWrap.appendChild(mk('i', `fa-solid ${isImportant ? 'fa-triangle-exclamation' : 'fa-bell'}`));

        const content = mk('div', 'toast-content');
        content.append(
            mk('div', 'toast-title', notice.title || 'New Announcement'),
            mk('div', 'toast-text', notice.content || '')
        );

        const closeBtn = mk('button', 'toast-close-btn', '×');
        closeBtn.type = 'button';
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); toast.remove(); });

        toast.append(iconWrap, content, closeBtn);
        toast.addEventListener('click', () => {
            if (typeof window.switchToView === 'function') window.switchToView('noticesView');
        });
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, 6000);
    }

    // `Notification` does not exist on iOS Safari (outside installed PWAs): guard it, and never let
    // a failure here stop the chime / calendar update that follow.
    if (showOs && 'Notification' in window && Notification.permission === 'granted') {
        const title = notice.title || "New Departmental Announcement";
        const body = notice.content || "Click to view the new announcement on your portal.";
        try {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => registration.showNotification(title, {
                    body,
                    icon: "./icon-192.jpg",
                    badge: "./favicon-32.jpg",
                    vibrate: [200, 100, 200],
                    tag: noticeTag(title),
                    data: { view: 'noticesView' }
                })).catch(() => {});
            } else {
                new Notification(title, { body, icon: "./icon-192.jpg" });
            }
        } catch (e) { /* ignore */ }
    }

    playNoticeChime();
}

// Announcements posted while the phone was asleep or the app was closed never reached the live
// connection. When the portal opens or resumes, tell the student about anything newer than the
// last announcement they were alerted to. (First run only records a starting point, so nobody
// gets a pile of old alerts.)
function catchUpNotices(list) {
    if (!window.tbUid || !Array.isArray(list) || !list.length) return;
    const times = list.map(n => Date.parse(n.created_at) || 0);
    const newest = Math.max(...times);
    if (!newest) return;
    let last = 0;
    try { last = Date.parse(localStorage.getItem(NOTICE_TS_KEY) || '') || 0; } catch (_) { /* ignore */ }
    if (!last) { rememberNoticeTime(new Date(newest).toISOString()); return; }

    const fresh = list.filter(n => (Date.parse(n.created_at) || 0) > last && !seenNotices.has(noticeKey(n)));
    fresh.forEach(n => seenNotices.add(noticeKey(n)));
    rememberNoticeTime(new Date(newest).toISOString());
    if (!fresh.length) return;

    if (fresh.length === 1) showNotificationToast(fresh[0], { os: false });
    else showNotificationToast({ title: fresh.length + ' new announcements', content: fresh[0].title || '', category: 'GENERAL' }, { os: false });
}
window.tbCatchUpNotices = function () { return fetchInitialAnnouncements().catch(() => {}); };

function formatDateString(dateStr) {
    if (!dateStr) return '';
    // "2026-06-15" alone is read as UTC midnight, which shows as the previous day west of UTC.
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr).trim());
    const dateObj = ymd ? new Date(+ymd[1], +ymd[2] - 1, +ymd[3]) : new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function updateNoticeCount() {
    const countBadge = document.getElementById('activeNoticeCount');
    const container = document.getElementById('noticesContainer');
    if (countBadge && container) {
        const total = container.querySelectorAll('article').length;
        countBadge.textContent = `${total} Active Announcement${total === 1 ? '' : 's'}`;
    }
}

// prepend = true for a live (realtime) notice; false when rendering an already newest-first list.
function renderNoticeCard(notice, prepend = false) {
    const container = document.getElementById('noticesContainer');
    if (!container) return;

    const category = (notice.category || 'GENERAL').toUpperCase();
    const isImportant = category === 'IMPORTANT';

    const article = mk('article', `matrix-card ${isImportant ? 'notice-card-important' : 'notice-card-general'}`);

    const header = mk('div', 'notice-card-header');
    header.appendChild(mk('span', isImportant ? 'course-code-tag' : 'total-units-badge', category));
    const date = mk('small', 'notice-date');
    date.append(mk('i', 'fa-solid fa-clock'), ' ' + formatDateString(notice.date));
    header.appendChild(date);

    article.append(header, mk('h4', 'notice-title', notice.title || ''), mk('p', 'notice-text', notice.content || ''));

    if (prepend) container.prepend(article);
    else container.appendChild(article);
    updateNoticeCount();
}

async function fetchInitialAnnouncements() {
    const supabase = window.tbSupabase;
    if (!supabase) return;
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching announcements:', error);
        return;
    }

    const container = document.getElementById('noticesContainer');
    if (!container) return;

    if (data && data.length > 0) {
        container.replaceChildren();
        data.forEach(notice => renderNoticeCard(notice)); // already newest-first: append in order
        catchUpNotices(data);
    }
}

let noticeChannel = null, noticeRetry = 0, noticeRetryTimer = null;

function handleLiveNotice(notice) {
    if (!notice) return;
    renderNoticeCard(notice, true);
    announceNotice(notice);

    const today = new Date();
    const year = today.getFullYear();
    const todayStr = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (notice.date === todayStr) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const displayDate = `${monthNames[today.getMonth()]} ${today.getDate()}, ${year}`;
        if (typeof window.updateFocusedEventCard === 'function') {
            window.updateFocusedEventCard(notice.title, displayDate, notice.content);
        }
    }
}

function subscribeToRealtimeAnnouncements() {
    const supabase = window.tbSupabase;
    if (!supabase) return;

    clearTimeout(noticeRetryTimer);
    if (noticeChannel) { try { supabase.removeChannel(noticeChannel); } catch (_) { /* ignore */ } }

    const ch = supabase.channel('public:announcements');
    noticeChannel = ch;
    ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => handleLiveNotice(payload.new))
      .subscribe((status) => {
        if (ch !== noticeChannel) return; // an old channel that was replaced on purpose
        console.log("Supabase Realtime Channel Status:", status);
        if (status === 'SUBSCRIBED') { noticeRetry = 0; return; }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            // A phone drops this connection whenever the app sleeps. Reconnect instead of staying deaf.
            const wait = Math.min(30000, 1000 * Math.pow(2, noticeRetry++));
            noticeRetryTimer = setTimeout(subscribeToRealtimeAnnouncements, wait);
        }
    });
}

// Phones suspend the live connection while the app is in the background, so anything posted in the
// meantime never arrives. Re-sync when the student comes back or the network returns.
let lastResync = Date.now();
function resyncLiveData() {
    if (!window.tbSupabase) return;
    if (Date.now() - lastResync < 10000) return;
    lastResync = Date.now();
    fetchInitialAnnouncements().catch(() => {});
    if (window.tbUid) fetchInitialStudentDues().catch(() => {});
    if (!noticeChannel || noticeChannel.state !== 'joined') subscribeToRealtimeAnnouncements();
    // Re-register for push now and then: the browser may have renewed or dropped the subscription.
    if (window.tbUid && Date.now() - lastPushSync > 6 * 3600 * 1000) ensurePushSubscription();
}
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    resyncLiveData();
    // An installed app resumes without a page load, so ask for a newer service worker explicitly.
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => reg && reg.update()).catch(() => {});
    }
});
window.addEventListener('online', resyncLiveData);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        const msg = event.data || {};
        if (msg.type === 'tb-open' && msg.view && window.tbUid) {
            window.switchToView(msg.view);
        } else if (msg.type === 'tb-push' && msg.notice) {
            // sw.js already showed the system alert. Add the in-app toast, and pull the new card in,
            // unless the live connection delivered this announcement a moment ago.
            const t = String(msg.notice.title || '').trim().toLowerCase();
            if (Date.now() - (recentTitles.get(t) || 0) > 20000) {
                recentTitles.set(t, Date.now());
                showNotificationToast({
                    title: msg.notice.title,
                    content: msg.notice.body || msg.notice.content,
                    category: msg.notice.category
                }, { os: false });
            }
            fetchInitialAnnouncements().catch(() => {});
        }
    });
}

// ======================================================= 
// 6. DOM CONTENT LOADED INITIALIZATIONS 
// ======================================================= 
document.addEventListener("DOMContentLoaded", function () {   
 
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {   
        anchor.addEventListener('click', function (e) {   
            const targetId = this.getAttribute('href').replace('#', '');   
            if (document.getElementById(targetId)) {   
                e.preventDefault();   
                window.switchToView(targetId);   
            } else if (targetId === '') {
                e.preventDefault();
            }   
        });   
    });   
   
    const viewMap = {   
        "my profile": "dashboardHomeView",   
        "courses": "coursesView",   
        "timetable": "timetableView",   
        "results": "resultsView",   
        "fees": "feesView",   
        "notices": "noticesView",   
        "documents": "documentsView",
        "gallery": "galleryView",
        "forum": "forumView"   
    };   
   
    document.querySelectorAll(".sidebar-grid-menu .menu-item").forEach(item => {   
        item.addEventListener("click", function () {   
            const label = this.querySelector("span")?.textContent.trim().toLowerCase();   
            const targetViewId = viewMap[label];   
            if (targetViewId) {   
                window.switchToView(targetViewId);   
            }   
        });   
    });   
   
    document.querySelectorAll(".quick-access-box-grid .access-box").forEach(box => {   
        box.addEventListener("click", function () {   
            const label = this.querySelector("span")?.textContent.trim().toLowerCase();   
            const targetViewId = viewMap[label];   
            if (targetViewId) {   
                window.switchToView(targetViewId);   
            }   
        });   
    });   
   
    // Back button + name/matric search for the scoresheet live in auth.js (the copies here hid every row).
    // Check existing notification permission on app load 
if ('Notification' in window && Notification.permission === 'granted') 
{ 
    const btn = document.getElementById('enableNotifBtn'); 
    if (btn) { 
        btn.innerHTML = `<i class="fa-solid fa-check"></i> 
Notifications Enabled`; 
        btn.style.background = '#22c55e'; 
    } 
} 
   
    // Mobile Sidebar & Overlay Controller (the only one; auth.js's copy was removed).
    // The CSS has used both `mobile-open` and `active` on the sidebar, so set both.
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.querySelector('.dashboard-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const menuItems = document.querySelectorAll('.sidebar-grid-menu .menu-item');

    function openMobileMenu() {
        if (sidebar) sidebar.classList.add('mobile-open', 'active');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
    }
    function closeMobileMenu() {
        if (sidebar) sidebar.classList.remove('mobile-open', 'active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && sidebar.classList.contains('mobile-open')) closeMobileMenu();
            else openMobileMenu();
        });
    }
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileMenu);
    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) closeMobileMenu();
        });
    });

    const profileBtn = document.getElementById('profileDropdownBtn');   
    const profileModal = document.getElementById('profileModal');   
    const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');   
    const modalProfilePicInput = document.getElementById('modalProfilePicInput');   
    const modalToggleThemeBtn = document.getElementById('modalToggleThemeBtn');   
    const modalLogoutBtn = document.getElementById('modalLogoutBtn');   
   
    const headerImg = document.getElementById('userAvatarImg');   
    const headerIcon = document.getElementById('userAvatarIcon');   
    const modalImg = document.getElementById('enlargedAvatarImg');   
    const modalIcon = document.getElementById('enlargedAvatarIcon');   
   
    function getCurrentUserKey() {    
        const userEmail = localStorage.getItem('logged_in_user_email') || 
window.currentLoggedInMatric || 'default_user';    
        return `avatar_${userEmail}`;    
    }    
  
    function loadUserProfilePicture() {   
        const storageKey = getCurrentUserKey();   
        const savedAvatar = localStorage.getItem(storageKey);   
        if (savedAvatar) {   
            if (headerImg) { headerImg.src = savedAvatar; headerImg.style.display = 'block'; }   
            if (headerIcon) headerIcon.style.display = 'none';   
            if (modalImg) { modalImg.src = savedAvatar; modalImg.style.display = 'block'; }   
            if (modalIcon) modalIcon.style.display = 'none';   
        } else {   
            if (headerImg) headerImg.style.display = 'none';   
            if (headerIcon) headerIcon.style.display = 'block';   
            if (modalImg) modalImg.style.display = 'none';   
            if (modalIcon) modalIcon.style.display = 'block';   
        }   
    }   
   
    if (profileBtn) {    
        profileBtn.addEventListener('click', () => {    
            loadUserProfilePicture();    
            const cleanMatric = window.currentLoggedInMatric || 
localStorage.getItem('logged_in_user_matric');  
            const displayName = (window.studentDirectory && 
window.studentDirectory[cleanMatric]) || "Trailblazer";  
            const modalNameHeader = document.getElementById('modalUserName');  
            if (modalNameHeader) modalNameHeader.textContent = displayName;  
            if (profileModal) profileModal.style.display = 'flex';    
        });    
    }   
   
    if (closeProfileModalBtn) {   
        closeProfileModalBtn.addEventListener('click', () => {   
            if (profileModal) profileModal.style.display = 'none';   
        });   
    }   
   
    if (profileModal) {   
        profileModal.addEventListener('click', (e) => {   
            if (e.target === profileModal) profileModal.style.display = 'none';   
        });   
    }   
   
    if (modalProfilePicInput) {
        modalProfilePicInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            event.target.value = '';
            if (!file) return;
            const reader = new FileReader();
            reader.onerror = () => alert("Couldn't read that photo. Please try another one.");
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => alert("That file couldn't be opened as an image. Please try a JPG or PNG.");
                img.onload = () => {
                    // Shrink to a small centred square: a raw phone photo is several MB and overflows localStorage.
                    const SIZE = 256;
                    const side = Math.min(img.width, img.height);
                    const canvas = document.createElement('canvas');
                    canvas.width = SIZE;
                    canvas.height = SIZE;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, SIZE, SIZE);
                    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
                    try {
                        localStorage.setItem(getCurrentUserKey(), canvas.toDataURL('image/jpeg', 0.85));
                    } catch (err) {
                        console.warn('Could not save profile photo:', err);
                        alert("Couldn't save your photo on this device (storage is full or blocked).");
                        return;
                    }
                    loadUserProfilePicture();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (modalToggleThemeBtn) {   
        modalToggleThemeBtn.addEventListener('click', () => {   
            document.body.classList.toggle('light-theme');   
            const isLight = document.body.classList.contains('light-theme');   
            try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (_) { /* storage blocked */ }   
        });   
    }   
   
    // Logout (header and profile modal buttons) is handled in auth.js.

    loadUserProfilePicture();   
   
    // ======================================================= 
    // CALENDAR IMPLEMENTATION (SAFE ASYNC SCOPE) 
    // ======================================================= 
    let currentCalendarDate = new Date();   
    const prevMonthBtn = document.getElementById("prevMonthBtn");   
    const nextMonthBtn = document.getElementById("nextMonthBtn");   
    const calendarMonthYearText = document.getElementById("calendarMonthYearText");   
    const calendarGridDays = document.getElementById("calendarGridDays");   
   
    const sampleEvents = {   
        "2026-06-15": {   
            title: "Mid-Semester Schedule Release",   
            text: "Mid-semester schedule released for ACC 102 and AMS 104."   
        },   
        "2026-06-23": {   
            title: "Mid-Semester Test",   
            text: "All students are advised to check the timetable for updates on lecture schedules."   
        }   
    };   
   
    function updateFocusedEventCard(title, dateStr, text) {
        const titleEl = document.getElementById("focusedEventTitle");
        const dateEl = document.getElementById("focusedEventDate");
        const textEl = document.getElementById("focusedEventText");
        if (titleEl) {
            const hasEvent = title && title !== "No Scheduled Events";
            const dot = mk('span', 'blue-indicator-dot');
            if (!hasEvent) dot.style.background = '#8b949e';
            titleEl.replaceChildren(dot, document.createTextNode(' ' + (hasEvent ? title : 'No Scheduled Events')));
        }
        if (dateEl) dateEl.textContent = dateStr;
        if (textEl) {
            textEl.style.whiteSpace = 'pre-line';
            textEl.textContent = text || "There are no events scheduled for today.";
        }
    }
    window.updateFocusedEventCard = updateFocusedEventCard;

    function showEventsOnCard(events, dateStr) {
        if (!events || events.length === 0) {
            updateFocusedEventCard("No Scheduled Events", dateStr, "There are no events scheduled for today.");
        } else if (events.length === 1) {
            updateFocusedEventCard(events[0].title, dateStr, events[0].content || events[0].text);
        } else {
            updateFocusedEventCard(`${events.length} events`, dateStr,
                events.map(ev => `• ${ev.title}: ${ev.content || ev.text || ''}`).join('\n'));
        }
    }

    let calendarRenderId = 0;
    async function renderCalendar(dateObj) {
        if (!calendarGridDays || !calendarMonthYearText) return;
        const renderId = ++calendarRenderId; // ignore results of a render the user has already navigated past

        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calendarMonthYearText.textContent = `${monthNames[month]} ${year}`;

        calendarGridDays.innerHTML = `
            <div class="day-label">MON</div><div class="day-label">TUE</div><div class="day-label">WED</div>
            <div class="day-label">THU</div><div class="day-label">FRI</div><div class="day-label">SAT</div><div class="day-label">SUN</div>
        `;

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();
        const today = new Date();

        for (let x = firstDayIndex; x > 0; x--) {
            const dayDiv = mk('div', 'day-num muted', String(prevLastDay - x + 1));
            calendarGridDays.appendChild(dayDiv);
        }

        // date -> array of notices (several can share one date)
        const eventsByDate = {};
        Object.keys(sampleEvents).forEach(k => { eventsByDate[k] = [sampleEvents[k]]; });
        const dayElements = {};

        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = mk('div', 'day-num', String(i));
            dayDiv.style.cursor = "pointer";

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
            dayElements[dateKey] = dayDiv;
            if (eventsByDate[dateKey]) dayDiv.classList.add("has-event");

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add("today-highlight");
            }

            dayDiv.addEventListener("click", function () {
                document.querySelectorAll(".day-num").forEach(d => d.classList.remove("selected-day"));
                this.classList.add("selected-day");
                showEventsOnCard(eventsByDate[dateKey], `${monthNames[month]} ${i}, ${year}`);
            });

            calendarGridDays.appendChild(dayDiv);
        }

        const supabase = window.tbSupabase;
        if (supabase) {
            try {
                const { data, error } = await supabase.from('announcements').select('*');
                if (renderId !== calendarRenderId) return;
                if (!error && data) {
                    data.forEach(notice => {
                        if (!dayElements[notice.date]) return;
                        (eventsByDate[notice.date] = eventsByDate[notice.date] || []).push(notice);
                        dayElements[notice.date].classList.add("has-event");
                    });
                }
            } catch (err) {
                console.error("Error loading calendar events from Supabase:", err);
            }
        }
        if (renderId !== calendarRenderId) return;

        // Only touch the "today" card while the current month is on screen.
        if (year === today.getFullYear() && month === today.getMonth()) {
            const todayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            showEventsOnCard(eventsByDate[todayKey], `${monthNames[month]} ${today.getDate()}, ${year}`);
        }
    }

    if (prevMonthBtn && nextMonthBtn) {   
        prevMonthBtn.addEventListener("click", function () {   
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);   
            renderCalendar(currentCalendarDate);   
        });   
   
        nextMonthBtn.addEventListener("click", function () {   
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);   
            renderCalendar(currentCalendarDate);   
        });   
    }   
   
    onSupabaseReady(() => {
        renderCalendar(currentCalendarDate);
        fetchInitialAnnouncements();
        subscribeToRealtimeAnnouncements();
        fetchInitialStudentDues();
        subscribeToRealtimeDues();
    });   
   
    const postNoticeForm = document.getElementById('postNoticeForm');
    if (postNoticeForm) {
        postNoticeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!isAdminNow()) {
                alert("Only admins can post announcements.");
                return;
            }
            const title = (document.getElementById('noticeTitleInput')?.value || '').trim();
            const date = document.getElementById('noticeDateInput')?.value;
            const content = (document.getElementById('noticeTextInput')?.value || '').trim();
            if (!title || !date || !content) {
                alert("Please fill in the title, date and message.");
                return;
            }

            try {
                await window.adminCall({ action: 'post_announcement', title, date, content, category: 'GENERAL' });
                alert("Announcement published successfully!");
                postNoticeForm.reset();
            } catch (err) {
                alert("Error publishing announcement: " + err.message);
            }
        });
    }

    const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');   
    if (duesAdminSearchInput) {   
        duesAdminSearchInput.addEventListener('input', (e) => {   
            window.renderAdminDuesTable(e.target.value.toLowerCase().trim());   
        });   
    }   
   
    const downloadDuesReceiptBtn = document.getElementById('downloadDuesReceiptBtn');   
    if (downloadDuesReceiptBtn) {   
        downloadDuesReceiptBtn.addEventListener('click', () => {   
            const activeMatric = window.currentLoggedInMatric;   
            if (activeMatric) {   
                window.printDuesReceipt(activeMatric);   
            } else {   
                alert("Could not identify logged-in student account.");   
            }   
        });   
    }   
});  
 
// ======================================================= 
// 7. PWA SERVICE WORKER REGISTRATION 
// ======================================================= 
// When a new service worker takes over (after a deploy), reload once so the page runs the new code.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });
}

if ('serviceWorker' in navigator) {   
  window.addEventListener('load', () => {   
    navigator.serviceWorker.register('./sw.js')   
      .then((reg) => {   
        console.log('PWA Service Worker registered successfully:', reg.scope);   
      })   
      .catch((err) => {   
        console.error('PWA Service Worker registration failed:', err);   
      });   
  });   
}   
   
(function () {
  // Chrome / Edge / Samsung Internet only offer the install prompt when they decide to (and never once the
  // app is installed or the prompt was dismissed). iPhones and some browsers never offer it at all.
  // So the button is shown to everyone who has not installed the app, and when there is no one-tap prompt
  // it shows the steps for their phone instead of doing nothing.
  const DISMISS_KEY = 'tb_install_dismissed';
  let deferred = window.__tbDeferredInstall || null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;
  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function legacyBtn() { return document.getElementById('pwaInstallBtn'); }
  function legacyPill() { return document.getElementById('pwaInstallPill'); }
  const onScreen = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

  function steps() {
    return isIos()
      ? ['Tap the Share button (the square with an arrow) in Safari.', 'Scroll down and tap "Add to Home Screen".', 'Tap "Add". Open the portal from your Home Screen.']
      : ['Open your browser menu (the three dots).', 'Tap "Install app" or "Add to Home screen".', 'Confirm, then open the portal from your Home Screen.'];
  }

  function showSteps() {
    if (document.getElementById('tbInstallSheet')) return;
    const sheet = mk('div', 'tb-install-sheet');
    sheet.id = 'tbInstallSheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    const card = mk('div', 'tb-install-card');
    const close = mk('button', 'tb-install-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    const list = mk('ol', 'tb-install-steps');
    steps().forEach(t => list.appendChild(mk('li', '', t)));
    card.append(mk('h3', '', 'Install the portal'), mk('p', '', 'Add it to your phone like an app, with alerts for new announcements.'), list, close);
    sheet.appendChild(card);
    const dismiss = () => sheet.remove();
    close.addEventListener('click', dismiss);
    sheet.addEventListener('click', (e) => { if (e.target === sheet) dismiss(); });
    document.body.appendChild(sheet);
  }

  async function install() {
    if (deferred) {
      try {
        deferred.prompt();
        const { outcome } = await deferred.userChoice;
        deferred = null;
        window.__tbDeferredInstall = null;
        if (outcome === 'accepted') { refresh(); return; }
      } catch (_) { deferred = null; }
    }
    if (!isStandalone()) showSteps();
  }

  // The floating pill is only used when the page has no visible install button of its own.
  function floatingPill() {
    let pill = document.getElementById('tbInstallFab');
    if (pill) return pill;
    pill = mk('div', 'tb-install-fab');
    pill.id = 'tbInstallFab';
    const go = mk('button', 'tb-install-go');
    go.type = 'button';
    go.append(mk('i', 'fa-solid fa-download'), document.createTextNode(' Install app'));
    go.addEventListener('click', install);
    const x = mk('button', 'tb-install-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Hide install button');
    x.addEventListener('click', () => {
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (_) { /* ignore */ }
      pill.style.display = 'none';
    });
    pill.append(go, x);
    document.body.appendChild(pill);
    return pill;
  }

  function dismissedRecently() {
    try { return Date.now() - Number(localStorage.getItem(DISMISS_KEY) || 0) < 1 * 86400000; } catch (_) { return false; }
  }

  function refresh() {
    try { refreshInner(); } catch (err) { console.warn('Install button refresh failed:', err); }
  }

  function refreshInner() {
    const btn = legacyBtn(), pill = legacyPill();
    if (isStandalone()) {
      if (pill) pill.style.display = 'none';
      if (btn) btn.style.display = 'none';
      const f = document.getElementById('tbInstallFab');
      if (f) f.style.display = 'none';
      return;
    }
    if (btn) btn.style.display = 'inline-flex';
    if (pill) pill.style.display = 'flex';
    const f = floatingPill();
    f.style.display = (onScreen(btn) || dismissedRecently()) ? 'none' : 'flex';
  }
  window.tbInstallRefresh = refresh;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    window.__tbDeferredInstall = e;
    refresh();
  });
  // Logging in or out swaps which screen is showing, and coming back to the tab can change the install state.
  window.addEventListener('tb-auth-change', () => { setTimeout(refresh, 150); setTimeout(refresh, 1200); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    try { localStorage.removeItem(DISMISS_KEY); } catch (_) { /* ignore */ }
    refresh();
  });

  function wire() {
    const btn = legacyBtn();
    if (btn && !btn.dataset.tbWired) {
      btn.dataset.tbWired = '1';
      btn.addEventListener('click', install);
    }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
  // The portal view appears after sign-in, so look again once the page has settled.
  setTimeout(refresh, 1500);
  setTimeout(refresh, 5000);
})();


// Timetable: give empty cells ("-") one consistent look in every row and both themes.
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.timetable-table td').forEach(td => {
        if (/^[\s\-\u2013\u2014]*$/.test(td.textContent)) td.classList.add('tt-empty');
    });
});

// =======================================================
// 7. GALLERY & LIGHTBOX
// =======================================================
document.addEventListener("DOMContentLoaded", function () {
    const cards = Array.from(document.querySelectorAll('.gallery-card'));
    const pills = document.querySelectorAll('.gallery-pill');
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    const img = document.getElementById('lightboxImage');
    const captionEl = document.getElementById('lightboxCaption');
    const timeEl = document.getElementById('lightboxTime');
    const dlBtn = document.getElementById('lightboxDownloadBtn');
    const shareBtn = document.getElementById('lightboxShareBtn');
    const emptyMsg = document.getElementById('galleryEmpty');

    let visible = [...cards];
    let index = 0;

    // computed style: the modal may be hidden by a CSS class rather than an inline style
    const isOpen = () => getComputedStyle(modal).display !== 'none';
    const close = () => { modal.style.display = 'none'; img.removeAttribute('src'); };

    function show(i) {
        if (!visible.length) return;
        index = (i + visible.length) % visible.length;
        const d = visible[index].dataset;
        img.src = d.src;
        img.alt = d.caption;
        captionEl.textContent = d.caption;
        timeEl.textContent = d.time;
        dlBtn.href = d.src;
        dlBtn.setAttribute('download', d.src.split('/').pop());
        modal.style.display = 'flex';
    }

    pills.forEach(pill => pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.category;
        visible = cards.filter(card => {
            const match = cat === 'all' || card.dataset.category === cat;
            card.style.display = match ? '' : 'none';
            return match;
        });
        if (emptyMsg) emptyMsg.style.display = visible.length ? 'none' : 'block';
    }));

    cards.forEach(card => card.addEventListener('click', () => {
        const i = visible.indexOf(card);
        if (i !== -1) show(i);
    }));

    document.getElementById('closeLightboxBtn').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.getElementById('lightboxPrevBtn').addEventListener('click', () => show(index - 1));
    document.getElementById('lightboxNextBtn').addEventListener('click', () => show(index + 1));

    document.addEventListener('keydown', e => {
        if (!isOpen()) return;
        if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
    });

    // Swipe left/right on the image (mobile)
    let startX = null;
    const box = document.querySelector('.lightbox-img-container');
    box?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    box?.addEventListener('touchend', e => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });

    // Share the image file when supported, otherwise its link
    shareBtn.addEventListener('click', async () => {
        const d = visible[index] && visible[index].dataset;
        if (!d) return;
        const url = new URL(d.src, window.location.href).href;
        const text = "Check out this photo on Trailblazers '29: " + d.caption;
        try {
            if (!navigator.share) {
                await navigator.clipboard.writeText(url);
                alert('Image link copied to clipboard!');
                return;
            }
            let file = null;
            try {
                const blob = await (await fetch(url)).blob();
                file = new File([blob], d.src.split('/').pop(), { type: blob.type });
            } catch (_) { /* could not fetch the image: share the link instead */ }

            if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: d.caption, text });
                } catch (err) {
                    // Cancelling the file share must NOT open a second share sheet.
                    if (err && err.name === 'AbortError') return;
                    await navigator.share({ title: d.caption, text, url });
                }
                return;
            }
            await navigator.share({ title: d.caption, text, url });
        } catch (err) { /* user cancelled or sharing unavailable */ }
    });
});

// =======================================================
// DAILY FORUM (Supabase tables + post-comment Edge Function)
// =======================================================
(function () {
    const FN_URL = "https://yuebmlmamkclsfizurkp.supabase.co/functions/v1/post-comment";
    const $ = id => document.getElementById(id);
    let topic = null;

    window.forumCall = async function (payload) {
        const token = await window.tbGetIdToken();
        if (!token) throw new Error("Please log in again.");
        const res = await fetch(FN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify(payload)
        });
        const raw = await res.text();
        let out = {};
        try { out = JSON.parse(raw); } catch (e) { out = { message: raw.slice(0, 120) }; }
        if (!res.ok) {
            throw new Error(out.error || ("Error " + res.status + ": " + (out.message || out.msg || out.code || "no details")));
        }
        return out;
    };

    function timeAgo(iso) {
        const m = Math.floor((Date.now() - new Date(iso)) / 60000);
        if (m < 1) return "just now";
        if (m < 60) return m + "m ago";
        if (m < 1440) return Math.floor(m / 60) + "h ago";
        return Math.floor(m / 1440) + "d ago";
    }

    function note(text) {
        const p = document.createElement("p");
        p.className = "forum-note";
        p.textContent = text;
        return p;
    }

    async function loadPosts() {
        const list = $("forumPosts");
        const { data, error } = await window.tbSupabase.from("posts")
            .select("id, handle, body, created_at").eq("topic_id", topic.id)
            .order("created_at", { ascending: false }).limit(100);
        list.replaceChildren();
        if (error) { list.appendChild(note("Could not load posts. Try again.")); return; }
        if (!data.length) { list.appendChild(note("No replies yet. Start the conversation.")); return; }
        data.forEach(p => {
            const el = document.createElement("div");
            el.className = "forum-post";
            const head = document.createElement("div");
            head.className = "forum-post-head";
            const who = document.createElement("strong");
            who.textContent = p.handle;
            const when = document.createElement("span");
            when.textContent = timeAgo(p.created_at);
            head.append(who, when);
            if (window.forumIsAdmin) {
                const rm = document.createElement("button");
                rm.type = "button";
                rm.className = "forum-remove";
                rm.textContent = "Remove";
                rm.addEventListener("click", async () => {
                    if (!confirm("Remove this post?")) return;
                    try {
                        await window.forumCall({ action: "admin_delete_post", id: p.id });
                        loadPosts();
                    } catch (err) { alert(err.message); }
                });
                head.appendChild(rm);
            }
            const body = document.createElement("p");
            body.textContent = p.body;
            el.append(head, body);
            list.appendChild(el);
        });
    }

    window.loadForum = async function () {
        if (!window.tbSupabase) return;
        const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
        // limit(1): two approved topics on one date made maybeSingle() error out and look like "no topic".
        const { data, error } = await window.tbSupabase.from("topics").select("*")
            .eq("release_date", today).eq("approved", true)
            .order("closes_at", { ascending: false }).limit(1).maybeSingle();
        if (error) {
            console.error("Forum topic load failed:", error);
            topic = null;
            $("forumTopic").textContent = "Could not load today's topic. Please try again.";
            $("forumForm").style.display = "none";
            $("forumPosts").replaceChildren();
            return;
        }
        topic = data;
        if (!topic) {
            $("forumTopic").textContent = "No topic yet today. Check back soon.";
            $("forumForm").style.display = "none";
            $("forumPosts").replaceChildren();
            return;
        }
        const open = new Date(topic.closes_at) > new Date();
        $("forumTopic").textContent = topic.title + (open ? "" : " (comments closed)");
        $("forumForm").style.display = open ? "" : "none";
        await loadPosts();
    };

    document.addEventListener("DOMContentLoaded", () => {
        const form = $("forumForm"), input = $("forumInput"), btn = $("forumSubmit");
        if (!form) return;
        input.addEventListener("input", () => { $("forumCount").textContent = input.value.length + "/500"; });
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const body = input.value.trim();
            if (!body || !topic) return;
            btn.disabled = true;
            try {
                await window.forumCall({ action: "post", topic_id: topic.id, body });
                input.value = "";
                $("forumCount").textContent = "0/500";
                await loadPosts();
            } catch (err) {
                alert(err.message);
            } finally {
                btn.disabled = false;
            }
        });
    });
})();


// =======================================================
// FORUM: STUDENT SUGGESTIONS + ADMIN PANEL
// =======================================================
(function () {
    const $ = id => document.getElementById(id);
    const el = (tag, cls, text) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
    };
    const baseLoad = window.loadForum;

    async function loadAdmin() {
        const box = $("forumAdminLists");
        try {
            const { suggestions, topics } = await window.forumCall({ action: "admin_list" });
            const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
            box.replaceChildren(el("h4", "forum-admin-title", "Suggestions (" + suggestions.length + ")"));
            if (!suggestions.length) box.appendChild(el("p", "forum-note", "No suggestions waiting."));
            suggestions.forEach(s => {
                const row = el("div", "forum-admin-row");
                const date = el("input");
                date.type = "date";
                date.min = today;
                const add = el("button", "btn-primary", "Schedule");
                add.type = "button";
                const del = el("button", "btn-outline", "Remove");
                del.type = "button";
                add.addEventListener("click", async () => {
                    if (!date.value) { alert("Pick a date first."); return; }
                    try {
                        await window.forumCall({ action: "admin_add_topic", text: s.suggestion, date: date.value, id: s.id });
                        await window.loadForum();
                    } catch (e) { alert(e.message); }
                });
                del.addEventListener("click", async () => {
                    try {
                        await window.forumCall({ action: "admin_delete_suggestion", id: s.id });
                        loadAdmin();
                    } catch (e) { alert(e.message); }
                });
                const actions = el("div", "forum-admin-actions");
                actions.append(date, add, del);
                row.append(el("p", "", s.suggestion), actions);
                box.appendChild(row);
            });
            box.appendChild(el("h4", "forum-admin-title", "Queued topics"));
            if (!topics.length) box.appendChild(el("p", "forum-note", "Nothing queued."));
            topics.forEach(t => box.appendChild(el("p", "forum-queued", t.release_date + ": " + t.title)));
        } catch (e) {
            box.replaceChildren(el("p", "forum-note", e.message));
        }
    }

    let adminCheckedFor = null; // uid the cached admin flag belongs to
    window.loadForum = async function () {
        const uid = window.tbUid || null;
        if (window.forumIsAdmin === undefined || adminCheckedFor !== uid) {
            window.forumIsAdmin = undefined;
            try {
                window.forumIsAdmin = (await window.forumCall({ action: "whoami" })).admin === true;
                adminCheckedFor = uid;
            } catch (e) { /* not signed in yet: treat as a student for now */ }
        }
        const adminBox = $("forumAdmin");
        if (adminBox) adminBox.style.display = window.forumIsAdmin ? "" : "none";
        await baseLoad();
        if (window.forumIsAdmin) loadAdmin();
    };

    document.addEventListener("DOMContentLoaded", () => {
        const sForm = $("forumSuggestForm");
        if (sForm) sForm.addEventListener("submit", async e => {
            e.preventDefault();
            const input = $("forumSuggestInput");
            try {
                await window.forumCall({ action: "suggest", text: input.value });
                input.value = "";
                $("forumSuggestBox").open = false;
                alert("Thanks! An admin will review your topic.");
            } catch (err) { alert(err.message); }
        });
        const tForm = $("forumTopicForm");
        if (tForm) tForm.addEventListener("submit", async e => {
            e.preventDefault();
            try {
                await window.forumCall({ action: "admin_add_topic", text: $("forumTopicTitle").value, date: $("forumTopicDate").value });
                tForm.reset();
                await window.loadForum();
            } catch (err) { alert(err.message); }
        });
    });
})();


// =======================================================
// 8. ASSIGNMENTS, POLLS, SITE SEARCH & SPLASH
// (merged from features.js: it adds its own sidebar items, pages, dashboard tiles and search button)
// =======================================================
// Trailblazers '29 portal: Assignments, Polls and site search.
// Loaded after app.js. It adds its own sidebar items, pages, dashboard tiles and search button,
// so index.html only needs the two include lines.
(function () {
  "use strict";

  // ── Test admins ─────────────────────────────────────────────────────────
  // Anyone listed here sees the admin buttons (add assignment, new poll, delete, close).
  // Put your matric number between the quotes, for example ["240805001"].
  // The real admins (course reps) are picked up automatically from the existing admin list.
  const TEST_ADMIN_MATRICS = [];
  const TEST_ADMIN_EMAILS = ["admin@student.local"];

  const DATA_FILE = "tb-data.json";
  const LAGOS = "Africa/Lagos";

  // ── Small helpers ───────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? "" : v);
      });
    }
    kids.flat().forEach((c) => {
      if (c == null || c === false) return;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  const icon = (cls) => h("i", { class: "fa-solid " + cls, "aria-hidden": "true" });

  function me() {
    return {
      email: (localStorage.getItem("logged_in_user_email") || "").toLowerCase(),
      matric: localStorage.getItem("logged_in_user_matric") || ""
    };
  }
  const voterId = () => me().matric || me().email;

  function lsGet(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
  }
  const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "l" + Date.now() + Math.random().toString(16).slice(2));

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: LAGOS
  });
  const whenText = (iso) => dateFmt.format(new Date(iso));

  function relText(iso) {
    const ms = new Date(iso) - Date.now();
    const abs = Math.abs(ms);
    const min = Math.round(abs / 60000), hr = Math.round(abs / 3600000), day = Math.round(abs / 86400000);
    let span;
    if (min < 1) return ms >= 0 ? "due now" : "just passed";
    if (min < 60) span = min + (min === 1 ? " minute" : " minutes");
    else if (hr < 24) span = hr + (hr === 1 ? " hour" : " hours");
    else span = day + (day === 1 ? " day" : " days");
    return ms >= 0 ? "in " + span : span + " ago";
  }

  function toast(text, isError) {
    let t = $("tbxToast");
    if (!t) {
      t = h("div", { id: "tbxToast", class: "tbx-toast", role: "status" });
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.className = "tbx-toast show" + (isError ? " error" : "");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.className = "tbx-toast"; }, 3200);
  }

  // ── Who is an admin ─────────────────────────────────────────────────────
  function localAdmin() {
    const m = me();
    if (TEST_ADMIN_EMAILS.indexOf(m.email) !== -1) return true;
    if (m.matric && TEST_ADMIN_MATRICS.map(norm).indexOf(norm(m.matric)) !== -1) return true;
    try { if (typeof window.tbIsAdmin === "function" && window.tbIsAdmin()) return true; } catch (e) { /* ignore */ }
    return false;
  }
  async function isAdmin() {
    if (localAdmin()) return true;
    if (window.forumIsAdmin === true) return true;
    if (window.forumIsAdmin === undefined && typeof window.forumCall === "function") {
      try { window.forumIsAdmin = (await window.forumCall({ action: "whoami" })).admin === true; }
      catch (e) { /* not an admin or not reachable */ }
    }
    return window.forumIsAdmin === true;
  }

  // ── Course list (for the add form and for search) ───────────────────────
  let dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_FILE).then((r) => r.json()).catch(() => ({}));
    }
    return dataPromise;
  }

  // ── Data layer ──────────────────────────────────────────────────────────
  // Uses the Supabase tables when they exist. Until they do, it falls back to a test mode that
  // keeps everything on this device only, so the screens can be tried right away.
  const L_ASSIGN = "tbx_local_assignments", L_POLLS = "tbx_local_polls", L_VOTES = "tbx_local_votes";

  function isMissingTable(err) {
    const msg = String((err && err.message) || "");
    return (err && (err.code === "PGRST205" || err.code === "42P01" || err.code === "PGRST202")) ||
      /could not find the (table|function)|does not exist|schema cache/i.test(msg);
  }
  function friendly(err) {
    if (err && err.code === "42501") return "The database refused this. Run the Assignments and Polls SQL again.";
    return (err && err.message) || "Something went wrong. Try again.";
  }

  const Store = {
    mode: null,   // "server" or "local"
    sb() { return window.tbSupabase || null; },

    async ensureMode() {
      if (this.mode === "server") return;
      const sb = this.sb();
      if (!sb) { this.mode = "local"; return; }
      const { error } = await sb.from("assignments").select("id").limit(1);
      if (!error) { this.mode = "server"; return; }
      if (isMissingTable(error)) { this.mode = "local"; return; }
      throw error;
    },

    // Assignments
    async listAssignments() {
      await this.ensureMode();
      if (this.mode === "local") return lsGet(L_ASSIGN, []);
      const { data, error } = await this.sb().from("assignments").select("*").order("due_at", { ascending: true }).limit(300);
      if (error) throw error;
      return data || [];
    },
    async addAssignment(a) {
      if (this.mode === "local") {
        const list = lsGet(L_ASSIGN, []);
        list.push(Object.assign({ id: uid(), created_at: new Date().toISOString(), created_by: me().email }, a));
        lsSet(L_ASSIGN, list);
        return;
      }
      const { error } = await this.sb().from("assignments").insert([Object.assign({ created_by: me().email }, a)]);
      if (error) throw error;
    },
    async updateAssignment(id, fields) {
      if (this.mode === "local") {
        lsSet(L_ASSIGN, lsGet(L_ASSIGN, []).map((x) => (x.id === id ? Object.assign({}, x, fields) : x)));
        return;
      }
      const { error } = await this.sb().from("assignments").update(fields).eq("id", id);
      if (error) throw error;
    },
    async deleteAssignment(id) {
      if (this.mode === "local") { lsSet(L_ASSIGN, lsGet(L_ASSIGN, []).filter((x) => x.id !== id)); return; }
      const { error } = await this.sb().from("assignments").delete().eq("id", id);
      if (error) throw error;
    },

    // Polls
    async listPolls() {
      await this.ensureMode();
      const voter = voterId();
      if (this.mode === "local") return this._localPolls(voter);
      const sb = this.sb();
      const { data, error } = await sb.from("polls")
        .select("id,question,allow_multiple,closes_at,closed,created_at,poll_options(id,label,position)")
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return Promise.all((data || []).map(async (p) => {
        const [c, m, n] = await Promise.all([
          sb.rpc("poll_counts", { p_poll: p.id }),
          sb.rpc("my_votes", { p_poll: p.id, p_voter: voter }),
          sb.rpc("poll_voter_count", { p_poll: p.id })
        ]);
        if (c.error) throw c.error;
        if (m.error) throw m.error;
        if (n.error) throw n.error;
        const counts = {};
        (c.data || []).forEach((r) => { counts[r.option_id] = Number(r.votes); });
        return {
          id: p.id, question: p.question, allow_multiple: p.allow_multiple, closes_at: p.closes_at,
          closed: p.closed, created_at: p.created_at,
          options: (p.poll_options || []).slice().sort((a, b) => a.position - b.position),
          counts, mine: new Set((m.data || []).map((r) => r.option_id)), voters: Number(n.data || 0)
        };
      }));
    },
    async listPollsLite() {
      await this.ensureMode();
      if (this.mode === "local") return lsGet(L_POLLS, []);
      const { data, error } = await this.sb().from("polls")
        .select("id,question,allow_multiple,closes_at,closed,created_at,poll_options(id,label,position)")
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []).map((p) => Object.assign({}, p, { options: p.poll_options || [] }));
    },
    _localPolls(voter) {
      const votes = lsGet(L_VOTES, []);
      return lsGet(L_POLLS, []).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((p) => {
        const mine = new Set(), counts = {}, who = new Set();
        votes.filter((v) => v.poll === p.id).forEach((v) => {
          counts[v.option] = (counts[v.option] || 0) + 1;
          who.add(v.voter);
          if (v.voter === voter) mine.add(v.option);
        });
        return Object.assign({}, p, { counts, mine, voters: who.size });
      });
    },
    async addPoll(p) {
      if (this.mode === "local") {
        const polls = lsGet(L_POLLS, []);
        polls.push({
          id: uid(), question: p.question, allow_multiple: p.allow_multiple, closes_at: p.closes_at, closed: false,
          created_at: new Date().toISOString(), options: p.options.map((label, i) => ({ id: uid(), label, position: i }))
        });
        lsSet(L_POLLS, polls);
        return;
      }
      const sb = this.sb();
      const { data, error } = await sb.from("polls").insert([{
        question: p.question, allow_multiple: p.allow_multiple, closes_at: p.closes_at, created_by: me().email
      }]).select("id").single();
      if (error) throw error;
      const { error: e2 } = await sb.from("poll_options").insert(
        p.options.map((label, i) => ({ poll_id: data.id, label, position: i }))
      );
      if (e2) { await sb.from("polls").delete().eq("id", data.id); throw e2; }
    },
    async closePoll(id) {
      if (this.mode === "local") {
        lsSet(L_POLLS, lsGet(L_POLLS, []).map((p) => (p.id === id ? Object.assign({}, p, { closed: true }) : p)));
        return;
      }
      const { error } = await this.sb().from("polls").update({ closed: true }).eq("id", id);
      if (error) throw error;
    },
    async deletePoll(id) {
      if (this.mode === "local") {
        lsSet(L_POLLS, lsGet(L_POLLS, []).filter((p) => p.id !== id));
        lsSet(L_VOTES, lsGet(L_VOTES, []).filter((v) => v.poll !== id));
        return;
      }
      const { error } = await this.sb().from("polls").delete().eq("id", id);
      if (error) throw error;
    },
    async vote(poll, optionIds) {
      const voter = voterId();
      const ids = Array.from(optionIds || []);
      if (!ids.length) throw new Error("Pick an answer first.");
      if (this.mode === "local") {
        const open = !poll.closed && (!poll.closes_at || new Date(poll.closes_at) > new Date());
        if (!open) throw new Error("This poll is closed.");
        const votes = lsGet(L_VOTES, []);
        if (votes.some((v) => v.poll === poll.id && v.voter === voter)) throw new Error("You have already voted in this poll.");
        if (!poll.allow_multiple && ids.length > 1) throw new Error("Pick only one answer.");
        ids.forEach((o) => votes.push({ poll: poll.id, option: o, voter }));
        lsSet(L_VOTES, votes);
        return;
      }
      const { error } = await this.sb().rpc("cast_vote", { p_poll: poll.id, p_options: ids, p_voter: voter });
      if (error) throw error;
    }
  };

  // ── Page plumbing: sidebar items, pages, dashboard tiles ────────────────
  const PAGES = {
    assignmentsView: { label: "Assignments", icon: "fa-list-check" },
    pollsView: { label: "Polls", icon: "fa-square-poll-vertical" }
  };

  function closeMobileMenu() {
    const sb = document.querySelector(".dashboard-sidebar");
    const ov = $("sidebar-overlay");
    if (sb) sb.classList.remove("mobile-open", "active");
    if (ov) ov.classList.remove("active");
  }

  function markActive(id) {
    document.querySelectorAll(".sidebar-grid-menu .menu-item").forEach((item) => {
      const span = item.querySelector("span");
      if (PAGES[id] && span && span.textContent.trim() === PAGES[id].label) item.classList.add("active");
    });
  }

  function openView(id) {
    closeMobileMenu();
    if (typeof window.switchToView === "function") window.switchToView(id);
  }
  window.tbxOpenView = openView;

  // switchToView runs these after showing the page, whether the student tapped a menu item,
  // opened a search result or pressed the phone's back button.
  window.tbViewHooks = window.tbViewHooks || {};
  window.tbViewHooks.assignmentsView = () => { markActive("assignmentsView"); Assignments.load(); };
  window.tbViewHooks.pollsView = () => { markActive("pollsView"); Polls.load(); };

  function installPages() {
    const nav = document.querySelector(".sidebar-grid-menu");
    const anchor = $("galleryView");
    const grid = document.querySelector(".quick-access-box-grid");
    if (!nav || !anchor) return false;
    if ($("assignmentsView")) return false;   // already installed (guards against a second copy of this code)

    Object.keys(PAGES).forEach((id) => {
      const p = PAGES[id];
      nav.appendChild(h("div", { class: "menu-item", role: "button", tabindex: "0", onclick: () => openView(id),
        onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openView(id); } } },
        icon(p.icon), h("span", { text: p.label })));
      if (grid) {
        grid.appendChild(h("div", { class: "access-box", role: "button", tabindex: "0", onclick: () => openView(id),
          onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openView(id); } } },
          icon(p.icon), h("span", { text: p.label })));
      }
      anchor.parentNode.appendChild(h("div", { id, class: "view-panel", style: "display: none;" }));
    });
    return true;
  }

  // Shared bits for both pages
  function modeBanner() {
    return Store.mode === "local"
      ? h("div", { class: "tbx-banner", role: "note" },
          icon("fa-flask"),
          h("span", { text: "Test mode. The server tables are not set up yet, so what you add here is saved on this device only." }))
      : null;
  }
  function stateBox(text, retry) {
    return h("div", { class: "tbx-state" }, h("p", { text }),
      retry ? h("button", { type: "button", class: "tbx-btn", onclick: retry }, icon("fa-rotate-right"), " Try again") : null);
  }
  function field(label, control, hint) {
    const isPicker = control.classList && control.classList.contains("tbx-dt");
    return h(isPicker ? "div" : "label", { class: "tbx-field" }, h("span", { class: "tbx-label", text: label }), control,
      hint ? h("small", { text: hint }) : null);
  }
  function toLocalInput(d) {
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
  }


  // ── Date and time picker: calendar plus an alarm-style time row, shown as dd/mm/yyyy ──
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const dmy = (d) => pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear();

  function dtPicker(opts) {
    const o = Object.assign({ optional: false, initial: null, defaultHour: 11, defaultMinute: 59, defaultPm: true }, opts || {});
    let date = o.initial ? new Date(o.initial.getFullYear(), o.initial.getMonth(), o.initial.getDate()) : null;
    let view = date ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const dateBtn = h("button", { type: "button", class: "tbx-input tbx-dt-date", "aria-haspopup": "dialog", "aria-expanded": "false" });
    const label = h("span", { class: "tbx-dt-text" });
    dateBtn.append(icon("fa-calendar-days"), label);

    const hourSel = h("select", { class: "tbx-input tbx-dt-sel", "aria-label": "Hour" });
    for (let i = 1; i <= 12; i++) hourSel.appendChild(h("option", { value: String(i), text: String(i) }));
    const minSel = h("select", { class: "tbx-input tbx-dt-sel", "aria-label": "Minute" });
    for (let i = 0; i < 60; i++) minSel.appendChild(h("option", { value: String(i), text: pad2(i) }));
    const apSel = h("select", { class: "tbx-input tbx-dt-sel", "aria-label": "AM or PM" });
    apSel.append(h("option", { value: "AM", text: "AM" }), h("option", { value: "PM", text: "PM" }));
    const setTime = (hh, mm, pm) => { hourSel.value = String(hh); minSel.value = String(mm); apSel.value = pm ? "PM" : "AM"; };
    if (o.initial) setTime(o.initial.getHours() % 12 || 12, o.initial.getMinutes(), o.initial.getHours() >= 12);
    else setTime(o.defaultHour, o.defaultMinute, o.defaultPm);

    const pop = h("div", { class: "tbx-cal", role: "dialog", "aria-label": "Choose a date", hidden: true });
    const wrap = h("div", { class: "tbx-dt" },
      h("div", { class: "tbx-dt-row" }, dateBtn),
      h("div", { class: "tbx-dt-row tbx-dt-time" }, icon("fa-clock"), hourSel, h("span", { class: "tbx-dt-colon", text: ":" }), minSel, apSel),
      pop);

    function refresh() {
      label.textContent = date ? dmy(date) : "dd/mm/yyyy";
      dateBtn.classList.toggle("is-empty", !date);
      [hourSel, minSel, apSel].forEach((s2) => { s2.disabled = !date; });
    }
    function close() { pop.hidden = true; dateBtn.setAttribute("aria-expanded", "false"); }
    function open() { pop.hidden = false; dateBtn.setAttribute("aria-expanded", "true"); drawCal(); }
    function pick(d) {
      date = d; refresh(); close();
      if (o.optional && !wrap.dataset.timeTouched) setTime(o.defaultHour, o.defaultMinute, o.defaultPm);
    }
    function drawCal() {
      const head = h("div", { class: "tbx-cal-head" });
      const prev = h("button", { type: "button", class: "tbx-icon-btn", "aria-label": "Previous month" }, icon("fa-chevron-left"));
      const next = h("button", { type: "button", class: "tbx-icon-btn", "aria-label": "Next month" }, icon("fa-chevron-right"));
      prev.disabled = !o.allowPast && view <= new Date(today.getFullYear(), today.getMonth(), 1);
      prev.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCal(); });
      next.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCal(); });
      head.append(prev, h("strong", { class: "tbx-cal-title", text: MONTHS[view.getMonth()] + " " + view.getFullYear() }), next);

      const grid = h("div", { class: "tbx-cal-grid", role: "grid" });
      DAYS.forEach((d) => grid.appendChild(h("span", { class: "tbx-cal-dow", text: d })));
      const first = new Date(view.getFullYear(), view.getMonth(), 1);
      const lead = (first.getDay() + 6) % 7;
      for (let i = 0; i < lead; i++) grid.appendChild(h("span", { class: "tbx-cal-gap" }));
      const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let n = 1; n <= count; n++) {
        const d = new Date(view.getFullYear(), view.getMonth(), n);
        const b = h("button", { type: "button", class: "tbx-cal-day" + (date && sameDay(d, date) ? " sel" : "") + (sameDay(d, today) ? " today" : ""), text: String(n) });
        if (d < today && !o.allowPast) b.disabled = true;
        else b.addEventListener("click", () => pick(d));
        grid.appendChild(b);
      }
      const foot = h("div", { class: "tbx-cal-foot" },
        h("button", { type: "button", class: "tbx-btn", onclick: () => pick(new Date(today)) }, "Today"),
        o.optional ? h("button", { type: "button", class: "tbx-btn", onclick: () => { date = null; refresh(); close(); } }, "Clear") : null);
      pop.replaceChildren(head, grid, foot);
    }

    dateBtn.addEventListener("click", () => { if (pop.hidden) open(); else close(); });
    [hourSel, minSel, apSel].forEach((s2) => s2.addEventListener("change", () => { wrap.dataset.timeTouched = "1"; }));
    document.addEventListener("click", (e) => { if (!pop.hidden && !e.composedPath().includes(wrap)) close(); });
    wrap.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { close(); dateBtn.focus(); } });
    refresh();

    wrap.getDate = () => {
      if (!date) return null;
      const hh = (Number(hourSel.value) % 12) + (apSel.value === "PM" ? 12 : 0);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, Number(minSel.value), 0, 0);
    };
    wrap.focusPicker = () => dateBtn.focus();
    return wrap;
  }

  // ── Assignments ─────────────────────────────────────────────────────────
  const Assignments = {
    items: [], state: "idle", admin: false, course: "", showPast: false, formOpen: false, editing: null,
    doneKey() { return "tbx_done_" + voterId(); },
    done() { return new Set(lsGet(this.doneKey(), [])); },
    toggleDone(id) {
      const s = this.done();
      if (s.has(id)) s.delete(id); else s.add(id);
      lsSet(this.doneKey(), Array.from(s));
    },

    async load() {
      this.state = "loading";
      this.render();
      try {
        const [items, admin] = await Promise.all([Store.listAssignments(), isAdmin()]);
        this.items = items; this.admin = admin; this.state = "ready";
        Sync.set(items);
      } catch (e) {
        console.error("Assignments failed to load:", e);
        this.state = "error";
      }
      this.render();
    },

    render() {
      const root = $("assignmentsView");
      if (!root) return;
      const now = Date.now();
      const open = this.items.filter((a) => new Date(a.due_at) >= now);
      const card = h("div", { class: "matrix-card tbx-card" });
      card.appendChild(h("div", { class: "table-header-row" },
        h("h3", null, icon("fa-list-check"), " Assignments"),
        this.state === "ready" ? h("span", { class: "total-units-badge", text: open.length + " open" }) : null));
      const banner = modeBanner();
      if (banner) card.appendChild(banner);

      if (this.state === "loading") { card.appendChild(stateBox("Loading assignments...")); root.replaceChildren(card); return; }
      if (this.state === "error") { card.appendChild(stateBox("Could not load assignments. Check your connection and try again.", () => this.load())); root.replaceChildren(card); return; }

      if (this.admin) {
        card.appendChild(h("div", { class: "tbx-toolbar" },
          h("button", { type: "button", class: "btn-primary tbx-add", "aria-expanded": String(this.formOpen),
            onclick: () => { this.formOpen = !this.formOpen; this.editing = null; this.render(); } },
            icon(this.formOpen ? "fa-xmark" : "fa-plus"), this.formOpen ? " Cancel" : " Add assignment")));
        if (this.formOpen) card.appendChild(this.form(this.editing ? this.items.find((x) => x.id === this.editing) : null));
      }

      const courses = Array.from(new Set(this.items.map((a) => a.course_code))).sort();
      if (this.items.length) {
        const sel = h("select", { class: "tbx-input", "aria-label": "Filter by course", onchange: (e) => { this.course = e.target.value; this.render(); } },
          h("option", { value: "", text: "All courses" }),
          courses.map((c) => h("option", { value: c, text: c, selected: c === this.course ? true : null })));
        const chk = h("label", { class: "tbx-check" },
          h("input", { type: "checkbox", checked: this.showPast ? true : null, onchange: (e) => { this.showPast = e.target.checked; this.render(); } }),
          h("span", { text: "Show past assignments" }));
        card.appendChild(h("div", { class: "tbx-filters" }, sel, chk));
      }

      const done = this.done();
      const visible = this.items.filter((a) => !this.course || a.course_code === this.course);
      const upcoming = visible.filter((a) => new Date(a.due_at) >= now).sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
      const past = visible.filter((a) => new Date(a.due_at) < now).sort((a, b) => new Date(b.due_at) - new Date(a.due_at));

      if (!this.items.length) {
        card.appendChild(stateBox(this.admin
          ? "No assignments yet. Use Add assignment to post the first one."
          : "No assignments have been posted. Check back after your course rep adds one."));
      } else if (!upcoming.length && !(this.showPast && past.length)) {
        card.appendChild(stateBox("Nothing is due. You are all caught up."));
      }
      if (upcoming.length) card.appendChild(h("div", { class: "tbx-list" }, upcoming.map((a) => this.item(a, done))));
      if (this.showPast && past.length) {
        card.appendChild(h("h4", { class: "tbx-subhead", text: "Past" }));
        card.appendChild(h("div", { class: "tbx-list" }, past.map((a) => this.item(a, done))));
      }
      root.replaceChildren(card);
    },

    item(a, done) {
      const ms = new Date(a.due_at) - Date.now();
      const tone = ms < 0 ? "late" : ms < 48 * 3600000 ? "soon" : "";
      const isDone = done.has(a.id);
      const el = h("article", { class: "tbx-item" + (isDone ? " is-done" : "") + (ms < 0 ? " is-past" : "") });
      const note = a.note ? h("p", { class: "tbx-note", text: a.note }) : null;
      el.appendChild(h("div", { class: "tbx-item-top" },
        h("span", { class: "tbx-tag", text: a.course_code }),
        h("span", { class: "tbx-due " + tone }, icon("fa-clock"), " ", relText(a.due_at))));
      el.appendChild(h("h4", { class: "tbx-item-title", text: a.title }));
      el.appendChild(h("p", { class: "tbx-meta", text: "Due " + whenText(a.due_at) }));
      if (note) el.appendChild(note);
      const actions = h("div", { class: "tbx-item-actions" },
        h("button", { type: "button", class: "tbx-btn", role: "checkbox", "aria-checked": String(isDone),
          onclick: () => { this.toggleDone(a.id); this.render(); } },
          icon(isDone ? "fa-square-check" : "fa-square"), isDone ? " Done" : " Mark as done"));
      if (this.admin) {
        const edit = h("button", { type: "button", class: "tbx-btn" }, icon("fa-pen"), " Edit");
        edit.addEventListener("click", () => {
          this.editing = a.id; this.formOpen = true; this.render();
          const f = $("assignmentsView").querySelector(".tbx-form");
          if (f) f.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        actions.appendChild(edit);
        actions.appendChild(this.deleteButton(a));
      }
      el.appendChild(actions);
      return el;
    },

    deleteButton(a) {
      const btn = h("button", { type: "button", class: "tbx-btn danger" }, icon("fa-trash"), " Delete");
      let armed = false;
      btn.addEventListener("click", async () => {
        if (!armed) {
          armed = true; btn.textContent = "Tap again to delete"; btn.classList.add("armed");
          setTimeout(() => { if (armed) { armed = false; btn.replaceChildren(icon("fa-trash"), " Delete"); btn.classList.remove("armed"); } }, 3500);
          return;
        }
        btn.disabled = true;
        try { await Store.deleteAssignment(a.id); toast("Assignment deleted."); await this.load(); }
        catch (e) { btn.disabled = false; toast(friendly(e), true); }
      });
      return btn;
    },

    form(edit) {
      const tomorrow = new Date(Date.now() + 86400000); tomorrow.setHours(23, 59, 0, 0);
      const course = h("input", { class: "tbx-input", id: "tbxACourse", list: "tbxCourseList", maxlength: "20", placeholder: "ACC 210", autocomplete: "off", required: true, value: edit ? edit.course_code : "" });
      const list = h("datalist", { id: "tbxCourseList" });
      loadData().then((d) => (d.courses || []).forEach((c) => { if (c.code) list.appendChild(h("option", { value: c.code, label: c.title || "" })); }));
      const title = h("input", { class: "tbx-input", id: "tbxATitle", maxlength: "200", placeholder: "What is the assignment?", required: true, value: edit ? edit.title : "" });
      const due = dtPicker({ initial: edit ? new Date(edit.due_at) : tomorrow, allowPast: !!edit });
      const note = h("textarea", { class: "tbx-input", id: "tbxANote", maxlength: "1000", rows: "3", placeholder: "Any detail students should know (optional)" });
      if (edit && edit.note) note.value = edit.note;
      const msg = h("p", { class: "tbx-formmsg", role: "alert" });
      const submit = h("button", { type: "submit", class: "btn-primary tbx-submit" }, edit ? "Save changes" : "Post assignment");
      const form = h("form", { class: "tbx-form", novalidate: true },
        field("Course", course, "Pick from the list or type a course code"), list,
        field("Title", title), field("Due date and time", due, "Pick a date, then set the time"), field("Short note", note), msg, submit);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";
        const code = course.value.trim().toUpperCase(), t = title.value.trim(), n = note.value.trim();
        const d = due.getDate();
        if (code.length < 3) { msg.textContent = "Enter the course code, for example ACC 210."; course.focus(); return; }
        if (t.length < 3) { msg.textContent = "Give the assignment a title of at least 3 characters."; title.focus(); return; }
        if (!d) { msg.textContent = "Choose a due date and time."; due.focusPicker(); return; }
        const unchangedTime = edit && d.getTime() === new Date(edit.due_at).getTime();
        if (d < new Date() && !unchangedTime) { msg.textContent = "That time has already passed. Pick a later time."; due.focusPicker(); return; }
        submit.disabled = true; submit.textContent = edit ? "Saving..." : "Posting...";
        try {
          const fields = { course_code: code, title: t, note: n || null, due_at: d.toISOString() };
          if (edit) await Store.updateAssignment(edit.id, fields); else await Store.addAssignment(fields);
          this.formOpen = false; this.editing = null; toast(edit ? "Assignment updated." : "Assignment posted."); await this.load();
        } catch (err) {
          console.error(err); msg.textContent = friendly(err);
          submit.disabled = false; submit.textContent = edit ? "Save changes" : "Post assignment";
        }
      });
      return form;
    }
  };

  // ── Polls ───────────────────────────────────────────────────────────────
  const Polls = {
    items: [], state: "idle", admin: false, formOpen: false,

    async load() {
      this.state = "loading";
      this.render();
      try {
        const [items, admin] = await Promise.all([Store.listPolls(), isAdmin()]);
        this.items = items; this.admin = admin; this.state = "ready";
      } catch (e) {
        console.error("Polls failed to load:", e);
        this.state = "error";
      }
      this.render();
    },

    draft: {},

    isOpen(p) { return !p.closed && (!p.closes_at || new Date(p.closes_at) > new Date()); },

    render() {
      const root = $("pollsView");
      if (!root) return;
      const card = h("div", { class: "matrix-card tbx-card" });
      const openCount = this.items.filter((p) => this.isOpen(p)).length;
      card.appendChild(h("div", { class: "table-header-row" },
        h("h3", null, icon("fa-square-poll-vertical"), " Polls"),
        this.state === "ready" ? h("span", { class: "total-units-badge", text: openCount + " open" }) : null));
      const banner = modeBanner();
      if (banner) card.appendChild(banner);

      if (this.state === "loading") { card.appendChild(stateBox("Loading polls...")); root.replaceChildren(card); return; }
      if (this.state === "error") { card.appendChild(stateBox("Could not load polls. Check your connection and try again.", () => this.load())); root.replaceChildren(card); return; }

      if (this.admin) {
        card.appendChild(h("div", { class: "tbx-toolbar" },
          h("button", { type: "button", class: "btn-primary tbx-add", "aria-expanded": String(this.formOpen),
            onclick: () => { this.formOpen = !this.formOpen; this.render(); } },
            icon(this.formOpen ? "fa-xmark" : "fa-plus"), this.formOpen ? " Cancel" : " New poll")));
        if (this.formOpen) card.appendChild(this.form());
      }
      if (!this.items.length) {
        card.appendChild(stateBox(this.admin ? "No polls yet. Use New poll to ask the class something." : "There are no polls right now."));
      } else {
        const sorted = this.items.slice().sort((a, b) => (this.isOpen(b) - this.isOpen(a)));
        card.appendChild(h("div", { class: "tbx-list" }, sorted.map((p) => this.pollCard(p))));
      }
      root.replaceChildren(card);
    },

    pollCard(p) {
      const open = this.isOpen(p);
      const voted = p.mine.size > 0;
      const canVote = open && !voted;
      const showResults = !open || voted || this.admin;
      const total = p.options.reduce((n, o) => n + (p.counts[o.id] || 0), 0);
      const draft = this.draft[p.id] || (this.draft[p.id] = new Set());
      const el = h("article", { class: "tbx-item tbx-poll" + (open ? "" : " is-past") });
      const status = !open ? "Closed"
        : p.closes_at ? "Closes " + whenText(p.closes_at) : "Open until the admin closes it";
      el.appendChild(h("div", { class: "tbx-item-top" },
        h("span", { class: "tbx-tag" + (open ? "" : " muted"), text: open ? "Open" : "Closed" }),
        h("span", { class: "tbx-meta", text: status })));
      el.appendChild(h("h4", { class: "tbx-item-title", text: p.question }));
      const err = h("p", { class: "tbx-formmsg", role: "alert" });
      const group = h("div", { class: "tbx-options", role: p.allow_multiple ? "group" : "radiogroup", "aria-label": p.question });
      const submit = h("button", { type: "button", class: "btn-primary tbx-submit" }, "Submit vote");
      submit.disabled = draft.size === 0;
      p.options.forEach((o) => {
        const n = p.counts[o.id] || 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const chosen = p.mine.has(o.id) || (canVote && draft.has(o.id));
        const btn = h("button", {
          type: "button", class: "tbx-option" + (chosen ? " chosen" : "") + (showResults ? " with-results" : ""),
          role: p.allow_multiple ? "checkbox" : "radio", "aria-checked": String(chosen), disabled: canVote ? null : true
        },
          showResults ? h("span", { class: "tbx-bar", style: "width:" + pct + "%" }) : null,
          h("span", { class: "tbx-mark" }, chosen ? icon("fa-check") : null),
          h("span", { class: "tbx-opt-label", text: o.label }),
          showResults ? h("span", { class: "tbx-opt-count", text: pct + "% (" + n + ")" }) : null);
        if (canVote) btn.addEventListener("click", () => {
          if (p.allow_multiple) { if (draft.has(o.id)) draft.delete(o.id); else draft.add(o.id); }
          else { draft.clear(); draft.add(o.id); }
          err.textContent = "";
          group.querySelectorAll(".tbx-option").forEach((b, i) => {
            const on = draft.has(p.options[i].id);
            b.classList.toggle("chosen", on); b.setAttribute("aria-checked", String(on));
            b.querySelector(".tbx-mark").replaceChildren(...(on ? [icon("fa-check")] : []));
          });
          submit.disabled = draft.size === 0;
        });
        group.appendChild(btn);
      });
      el.appendChild(group);
      el.appendChild(err);
      if (canVote) {
        submit.addEventListener("click", () => this.cast(p, el, err));
        el.appendChild(submit);
      }
      if (showResults) el.appendChild(h("p", { class: "tbx-meta", text: p.voters + (p.voters === 1 ? " student voted" : " students voted") }));
      if (this.admin) {
        const acts = h("div", { class: "tbx-item-actions" });
        if (open) {
          const closeBtn = h("button", { type: "button", class: "tbx-btn" }, icon("fa-lock"), " Close poll");
          closeBtn.addEventListener("click", async () => {
            closeBtn.disabled = true;
            try { await Store.closePoll(p.id); toast("Poll closed."); await this.load(); }
            catch (e) { closeBtn.disabled = false; toast(friendly(e), true); }
          });
          acts.appendChild(closeBtn);
        }
        const del = h("button", { type: "button", class: "tbx-btn danger" }, icon("fa-trash"), " Delete");
        let armed = false;
        del.addEventListener("click", async () => {
          if (!armed) {
            armed = true; del.textContent = "Tap again to delete"; del.classList.add("armed");
            setTimeout(() => { if (armed) { armed = false; del.replaceChildren(icon("fa-trash"), " Delete"); del.classList.remove("armed"); } }, 3500);
            return;
          }
          del.disabled = true;
          try { await Store.deletePoll(p.id); toast("Poll deleted."); await this.load(); }
          catch (e) { del.disabled = false; toast(friendly(e), true); }
        });
        acts.appendChild(del);
        el.appendChild(acts);
      }
      return el;
    },

    async cast(p, el, errEl) {
      const picks = Array.from(this.draft[p.id] || []);
      if (!picks.length) { errEl.textContent = "Pick an answer first."; return; }
      errEl.textContent = "";
      el.setAttribute("aria-busy", "true");
      el.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      try {
        await Store.vote(p, picks);
        delete this.draft[p.id];
        toast("Vote recorded.");
        const fresh = (await Store.listPolls()).find((x) => x.id === p.id);
        const idx = this.items.findIndex((x) => x.id === p.id);
        if (fresh && idx !== -1) { this.items[idx] = fresh; el.replaceWith(this.pollCard(fresh)); }
        else await this.load();
      } catch (e) {
        console.error(e);
        el.removeAttribute("aria-busy");
        errEl.textContent = friendly(e);
        const fresh = (await Store.listPolls().catch(() => [])).find((x) => x.id === p.id);
        if (fresh && fresh.mine.size) { delete this.draft[p.id]; const idx = this.items.findIndex((x) => x.id === p.id); if (idx !== -1) this.items[idx] = fresh; el.replaceWith(this.pollCard(fresh)); }
        else el.replaceWith(this.pollCard(p));
      }
    },

    form() {
      const q = h("input", { class: "tbx-input", maxlength: "300", placeholder: "What do you want to ask the class?", required: true });
      const optsBox = h("div", { class: "tbx-optlist" });
      const addBtn = h("button", { type: "button", class: "tbx-btn" }, icon("fa-plus"), " Add option");
      const inputs = [];
      const addOption = () => {
        if (inputs.length >= 8) return;
        const inp = h("input", { class: "tbx-input", maxlength: "120", placeholder: "Option " + (inputs.length + 1), "aria-label": "Option " + (inputs.length + 1) });
        const rm = h("button", { type: "button", class: "tbx-icon-btn", "aria-label": "Remove option" }, icon("fa-xmark"));
        const row = h("div", { class: "tbx-optrow" }, inp, rm);
        rm.addEventListener("click", () => {
          if (inputs.length <= 2) return;
          inputs.splice(inputs.indexOf(inp), 1); row.remove();
          inputs.forEach((x, i) => { x.placeholder = "Option " + (i + 1); x.setAttribute("aria-label", "Option " + (i + 1)); });
          addBtn.disabled = false;
        });
        inputs.push(inp); optsBox.appendChild(row);
        if (inputs.length >= 8) addBtn.disabled = true;
      };
      addOption(); addOption();
      addBtn.addEventListener("click", () => { addOption(); inputs[inputs.length - 1].focus(); });
      const multi = h("input", { type: "checkbox" });
      const closes = dtPicker({ optional: true });
      const msg = h("p", { class: "tbx-formmsg", role: "alert" });
      const submit = h("button", { type: "submit", class: "btn-primary tbx-submit" }, "Post poll");
      const form = h("form", { class: "tbx-form", novalidate: true },
        field("Question", q),
        h("div", { class: "tbx-field" }, h("span", { class: "tbx-label", text: "Options (2 to 8)" }), optsBox, addBtn),
        h("label", { class: "tbx-check" }, multi, h("span", { text: "Allow more than one answer" })),
        field("Closing date and time (optional)", closes, "Leave the date empty to keep it open until you close it"),
        msg, submit);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";
        const question = q.value.trim();
        const labels = inputs.map((i) => i.value.trim()).filter(Boolean);
        const lower = labels.map((l) => l.toLowerCase());
        if (question.length < 3) { msg.textContent = "Write the question first."; q.focus(); return; }
        if (labels.length < 2) { msg.textContent = "Add at least two options."; return; }
        if (new Set(lower).size !== lower.length) { msg.textContent = "Two options are the same. Make each one different."; return; }
        let closesAt = null;
        const closeD = closes.getDate();
        if (closeD) {
          if (closeD <= new Date()) { msg.textContent = "The closing time must be in the future."; closes.focusPicker(); return; }
          closesAt = closeD.toISOString();
        }
        submit.disabled = true; submit.textContent = "Posting...";
        try {
          await Store.addPoll({ question, options: labels, allow_multiple: multi.checked, closes_at: closesAt });
          this.formOpen = false; toast("Poll posted."); await this.load();
        } catch (err) {
          console.error(err); msg.textContent = friendly(err);
          submit.disabled = false; submit.textContent = "Post poll";
        }
      });
      return form;
    }
  };


  // ── Keep assignments visible in the Notices tab and on the profile calendar ──
  const Sync = {
    items: [], tries: 0, last: 0,
    set(items) { this.items = items || []; this.last = Date.now(); this.paint(); },
    async refresh() {
      if (!window.tbSupabase && this.tries++ < 12) { setTimeout(() => this.refresh(), 800); return; }
      try { this.set(await Store.listAssignments()); } catch (e) { /* leave what is shown */ }
    },
    keyOf(iso) { return new Intl.DateTimeFormat("en-CA", { timeZone: LAGOS }).format(new Date(iso)); },
    byKey() {
      const m = {};
      this.items.slice().sort((a, b) => new Date(a.due_at) - new Date(b.due_at)).forEach((a) => { (m[this.keyOf(a.due_at)] = m[this.keyOf(a.due_at)] || []).push(a); });
      return m;
    },
    paint() { this.paintNotices(); this.markCalendar(); this.enhanceFocused(); },

    paintNotices() {
      const container = $("noticesContainer");
      if (!container || !container.parentNode) return;
      let holder = $("tbxNoticeAssign");
      if (!holder) { holder = h("div", { id: "tbxNoticeAssign" }); container.parentNode.insertBefore(holder, container); }
      const upcoming = this.items.filter((a) => new Date(a.due_at) >= Date.now())
        .sort((a, b) => new Date(a.due_at) - new Date(b.due_at)).slice(0, 12);
      if (!upcoming.length) { holder.replaceChildren(); return; }
      const open = h("button", { type: "button", class: "tbx-btn" }, "Open Assignments ", icon("fa-arrow-right"));
      open.addEventListener("click", () => openView("assignmentsView"));
      const cards = upcoming.map((a) => h("article", { class: "matrix-card notice-card-important" },
        h("div", { class: "notice-card-header" },
          h("span", { class: "course-code-tag", text: "ASSIGNMENT" }),
          h("small", { class: "notice-date" }, icon("fa-clock"), " Due " + whenText(a.due_at))),
        h("h4", { class: "notice-title", text: a.course_code + ": " + a.title }),
        h("p", { class: "notice-text", text: (a.note ? a.note + "\n" : "") + "Due " + relText(a.due_at).replace(/^in /, "in ") + "." })));
      holder.replaceChildren(
        h("div", { class: "tbx-notice-head" }, h("h4", { class: "tbx-subhead", text: "Assignments due" }), open),
        h("div", { class: "notices-grid" }, cards));
    },

    markCalendar() {
      const grid = $("calendarGridDays"), label = $("calendarMonthYearText");
      if (!grid || !label) return;
      const m = /([A-Za-z]+)\s+(\d{4})/.exec(label.textContent || "");
      const mi = m ? MONTHS.indexOf(m[1]) : -1;
      grid.querySelectorAll(".tbx-due-day").forEach((el) => {
        el.classList.remove("tbx-due-day");
        if (el.dataset.tbxEv) { el.classList.remove("has-event"); delete el.dataset.tbxEv; }
        el.removeAttribute("title");
      });
      if (mi < 0) return;
      const map = this.byKey();
      grid.querySelectorAll(".day-num:not(.muted)").forEach((el) => {
        const key = m[2] + "-" + pad2(mi + 1) + "-" + pad2(Number(el.textContent));
        const list = map[key];
        if (!list) return;
        el.classList.add("tbx-due-day");
        if (!el.classList.contains("has-event")) { el.classList.add("has-event"); el.dataset.tbxEv = "1"; }
        el.title = list.length + (list.length === 1 ? " assignment due" : " assignments due");
      });
    },

    enhanceFocused() {
      const titleEl = $("focusedEventTitle"), dateEl = $("focusedEventDate"), textEl = $("focusedEventText");
      if (!titleEl || !dateEl || !textEl) return;
      const m = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(dateEl.textContent || "");
      const mi = m ? MONTHS.indexOf(m[1]) : -1;
      if (mi < 0) return;
      const list = this.byKey()[m[3] + "-" + pad2(mi + 1) + "-" + pad2(Number(m[2]))] || [];
      const MARK = "Assignments due:";
      const NONE = "There are no events scheduled for today.";
      let base = textEl.textContent || "";
      const at = base.indexOf("\n\n" + MARK);
      if (at >= 0) base = base.slice(0, at); else if (base.indexOf(MARK) === 0) base = "";
      const titleTxt = (titleEl.textContent || "").trim();
      const mineTitle = /^\d+ assignments? due$/.test(titleTxt);
      const noEvents = /No Scheduled Events/.test(titleTxt) || mineTitle;
      let nextText, nextTitle = null;
      if (!list.length) {
        nextText = base || NONE;
        if (mineTitle) nextTitle = "No Scheduled Events";
      } else {
        const lines = list.map((a) => "• " + a.course_code + ": " + a.title + " (" + new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: LAGOS }).format(new Date(a.due_at)) + ")").join("\n");
        const own = base && base !== NONE;
        nextText = (own ? base + "\n\n" : "") + MARK + "\n" + lines;
        if (noEvents) nextTitle = list.length + (list.length === 1 ? " assignment due" : " assignments due");
      }
      if (nextText !== textEl.textContent) textEl.textContent = nextText;
      if (nextTitle && nextTitle !== titleTxt) {
        const dot = h("span", { class: "blue-indicator-dot" });
        if (nextTitle === "No Scheduled Events") dot.style.background = "#8b949e";
        titleEl.replaceChildren(dot, document.createTextNode(" " + nextTitle));
      }
    },

    init() {
      const watch = (id, opts, fn) => {
        const el = $(id);
        if (!el || el.dataset.tbxWatch) return;
        el.dataset.tbxWatch = "1";
        let queued = false;
        new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(); }); }).observe(el, opts);
      };
      watch("calendarGridDays", { childList: true }, () => this.markCalendar());
      watch("calendarFocusedEventCard", { childList: true, subtree: true, characterData: true }, () => this.enhanceFocused());
      const orig = window.switchToView;
      if (typeof orig === "function" && !orig.__tbx) {
        const wrapped = function (id) {
          const r = orig.apply(this, arguments);
          if ((id === "noticesView" || id === "dashboardHomeView") && Date.now() - Sync.last > 15000) Sync.refresh();
          return r;
        };
        wrapped.__tbx = true;
        window.switchToView = wrapped;
      }
      this.refresh();
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const TABS = [
    { label: "My Profile", view: "dashboardHomeView", icon: "fa-user", kw: "profile dashboard home academic calendar" },
    { label: "Courses", view: "coursesView", icon: "fa-book-open", kw: "registered courses lecturers units" },
    { label: "Timetable", view: "timetableView", icon: "fa-calendar-days", kw: "class schedule venue lecture time" },
    { label: "Results", view: "resultsView", icon: "fa-chart-simple", kw: "grades scores cgpa gpa" },
    { label: "Fees", view: "feesView", icon: "fa-naira-sign", kw: "dues payment receipt money" },
    { label: "Notices", view: "noticesView", icon: "fa-bell", kw: "announcements news notifications" },
    { label: "Documents", view: "documentsView", icon: "fa-folder-closed", kw: "materials notes upload lecture notes handouts" },
    { label: "Gallery", view: "galleryView", icon: "fa-images", kw: "photos pictures events" },
    { label: "Forum", view: "forumView", icon: "fa-comments", kw: "discussion daily topic" },
    { label: "Assignments", view: "assignmentsView", icon: "fa-list-check", kw: "homework deadline due" },
    { label: "Polls", view: "pollsView", icon: "fa-square-poll-vertical", kw: "vote voting" },
    { label: "TB AI", href: "ai.html", icon: "fa-robot", kw: "tutor support chat assistant ask questions" }
  ];

  const SRC = { at: 0, loading: null, tb: {}, notices: [], materials: [], assignments: [], polls: [], failed: false };

  function loadSources() {
    if (SRC.loading) return SRC.loading;
    if (Date.now() - SRC.at < 120000) return Promise.resolve();
    const sb = window.tbSupabase;
    SRC.loading = (async () => {
      let failed = false;
      const guard = async (p, fallback) => {
        try { const r = await p; if (r && r.error) throw r.error; return r && r.data !== undefined ? r.data : r; }
        catch (e) { failed = true; return fallback; }
      };
      const [tb, notices, materials, assignments, polls] = await Promise.all([
        loadData(),
        sb ? guard(sb.from("announcements").select("title,content,date,category").order("created_at", { ascending: false }).limit(60), []) : [],
        sb ? guard(sb.from("course_materials").select("courseCode,topicName,fileName,fileUrl").limit(1000), []) : [],
        guard(Store.listAssignments(), []),
        guard(Store.listPollsLite(), [])
      ]);
      SRC.tb = tb || {}; SRC.notices = notices || []; SRC.materials = materials || [];
      SRC.assignments = assignments || []; SRC.polls = polls || []; SRC.failed = failed; SRC.at = Date.now();
      SRC.loading = null;
    })();
    return SRC.loading;
  }

  function buildIndex() {
    const out = [];
    const add = (group, title, sub, extra, action, ic) =>
      out.push({ group, title, sub, icon: ic, action, hay: (title + " " + sub + " " + extra).toLowerCase() });

    TABS.forEach((t) => add("Pages", t.label, "Open " + t.label, t.kw, t.href ? { href: t.href } : { view: t.view }, t.icon));

    (SRC.tb.courses || []).forEach((c) => {
      if (!c.code) return;
      add("Courses", c.code + " " + (c.title || ""), "Course", c.description || "", { view: "coursesView" }, "fa-book-open");
      (c.topics || []).forEach((t) => add("Courses", t, c.code + " topic", "", { view: "documentsView" }, "fa-list-ul"));
    });
    const faq = (SRC.tb.department && SRC.tb.department.faq) || [];
    faq.forEach((f) => add("Questions", f.q, "Tap to read the answer", f.a, { faq: f.a }, "fa-circle-question"));

    SRC.notices.forEach((n) => add("Notices", n.title || "Notice", (n.date || "") + (n.category ? " · " + n.category : ""),
      n.content || "", { view: "noticesView" }, "fa-bell"));
    SRC.materials.forEach((m) => {
      if (!/^https?:\/\//i.test(String(m.fileUrl || ""))) return;
      add("Materials", m.fileName || "File", [m.courseCode, m.topicName].filter(Boolean).join(" · "), "", { url: m.fileUrl }, "fa-file-lines");
    });
    SRC.assignments.forEach((a) => add("Assignments", a.title, a.course_code + " · due " + whenText(a.due_at), a.note || "",
      { view: "assignmentsView" }, "fa-list-check"));
    SRC.polls.forEach((p) => add("Polls", p.question, Polls.isOpen(p) ? "Open poll" : "Closed poll",
      p.options.map((o) => o.label).join(" "), { view: "pollsView" }, "fa-square-poll-vertical"));
    document.querySelectorAll("#galleryGrid .gallery-card").forEach((g) => {
      const cap = g.getAttribute("data-caption");
      if (cap) add("Gallery", cap, g.getAttribute("data-category") || "Photo", "", { view: "galleryView" }, "fa-image");
    });
    return out;
  }

  function highlight(text, terms) {
    const lower = text.toLowerCase();
    const marks = [];
    terms.forEach((t) => {
      let i = lower.indexOf(t);
      while (i !== -1) { marks.push([i, i + t.length]); i = lower.indexOf(t, i + t.length); }
    });
    if (!marks.length) return [text];
    marks.sort((a, b) => a[0] - b[0]);
    const merged = [marks[0].slice()];
    marks.slice(1).forEach((m) => {
      const last = merged[merged.length - 1];
      if (m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else merged.push(m.slice());
    });
    const parts = []; let pos = 0;
    merged.forEach(([s, e]) => {
      if (s > pos) parts.push(text.slice(pos, s));
      parts.push(h("mark", { text: text.slice(s, e) }));
      pos = e;
    });
    if (pos < text.length) parts.push(text.slice(pos));
    return parts;
  }

  const GROUP_ORDER = ["Pages", "Assignments", "Polls", "Notices", "Materials", "Courses", "Questions", "Gallery"];
  const PER_GROUP = 5;

  function search(query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const index = buildIndex();
    if (!terms.length) return { terms, groups: [{ name: "Go to", items: index.filter((i) => i.group === "Pages") }] };
    const scored = [];
    index.forEach((it) => {
      const t = it.title.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (it.hay.indexOf(term) === -1) return;
        score += (t.indexOf(term) !== -1 ? 3 : 1) + (t.indexOf(term) === 0 ? 2 : 0);
      }
      scored.push({ it, score });
    });
    scored.sort((a, b) => b.score - a.score);
    const groups = GROUP_ORDER.map((name) => ({
      name, items: scored.filter((s) => s.it.group === name).map((s) => s.it).slice(0, PER_GROUP)
    })).filter((g) => g.items.length);
    return { terms, groups };
  }

  function pick(item, rowEl) {
    const a = item.action;
    if (a.faq !== undefined) {
      const open = rowEl.nextElementSibling && rowEl.nextElementSibling.classList.contains("tbx-faq");
      if (open) { rowEl.nextElementSibling.remove(); rowEl.setAttribute("aria-expanded", "false"); }
      else { rowEl.after(h("p", { class: "tbx-faq", text: a.faq })); rowEl.setAttribute("aria-expanded", "true"); }
      return;
    }
    closeAll();
    if (a.href) { window.location.href = a.href; return; }
    if (a.url) { window.open(a.url, "_blank", "noopener"); return; }
    if (a.view) openView(a.view);
  }

  function renderResults(box, query) {
    const { terms, groups } = search(query);
    const frag = document.createDocumentFragment();
    if (terms.length && !groups.length) {
      frag.appendChild(h("p", { class: "tbx-empty", text: 'Nothing found for "' + query.trim() + '". Try a course code, a topic or a notice title.' }));
    }
    groups.forEach((g) => {
      frag.appendChild(h("div", { class: "tbx-group", text: g.name }));
      g.items.forEach((it) => {
        const row = h("button", { type: "button", class: "tbx-res", "aria-expanded": it.action.faq !== undefined ? "false" : null },
          icon(it.icon),
          h("span", { class: "tbx-res-text" },
            h("span", { class: "tbx-res-title" }, highlight(it.title, terms)),
            it.sub ? h("span", { class: "tbx-res-sub", text: it.sub }) : null));
        row.addEventListener("click", () => pick(it, row));
        frag.appendChild(row);
      });
    });
    if (SRC.failed && terms.length) frag.appendChild(h("p", { class: "tbx-note-small", text: "Some results could not be loaded. Check your connection." }));
    box.replaceChildren(frag);
  }

  function wireResults(input, box) {
    let timer = null;
    const run = () => renderResults(box, input.value);
    input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 110); });
    input.addEventListener("focus", () => { loadSources().then(run); run(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); const f = box.querySelector(".tbx-res"); if (f) f.focus(); }
      if (e.key === "Enter") { const f = box.querySelector(".tbx-res"); if (f) { e.preventDefault(); f.click(); } }
    });
    box.addEventListener("keydown", (e) => {
      const rows = Array.from(box.querySelectorAll(".tbx-res"));
      const i = rows.indexOf(document.activeElement);
      if (i === -1) return;
      if (e.key === "ArrowDown") { e.preventDefault(); if (rows[i + 1]) rows[i + 1].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); if (i === 0) input.focus(); else rows[i - 1].focus(); }
    });
    return run;
  }

  let sheet = null, sheetInput = null, inline = null, inlineInput = null;
  const desktopMQ = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)");

  function closeAll() {
    if (sheet) { sheet.classList.remove("open"); document.body.classList.remove("tbx-lock"); }
    if (inline) inline.classList.remove("open");
    if (inlineInput) inlineInput.blur();
  }

  window.tbxCloseSearch = closeAll;   // the back button closes the search sheet through this

  function openSearch() {
    if (desktopMQ.matches && inlineInput) { inline.classList.add("open"); inlineInput.focus(); inlineInput.select(); return; }
    sheet.classList.add("open");
    document.body.classList.add("tbx-lock");
    sheetInput.focus();
    loadSources().then(() => renderResults(sheet.querySelector(".tbx-results"), sheetInput.value));
  }

  function installSearch() {
    const actions = document.querySelector(".top-nav-actions");
    if (!actions) return;

    inlineInput = h("input", { class: "tbx-search-input", type: "search", placeholder: "Search the portal", "aria-label": "Search the portal", autocomplete: "off", spellcheck: "false" });
    const drop = h("div", { class: "tbx-drop", role: "region", "aria-label": "Search results" });
    const btn = h("button", { type: "button", class: "tbx-search-btn", "aria-label": "Search", title: "Search (press /)" }, icon("fa-magnifying-glass"));
    inline = h("div", { class: "tbx-search" }, inlineInput, btn, drop);
    actions.insertBefore(inline, actions.firstChild);

    const runInline = wireResults(inlineInput, drop);
    inlineInput.addEventListener("focus", () => inline.classList.add("open"));
    btn.addEventListener("click", () => { if (desktopMQ.matches) { inline.classList.add("open"); inlineInput.focus(); } else openSearch(); });
    drop.addEventListener("mousedown", (e) => e.preventDefault());   // keep focus in the box while clicking a result
    document.addEventListener("mousedown", (e) => { if (inline && !inline.contains(e.target)) inline.classList.remove("open"); });
    inlineInput.addEventListener("keydown", (e) => { if (e.key === "Escape") { inline.classList.remove("open"); inlineInput.blur(); } });

    sheetInput = h("input", { class: "tbx-sheet-input", type: "search", placeholder: "Search the portal", "aria-label": "Search the portal", autocomplete: "off", spellcheck: "false" });
    const results = h("div", { class: "tbx-results" });
    const close = h("button", { type: "button", class: "tbx-sheet-close", "aria-label": "Close search" }, icon("fa-xmark"));
    sheet = h("div", { class: "tbx-sheet", role: "dialog", "aria-modal": "true", "aria-label": "Search" },
      h("div", { class: "tbx-sheet-bar" }, icon("fa-magnifying-glass"), sheetInput, close), results);
    document.body.appendChild(sheet);
    wireResults(sheetInput, results);
    close.addEventListener("click", closeAll);
    sheet.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    document.addEventListener("keydown", (e) => {
      const typing = /^(input|textarea|select)$/i.test((document.activeElement || {}).tagName || "") || (document.activeElement || {}).isContentEditable;
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        if (!$("LoggedInView") || $("LoggedInView").style.display === "none") return;
        e.preventDefault(); openSearch();
      }
    });
    runInline();
  }

  // ── Start ───────────────────────────────────────────────────────────────
  function start() {
    if (installPages()) installSearch();
    Sync.init();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.__tbxTest = { Store, Assignments, Polls, Sync, search, buildIndex, SRC };
})();

/* Splash controller: hide the splash once the portal view is up */
(function () {
  var KEY = "tbWasIn";
  function done() {
    var d = document.documentElement;
    d.classList.remove("tb-splash-on");
  }
  function inView() {
    var v = document.getElementById("LoggedInView");
    return v && v.style.display !== "none" && getComputedStyle(v).display !== "none";
  }
  function check() {
    if (inView()) { try { localStorage.setItem(KEY, "1"); } catch (e) {} done(); return true; }
    return false;
  }
  function start() {
    var v = document.getElementById("LoggedInView");
    if (!check() && v) {
      new MutationObserver(function () { if (check()) this.disconnect(); }).observe(v, { attributes: true, attributeFilter: ["style", "class"] });
    }
    // Not signed in anymore (or very slow network): stop waiting
    setTimeout(function () {
      if (!inView()) { try { localStorage.removeItem(KEY); } catch (e) {} }
      done();
    }, 6000);
    ["logoutBtn", "modalLogoutBtn"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener("click", function () { try { localStorage.removeItem(KEY); } catch (e) {} });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();