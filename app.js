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
        greetingHeader.textContent = displayName + ' ';
        greetingHeader.appendChild(mk('i', 'fa-solid fa-circle-check verified-badge-icon'));
    }

    const dropdownNameLabel = document.getElementById("dropdownUserName");
    if (dropdownNameLabel) dropdownNameLabel.textContent = displayName;
};

window.switchToView = function(viewId) {   
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
};   
   
// switchSemester lives in auth.js (it also resets the scores detail view).

window.updateStudentDuesUI = function(matricNumber) {    
    if (!matricNumber) return;   
    const cleanMatric = String(matricNumber).replace(/[^0-9]/g, '').trim();    
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
   
window.printDuesReceipt = async function(matricNumber) {
    const cleanMatric = String(matricNumber).replace(/[^0-9]/g, '').trim();
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
            paidAt = (paid && (data.paid_at || data.updated_at)) || null;
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
    const paidDateObj = paidAt ? new Date(paidAt) : null;
    const paymentDateRow = paidDateObj && !isNaN(paidDateObj.getTime())
        ? `<tr><td class="label">Payment Date:</td><td class="value">${fmtDate(paidDateObj)}</td></tr>`
        : '';
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
window.requestNotificationPermission = async function() {
    if (!('Notification' in window)) {
        alert("This browser does not support push notifications.");
        return;
    }
    const permission = await Notification.requestPermission();
    const btn = document.getElementById('enableNotifBtn');
    if (permission === 'granted') {
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Notifications Enabled`;
            btn.style.background = '#22c55e';
        }
       
        // Mobile Chrome / Android Service Worker Push
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification("Trailblazers '29 Portal", {
                body: "Notifications are on. You'll get an alert when a new announcement is posted while the app is open.",
                icon: "./icon-192.jpg",
                badge: "./favicon-32.jpg"
            });
        } else {
            new Notification("Trailblazers '29 Portal", {
                body: "Notifications are on. You'll get an alert when a new announcement is posted while the app is open.",
                icon: "./icon-192.jpg"
            });
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

function showNotificationToast(notice) {
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
    // a push failure stop the chime / calendar update that follow.
    if ('Notification' in window && Notification.permission === 'granted') {
        const title = notice.title || "New Departmental Announcement";
        const body = notice.content || "Click to view the new announcement on your portal.";
        try {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => registration.showNotification(title, {
                    body,
                    icon: "./icon-192.jpg",
                    badge: "./favicon-32.jpg",
                    vibrate: [200, 100, 200],
                    tag: "announcement-" + Date.now()
                })).catch(() => {});
            } else {
                new Notification(title, { body, icon: "./icon-192.jpg" });
            }
        } catch (e) { /* ignore */ }
    }

    playNoticeChime();
}

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
    }
}

function subscribeToRealtimeAnnouncements() {
    const supabase = window.tbSupabase;
    if (!supabase) return;

    supabase
        .channel('public:announcements')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
            const notice = payload.new;
            if (!notice) return;
            renderNoticeCard(notice, true);
            showNotificationToast(notice);

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
        })
        .subscribe((status) => {
            console.log("Supabase Realtime Channel Status:", status);
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
   
let deferredPrompt; 
const installBtn = document.getElementById('pwaInstallBtn'); 
const installPill = document.getElementById('pwaInstallPill'); 
 
window.addEventListener('beforeinstallprompt', (e) => { 
  e.preventDefault(); 
  deferredPrompt = e; 
  if (installPill) installPill.style.display = 'flex'; 
  if (installBtn) installBtn.style.display = 'inline-flex'; 
}); 
 
if (installBtn) { 
  installBtn.addEventListener('click', async () => { 
    if (!deferredPrompt) return; 
    deferredPrompt.prompt(); 
    const { outcome } = await deferredPrompt.userChoice; 
    if (outcome === 'accepted') { 
      if (installPill) installPill.style.display = 'none'; 
    } 
    deferredPrompt = null; 
  }); 
}

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
