// --- 1. SUPABASE INITIALIZATION --- 
if (typeof supabase === 'undefined' && typeof window.supabaseClient 
!== 'undefined') { 
    var supabase = window.supabaseClient; 
} else if (typeof supabase === 'undefined') { 
    const SUPABASE_URL = 'https://yuebmlmamkclsfizurkp.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWJtbG1hbWtjbHNmaXp1cmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDIyMzksImV4cCI6MjEwMzQ3ODIzOX0.eWDugNSs0GD0Mx-eWaDjkiLx07B_oqjm-xVTdB39zpI'; 
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 
} 
 
// --- 2. STUDENT DIRECTORY MAPPING & DUES REGISTRY --- 
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
 
// Generate Class Dues Array 
const studentDuesRegistry = Object.keys(studentDirectory).map(matric => ({ 
    matric: matric, 
    name: studentDirectory[matric], 
    paid: false 
})); 
 
// Fetch payment statuses from Supabase database 
async function fetchInitialStudentDues() { 
    if (typeof supabase === 'undefined') return; 
    const { data, error } = await supabase 
        .from('student_dues') 
        .select('*'); 
    if (error) { 
        console.error('Error fetching student dues:', error); 
        return; 
    } 
    if (data && data.length > 0) { 
        data.forEach(item => { 
            const student = studentDuesRegistry.find(s => s.matric === 
item.matric); 
            if (student) { 
                student.paid = item.paid; 
            } 
        }); 
    } 
    if (window.currentLoggedInMatric) { 
        window.updateStudentDuesUI(window.currentLoggedInMatric); 
    } 
    const duesAdminSearchInput = 
document.getElementById('duesAdminSearchInput'); 
    const currentSearch = duesAdminSearchInput ? 
duesAdminSearchInput.value.toLowerCase().trim() : ''; 
    window.renderAdminDuesTable(currentSearch); 
} 
 
// Subscribe to live change events from Supabase 
function subscribeToRealtimeDues() { 
    if (typeof supabase === 'undefined') return; 
    supabase 
        .channel('public:student_dues') 
        .on('postgres_changes', { event: '*', schema: 'public', table: 
'student_dues' }, payload => { 
            const updated = payload.new; 
            if (!updated || !updated.matric) return; 
            const student = studentDuesRegistry.find(s => s.matric === 
updated.matric); 
            if (student) { 
                student.paid = updated.paid; 
            } 
            if (window.currentLoggedInMatric === updated.matric) { 
                window.updateStudentDuesUI(updated.matric); 
            } 
            const duesAdminSearchInput = 
document.getElementById('duesAdminSearchInput'); 
            const currentSearch = duesAdminSearchInput ? 
duesAdminSearchInput.value.toLowerCase().trim() : ''; 
            window.renderAdminDuesTable(currentSearch); 
        }) 
        .subscribe(); 
} 
 
// --- 3. GLOBAL FUNCTIONS (REQUIRED FOR INLINE HTML ONCLICK / MODULE SCOPE) --- 
 
