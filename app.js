// ======================================================= 
// 1. SUPABASE INITIALIZATION 
// ======================================================= 
if (typeof supabase === 'undefined' && typeof window.supabaseClient !== 'undefined') {   
    var supabase = window.supabaseClient;   
} else if (typeof supabase === 'undefined' && typeof window.supabase !== 'undefined' && 
window.supabase.createClient) {   
    const SUPABASE_URL = 'https://yuebmlmamkclsfizurkp.supabase.co';   
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWJtbG1hbWtjbHNmaXp1cmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDIyMzksImV4cCI6MjEwMzQ3ODIzOX0.eWDugNSs0GD0Mx-eWaDjkiLx07B_oqjm-xVTdB39zpI';   
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);   
}   
 
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
    "250301018": "Akande Olamide",   
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
    "250201004": "Yusuph Aishat"   
};   
window.studentDirectory = studentDirectory;   
   
const studentDuesRegistry = Object.keys(studentDirectory).map(matric => ({   
    matric: matric,   
    name: studentDirectory[matric],   
    paid: false   
}));   
window.studentDuesRegistry = studentDuesRegistry;  
 
// Fetch payment statuses from Supabase database   
async function fetchInitialStudentDues() {    
    if (typeof window.renderAdminDuesTable === 'function') {   
        window.renderAdminDuesTable();    
    }  
  
    if (typeof supabase === 'undefined') return;    
      
    try {  
        const { data, error } = await supabase    
            .from('student_dues')    
            .select('*');    
          
        if (data && data.length > 0) {    
            data.forEach(item => {    
                const student = studentDuesRegistry.find(s => s.matric === item.matric);    
                if (student) {    
                    student.paid = item.paid;    
                }    
            });    
        }    
        if (window.currentLoggedInMatric && typeof window.updateStudentDuesUI === 'function') {    
            window.updateStudentDuesUI(window.currentLoggedInMatric);    
        }    
        const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');    
        const currentSearch = duesAdminSearchInput ? 
duesAdminSearchInput.value.toLowerCase().trim() : '';    
        if (typeof window.renderAdminDuesTable === 'function') {   
            window.renderAdminDuesTable(currentSearch);    
        }   
    } catch (err) {  
        console.error('Error fetching student dues:', err);  
    }  
}  
   
function subscribeToRealtimeDues() {   
    if (typeof supabase === 'undefined') return;   
    supabase   
        .channel('public:student_dues')   
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_dues' }, payload => {   
            const updated = payload.new;   
            if (!updated || !updated.matric) return;  
            const student = studentDuesRegistry.find(s => s.matric === updated.matric);   
            if (student) {   
                student.paid = updated.paid;   
            }   
            if (window.currentLoggedInMatric === updated.matric && typeof 
window.updateStudentDuesUI === 'function') {   
                window.updateStudentDuesUI(updated.matric);   
            }   
            const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');   
            const currentSearch = duesAdminSearchInput ? 
duesAdminSearchInput.value.toLowerCase().trim() : '';   
            if (typeof window.renderAdminDuesTable === 'function') {  
                window.renderAdminDuesTable(currentSearch);   
            }  
        })   
        .subscribe();   
}   
   
