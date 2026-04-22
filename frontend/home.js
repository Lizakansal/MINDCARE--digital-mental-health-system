/* ============================================
   MindCare — Welcome Hub Logic (home.js)
   ============================================ */

// ── Affirmations List ──────────────────────────
const affirmations = [
    "You are stronger than you think. One step at a time.",
    "It's okay to not be okay. Healing is not linear.",
    "Your feelings are valid. You deserve care and compassion.",
    "Every day is a fresh start. You've got this.",
    "Small progress is still progress. Be proud of yourself.",
    "You are not alone. There are people who care about you.",
    "Taking care of your mind is the bravest thing you can do.",
    "Breathe. This moment will pass.",
    "आप अकेले नहीं हैं — मदद हमेशा पास है।",
    "Courage doesn't mean you don't feel fear. It means you move forward anyway.",
    "Rest is productive. Give yourself permission to pause.",
    "You have survived every difficult day so far. That's 100% success.",
];

let currentQuoteIndex = -1;

function showRandomQuote() {
    const el = document.getElementById('affirmationText');
    let newIndex;
    do { newIndex = Math.floor(Math.random() * affirmations.length); }
    while (newIndex === currentQuoteIndex);
    currentQuoteIndex = newIndex;

    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = affirmations[currentQuoteIndex];
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
    document.getElementById('timeGreeting').textContent = greeting;
}

// ── Load User Name (from localStorage after login) ──
function loadUserName() {
    const name = localStorage.getItem('mindcare_user_name');
    if (name) {
        document.getElementById('userName').textContent = name.split(' ')[0]; // First name only
    }
}

// ── Load Stats (from localStorage after quiz) ──
function loadStats() {
    const score   = localStorage.getItem('mindcare_quiz_score');
    const streak  = localStorage.getItem('mindcare_streak') || '0';
    const sessions = localStorage.getItem('mindcare_sessions') || '0';

    document.getElementById('statScore').textContent   = score   ? `${score}/40` : '—';
    document.getElementById('statStreak').textContent  = streak  ? `${streak}🔥`  : '—';
    document.getElementById('statSessions').textContent = sessions ? sessions      : '—';
}

// ── Mood Tracker ──────────────────────────────
function initMoodTracker() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    const today    = new Date().toDateString();
    const savedMood = localStorage.getItem('mindcare_mood_' + today);

    moodBtns.forEach(btn => {
        if (btn.dataset.mood === savedMood) btn.classList.add('selected');

        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            localStorage.setItem('mindcare_mood_' + today, btn.dataset.mood);
            showToast(`Mood logged: ${btn.textContent} — Thank you for checking in!`);

            // Update sessions count
            let sessions = parseInt(localStorage.getItem('mindcare_sessions') || '0');
            sessions++;
            localStorage.setItem('mindcare_sessions', sessions);
            document.getElementById('statSessions').textContent = sessions;
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
