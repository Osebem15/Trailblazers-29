// Save this file as app.js in your project directory
// Add at the very top of app.js if not already declared globally via auth.js
if (typeof supabase === 'undefined' && typeof window.supabaseClient !== 'undefined') {
    var supabase = window.supabaseClient;
} else if (typeof supabase === 'undefined') {
    const SUPABASE_URL = 'https://yuebmlmamkclsfizurkp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWJtbG1hbWtjbHNmaXp1cmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDIyMzksImV4cCI6MjEwMzQ3ODIzOX0.eWDugNSs0GD0Mx-eWaDjkiLx07B_oqjm-xVTdB39zpI'; // Replace with your actual anon key
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
document.addEventListener("DOMContentLoaded", function () {
    // --- 1. PROFILE DROPDOWN MENU HANDLER ---
    const profileDropdownBtn = document.getElementById("profileDropdownBtn");
    const profileDropdownMenu = document.getElementById("profileDropdownMenu");
    const profilePicInput = document.getElementById("profilePicInput");
    const userAvatarImg = document.getElementById("userAvatarImg");
    const userAvatarIcon = document.getElementById("userAvatarIcon");
    const toggleThemeBtn = document.getElementById("toggleThemeBtn");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");
    const dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");
    const mainLogoutBtn = document.getElementById("logoutBtn");

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

    // Handle Profile Picture Upload
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

    // Handle Theme Toggle
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
const studentDuesRegistry = [
  { matric: "250201054", name: "Fakayode Oluwasemilore", paid: false },
  { matric: "250201013", name: "Abidekun Elizabeth", paid: false },
  { matric: "250201368", name: "Abubakar Kehinde", paid: false },
  { matric: "250201302", name: "Adaramola Bisola", paid: false },
  { matric: "250201355", name: "Adebamowo Emmanuel", paid: false },
  { matric: "250201306", name: "Adebayo Ife", paid: false },
  { matric: "250201408", name: "Adebayo Oluwatofunmi", paid: false },
  { matric: "250201379", name: "Adebowale-David Oluwaranolasimi", paid: false },
  { matric: "250201391", name: "Adedeji Tosin", paid: false },
  { matric: "250201021", name: "Adefalujo Oluwafunmilayo", paid: false },
  { matric: "250201407", name: "Adekunle Enoch", paid: false },
  { matric: "250201400", name: "Adeleke Ayodeji", paid: false },
  { matric: "250201052", name: "Ademola Elijah", paid: false },
  { matric: "250201403", name: "Adeniji Tanitoluwa", paid: false },
  { matric: "250201402", name: "Adeniran Abdullah", paid: false },
  { matric: "250201325", name: "Adeniran Oluwadamilola", paid: false },
  { matric: "250201378", name: "Adeniyi Temitope", paid: false },
  { matric: "250201308", name: "Adesanya Adetutu", paid: false },
  { matric: "250201292", name: "Adewole Habeeb", paid: false },
  { matric: "250201404", name: "Adeyanju Mulikat", paid: false },
  { matric: "250201393", name: "Adigun Mosopefoluwa", paid: false },
  { matric: "250201029", name: "Adio Oluwanifemi", paid: false },
  { matric: "250201007", name: "Adukanle Precious", paid: false },
  { matric: "250201107", name: "Afolabi Daniel", paid: false },
  { matric: "250201301", name: "Afolabi Hezekiah", paid: false },
  { matric: "250201069", name: "Afolabiozua Ebubechukwu", paid: false },
  { matric: "250201028", name: "Agbalaya Hiqmat", paid: false },
  { matric: "250201337", name: "Agbasi Chimamanda", paid: false },
  { matric: "250201343", name: "Agboola Olabisi", paid: false },
  { matric: "250201341", name: "Ajadi Fathia", paid: false },
  { matric: "250201293", name: "Ajayi Ifeoluwa", paid: false },
  { matric: "250201070", name: "Ajayi Isaac", paid: false },
  { matric: "250201294", name: "Ajayi Motunrayo", paid: false },
  { matric: "250201358", name: "Ajenifuja Anuoluwapo", paid: false },
  { matric: "250201011", name: "Ajibade Adeola", paid: false },
  { matric: "250201396", name: "Ajibade Fathia", paid: false },
  { matric: "250201338", name: "Ajibola Peace", paid: false },
  { matric: "250201050", name: "Ajisegiri Eniola", paid: false },
  { matric: "250201018", name: "Akande Olamide", paid: false },
  { matric: "250301018", name: "Akande Olamide", paid: false },
  { matric: "250201367", name: "Akapo David", paid: false },
  { matric: "250201365", name: "Akinbode Hameedat", paid: false },
  { matric: "250201066", name: "Akinbode Precious", paid: false },
  { matric: "250201046", name: "Akinola Olusolape", paid: false },
  { matric: "250201049", name: "Akinrefon Eniola", paid: false },
  { matric: "250201042", name: "Akintan Jamal", paid: false },
  { matric: "250201322", name: "Akinyemi Faith", paid: false },
  { matric: "250201345", name: "Alabi Emmanuel", paid: false },
  { matric: "250201037", name: "Aladetohun Oluwakamimayo", paid: false },
  { matric: "250201035", name: "Alawode Praise", paid: false },
  { matric: "250201008", name: "Ambelly Aleeyah", paid: false },
  { matric: "250201111", name: "Amole Abdulsamad", paid: false },
  { matric: "250201353", name: "Amosun Daniella", paid: false },
  { matric: "250201005", name: "Anene Deborah", paid: false },
  { matric: "250201079", name: "Asaolu Babatope", paid: false },
  { matric: "250201356", name: "Ayesoro Eniola", paid: false },
  { matric: "250201369", name: "Ayinla Abosede", paid: false },
  { matric: "250201117", name: "Badewole Prosper", paid: false },
  { matric: "250201047", name: "Bakare Gold", paid: false },
  { matric: "250201305", name: "Bakare Idris", paid: false },
  { matric: "250201053", name: "Bakare Sulhaa", paid: false },
  { matric: "250201032", name: "Bankole Ibukun", paid: false },
  { matric: "250201290", name: "Bankole Jason", paid: false },
  { matric: "250201376", name: "Bassey Favour", paid: false },
  { matric: "250201340", name: "Batula Oluwaranti", paid: false },
  { matric: "250201387", name: "Bello Mohammed", paid: false },
  { matric: "250201374", name: "Bena Elizabeth", paid: false },
  { matric: "250201012", name: "Bode-Adams Ireoluwa", paid: false },
  { matric: "250201017", name: "Borokinni Precious", paid: false },
  { matric: "250201359", name: "Busari Abdullah", paid: false },
  { matric: "250201014", name: "Chiegwu Wilson", paid: false },
  { matric: "250201373", name: "Chukwu Esther", paid: false },
  { matric: "250201109", name: "Chukwudi Okeh-chidera", paid: false },
  { matric: "250201328", name: "Coker Omogbemisola", paid: false },
  { matric: "250201398", name: "Collins Victoria", paid: false },
  { matric: "250201038", name: "Da-silva Precious", paid: false },
  { matric: "250201009", name: "Dike Joy", paid: false },
  { matric: "250201366", name: "Ehiremen Mercy", paid: false },
  { matric: "250201349", name: "Ejike Esther", paid: false },
  { matric: "250201300", name: "Ekeopara Chibuike", paid: false },
  { matric: "250201081", name: "Emmanuel Okon", paid: false },
  { matric: "250201380", name: "Emmanuel Olatoye", paid: false },
  { matric: "250201304", name: "Eniafe Abdulwahab", paid: false },
  { matric: "250201384", name: "Fadairo Oluwaferanmi", paid: false },
  { matric: "250201055", name: "Fadare Fadeshola", paid: false },
  { matric: "250201015", name: "Fakorede Aliyah", paid: false },
  { matric: "250201406", name: "Farayibi Daniel", paid: false },
  { matric: "250201063", name: "Fashina Ifeoluwa", paid: false },
  { matric: "250201023", name: "Folorunsho Mosunmola", paid: false },
  { matric: "250201382", name: "Garuba Aishat", paid: false },
  { matric: "250201112", name: "Hamzah Fareedah", paid: false },
  { matric: "250201044", name: "Hassan Eniola", paid: false },
  { matric: "250201381", name: "Hussein Mutmainnah", paid: false },
  { matric: "250201288", name: "Huthman Sheriffdeen", paid: false },
  { matric: "250201106", name: "Ibitoye Olawumi", paid: false },
  { matric: "250201339", name: "Ibrahim Aleeyat", paid: false },
  { matric: "250201022", name: "Ilori Oluwatofunmi", paid: false },
  { matric: "250201389", name: "Imran Al-Ameen", paid: false },
  { matric: "250201361", name: "Isogun Oluwasegun", paid: false },
  { matric: "250201031", name: "John Chisom", paid: false },
  { matric: "250201030", name: "Kalu Glory", paid: false },
  { matric: "250201025", name: "Kayode Adebakin", paid: false },
  { matric: "250201068", name: "Kazeem Abdullateef", paid: false },
  { matric: "250201010", name: "Kelani Victor", paid: false },
  { matric: "250201071", name: "Kila Khadijah", paid: false },
  { matric: "250201295", name: "Lamidi Emmanuel", paid: false },
  { matric: "250201392", name: "Lisa Adam", paid: false },
  { matric: "250201397", name: "Makanjuola Halleluyah", paid: false },
  { matric: "250201383", name: "Mobolade Zainab", paid: false },
  { matric: "250201334", name: "Monsuru Abdul", paid: false },
  { matric: "250201036", name: "Morawo Adedayo", paid: false },
  { matric: "250201399", name: "Mustapha Abdul", paid: false },
  { matric: "250201319", name: "Mustapha Amirat", paid: false },
  { matric: "250201344", name: "Njoku Francis", paid: false },
  { matric: "250201016", name: "Nnadi Francis", paid: false },
  { matric: "250201333", name: "Nwankwo Favour", paid: false },
  { matric: "250201033", name: "Nwofia Jedidah", paid: false },
  { matric: "250201320", name: "Obasesan-Yusuf Jafar", paid: false },
  { matric: "250201362", name: "Odio Esther", paid: false },
  { matric: "250201291", name: "Odughu Gift", paid: false },
  { matric: "250201113", name: "Odusola Moyinoluwa", paid: false },
  { matric: "250201390", name: "Oduwaye Toluwalase", paid: false },
  { matric: "250201321", name: "Ogbeide Serena", paid: false },
  { matric: "250201020", name: "Ogunbayo Anuoluwapo", paid: false },
  { matric: "250201401", name: "Ogunfowokan Oluwatetisimi", paid: false },
  { matric: "250201024", name: "Ogunkoya Oluwademilade", paid: false },
  { matric: "250201323", name: "Ojora Roheem", paid: false },
  { matric: "250201003", name: "Okunubi Mujeeb", paid: false },
  { matric: "250201394", name: "Ola Selimot", paid: false },
  { matric: "250201108", name: "Olabamerun Inioluwa", paid: false },
  { matric: "250201335", name: "Oladimeji Isaac", paid: false },
  { matric: "250201064", name: "Oladiran Praise", paid: false },
  { matric: "250201289", name: "Oladunjoye Opemipo", paid: false },
  { matric: "250201296", name: "Oladuntoye Oluwatimilehin", paid: false },
  { matric: "250201348", name: "Olaitan Oluwanifemi", paid: false },
  { matric: "250201375", name: "Olajire Quam", paid: false },
  { matric: "250201299", name: "Olaleye Mopelola", paid: false },
  { matric: "250201045", name: "Olanrewaju Daniel", paid: false },
  { matric: "250201303", name: "Olanrewaju Juliet", paid: false },
  { matric: "250201001", name: "Olaosun Isaac", paid: false },
  { matric: "250201364", name: "Olasunkanmi Mariam", paid: false },
  { matric: "250201105", name: "Olasunmiboye Adedamola", paid: false },
  { matric: "250201331", name: "Olomo Adeshina", paid: false },
  { matric: "250201065", name: "Olufade Oluwaseyi", paid: false },
  { matric: "250201395", name: "Olulana Ibukunoluwa", paid: false },
  { matric: "250201043", name: "Oluwalajiki Deborah", paid: false },
  { matric: "250201347", name: "Oluwole Oluwakayode", paid: false },
  { matric: "250201019", name: "Omeje Somfe", paid: false },
  { matric: "250201051", name: "Omeke Precious", paid: false },
  { matric: "250201354", name: "Omereme Ifeanyi", paid: false },
  { matric: "250201330", name: "Oni Daniel", paid: false },
  { matric: "250201318", name: "Oni Victoria", paid: false },
  { matric: "250201360", name: "Opeyemi Faithful", paid: false },
  { matric: "250201324", name: "Osebeyo Emmanuel", paid: false },
  { matric: "250201317", name: "Oviawe Faith", paid: false },
  { matric: "250201342", name: "Oyebadejo Tobiloba", paid: false },
  { matric: "250201371", name: "Oyebulu Olayiwola", paid: false },
  { matric: "250201336", name: "Oyeniran Olamide", paid: false },
  { matric: "250201363", name: "Oyeniyi-Okedun Christiana", paid: false },
  { matric: "250201067", name: "Princewill Joy-Abasi", paid: false },
  { matric: "250201002", name: "Quadri Oluwaseni", paid: false },
  { matric: "250201372", name: "Sajowa Kehinde", paid: false },
  { matric: "250201357", name: "Salamade Adesola", paid: false },
  { matric: "250201114", name: "Salau Misturah", paid: false },
  { matric: "250201386", name: "Samuel Eniola", paid: false },
  { matric: "250201027", name: "Sani Mubarak", paid: false },
  { matric: "250201026", name: "Shittu Olamiposi", paid: false },
  { matric: "250201332", name: "Shiyanbade Faderera", paid: false },
  { matric: "250201316", name: "Shobayo Malik", paid: false },
  { matric: "250201297", name: "Sobur Kotun", paid: false },
  { matric: "250201346", name: "Ugo Onyekachi", paid: false },
  { matric: "250201405", name: "Uthman Omonifemi", paid: false },
  { matric: "250201048", name: "Uzoechi Chika", paid: false },
  { matric: "250201110", name: "Yusuf Abdul-azeez", paid: false },
  { matric: "250201004", name: "Yusuph Aishat", paid: false }
];

// Load persisted payments from localStorage
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
    console.error("Error loading stored dues", e);
  }
}

// Global UI Updater for Logged-In Student Dues
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

// Global Admin Table Renderer
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

        // Persist change to localStorage
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

const duesAdminSearchInput = document.getElementById('duesAdminSearchInput');
if (duesAdminSearchInput) {
  duesAdminSearchInput.addEventListener('input', (e) => {
    window.renderAdminDuesTable(e.target.value.toLowerCase().trim());
  });
}

const downloadDuesReceiptBtn = document.getElementById('downloadDuesReceiptBtn');
if (downloadDuesReceiptBtn) {
  downloadDuesReceiptBtn.addEventListener('click', () => {
    alert("Downloading official ACC '29 Class Dues payment receipt...");
  });
}

    // Fetch existing announcements on page load
async function fetchInitialAnnouncements() {
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
        container.innerHTML = ''; // Clear default static placeholders
        data.forEach(notice => renderNoticeCard(notice));
    }
}