// ======================================================= 
// 3. GLOBAL UI NAVIGATION FUNCTIONS 
// ======================================================= 
window.setStudentDisplayName = function(matricNumber) {   
    const cleanMatric = String(matricNumber).trim();   
    const displayName = studentDirectory[cleanMatric] || "Trailblazer";   
   
    const greetingHeader = document.querySelector(".welcome-greeting h2");   
    if (greetingHeader) {   
        greetingHeader.innerHTML = `${displayName} <i class="fa-solid fa-circle-check 
verified-badge-icon"></i>`;   
    }   
   
    const dropdownNameLabel = document.getElementById("dropdownUserName");   
    if (dropdownNameLabel) {   
        dropdownNameLabel.textContent = displayName;   
    }   
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
   
window.switchSemester = function(semester) {   
    const btn1st = document.getElementById('btnFirstSemester');   
    const btn2nd = document.getElementById('btnSecondSemester');   
    const courseCards = document.querySelectorAll('.results-course-card');   
   
    if (semester === '1st') {   
        if (btn1st) { btn1st.style.background = '#1d9bf0'; btn1st.style.color = '#fff'; }   
        if (btn2nd) { btn2nd.style.background = 'transparent'; btn2nd.style.color = '#8fa5c3'; }   
    } else {   
        if (btn2nd) { btn2nd.style.background = '#1d9bf0'; btn2nd.style.color = '#fff'; }   
        if (btn1st) { btn1st.style.background = 'transparent'; btn1st.style.color = '#8fa5c3'; }   
    }   
   
    courseCards.forEach(card => {   
        if (card.getAttribute('data-semester') === semester) {   
            card.style.display = 'block';   
        } else {   
            card.style.display = 'none';   
        }   
    });   
};   
 
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
   
window.printDuesReceipt = function(matricNumber) {   
    const cleanMatric = String(matricNumber).replace(/[^0-9]/g, '').trim();   
    const studentName = studentDirectory[cleanMatric] || "Trailblazer Student";   
    const student = studentDuesRegistry.find(s => s.matric === cleanMatric);   
   
    if (!student || !student.paid) {   
        alert("Receipt unavailable. Class dues status is currently Pending.");   
        return;   
    }   
   
    const printWindow = window.open('', '_blank', 'width=800,height=750');   
    if (!printWindow) {   
        alert("Please allow popups to generate and print your receipt.");   
        return;   
    }   
   
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
                    <tr><td class="label">Student Name:</td><td 
class="value">${studentName}</td></tr>   
                    <tr><td class="label">Matriculation No:</td><td 
class="value">${cleanMatric}</td></tr>   
                    <tr><td class="label">Fee Description:</td><td class="value">ACC '29 
Departmental & Class Package Dues</td></tr>   
                    <tr><td class="label">Academic Session:</td><td class="value">2026/2027 
Session</td></tr>   
                    <tr><td class="label">Amount Paid:</td><td class="value">₦ 500.00</td></tr>   
                    <tr><td class="label">Verification Status:</td><td class="value"><span 
class="paid-stamp">VERIFIED PAID</span></td></tr>   
                    <tr><td class="label">Date Issued:</td><td class="value">${new 
Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>   
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
    const currentMatric = window.currentLoggedInMatric || 
localStorage.getItem('logged_in_user_matric');  
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
    const adminDuesTbody = document.getElementById('adminDuesTbody');    
    if (!adminDuesTbody) return;    
    
    adminDuesTbody.innerHTML = '';    
    const filtered = studentDuesRegistry.filter(s =>     
        s.name.toLowerCase().includes(filterQuery) || s.matric.toLowerCase().includes(filterQuery)    
    );    
    
    if (filtered.length === 0) {    
        adminDuesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; 
color:#8fa5c3;">No students found.</td></tr>`;    
        return;    
    }    
    
    filtered.forEach((student, index) => {    
        const row = document.createElement('tr');    
        row.innerHTML = `    
            <td>${index + 1}</td>    
            <td class="course-code-tag">${student.matric}</td>    
            <td><strong>${student.name}</strong></td>    
            <td>    
                <span class="grade-badge ${student.paid ? 'grade-a' : 'grade-b'}" 
style="${!student.paid ? 'background: rgba(255, 77, 77, 0.2); color: #ff4d4d;' : ''}">    
                    ${student.paid ? 'Paid' : 'Pending'}    
                </span>    
            </td>    
            <td>    
                <label class="status-toggle-label">    
                    <input type="checkbox" class="dues-toggle-checkbox" 
data-matric="${student.matric}" ${student.paid ? 'checked' : ''}>    
                    <span class="toggle-slider"></span>    
                </label>    
            </td>    
        `;    
        adminDuesTbody.appendChild(row);    
    });    
    
    document.querySelectorAll('.dues-toggle-checkbox').forEach(chk => {    
        chk.addEventListener('change', async (e) => {    
            const targetMatric = e.target.dataset.matric;    
            const isChecked = e.target.checked;    
    
            const targetStudent = studentDuesRegistry.find(s => s.matric === targetMatric);    
            if (targetStudent) {    
                targetStudent.paid = isChecked;    
            }    
   
            if (window.currentLoggedInMatric === targetMatric && typeof 
window.updateStudentDuesUI === 'function') {   
                window.updateStudentDuesUI(targetMatric);   
            }   
    
            if (typeof supabase !== 'undefined') {    
                try {  
                    const { error } = await supabase    
                        .from('student_dues')    
                        .upsert({ matric: targetMatric, paid: isChecked }, { onConflict: 'matric' });    
        
                    if (error) console.error('Error updating status in Supabase:', error);    
                } catch (err) {  
                    console.error('Supabase update exception:', err);  
                }  
            }    
        });    
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
                body: "Push notifications enabled! You will receive live announcement updates.",
                icon: "./icon-192.jpg",
                badge: "./favicon-32.jpg"
            });
        } else {
            new Notification("Trailblazers '29 Portal", {
                body: "Push notifications enabled! You will receive live announcement updates.",
                icon: "./icon-192.jpg"
            });
        }
    } else {
        alert("Notification permission was denied. You can enable it in your browser settings.");
    }
};
function showNotificationToast(notice) {
    const container = document.getElementById('toastContainer');
    if (container) {
        const isImportant = (notice.category || '').toUpperCase() === 'IMPORTANT';
        const toast = document.createElement('div');
        toast.className = `toast-card ${isImportant ? 'toast-important' : ''}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${isImportant ? 'fa-triangle-exclamation' : 'fa-bell'}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notice.title || 'New Announcement'}</div>
                <div class="toast-text">${notice.content || ''}</div>
            </div>
            <button class="toast-close-btn" onclick="this.parentElement.remove()">×</button>
        `;
        toast.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toast-close-btn')) {
                if (typeof window.switchToView === 'function') {
                    window.switchToView('noticesView');
                }
            }
        });
        container.appendChild(toast);
       
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, 6000);
    }
    // Trigger Mobile & Desktop Push via Service Worker Registration
    if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(notice.title || "New Departmental Announcement", {
                    body: notice.content || "Click to view the new announcement on your portal.",
                    icon: "./icon-192.jpg",
                    badge: "./favicon-32.jpg",
                    vibrate: [200, 100, 200],
                    tag: "announcement-" + Date.now()
                });
            });
        } else if ('Notification' in window) {
            new Notification(notice.title || "New Departmental Announcement", {
                body: notice.content || "Click to view the new announcement on your portal.",
                icon: "./icon-192.jpg"
            });
        }
    }
    
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
}
function formatDateString(dateStr) {   
    if (!dateStr) return '';   
    const dateObj = new Date(dateStr);   
    if (isNaN(dateObj.getTime())) return dateStr;   
    return dateObj.toLocaleDateString('en-US', {   
        month: 'long',   
        day: 'numeric',   
        year: 'numeric'   
    });   
}   
   
