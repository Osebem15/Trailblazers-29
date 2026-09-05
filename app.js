// --- 1. SUPABASE INITIALIZATION ---
if (typeof supabase === 'undefined' && typeof window.supabaseClient !== 'undefined') {
    var supabase = window.supabaseClient;
} else if (typeof supabase === 'undefined') {
    const SUPABASE_URL = 'https://yuebmlmamkclsfizurkp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWJtbG1hbWtjbHNmaXp1cmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDIyMzksImV4cCI6MjEwMzQ3ODIzOX0.eWDugNSs0GD0Mx-eWaDjkiLx07B_oqjm-xVTdB39zpI';
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// --- 2. STUDENT DIRECTORY MAPPING ---
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

// Generate Class Dues Array
const studentDuesRegistry = Object.keys(studentDirectory).map(matric => ({
    matric: matric,
    name: studentDirectory[matric],
    paid: false
}));

// Load persisted payment status
const savedDues = localStorage.getItem('studentDuesRegistry');
if (savedDues) {
    try {
        const parsed = JSON.parse(savedDues);
        studentDuesRegistry.forEach(s => {
            if (parsed[s.matric] !== undefined) {
                s.paid = parsed[s.matric];
            }
        });
    } catch (e) {
        console.error("Error loading stored dues:", e);
    }
}

// --- 3. GLOBAL FUNCTIONS (REQUIRED FOR INLINE HTML ONCLICK / MODULE SCOPE) ---

window.setStudentDisplayName = function(matricNumber) {
    const cleanMatric = String(matricNumber).trim();
    const displayName = studentDirectory[cleanMatric] || "Trailblazer";

    const greetingHeader = document.querySelector(".welcome-greeting h2");
    if (greetingHeader) {
        greetingHeader.innerHTML = `${displayName} <i class="fa-solid fa-circle-check verified-badge-icon"></i>`;
    }

    const dropdownNameLabel = document.getElementById("dropdownUserName");
    if (dropdownNameLabel) {
        dropdownNameLabel.textContent = displayName;
    }
};

window.switchToView = function(viewId) {
    if (!viewId) return;

    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.style.display = 'none';
    });

    // Show target view panel
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
    }

    // Synchronize active sidebar menu state
    document.querySelectorAll('.sidebar-grid-menu .menu-item').forEach(item => {
        const label = item.querySelector('span')?.textContent.trim().toLowerCase();
        
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

window.toggleCourseTopics = function(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (wrapper) {
        wrapper.style.display = (wrapper.style.display === 'none' || wrapper.style.display === '') ? 'block' : 'none';
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
            <option value="General">General Practice Questions / Summary</option>
        `;
    }

    if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
    }
};

window.updateStudentDuesUI = function(matricNumber) {
    const cleanMatric = String(matricNumber).replace(/[^0-9]/g, '').trim();
    const student = studentDuesRegistry.find(s => s.matric === cleanMatric);

    const statusText = document.getElementById('studentDuesStatusText');
    const statusBadge = document.getElementById('duesStatusBadge');
    const isPaid = student ? student.paid : false;

    if (statusText) {
        if (isPaid) {
            statusText.className = "gpa-status status-success";
            statusText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Status: Verified Paid`;
        } else {
            statusText.className = "gpa-status status-pending";
            statusText.style.color = "#ff4d4d";
            statusText.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Status: Pending Payment`;
        }
    }

    if (statusBadge) {
        if (isPaid) {
            statusBadge.className = "grade-badge grade-a";
            statusBadge.textContent = "Paid";
            statusBadge.style.background = "";
            statusBadge.style.color = "";
        } else {
            statusBadge.className = "grade-badge grade-b";
            statusBadge.style.background = "rgba(255, 77, 77, 0.2)";
            statusBadge.style.color = "#ff4d4d";
            statusBadge.textContent = "Pending";
        }
    }
};

window.renderAdminDuesTable = function(filterQuery = '') {
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
                <span class="grade-badge ${student.paid ? 'grade-a' : 'grade-b'}" style="${!student.paid ? 'background: rgba(255, 77, 77, 0.2); color: #ff4d4d;' : ''}">
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
                const duesMap = {};
                studentDuesRegistry.forEach(s => duesMap[s.matric] = s.paid);
                localStorage.setItem('studentDuesRegistry', JSON.stringify(duesMap));

                const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');
                const currentSearch = duesAdminSearchInput ? duesAdminSearchInput.value.toLowerCase().trim() : '';
                window.renderAdminDuesTable(currentSearch);
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
        countBadge.textContent = `${total} Active Announcement${total === 1 ? '' : 's'}`;
    }
}

function renderNoticeCard(notice) {
    const container = document.getElementById('noticesContainer');
    if (!container) return;

    const category = (notice.category || 'GENERAL').toUpperCase();
    const isImportant = category === 'IMPORTANT';

    const article = document.createElement('article');
    article.className = `matrix-card ${isImportant ? 'notice-card-important' : 'notice-card-general'}`;
    article.innerHTML = `
        <div class="notice-card-header">
            <span class="${isImportant ? 'course-code-tag' : 'total-units-badge'}">${category}</span>
            <small class="notice-date"><i class="fa-solid fa-clock"></i> ${formatDateString(notice.date)}</small>
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
            renderNoticeCard(payload.new);
        })
        .subscribe();
}

// Helper: Populate Course Scoresheet table dynamically
function populateCourseScoresheet(courseCode, courseTitle) {
    const tbody = document.getElementById('studentScoresTbody');
    const titleHeader = document.getElementById('activeCourseTitle');
    if (titleHeader) titleHeader.textContent = `${courseCode} - ${courseTitle}`;

    if (!tbody) return;
    tbody.innerHTML = '';

    const matrics = Object.keys(studentDirectory);
    matrics.forEach((matric, idx) => {
        // Generate illustrative score data
        const ca = Math.floor(Math.random() * 11) + 20; // 20 - 30
        const exam = Math.floor(Math.random() * 31) + 40; // 40 - 70
        const total = ca + exam;
        let grade = 'F';
        if (total >= 70) grade = 'A';
        else if (total >= 60) grade = 'B';
        else if (total >= 50) grade = 'C';
        else if (total >= 45) grade = 'D';
        else if (total >= 40) grade = 'E';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td class="course-code-tag">${matric}</td>
            <td>${ca}</td>
            <td>${exam}</td>
            <td><strong>${total}</strong></td>
            <td><span class="grade-badge ${grade === 'A' ? 'grade-a' : 'grade-b'}">${grade}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 5. DOM CONTENT LOADED INITIALIZATIONS ---

document.addEventListener("DOMContentLoaded", function () {

    // A. Intercept ALL Hash Links (e.g. <a href="#noticesView">) to drive SPA view switching
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').replace('#', '');
            if (document.getElementById(targetId)) {
                e.preventDefault();
                window.switchToView(targetId);
            }
        });
    });

    // B. Navigation Sidebar & Quick Access Box Click Triggers
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

    // C. Course Result Scoresheet View Controls
    document.querySelectorAll('.course-score-trigger').forEach(card => {
        card.addEventListener('click', function () {
            const code = this.getAttribute('data-code') || 'ACC 101';
            const title = this.getAttribute('data-title') || 'Course Title';

            populateCourseScoresheet(code, title);

            const listView = document.getElementById('resultsCourseListView');
            const detailView = document.getElementById('courseScoresDetailView');
            if (listView) listView.style.display = 'none';
            if (detailView) detailView.style.display = 'block';
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

    // D. GPA Calculator Auto-Fill Lookup
    const autoFillGradesBtn = document.getElementById('autoFillGradesBtn');
    if (autoFillGradesBtn) {
        autoFillGradesBtn.addEventListener('click', function () {
            const input = document.getElementById('gpaMatricLookupInput');
            const matric = input ? input.value.trim() : '';

            if (!matric || !studentDirectory[matric]) {
                alert("Please enter a valid student Matriculation Number from the directory.");
                return;
            }

            document.querySelectorAll('.grade-select').forEach(select => {
                select.value = "5"; // Auto-fill with Grade A for demonstration
            });

            const calcBtn = document.getElementById("calcGpaBtn");
            if (calcBtn) calcBtn.click();
            alert(`Grades automatically loaded for ${studentDirectory[matric]}!`);
        });
    }

    // E. Mobile Drawer Hamburger Toggle
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const dashboardSidebar = document.querySelector(".dashboard-sidebar");

    if (menuToggleBtn && dashboardSidebar) {
        menuToggleBtn.addEventListener("click", function () {
            dashboardSidebar.classList.toggle("mobile-open");
            if (sidebarOverlay) sidebarOverlay.classList.toggle("active");
        });
    }

    if (sidebarOverlay && dashboardSidebar) {
        sidebarOverlay.addEventListener("click", function () {
            dashboardSidebar.classList.remove("mobile-open");
            sidebarOverlay.classList.remove("active");
        });
    }

    // F. Profile Dropdown & Theme Settings
    const profileDropdownBtn = document.getElementById("profileDropdownBtn");
    const profileDropdownMenu = document.getElementById("profileDropdownMenu");
    const profilePicInput = document.getElementById("profilePicInput");
    const userAvatarImg = document.getElementById("userAvatarImg");
    const userAvatarIcon = document.getElementById("userAvatarIcon");
    const toggleThemeBtn = document.getElementById("toggleThemeBtn");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");

    if (profileDropdownBtn && profileDropdownMenu) {
        profileDropdownBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            profileDropdownMenu.classList.toggle("show");
        });

        document.addEventListener("click", function (e) {
            if (!profileDropdownMenu.contains(e.target) && !profileDropdownBtn.contains(e.target)) {
                profileDropdownMenu.classList.remove("show");
            }
        });
    }

    if (profilePicInput) {
        profilePicInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    userAvatarImg.src = event.target.result;
                    userAvatarImg.style.display = "block";
                    if (userAvatarIcon) userAvatarIcon.style.display = "none";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener("click", function () {
            document.body.classList.toggle("light-theme");
            const isLight = document.body.classList.contains("light-theme");
            if (themeIcon) {
                themeIcon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
            }
            if (themeText) {
                themeText.textContent = isLight ? "Light Mode" : "Dark Mode";
            }
        });
    }

    // G. GPA Calculator Filter & Calculation
    const gpaToggleBtns = document.querySelectorAll(".gpa-toggle-btn");
    const gpaRows = document.querySelectorAll("#gpaTableBody tr");

    gpaToggleBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            gpaToggleBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const filter = this.getAttribute("data-filter");

            gpaRows.forEach(row => {
                const semester = row.getAttribute("data-semester");
                if (filter === "all" || semester === filter) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });

    const calcGpaBtn = document.getElementById("calcGpaBtn");
    if (calcGpaBtn) {
        calcGpaBtn.addEventListener("click", function () {
            let totalPoints = 0;
            let totalUnits = 0;

            document.querySelectorAll("#gpaTableBody tr").forEach(row => {
                if (row.style.display !== "none") {
                    const select = row.querySelector(".grade-select");
                    if (select && select.value !== "") {
                        const gradeVal = parseFloat(select.value);
                        const units = parseFloat(select.getAttribute("data-units") || "0");
                        totalPoints += gradeVal * units;
                        totalUnits += units;
                    }
                }
            });

            const gpaResultDisplay = document.getElementById("gpaResultDisplay");
            if (gpaResultDisplay) {
                gpaResultDisplay.textContent = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
            }
        });
    }

    // H. Dynamic Calendar Handler
    let currentCalendarDate = new Date();
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const calendarMonthYearText = document.getElementById("calendarMonthYearText");
    const calendarGridDays = document.getElementById("calendarGridDays");

    const focusedEventTitle = document.getElementById("focusedEventTitle");
    const focusedEventDate = document.getElementById("focusedEventDate");
    const focusedEventText = document.getElementById("focusedEventText");

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

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calendarMonthYearText.textContent = `${monthNames[month]} ${year}`;

        calendarGridDays.innerHTML = `
            <div class="day-label">MON</div><div class="day-label">TUE</div><div class="day-label">WED</div>
            <div class="day-label">THU</div><div class="day-label">FRI</div><div class="day-label">SAT</div><div class="day-label">SUN</div>
        `;

        let dbAnnouncements = [];
        if (typeof supabase !== 'undefined') {
            const { data } = await supabase.from('announcements').select('*');
            if (data) dbAnnouncements = data;
        }

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

        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day-num";
            dayDiv.textContent = i;
            dayDiv.style.cursor = "pointer";

            const monthFormatted = String(month + 1).padStart(2, "0");
            const dayFormatted = String(i).padStart(2, "0");
            const dateKey = `${year}-${monthFormatted}-${dayFormatted}`;

            const matchedNotice = dbAnnouncements.find(n => n.date === dateKey);
            if (matchedNotice || sampleEvents[dateKey]) {
                dayDiv.classList.add("has-event");
            }

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add("today-highlight");
            }

            dayDiv.addEventListener("click", function () {
                document.querySelectorAll(".day-num").forEach(d => d.classList.remove("selected-day"));
                this.classList.add("selected-day");

                const displayDateStr = `${monthNames[month]} ${i}, ${year}`;

                if (matchedNotice) {
                    focusedEventTitle.innerHTML = `<span class='blue-indicator-dot'></span> ${matchedNotice.title}`;
                    focusedEventDate.textContent = displayDateStr;
                    focusedEventText.textContent = matchedNotice.content;
                } else if (sampleEvents[dateKey]) {
                    focusedEventTitle.innerHTML = sampleEvents[dateKey].title;
                    focusedEventDate.textContent = displayDateStr;
                    focusedEventText.textContent = sampleEvents[dateKey].text;
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

    // I. Supabase Announcements Load & Realtime Subscription
    fetchInitialAnnouncements();
    subscribeToRealtimeAnnouncements();

    // J. Admin Post Notice Form
    const postNoticeForm = document.getElementById('postNoticeForm');
    if (postNoticeForm) {
        postNoticeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const title = document.getElementById('noticeTitleInput')?.value;
            const date = document.getElementById('noticeDateInput')?.value;
            const content = document.getElementById('noticeTextInput')?.value;

            if (typeof supabase !== 'undefined') {
                const { error } = await supabase.from('announcements').insert([{ title, date, content, category: 'GENERAL' }]);
                if (error) alert("Error publishing announcement: " + error.message);
                else {
                    alert("Announcement published successfully!");
                    postNoticeForm.reset();
                }
            }
        });
    }

    // K. Document Upload Modal Form
    const uploadMaterialForm = document.getElementById('uploadMaterialForm');
    if (uploadMaterialForm) {
        uploadMaterialForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert("Study material uploaded to cloud storage successfully!");
            document.getElementById('uploadNotesModal')?.close();
        });
    }

    // L. Admin Search Input Trigger
    const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');
    if (duesAdminSearchInput) {
        duesAdminSearchInput.addEventListener('input', (e) => {
            window.renderAdminDuesTable(e.target.value.toLowerCase().trim());
        });
    }

    // M. Receipt Action Trigger
    const downloadDuesReceiptBtn = document.getElementById('downloadDuesReceiptBtn');
    if (downloadDuesReceiptBtn) {
        downloadDuesReceiptBtn.addEventListener('click', () => {
            alert("Downloading official ACC '29 Class Dues payment receipt...");
        });
    }
});