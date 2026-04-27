// ── Affirmations List ──────────────────────────
const API_BASE_URL = 'http://127.0.0.1:5000';
const affirmations = [
    "You are stronger than you think. One step at a time.",
    "It's okay to not be okay. Healing is not linear.",
    "Your feelings are valid. You deserve care and compassion.",
    "Every day is a fresh start. You've got this.",
    "Small progress is still progress. Be proud of yourself.",
    "You are not alone. There are people who care about you.",
    "Taking care of your mind is the bravest thing you can do.",
    "Breathe. This moment will pass.",
    "Courage doesn't mean you don't feel fear. It means you move forward anyway.",
    "Rest is productive. Give yourself permission to pause.",
    "You have survived every difficult day so far. That's 100% success.",
];



const affirmationsHi = [
    "आप अपनी सोच से भी ज्यादा मजबूत हैं। एक बार में एक कदम बढ़ाएं।",
    "ठीक न होना भी ठीक है। ठीक होने की प्रक्रिया सीधी रेखा में नहीं होती।",
    "आपकी भावनाएं सही हैं। आप देखभाल और करुणा के पात्र हैं।",
    "हर दिन एक नई शुरुआत है। आप यह कर सकते हैं।",
    "छोटी प्रगति भी प्रगति है। खुद पर गर्व करें।",
    "आप अकेले नहीं हैं। ऐसे लोग हैं जो आपकी परवाह करते हैं।",
    "अपने मन का ख्याल रखना सबसे बहादुरी का काम है जो आप कर सकते हैं।",
    "सांस लें। यह पल भी बीत जाएगा।",
    "साहस का मतलब यह नहीं कि आपको डर नहीं लगता। इसका मतलब है कि आप फिर भी आगे बढ़ते हैं।",
    "आराम करना भी उत्पादक है। खुद को रुकने की अनुमति दें।",
    "आपने अब तक हर कठिन दिन का सामना किया है। यह 100% सफलता है।"
];

const activeAffirmations = (typeof APP_LANG !== 'undefined' && APP_LANG === 'hi') ? affirmationsHi : affirmations;

let currentQuoteIndex = -1;

function showRandomQuote() {
    const el = document.getElementById('affirmationText');
    let newIndex;
    do { newIndex = Math.floor(Math.random() * affirmations.length); }
    while (newIndex === currentQuoteIndex);
    currentQuoteIndex = newIndex;

    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = activeAffirmations[currentQuoteIndex];
        el.style.opacity = '1';
    }, 300);
}

// ── Time-based Greeting ────────────────────────
function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17 && hour < 21) greeting = 'Good Evening';
    else if (hour >= 21 || hour < 5) greeting = 'Good Night';
    if (window.t) {
        greeting = window.t(greeting);
    }
    document.getElementById('timeGreeting').textContent = greeting;
}

// ── Load User Name (from localStorage after login) ──
function loadUserName() {
    const storedUser = JSON.parse(localStorage.getItem('mindcare_user') || 'null');
    const name = storedUser?.name || localStorage.getItem('mindcare_user_name');
    if (name) {
        document.getElementById('userName').textContent = name.split(' ')[0]; // First name only
    }
}

// ── Load Stats (from localStorage after quiz) ──
function loadStats() {
    let score = null;
    try {
        const quizData = JSON.parse(localStorage.getItem('mindcare_quiz'));
        if (quizData && quizData.score !== undefined) {
            score = quizData.score;
        }
    } catch (e) { }
    const sessions = localStorage.getItem('mindcare_sessions') || '0';

    const statScoreEl = document.getElementById('statScore');
    if (statScoreEl) statScoreEl.textContent = score ? `${score}/40` : '—';

    // Streaks have been removed.
    const statSessionsEl = document.getElementById('statSessions');
    if (statSessionsEl) statSessionsEl.textContent = sessions ? sessions : '—';
}

// ── Mood Tracker ──────────────────────────────
function initMoodTracker() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    const today = new Date().toDateString();
    const savedMood = localStorage.getItem('mindcare_mood_' + today);

    moodBtns.forEach(btn => {
        if (btn.dataset.mood === savedMood) btn.classList.add('selected');

        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            localStorage.setItem('mindcare_mood_' + today, btn.dataset.mood);
            showToast(`Mood logged: ${btn.textContent} — Thank you for checking in!`);

            // Push to mood history for the chart
            let moodVal = 3;
            if (btn.dataset.mood === 'rough') moodVal = 1;
            if (btn.dataset.mood === 'low') moodVal = 2;
            if (btn.dataset.mood === 'okay') moodVal = 3;
            if (btn.dataset.mood === 'good') moodVal = 4;
            if (btn.dataset.mood === 'great') moodVal = 5;

            let history = [];
            try { history = JSON.parse(localStorage.getItem('mindcare_moodHistory')) || []; } catch (e) { }
            history.push({ session: 'Check-in ' + (history.length + 1), val: moodVal });
            localStorage.setItem('mindcare_moodHistory', JSON.stringify(history));

            // Update sessions count
            let sessions = parseInt(localStorage.getItem('mindcare_sessions') || '0');
            sessions++;
            localStorage.setItem('mindcare_sessions', sessions);
            const sessionEl = document.getElementById('statSessions');
            if (sessionEl) sessionEl.textContent = sessions;

            const token = localStorage.getItem('mindcare_token');
            if (token) {
                fetch(`${API_BASE_URL}/api/mood`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        score: moodVal,
                        note: `Quick check-in: ${btn.dataset.mood}`
                    })
                }).catch(err => console.error('Mood sync failed:', err));
            }
        });
    });
}

// ── Toast Notification ─────────────────────────
function showToast(message) {
    // Remove existing toast if any
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ── Logout Handler ─────────────────────────────
function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        // Clear session info (keep quiz score for returning users)
        localStorage.removeItem('mindcare_user_name');
        localStorage.removeItem('mindcare_token');
        window.location.href = 'login.html';
    }
}

// ── Card Staggered Animation ───────────────────
function animateCards() {
    const cards = document.querySelectorAll('.hub-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.5s ease ${0.1 + i * 0.1}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.1}s`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });
    });
}

// ── Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setGreeting();
    loadUserName();
    loadStats();
    initMoodTracker();
    animateCards();
    showRandomQuote(); // Show initial quote

    // Refresh quote button
    document.getElementById('refreshQuote').addEventListener('click', showRandomQuote);

    // Auto-cycle quote every 15 seconds
    setInterval(showRandomQuote, 15000);
});