function updateNoticeCount() {   
    const countBadge = document.getElementById('activeNoticeCount');   
    const container = document.getElementById('noticesContainer');   
    if (countBadge && container) {   
        const total = container.querySelectorAll('article').length;   
        countBadge.textContent = `${total} Active Announcement${total === 1 ? '' : 's'}`;   
    }   
}   
   
function renderNoticeCard(notice) {   
    const container = document.getElementById('noticesContainer');   
    if (!container) return;   
   
    const category = (notice.category || 'GENERAL').toUpperCase();   
    const isImportant = category === 'IMPORTANT';   
   
    const article = document.createElement('article');   
    article.className = `matrix-card ${isImportant ? 'notice-card-important' : 
'notice-card-general'}`;   
    article.innerHTML = `   
        <div class="notice-card-header">   
            <span class="${isImportant ? 'course-code-tag' : 
'total-units-badge'}">${category}</span>   
            <small class="notice-date"><i class="fa-solid fa-clock"></i> 
${formatDateString(notice.date)}</small>   
        </div>   
        <h4 class="notice-title">${notice.title}</h4>   
        <p class="notice-text">${notice.content}</p>   
    `;   
   
    container.prepend(article);   
    updateNoticeCount();   
}   
   
async function fetchInitialAnnouncements() {   
    if (typeof supabase === 'undefined') return;   
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
        container.innerHTML = '';   
        data.forEach(notice => renderNoticeCard(notice));   
    }   
}   
 