window.setStudentDisplayName = function(matricNumber) { 
    const cleanMatric = String(matricNumber).trim(); 
    const displayName = studentDirectory[cleanMatric] || 
"Trailblazer"; 
 
    const greetingHeader = document.querySelector(".welcome-greeting h2"); 
    if (greetingHeader) { 
        greetingHeader.innerHTML = `${displayName} <i class="fa-solid 
fa-circle-check verified-badge-icon"></i>`; 
    } 
 
    const dropdownNameLabel = 
document.getElementById("dropdownUserName"); 
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
    if (targetView) { 
        targetView.style.display = 'block'; 
    } 
 
    document.querySelectorAll('.sidebar-grid-menu .menu-item').forEach(item => { 
        const label = 
item.querySelector('span')?.textContent.trim().toLowerCase(); 
         
        const viewToLabel = { 
            "dashboardHomeView": "my profile", 
            "coursesView": "courses", 
            "timetableView": "timetable", 
            "resultsView": "results", 
            "feesView": "fees", 
            "noticesView": "notices", 
            "documentsView": "documents" 
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
    const courseCards = 
document.querySelectorAll('.results-course-card'); 
 
    if (semester === '1st') { 
        if (btn1st) { btn1st.style.background = '#1d9bf0'; 
btn1st.style.color = '#fff'; } 
        if (btn2nd) { btn2nd.style.background = 'transparent'; 
btn2nd.style.color = '#8fa5c3'; } 
    } else { 
        if (btn2nd) { btn2nd.style.background = '#1d9bf0'; 
btn2nd.style.color = '#fff'; } 
        if (btn1st) { btn1st.style.background = 'transparent'; 
btn1st.style.color = '#8fa5c3'; } 
    } 
 
    courseCards.forEach(card => { 
        if (card.getAttribute('data-semester') === semester) { 
            card.style.display = 'block'; 
        } else { 
            card.style.display = 'none'; 
        } 
    }); 
}; 
 
window.toggleCourseTopics = function(wrapperId) { 
    const wrapper = document.getElementById(wrapperId); 
    if (wrapper) { 
        wrapper.style.display = (wrapper.style.display === 'none' || 
wrapper.style.display === '') ? 'block' : 'none'; 
    } 
}; 
 
window.openUploadModal = function(courseCode) { 
    const modal = document.getElementById('uploadNotesModal'); 
    const courseInput = document.getElementById('uploadTargetCourse'); 
    const topicSelect = document.getElementById('uploadTargetTopic'); 
 
    if (courseInput) courseInput.value = courseCode; 
 
    if (topicSelect) { 
        topicSelect.innerHTML = ` 
            <option value="Topic 1">Topic 1 Module Material</option> 
            <option value="Topic 2">Topic 2 Module Material</option> 
            <option value="Topic 3">Topic 3 Module Material</option> 
            <option value="General">General Practice Questions / 
Summary</option> 
        `; 
    } 
 
    if (modal && typeof modal.showModal === 'function') { 
        modal.showModal(); 
    } 
}; 
 
window.generateDuesReceipt = function () {
    const currentMatric = window.currentLoggedInMatric || localStorage.getItem('logged_in_user_matric');
    if (!currentMatric) {
        alert("Please log in to access your receipt.");
        return;
    }
    const cleanMatric = String(currentMatric).replace(/[^0-9]/g, '').trim();
    const student = (window.studentDuesRegistry)
        ? window.studentDuesRegistry.find(s => s.matric === cleanMatric)
        : null;
   
    // Default to false if student data is not found or payment is unverified
    const isPaid = student ? student.paid : false;
    // --- ACCESS CONTROL GUARD ---
    if (!isPaid) {
        alert("Access Denied: Payment clearance required. You cannot generate or print a receipt until your payment status is verified by an admin.");
        return; // Immediately block print window generation
    }
    const receiptRef = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    // ... receipt HTML and print window logic ...
};
 
window.renderAdminDuesTable = function(filterQuery = '') { 
    const adminDuesTbody = document.getElementById('adminDuesTbody'); 
    if (!adminDuesTbody) return; 
 
    adminDuesTbody.innerHTML = ''; 
    const filtered = studentDuesRegistry.filter(s =>  
        s.name.toLowerCase().includes(filterQuery) || 
s.matric.toLowerCase().includes(filterQuery) 
    ); 
 
    if (filtered.length === 0) { 
        adminDuesTbody.innerHTML = `<tr><td colspan="5" 
style="text-align:center; color:#8fa5c3;">No students 
found.</td></tr>`; 
        return; 
    } 
 
    filtered.forEach((student, index) => { 
        const row = document.createElement('tr'); 
        row.innerHTML = ` 
            <td>${index + 1}</td> 
            <td class="course-code-tag">${student.matric}</td> 
            <td><strong>${student.name}</strong></td> 
            <td> 
                <span class="grade-badge ${student.paid ? 'grade-a' : 
'grade-b'}" style="${!student.paid ? 'background: rgba(255, 77, 77, 0.2); color: #ff4d4d;' : ''}"> 
                    ${student.paid ? 'Paid' : 'Pending'} 
                </span> 
            </td> 
            <td> 
                <label class="status-toggle-label"> 
                    <input type="checkbox" 
class="dues-toggle-checkbox" data-matric="${student.matric}" 
${student.paid ? 'checked' : ''}> 
                    <span class="toggle-slider"></span> 
                </label> 
            </td> 
        `; 
        adminDuesTbody.appendChild(row); 
    }); 
 
    document.querySelectorAll('.dues-toggle-checkbox').forEach(chk => 
{ 
        chk.addEventListener('change', async (e) => { 
            const targetMatric = e.target.dataset.matric; 
            const isChecked = e.target.checked; 
 
            const targetStudent = studentDuesRegistry.find(s => 
s.matric === targetMatric); 
            if (targetStudent) { 
                targetStudent.paid = isChecked; 
            } 
 
            if (typeof supabase !== 'undefined') { 
                const { error } = await supabase 
                    .from('student_dues') 
                    .upsert({ matric: targetMatric, paid: isChecked }, 
{ onConflict: 'matric' }); 
 
                if (error) { 
                    console.error('Error updating status in Supabase:', error); 
                    alert('Failed to update fee status in Supabase: ' 
+ error.message); 
                } 
            } 
        }); 
    }); 
}; 
 
// --- 4. SUPABASE ANNOUNCEMENTS LOGIC --- 
 
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
        countBadge.textContent = `${total} Active Announcement${total 
=== 1 ? '' : 's'}`; 
    } 
} 
 
function renderNoticeCard(notice) { 
    const container = document.getElementById('noticesContainer'); 
    if (!container) return; 
 
    const category = (notice.category || 'GENERAL').toUpperCase(); 
    const isImportant = category === 'IMPORTANT'; 
 
    const article = document.createElement('article'); 
    article.className = `matrix-card ${isImportant ? 
'notice-card-important' : 'notice-card-general'}`; 
    article.innerHTML = ` 
        <div class="notice-card-header"> 
            <span class="${isImportant ? 'course-code-tag' : 
'total-units-badge'}">${category}</span> 
            <small class="notice-date"><i class="fa-solid 
fa-clock"></i> ${formatDateString(notice.date)}</small> 
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
        .on('postgres_changes', { event: 'INSERT', schema: 'public', 
table: 'announcements' }, payload => { 
            renderNoticeCard(payload.new); 
        }) 
        .subscribe(); 
} 
 
// --- 5. DOM CONTENT LOADED INITIALIZATIONS --- 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    document.querySelectorAll('a[href^="#"]').forEach(anchor => { 
        anchor.addEventListener('click', function (e) { 
            const targetId = this.getAttribute('href').replace('#', 
''); 
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
        "documents": "documentsView" 
    }; 
 
    document.querySelectorAll(".sidebar-grid-menu .menu-item").forEach(item => { 
        item.addEventListener("click", function () { 
            const label = 
this.querySelector("span")?.textContent.trim().toLowerCase(); 
            const targetViewId = viewMap[label]; 
            if (targetViewId) { 
                window.switchToView(targetViewId); 
            } 
        }); 
    }); 
 
    document.querySelectorAll(".quick-access-box-grid .access-box").forEach(box => { 
        box.addEventListener("click", function () { 
            const label = 
this.querySelector("span")?.textContent.trim().toLowerCase(); 
            const targetViewId = viewMap[label]; 
            if (targetViewId) { 
                window.switchToView(targetViewId); 
            } 
        }); 
    }); 
 
    document.querySelectorAll('.course-score-trigger').forEach(card => 
{ 
        card.addEventListener('click', function () { 
            const code = this.getAttribute('data-code') || 'ACC 101'; 
            const title = this.getAttribute('data-title') || 'Course Title'; 
 
            if (typeof populateCourseScoresheet === 'function') { 
                populateCourseScoresheet(code, title); 
            } 
 
            const listView = 
document.getElementById('resultsCourseListView'); 
            const detailView = 
document.getElementById('courseScoresDetailView'); 
            if (listView) listView.style.display = 'none'; 
            if (detailView) detailView.style.display = 'block'; 
        }); 
    }); 
 
    const backToCoursesBtn = 
document.getElementById('backToCoursesBtn'); 
    if (backToCoursesBtn) { 
        backToCoursesBtn.addEventListener('click', function () { 
            const listView = 
document.getElementById('resultsCourseListView'); 
            const detailView = 
document.getElementById('courseScoresDetailView'); 
            if (detailView) detailView.style.display = 'none'; 
            if (listView) listView.style.display = 'block'; 
        }); 
    } 
 
    const studentSearchInput = 
document.getElementById('studentSearchInput'); 
    if (studentSearchInput) { 
        studentSearchInput.addEventListener('input', function (e) { 
            const query = e.target.value.toLowerCase().trim(); 
            document.querySelectorAll('#studentScoresTbody tr').forEach(row => { 
                const text = row.textContent.toLowerCase(); 
                row.style.display = text.includes(query) ? '' : 
'none'; 
            }); 
        }); 
    } 
 
    const menuToggleBtn = document.getElementById("menu-toggle-btn"); 
    const sidebarOverlay = document.getElementById("sidebar-overlay"); 
    const dashboardSidebar = 
document.querySelector(".dashboard-sidebar"); 
 
    if (menuToggleBtn && dashboardSidebar) { 
        menuToggleBtn.addEventListener("click", function () { 
            dashboardSidebar.classList.toggle("mobile-open"); 
            if (sidebarOverlay) 
sidebarOverlay.classList.toggle("active"); 
        }); 
    } 
 
    if (sidebarOverlay && dashboardSidebar) { 
        sidebarOverlay.addEventListener("click", function () { 
            dashboardSidebar.classList.remove("mobile-open"); 
            sidebarOverlay.classList.remove("active"); 
        }); 
    } 
 
    const profileBtn = document.getElementById('profileDropdownBtn'); 
    const profileModal = document.getElementById('profileModal'); 
    const closeProfileModalBtn = 
document.getElementById('closeProfileModalBtn'); 
    const modalProfilePicInput = 
document.getElementById('modalProfilePicInput'); 
    const modalToggleThemeBtn = 
document.getElementById('modalToggleThemeBtn'); 
    const modalLogoutBtn = document.getElementById('modalLogoutBtn'); 
 
    const headerImg = document.getElementById('userAvatarImg'); 
    const headerIcon = document.getElementById('userAvatarIcon'); 
 
    const modalImg = document.getElementById('enlargedAvatarImg'); 
    const modalIcon = document.getElementById('enlargedAvatarIcon'); 
 
    function getCurrentUserKey() { 
        const userEmail = localStorage.getItem('logged_in_user_email') 
|| 'default_user'; 
        return `avatar_${userEmail}`; 
    } 
 
    function loadUserProfilePicture() { 
        const storageKey = getCurrentUserKey(); 
        const savedAvatar = localStorage.getItem(storageKey); 
        if (savedAvatar) { 
            if (headerImg) { 
                headerImg.src = savedAvatar; 
                headerImg.style.display = 'block'; 
            } 
            if (headerIcon) headerIcon.style.display = 'none'; 
            if (modalImg) { 
                modalImg.src = savedAvatar; 
                modalImg.style.display = 'block'; 
            } 
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
            if (e.target === profileModal) { 
                profileModal.style.display = 'none'; 
            } 
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
            const isLight = 
document.body.classList.contains('light-theme'); 
            localStorage.setItem('theme', isLight ? 'light' : 'dark'); 
        }); 
    } 
 
    if (modalLogoutBtn) { 
        modalLogoutBtn.addEventListener('click', () => { 
            const logoutBtn = document.getElementById('logoutBtn'); 
            if (logoutBtn) { 
                logoutBtn.click(); 
            } else { 
                location.reload(); 
            } 
        }); 
    } 
 
    loadUserProfilePicture(); 
 
    let currentCalendarDate = new Date(); 
    const prevMonthBtn = document.getElementById("prevMonthBtn"); 
    const nextMonthBtn = document.getElementById("nextMonthBtn"); 
    const calendarMonthYearText = 
document.getElementById("calendarMonthYearText"); 
    const calendarGridDays = 
document.getElementById("calendarGridDays"); 
 
    const focusedEventTitle = 
document.getElementById("focusedEventTitle"); 
    const focusedEventDate = 
document.getElementById("focusedEventDate"); 
    const focusedEventText = 
document.getElementById("focusedEventText"); 
 
    const sampleEvents = { 
        "2026-06-15": { 
            title: "<span class='blue-indicator-dot'></span> Mid-Semester Schedule Release", 
            text: "Mid-semester schedule released for ACC 102 and AMS 104." 
        }, 
        "2026-06-23": { 
            title: "<span class='blue-indicator-dot'></span> Mid-Semester Test", 
            text: "All students are advised to check the timetable for updates on lecture schedules." 
        } 
    }; 
 
    async function renderCalendar(dateObj) { 
        if (!calendarGridDays || !calendarMonthYearText) return; 
 
        const year = dateObj.getFullYear(); 
        const month = dateObj.getMonth(); 
 
        const monthNames = ["January", "February", "March", "April", 
"May", "June", "July", "August", "September", "October", "November", 
"December"]; 
        calendarMonthYearText.textContent = `${monthNames[month]} 
${year}`; 
 
        calendarGridDays.innerHTML = ` 
            <div class="day-label">MON</div><div 
class="day-label">TUE</div><div class="day-label">WED</div> 
            <div class="day-label">THU</div><div 
class="day-label">FRI</div><div class="day-label">SAT</div><div 
class="day-label">SUN</div> 
        `; 
 
        let dbAnnouncements = []; 
        if (typeof supabase !== 'undefined') { 
            const { data } = await 
supabase.from('announcements').select('*'); 
            if (data) dbAnnouncements = data; 
        } 
 
        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) 
% 7; 
        const lastDay = new Date(year, month + 1, 0).getDate(); 
        const prevLastDay = new Date(year, month, 0).getDate(); 
        const today = new Date(); 
 
        for (let x = firstDayIndex; x > 0; x--) { 
            const dayDiv = document.createElement("div"); 
            dayDiv.className = "day-num muted"; 
            dayDiv.textContent = prevLastDay - x + 1; 
            calendarGridDays.appendChild(dayDiv); 
        } 
 
        for (let i = 1; i <= lastDay; i++) { 
            const dayDiv = document.createElement("div"); 
            dayDiv.className = "day-num"; 
            dayDiv.textContent = i; 
            dayDiv.style.cursor = "pointer"; 
 
            const monthFormatted = String(month + 1).padStart(2, "0"); 
            const dayFormatted = String(i).padStart(2, "0"); 
            const dateKey = 
`${year}-${monthFormatted}-${dayFormatted}`; 
 
            const matchedNotice = dbAnnouncements.find(n => n.date === 
dateKey); 
            if (matchedNotice || sampleEvents[dateKey]) { 
                dayDiv.classList.add("has-event"); 
            } 
 
            if (i === today.getDate() && month === today.getMonth() && 
year === today.getFullYear()) { 
                dayDiv.classList.add("today-highlight"); 
            } 
 
            dayDiv.addEventListener("click", function () { 
                document.querySelectorAll(".day-num").forEach(d => 
d.classList.remove("selected-day")); 
                this.classList.add("selected-day"); 
 
                const displayDateStr = `${monthNames[month]} ${i}, 
${year}`; 
 
                if (matchedNotice) { 
                    focusedEventTitle.innerHTML = `<span 
class='blue-indicator-dot'></span> ${matchedNotice.title}`; 
                    focusedEventDate.textContent = displayDateStr; 
                    focusedEventText.textContent = 
matchedNotice.content; 
                } else if (sampleEvents[dateKey]) { 
                    focusedEventTitle.innerHTML = 
sampleEvents[dateKey].title; 
                    focusedEventDate.textContent = displayDateStr; 
                    focusedEventText.textContent = 
sampleEvents[dateKey].text; 
                } else { 
                    focusedEventTitle.innerHTML = "<span class='blue-indicator-dot' style='background: #8b949e;'></span> No Scheduled Events"; 
                    focusedEventDate.textContent = displayDateStr; 
                    focusedEventText.textContent = "There are no events today."; 
                } 
            }); 
 
            calendarGridDays.appendChild(dayDiv); 
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
 
    // Initial Supabase Data Operations 
    fetchInitialAnnouncements(); 
    subscribeToRealtimeAnnouncements(); 
    fetchInitialStudentDues(); 
    subscribeToRealtimeDues(); 
 
    const postNoticeForm = document.getElementById('postNoticeForm'); 
    if (postNoticeForm) { 
        postNoticeForm.addEventListener('submit', async function (e) { 
            e.preventDefault(); 
            const title = 
document.getElementById('noticeTitleInput')?.value; 
            const date = 
document.getElementById('noticeDateInput')?.value; 
            const content = 
document.getElementById('noticeTextInput')?.value; 
 
            if (typeof supabase !== 'undefined') { 
                const { error } = await 
supabase.from('announcements').insert([{ title, date, content, 
category: 'GENERAL' }]); 
                if (error) alert("Error publishing announcement: " + 
error.message); 
                else { 
                    alert("Announcement published successfully!"); 
                    postNoticeForm.reset(); 
                } 
            } 
        }); 
    } 
 
    const uploadMaterialForm = 
document.getElementById('uploadMaterialForm'); 
    if (uploadMaterialForm) { 
        uploadMaterialForm.addEventListener('submit', function (e) { 
            e.preventDefault(); 
            alert("Study material uploaded to cloud storage successfully!"); 
            document.getElementById('uploadNotesModal')?.close(); 
        }); 
    } 
 
    const duesAdminSearchInput = 
document.getElementById('duesAdminSearchInput'); 
    if (duesAdminSearchInput) { 
        duesAdminSearchInput.addEventListener('input', (e) => { 
            
window.renderAdminDuesTable(e.target.value.toLowerCase().trim()); 
        }); 
    } 
 
    window.generateDuesReceipt = function () {
    const currentMatric = window.currentLoggedInMatric || localStorage.getItem('logged_in_user_matric');
    if (!currentMatric) {
        alert("Please log in to access your receipt.");
        return;
    }
    const cleanMatric = String(currentMatric).replace(/[^0-9]/g, '').trim();
    const student = (window.studentDuesRegistry)
        ? window.studentDuesRegistry.find(s => s.matric === cleanMatric)
        : null;
   
    // Default to false if student data is not found or payment is unverified
    const isPaid = student ? student.paid : false;
    // --- ACCESS CONTROL GUARD ---
    if (!isPaid) {
        alert("Access Denied: Payment clearance required. You cannot generate or print a receipt until your payment status is verified by an admin.");
        return; // Immediately block print window generation
    }
    const receiptRef = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const printWindow = window.open('', '_blank', 'width=800,height=900');
 
 
    const receiptHTML = ` 
      <!DOCTYPE html> 
      <html> 
      <head> 
        <title>Receipt_${currentMatric}_ACC29</title> 
        <style> 
          body {  
            font-family: 'Segoe UI', Arial, sans-serif;  
            background: #f8fafc;  
            color: #0f172a;  
            padding: 40px;  
            margin: 0;  
          } 
          .receipt-box {  
            max-width: 650px;  
            margin: 0 auto;  
            background: #ffffff;  
            border: 2px solid #cbd5e1;  
            border-radius: 12px;  
            padding: 36px;  
            position: relative;  
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);  
          } 
          .header {  
            text-align: center;  
            border-bottom: 2px double #0f172a;  
            padding-bottom: 16px;  
            margin-bottom: 24px;  
          } 
          .header h2 {  
            margin: 0;  
            font-size: 22px;  
            text-transform: uppercase;  
            letter-spacing: 1px;  
            color: #000b18;  
          } 
          .header h3 {  
            margin: 6px 0 0;  
            font-size: 15px;  
            color: #1d9bf0;  
            font-weight: 600;  
          } 
          .header p {  
            margin: 4px 0 0;  
            font-size: 12px;  
            color: #64748b;  
          } 
          .meta-bar {  
            display: flex;  
            justify-content: space-between;  
            font-size: 13px;  
            color: #475569;  
            margin-bottom: 24px;  
            padding: 10px 14px;  
            background: #f1f5f9;  
            border-radius: 6px;  
          } 
          .details-table {  
            width: 100%;  
            border-collapse: collapse;  
            margin-bottom: 28px;  
          } 
          .details-table th, .details-table td {  
            padding: 12px 14px;  
            text-align: left;  
            border-bottom: 1px solid #e2e8f0;  
            font-size: 14px;  
          } 
          .details-table th {  
            background: #f8fafc;  
            color: #64748b;  
            text-transform: uppercase;  
            font-size: 11px;  
            letter-spacing: 0.5px;  
            width: 38%;  
          } 
          .total-row {  
            font-size: 16px;  
            font-weight: bold;  
            background: rgba(29, 155, 240, 0.08);  
          } 
          .total-row td {  
            color: #1d9bf0;  
            font-size: 18px;  
            font-weight: 800;  
          } 
          .status-stamp {  
            position: absolute;  
            right: 40px;  
            bottom: 90px;  
            border: 3px double ${isPaid ? '#16a34a' : '#dc2626'};  
            color: ${isPaid ? '#16a34a' : '#dc2626'};  
            padding: 8px 18px;  
            border-radius: 8px;  
            font-weight: 900;  
            font-size: 16px;  
            transform: rotate(-12deg);  
            opacity: 0.85;  
            text-transform: uppercase;  
            letter-spacing: 2px;  
          } 
          .footer {  
            text-align: center;  
            font-size: 11px;  
            color: #94a3b8;  
            border-top: 1px solid #e2e8f0;  
            padding-top: 18px;  
            margin-top: 20px;  
          } 
          @media print {  
            body { background: none; padding: 0; }  
            .receipt-box { border: none; box-shadow: none; }  
          } 
        </style> 
      </head> 
      <body> 
        <div class="receipt-box"> 
          <div class="status-stamp">${isPaid ? 'VERIFIED PAID' : 
'PENDING'}</div> 
           
          <div class="header"> 
            <h2>University of Lagos</h2> 
            <h3>Department of Accounting — ACC '29</h3> 
            <p>Official Departmental Dues Clearance Receipt</p> 
          </div> 
 
          <div class="meta-bar"> 
            <span><strong>Receipt Ref:</strong> ${receiptRef}</span> 
            <span><strong>Date Issued:</strong> ${currentDate}</span> 
          </div> 
 
          <table class="details-table"> 
            <tr> 
              <th>Student Name</th> 
              <td><strong>${studentName}</strong></td> 
            </tr> 
            <tr> 
              <th>Matriculation No</th> 
              <td><code>${currentMatric}</code></td> 
            </tr> 
            <tr> 
              <th>Class / Level</th> 
              <td>Accounting (200 Level — Trailblazers '29)</td> 
            </tr> 
            <tr> 
              <th>Academic Session</th> 
              <td>2026/2027 Session</td> 
            </tr> 
            <tr> 
              <th>Fee Description</th> 
              <td>ACC '29 Departmental & Class Package Dues</td> 
            </tr> 
            <tr> 
              <th>Payment Status</th> 
              <td><strong style="color: ${isPaid ? '#16a34a' : '#dc2626'};">${isPaid ? 'Verified Paid' : 'Pending Payment'}</strong></td> 
            </tr> 
            <tr class="total-row"> 
              <th>Amount Paid</th> 
              <td>₦ 500.00</td> 
            </tr> 
          </table> 
 
          <div class="footer"> 
            <p>This is an official computer-generated receipt issued 
by the Department of Accounting, UNILAG.</p> 
            <p><em>Integrity, Excellence and Service</em></p> 
          </div> 
        </div> 
 
        <script> 
          window.onload = function() { 
            window.print(); 
          }; 
        </script> 
      </body> 
      </html> 
    `; 
 
    printWindow.document.write(receiptHTML); 
    printWindow.document.close(); 
}; 
 
// Wire up button event listener 
const downloadDuesReceiptBtn = 
document.getElementById('downloadDuesReceiptBtn'); 
if (downloadDuesReceiptBtn) { 
    downloadDuesReceiptBtn.addEventListener('click', 
window.generateDuesReceipt); 
} 
}); 
 
if ('serviceWorker' in navigator) { 
  window.addEventListener('load', () => { 
    navigator.serviceWorker.register('./sw.js') 
      .then((reg) => { 
        console.log('PWA Service Worker registered successfully:', 
reg.scope); 
      }) 
      .catch((err) => { 
        console.error('PWA Service Worker registration failed:', err); 
      }); 
  }); 
} 
 
let deferredPrompt; 
const installBtn = document.getElementById('pwaInstallBtn'); 
window.addEventListener('beforeinstallprompt', (e) => { 
  e.preventDefault(); 
  deferredPrompt = e; 
  if (installBtn) { 
    installBtn.style.display = 'inline-flex'; 
  } 
}); 
 
if (installBtn) { 
  installBtn.addEventListener('click', async () => { 
    if (!deferredPrompt) return; 
    deferredPrompt.prompt(); 
    const { outcome } = await deferredPrompt.userChoice; 
    if (outcome === 'accepted') { 
      installBtn.style.display = 'none'; 
    } 
    deferredPrompt = null; 
  }); 
} 