// Subscribe to real-time additions
function subscribeToRealtimeAnnouncements() {
    supabase
        .channel('public:announcements')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
            renderNoticeCard(payload.new, true);
        })
        .subscribe();
}

// Helper to format YYYY-MM-DD into "Month Day, Year"
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

// Update Active Announcements Counter
function updateNoticeCount() {
    const countBadge = document.getElementById('activeNoticeCount');
    const container = document.getElementById('noticesContainer');
    if (countBadge && container) {
        const total = container.querySelectorAll('article').length;
        countBadge.textContent = `${total} Active Announcement${total === 1 ? '' : 's'}`;
    }
}

// Render Notice Card using category and formatted date
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

// Execute initial load and real-time listener
fetchInitialAnnouncements();
subscribeToRealtimeAnnouncements();

    // --- 2. GPA CALCULATOR SEMESTER TOGGLE ---
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

    // --- 3. DYNAMIC FULL YEAR CALENDAR & EVENTS HANDLER ---
    let currentCalendarDate = new Date();
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const calendarMonthYearText = document.getElementById("calendarMonthYearText");
    const calendarGridDays = document.getElementById("calendarGridDays");

    const focusedEventTitle = document.getElementById("focusedEventTitle");
    const focusedEventDate = document.getElementById("focusedEventDate");
    const focusedEventText = document.getElementById("focusedEventText");

    // Sample Event Repository indexed by YYYY-MM-DD
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

    function renderCalendar(dateObj) {
        if (!calendarGridDays || !calendarMonthYearText) return;

        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calendarMonthYearText.textContent = `${monthNames[month]} ${year}`;

        calendarGridDays.innerHTML = `
            <div class="day-label">MON</div><div class="day-label">TUE</div><div class="day-label">WED</div>
            <div class="day-label">THU</div><div class="day-label">FRI</div><div class="day-label">SAT</div><div class="day-label">SUN</div>
        `;

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday start
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        const today = new Date();

        // Previous Month Days
        for (let x = firstDayIndex; x > 0; x--) {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day-num muted";
            dayDiv.textContent = prevLastDay - x + 1;
            calendarGridDays.appendChild(dayDiv);
        }

        // Current Month Days
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day-num";
            dayDiv.textContent = i;
            dayDiv.style.cursor = "pointer";

            const monthFormatted = String(month + 1).padStart(2, "0");
            const dayFormatted = String(i).padStart(2, "0");
            const dateKey = `${year}-${monthFormatted}-${dayFormatted}`;

            // Highlight Today
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add("today-highlight");
            }

            // Date Click Event Listener
            dayDiv.addEventListener("click", function () {
                document.querySelectorAll(".day-num").forEach(d => d.classList.remove("selected-day"));
                this.classList.add("selected-day");

                const displayDateStr = `${monthNames[month]} ${i}, ${year}`;
                
                if (sampleEvents[dateKey]) {
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

    // Initial Calendar Render
    renderCalendar(currentCalendarDate);
});
// Student Directory Mapping (Matric Number -> Clean Display Name)
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

// Function to update the greeting and header profile menu
function setStudentDisplayName(matricNumber) {
    const cleanMatric = String(matricNumber).trim();
    const displayName = studentDirectory[cleanMatric] || "Trailblazer";

    // Update Hero Greeting Header
    const greetingHeader = document.querySelector(".welcome-greeting h2");
    if (greetingHeader) {
        greetingHeader.innerHTML = `${displayName} <i class="fa-solid fa-circle-check verified-badge-icon"></i>`;
    }

    // Update Dropdown Name Label
    const dropdownNameLabel = document.getElementById("dropdownUserName");
    if (dropdownNameLabel) {
        dropdownNameLabel.textContent = displayName;
    }
}