function subscribeToRealtimeAnnouncements() {
    if (typeof supabase === 'undefined') return;
   
    supabase
        .channel('public:announcements')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
            const notice = payload.new;
            if (!notice) return;
            renderNoticeCard(notice);
            showNotificationToast(notice);
            
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
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
   
    const backToCoursesBtn = document.getElementById('backToCoursesBtn');   
    if (backToCoursesBtn) {   
        backToCoursesBtn.addEventListener('click', function () {   
            const listView = document.getElementById('resultsCourseListView');   
            const detailView = document.getElementById('courseScoresDetailView');   
            if (detailView) detailView.style.display = 'none';   
            if (listView) listView.style.display = 'block';   
        });   
    }   
   
    const studentSearchInput = document.getElementById('studentSearchInput');   
    if (studentSearchInput) {   
        studentSearchInput.addEventListener('input', function (e) {   
            const query = e.target.value.toLowerCase().trim();   
            document.querySelectorAll('#studentScoresTbody tr').forEach(row => {   
                const text = row.textContent.toLowerCase();   
                row.style.display = text.includes(query) ? '' : 'none';   
            });   
        });   
    }   
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
   
    // Mobile Sidebar & Overlay Controller
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.querySelector('.dashboard-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const menuItems = document.querySelectorAll('.sidebar-grid-menu .menu-item');
// 1. Open / Toggle Mobile Menu
function openMobileMenu() {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
}
// 2. Close Mobile Menu
function closeMobileMenu() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}
// 3. Bind Hamburger Button
if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}
// 4. Close menu when tapping anywhere on the dark backdrop outside
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileMenu);
}
// 5. Automatically close menu when any sidebar item is clicked
menuItems.forEach((item) => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            closeMobileMenu();
        }
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
            if (!file) return;   
            const reader = new FileReader();   
            reader.onload = function (e) {   
                const base64Image = e.target.result;   
                const storageKey = getCurrentUserKey();   
                localStorage.setItem(storageKey, base64Image);   
                loadUserProfilePicture();   
            };   
            reader.readAsDataURL(file);   
        });   
    }   
   
    if (modalToggleThemeBtn) {   
        modalToggleThemeBtn.addEventListener('click', () => {   
            document.body.classList.toggle('light-theme');   
            const isLight = document.body.classList.contains('light-theme');   
            localStorage.setItem('theme', isLight ? 'light' : 'dark');   
        });   
    }   
   
    if (modalLogoutBtn) {   
        modalLogoutBtn.addEventListener('click', () => {   
            const logoutBtn = document.getElementById('logoutBtn');   
            if (logoutBtn) logoutBtn.click();   
            else location.reload();   
        });   
    }   
   
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
        const focusedEventTitle = document.getElementById("focusedEventTitle");  
        const focusedEventDate = document.getElementById("focusedEventDate");  
        const focusedEventText = document.getElementById("focusedEventText");  
        if (focusedEventTitle) {  
            focusedEventTitle.innerHTML = title && title !== "No Scheduled Events"  
                ? `<span class='blue-indicator-dot'></span> ${title}`  
                : `<span class='blue-indicator-dot' style='background: #8b949e;'></span> No 
Scheduled Events`;  
        }  
        if (focusedEventDate) focusedEventDate.textContent = dateStr;  
        if (focusedEventText) focusedEventText.textContent = text || "There are no events scheduled for today.";  
    }  
    window.updateFocusedEventCard = updateFocusedEventCard;  
 
    async function renderCalendar(dateObj) {   
        if (!calendarGridDays || !calendarMonthYearText) return;   
      
        const year = dateObj.getFullYear();   
        const month = dateObj.getMonth();   
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", 
"August", "September", "October", "November", "December"];   
        calendarMonthYearText.textContent = `${monthNames[month]} ${year}`;   
      
        calendarGridDays.innerHTML = `   
            <div class="day-label">MON</div><div class="day-label">TUE</div><div 
class="day-label">WED</div>   
            <div class="day-label">THU</div><div class="day-label">FRI</div><div 
class="day-label">SAT</div><div class="day-label">SUN</div>   
        `;   
      
        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;   
        const lastDay = new Date(year, month + 1, 0).getDate();   
        const prevLastDay = new Date(year, month, 0).getDate();   
        const today = new Date();   
      
        for (let x = firstDayIndex; x > 0; x--) {   
            const dayDiv = document.createElement("div");   
            dayDiv.className = "day-num muted";   
            dayDiv.textContent = prevLastDay - x + 1;   
            calendarGridDays.appendChild(dayDiv);   
        }   
      
        const dayElements = {};  
        let todayNoticeFound = null; 
 
        for (let i = 1; i <= lastDay; i++) {   
            const dayDiv = document.createElement("div");   
            dayDiv.className = "day-num";   
            dayDiv.textContent = i;   
            dayDiv.style.cursor = "pointer";   
      
            const monthFormatted = String(month + 1).padStart(2, "0");   
            const dayFormatted = String(i).padStart(2, "0");   
            const dateKey = `${year}-${monthFormatted}-${dayFormatted}`;   
              
            dayElements[dateKey] = dayDiv;  
      
            if (sampleEvents[dateKey]) {   
                dayDiv.classList.add("has-event");   
            }   
      
            const isToday = (i === today.getDate() && month === today.getMonth() && year === 
today.getFullYear());   
            if (isToday) {   
                dayDiv.classList.add("today-highlight");   
                if (sampleEvents[dateKey]) {  
                    todayNoticeFound = { notice: sampleEvents[dateKey], dateStr: 
`${monthNames[month]} ${i}, ${year}` }; 
                }  
            }   
      
            dayDiv.addEventListener("click", function () {   
                document.querySelectorAll(".day-num").forEach(d => 
d.classList.remove("selected-day"));   
                this.classList.add("selected-day");   
                const displayDateStr = `${monthNames[month]} ${i}, ${year}`;   
                  
                const eventData = dayDiv.dataset.noticeContent ? 
JSON.parse(dayDiv.dataset.noticeContent) : sampleEvents[dateKey];  
                if (eventData) {   
                    updateFocusedEventCard(eventData.title, displayDateStr, eventData.content || 
eventData.text);   
                } else {   
                    updateFocusedEventCard("No Scheduled Events", displayDateStr, "There are no events scheduled for today.");   
                }   
            });   
      
            calendarGridDays.appendChild(dayDiv);   
        }   
 
        if (typeof supabase !== 'undefined') {   
            try {  
                const { data, error } = await supabase.from('announcements').select('*');   
                if (!error && data) {  
                    data.forEach(notice => {  
                        if (dayElements[notice.date]) {  
                            dayElements[notice.date].classList.add("has-event");  
                            dayElements[notice.date].dataset.noticeContent = JSON.stringify(notice);  
                                  
                            const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 
1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;  
                            if (notice.date === todayKey) {  
                                todayNoticeFound = { notice: notice, dateStr: 
`${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}` }; 
                            }  
                        }  
                    });  
                }  
            } catch (err) {  
                console.error("Error loading calendar events from Supabase:", err);  
            }  
        }   
 
        const todayDisplayDate = `${monthNames[today.getMonth()]} ${today.getDate()}, 
${today.getFullYear()}`;  
        if (todayNoticeFound) {  
            updateFocusedEventCard(todayNoticeFound.notice.title, todayNoticeFound.dateStr, 
todayNoticeFound.notice.content || todayNoticeFound.notice.text);  
        } else {  
            updateFocusedEventCard("No Scheduled Events", todayDisplayDate, "There are no events scheduled for today.");  
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
   
    renderCalendar(currentCalendarDate);   
   
    fetchInitialAnnouncements();   
    subscribeToRealtimeAnnouncements();   
    fetchInitialStudentDues();   
    subscribeToRealtimeDues();   
   
    const postNoticeForm = document.getElementById('postNoticeForm');   
    if (postNoticeForm) {   
        postNoticeForm.addEventListener('submit', async function (e) {   
            e.preventDefault();   
            const title = document.getElementById('noticeTitleInput')?.value;   
            const date = document.getElementById('noticeDateInput')?.value;   
            const content = document.getElementById('noticeTextInput')?.value;   
   
            if (typeof supabase !== 'undefined') {   
                const { error } = await supabase.from('announcements').insert([{ title, date, content, 
category: 'GENERAL' }]);   
                if (error) alert("Error publishing announcement: " + error.message);   
                else {   
                    alert("Announcement published successfully!");   
                    postNoticeForm.reset();   
                }   
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

    const isOpen = () => modal.style.display !== 'none';
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
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
    });

    // Swipe left/right on the image (mobile)
    let startX = null;
    const box = document.querySelector('.lightbox-img-container');
    box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
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
            if (navigator.share) {
                try {
                    const blob = await (await fetch(url)).blob();
                    const file = new File([blob], d.src.split('/').pop(), { type: blob.type });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({ files: [file], title: d.caption, text });
                        return;
                    }
                } catch (_) { /* fall through to link share */ }
                await navigator.share({ title: d.caption, text, url });
            } else {
                await navigator.clipboard.writeText(url);
                alert('Image link copied to clipboard!');
            }
        } catch (err) { /* user cancelled */ }
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
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || "Something went wrong. Try again.");
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
        const { data } = await window.tbSupabase.from("topics").select("*")
            .eq("release_date", today).eq("approved", true).maybeSingle();
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
                const token = await window.tbGetIdToken();
                if (!token) throw new Error("Please log in again.");
                const res = await fetch(FN_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
                    body: JSON.stringify({ action: "post", topic_id: topic.id, body })
                });
                const out = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(out.error || "Could not post. Try again.");
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

    window.loadForum = async function () {
        if (window.forumIsAdmin === undefined) {
            try {
                window.forumIsAdmin = (await window.forumCall({ action: "whoami" })).admin === true;
                $("forumAdmin").style.display = window.forumIsAdmin ? "" : "none";
            } catch (e) { /* not signed in yet: treat as a student for now */ }
        }
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
