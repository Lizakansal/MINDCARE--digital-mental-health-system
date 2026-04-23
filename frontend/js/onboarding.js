/* ============================================
   onboarding.js — MindCare Onboarding Quiz
   Bilingual (English / Hindi), 10 questions
   ============================================ */

// ── Quiz Data ───────────────────────────────
const QUIZ = [
    {
        category: { en: 'Mood', hi: 'मनोदशा' },
        icon: '😊',
        question: {
            en: 'How would you describe your overall mood lately?',
            hi: 'आजकल आपका मूड (मनोदशा) कैसा रहता है?'
        },
        options: [
            { en: 'Very low — sad most of the time', hi: 'बहुत उदास — ज़्यादातर समय दुखी रहता/रहती हूँ', score: 1 },
            { en: 'Down, not feeling great', hi: 'नीचे — अच्छा नहीं लग रहा', score: 2 },
            { en: 'Okay, managing well enough', hi: 'ठीक-ठाक, किसी तरह चल रहा है', score: 3 },
            { en: 'Good to great — feeling positive', hi: 'अच्छा या बहुत अच्छा — सकारात्मक महसूस हो रहा', score: 4 }
        ]
    },
    {
        category: { en: 'Anxiety', hi: 'चिंता' },
        icon: '😰',
        question: {
            en: 'How often do you feel worried or anxious without a clear reason?',
            hi: 'क्या आपको अक्सर बिना किसी कारण के घबराहट या चिंता होती है?'
        },
        options: [
            { en: 'Almost all the time', hi: 'लगभग हमेशा', score: 1 },
            { en: 'Quite often', hi: 'अक्सर', score: 2 },
            { en: 'Sometimes — not too bad', hi: 'कभी-कभी — ज़्यादा नहीं', score: 3 },
            { en: 'Rarely or never', hi: 'बहुत कम या कभी नहीं', score: 4 }
        ]
    },
    {
        category: { en: 'Sleep', hi: 'नींद' },
        icon: '😴',
        question: {
            en: 'How has your sleep been recently?',
            hi: 'आजकल आपकी नींद कैसी है?'
        },
        options: [
            { en: 'Very poor — can\'t sleep or sleeping too much', hi: 'बहुत खराब — नींद नहीं आती या बहुत ज़्यादा सोता/सोती हूँ', score: 1 },
            { en: 'Often disturbed or restless', hi: 'अक्सर बाधित या बेचैन', score: 2 },
            { en: 'Mostly okay, occasional issues', hi: 'ज़्यादातर ठीक, कभी-कभी दिक्कत', score: 3 },
            { en: 'Sleeping well and waking refreshed', hi: 'अच्छी नींद आती है, तरोताज़ा उठता/उठती हूँ', score: 4 }
        ]
    },
    {
        category: { en: 'Social', hi: 'सामाजिकता' },
        icon: '🤝',
        question: {
            en: 'How do you feel about spending time with others?',
            hi: 'लोगों के साथ समय बिताने के बारे में आप कैसा महसूस करते हैं?'
        },
        options: [
            { en: 'I avoid everyone and prefer isolation', hi: 'मैं सबसे दूर रहता/रहती हूँ, अकेला रहना पसंद है', score: 1 },
            { en: 'I find it hard but sometimes manage', hi: 'मुश्किल लगता है पर कभी-कभी कर लेता/लेती हूँ', score: 2 },
            { en: 'I enjoy it sometimes', hi: 'कभी-कभी अच्छा लगता है', score: 3 },
            { en: 'I love being around people', hi: 'मुझे लोगों के साथ रहना बहुत पसंद है', score: 4 }
        ]
    },
    {
        category: { en: 'Energy', hi: 'ऊर्जा' },
        icon: '⚡',
        question: {
            en: 'How energetic do you feel during the day?',
            hi: 'दिन भर आप कितना ऊर्जावान महसूस करते हैं?'
        },
        options: [
            { en: 'Exhausted all the time', hi: 'हमेशा थका हुआ/थकी हुई', score: 1 },
            { en: 'Low energy, hard to get things done', hi: 'कम ऊर्जा, काम करना मुश्किल', score: 2 },
            { en: 'Moderate energy, getting by', hi: 'ठीक-ठाक ऊर्जा, काम हो जाता है', score: 3 },
            { en: 'Full of energy and motivation', hi: 'भरपूर ऊर्जा और उत्साह', score: 4 }
        ]
    },
    {
        category: { en: 'Stress', hi: 'तनाव' },
        icon: '😤',
        question: {
            en: 'How much pressure do you feel from work, studies, or responsibilities?',
            hi: 'काम, पढ़ाई या ज़िम्मेदारियों का कितना दबाव महसूस होता है?'
        },
        options: [
            { en: 'Overwhelming — I can\'t cope', hi: 'बहुत ज़्यादा — संभाल नहीं पा रहा/रही', score: 1 },
            { en: 'Quite a lot, struggling', hi: 'काफी ज़्यादा, मुश्किल हो रहा है', score: 2 },
            { en: 'Some pressure but manageable', hi: 'थोड़ा दबाव, पर संभल जाता है', score: 3 },
            { en: 'Minimal — handling things well', hi: 'बहुत कम — सब अच्छे से हो जाता है', score: 4 }
        ]
    },
    {
        category: { en: 'Self-Worth', hi: 'आत्म-मूल्य' },
        icon: '💙',
        question: {
            en: 'How do you feel about yourself as a person?',
            hi: 'एक इंसान के रूप में आप खुद के बारे में कैसा महसूस करते हैं?'
        },
        options: [
            { en: 'I feel worthless and dislike myself', hi: 'मुझे लगता है मैं बेकार हूँ, खुद से नफरत है', score: 1 },
            { en: 'Often doubt myself and my abilities', hi: 'अक्सर खुद पर और अपनी काबिलियत पर शक होता है', score: 2 },
            { en: 'Mostly okay, some self-doubt', hi: 'ज़्यादातर ठीक, थोड़ा शक रहता है', score: 3 },
            { en: 'Confident and value myself', hi: 'आत्मविश्वासी हूँ और खुद को अहमियत देता/देती हूँ', score: 4 }
        ]
    },
    {
        category: { en: 'Hope', hi: 'उम्मीद' },
        icon: '🌅',
        question: {
            en: 'How do you feel about your future?',
            hi: 'आपको अपने भविष्य के बारे में कैसा लगता है?'
        },
        options: [
            { en: 'Hopeless — things will never improve', hi: 'कोई उम्मीद नहीं — कुछ नहीं बदलेगा', score: 1 },
            { en: 'Not very hopeful', hi: 'ज़्यादा उम्मीद नहीं', score: 2 },
            { en: 'Somewhat hopeful', hi: 'थोड़ी उम्मीद है', score: 3 },
            { en: 'Optimistic and excited about the future', hi: 'उत्साहित हूँ, भविष्य को लेकर सकारात्मक हूँ', score: 4 }
        ]
    },
    {
        category: { en: 'Coping', hi: 'समाधान' },
        icon: '🛡️',
        question: {
            en: 'When you face a difficult situation, what do you usually do?',
            hi: 'जब कोई मुश्किल आती है तो आप क्या करते हैं?'
        },
        options: [
            { en: 'Shut down completely or feel paralyzed', hi: 'बिल्कुल टूट जाता/जाती हूँ, कुछ नहीं कर पाता/पाती', score: 1 },
            { en: 'Avoid it and hope it goes away', hi: 'आँखें मूँद लेता/लेती हूँ, उम्मीद करता/करती हूँ ठीक हो जाएगा', score: 2 },
            { en: 'Try to manage with some difficulty', hi: 'कोशिश करता/करती हूँ, थोड़ी मुश्किल होती है', score: 3 },
            { en: 'Face it calmly and find solutions', hi: 'शांति से सामना करता/करती हूँ और हल ढूँढता/ढूँढती हूँ', score: 4 }
        ]
    },
    {
        category: { en: 'Support', hi: 'सहारा' },
        icon: '🤗',
        question: {
            en: 'Do you have someone you can talk to when you\'re struggling?',
            hi: 'क्या आपके पास कोई है जिससे आप मुश्किल समय में बात कर सकते हैं?'
        },
        options: [
            { en: 'No one at all — I feel completely alone', hi: 'कोई नहीं — बिल्कुल अकेला/अकेली हूँ', score: 1 },
            { en: 'Not really — very limited support', hi: 'ज़्यादा नहीं — बहुत कम सहारा', score: 2 },
            { en: 'A few people I can turn to', hi: 'कुछ लोग हैं जिनसे बात कर सकता/सकती हूँ', score: 3 },
            { en: 'Strong support from family or friends', hi: 'परिवार या दोस्तों का मज़बूत सहारा है', score: 4 }
        ]
    }
];

// ── Result Levels ───────────────────────────
const LEVELS = [
    {
        min: 35,
        emoji: '🌟',
        level: { en: 'Thriving', hi: 'बहुत अच्छे' },
        color: '#43C6AC',
        msg: {
            en: 'You seem to be in a great place mentally! Keep nurturing your wellbeing and support those around you.',
            hi: 'आप मानसिक रूप से बहुत अच्छी स्थिति में हैं! अपनी भलाई का ख्याल रखें और दूसरों का भी साथ दें।'
        },
        tip: {
            en: '💡 Keep building on your strengths. Consider journaling, mindfulness, or helping others.',
            hi: '💡 अपनी शक्तियों को और निखारें। जर्नलिंग, माइंडफुलनेस या दूसरों की मदद करें।'
        }
    },
    {
        min: 25,
        emoji: '😊',
        level: { en: 'Doing Well', hi: 'ठीक हैं' },
        color: '#6C63FF',
        msg: {
            en: 'You\'re managing life pretty well! There are a few areas to strengthen — MindCare is here for you.',
            hi: 'आप जीवन को अच्छे से संभाल रहे हैं! कुछ क्षेत्रों पर ध्यान देना फायदेमंद होगा — MindCare आपके साथ है।'
        },
        tip: {
            en: '💡 Focus on sleep, social connections, and small daily wins. You\'re doing great!',
            hi: '💡 नींद, सामाजिक संबंध और छोटी-छोटी दैनिक सफलताओं पर ध्यान दें। आप बहुत अच्छा कर रहे हैं!'
        }
    },
    {
        min: 15,
        emoji: '🌿',
        level: { en: 'Needs Care', hi: 'देखभाल ज़रूरी' },
        color: '#f0a500',
        msg: {
            en: 'You may be going through a tough phase. With the right support and tools, things can get better.',
            hi: 'शायद आप एक कठिन दौर से गुज़र रहे हैं। सही सहारे और साधनों से चीज़ें बेहतर हो सकती हैं।'
        },
        tip: {
            en: '💡 Talk to someone you trust. Try our guided sessions and resources in the dashboard.',
            hi: '💡 किसी विश्वसनीय व्यक्ति से बात करें। डैशबोर्ड में गाइडेड सेशन और संसाधन आज़माएं।'
        }
    },
    {
        min: 0,
        emoji: '💙',
        level: { en: 'Seeking Help', hi: 'मदद की ज़रूरत' },
        color: '#e05c5c',
        msg: {
            en: 'It looks like you\'re going through a really hard time. You\'re not alone — our professionals are here.',
            hi: 'लग रहा है आप बहुत कठिन समय से गुज़र रहे हैं। आप अकेले नहीं हैं — हमारे विशेषज्ञ आपके साथ हैं।'
        },
        tip: {
            en: '💡 Please consider speaking to a counselor. Use the Connect button in your dashboard anytime.',
            hi: '💡 कृपया किसी परामर्शदाता से बात करने पर विचार करें। डैशबोर्ड में Connect बटन का उपयोग करें।'
        }
    }
];

// ── UI Labels (bilingual) ───────────────────
const UI = {
    en: {
        questionOf: (c, t) => `Q ${c} / ${t}`,
        back: 'Back',
        skip: 'Skip',
        dashboard: 'Go to Dashboard',
        retake: 'Retake Quiz',
        crisis: 'In crisis? Call',
        privacy: 'Your responses are private and only used to personalize your experience.'
    },
    hi: {
        questionOf: (c, t) => `प्रश्न ${c} / ${t}`,
        back: 'पीछे',
        skip: 'छोड़ें',
        dashboard: 'डैशबोर्ड पर जाएं',
        retake: 'दोबारा लें',
        crisis: 'संकट में हैं? कॉल करें',
        privacy: 'आपके जवाब निजी हैं और केवल आपके अनुभव को व्यक्तिगत बनाने के लिए उपयोग किए जाते हैं।'
    }
};

// ── State ───────────────────────────────────
let lang = localStorage.getItem('mindcare_lang') || null;
let current = 0;        // current question index
let answers = new Array(QUIZ.length).fill(null); // null = unanswered
const LETTERS = ['A', 'B', 'C', 'D'];

// ── Helper: show a screen ───────────────────
function showScreen(id) {
    document.querySelectorAll('.ob-screen').forEach(s => {
        s.classList.remove('active', 'exit-left');
    });
    const target = document.getElementById(id);
    // Trigger reflow then activate
    requestAnimationFrame(() => {
        target.classList.add('active');
    });
}

// ── LANGUAGE SELECTION ──────────────────────
function selectLang(chosen) {
    lang = chosen;
    localStorage.setItem('mindcare_lang', lang);

    // Visual feedback on selected card
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('selected'));
    const btnId = chosen === 'en' ? 'btnEnglish' : 'btnHindi';
    document.getElementById(btnId).classList.add('selected');

    // Short delay for animation, then go to quiz
    setTimeout(() => {
        current = 0;
        answers.fill(null);
        renderQuestion();
        showScreen('quizScreen');
    }, 380);
}

// Switch language mid-quiz
function switchLang() {
    lang = lang === 'en' ? 'hi' : 'en';
    localStorage.setItem('mindcare_lang', lang);
    renderQuestion(false); // re-render without resetting answer
}

// ── QUIZ RENDERING ──────────────────────────
function renderQuestion(animate = true) {
    const q = QUIZ[current];
    const L = UI[lang];
    const pct = ((current + 1) / QUIZ.length) * 100;

    // Badge & category
    document.getElementById('qBadge').textContent = L.questionOf(current + 1, QUIZ.length);
    document.getElementById('qCategory').textContent = q.category[lang];
    document.getElementById('backLabel').textContent = L.back;
    document.getElementById('skipLabel').textContent = L.skip;

    // Progress bar
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressGlow').style.left = pct + '%';

    // Icon (re-trigger animation)
    const iconEl = document.getElementById('qIcon');
    iconEl.style.animation = 'none';
    iconEl.offsetHeight; // reflow
    iconEl.style.animation = '';
    iconEl.textContent = q.icon;

    // Question text
    const textEl = document.getElementById('qText');
    if (animate) {
        textEl.style.animation = 'none';
        textEl.offsetHeight;
        textEl.style.animation = '';
    }
    textEl.textContent = q.question[lang];

    // Options
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn' + (answers[current] === i ? ' selected' : '');
        btn.id = `opt_${i}`;
        btn.setAttribute('aria-pressed', answers[current] === i ? 'true' : 'false');
        btn.innerHTML = `
            <span class="option-letter">${LETTERS[i]}</span>
            <span class="option-text">${opt[lang]}</span>
        `;
        btn.addEventListener('click', () => selectOption(i));
        grid.appendChild(btn);
    });

    // Show/hide back button
    document.getElementById('btnPrev').style.visibility = current === 0 ? 'hidden' : 'visible';
}

// ── SELECT OPTION ───────────────────────────
function selectOption(index) {
    answers[current] = index;

    // Update UI immediately
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
        btn.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });

    // Auto-advance after 480ms
    setTimeout(() => {
        if (current < QUIZ.length - 1) {
            current++;
            renderQuestion();
        } else {
            showResults();
        }
    }, 480);
}

// ── NAVIGATION ──────────────────────────────
function prevQuestion() {
    if (current > 0) {
        current--;
        renderQuestion();
    }
}

function skipQuestion() {
    answers[current] = null; // mark as skipped
    if (current < QUIZ.length - 1) {
        current++;
        renderQuestion();
    } else {
        showResults();
    }
}

// ── RESULTS ─────────────────────────────────
function showResults() {
    // Calculate score (skipped = 0 points)
    const totalScore = answers.reduce((sum, ans, i) => {
        return sum + (ans !== null ? QUIZ[i].options[ans].score : 0);
    }, 0);

    // Find level
    const level = LEVELS.find(l => totalScore >= l.min);

    // Update SVG ring colour dynamically
    injectRingGradient(level.color);

    // Set content
    document.getElementById('resultEmoji').textContent = level.emoji;
    document.getElementById('resultLevel').textContent = level.level[lang];
    document.getElementById('resultMsg').textContent = level.msg[lang];
    document.getElementById('resultTip').textContent = level.tip[lang];
    document.getElementById('dashLabel').textContent = UI[lang].dashboard;
    document.getElementById('retakeLabel').textContent = UI[lang].retake;
    document.getElementById('crisisLabel').textContent = UI[lang].crisis;

    // Category tags
    const tagsEl = document.getElementById('resultTags');
    tagsEl.innerHTML = '';
    QUIZ.forEach((q, i) => {
        const ans = answers[i];
        const score = ans !== null ? q.options[ans].score : 0;
        const cls = score >= 3 ? 'good' : score === 2 ? 'mid' : 'low';
        const tag = document.createElement('span');
        tag.className = `r-tag ${cls}`;
        tag.textContent = `${q.icon} ${q.category[lang]}`;
        tagsEl.appendChild(tag);
    });

    // Switch screen
    showScreen('resultScreen');

    // Animate score ring + number after transition
    setTimeout(() => {
        const circumference = 2 * Math.PI * 50; // 314.16
        const offset = circumference - (totalScore / 40) * circumference;
        document.getElementById('ringFill').style.strokeDashoffset = offset;

        // Animated score counter
        const numEl = document.getElementById('scoreNum');
        const target = totalScore;
        let current = 0;
        const step = Math.ceil(target / 30);
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            numEl.textContent = current;
            if (current >= target) clearInterval(timer);
        }, 40);
    }, 400);

    // Save to localStorage for dashboard fallback
    const quizResult = {
        score: totalScore,
        level: level.level.en,
        answers: answers,
        lang: lang,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('mindcare_quiz', JSON.stringify(quizResult));

    // ---- Send to Backend ----
    const user = JSON.parse(localStorage.getItem('mindcare_user'));
    if (user && user.email) {
        fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...quizResult,
                email: user.email
            })
        })
        .then(res => res.json())
        .then(data => console.log('Quiz saved to server:', data))
        .catch(err => console.error('Error saving quiz:', err));
    }
}

function injectRingGradient(color) {
    // Inject or update SVG linearGradient
    let defs = document.querySelector('.score-ring defs');
    if (!defs) {
        const svg = document.querySelector('.score-ring');
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.prepend(defs);
    }
    defs.innerHTML = `
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#6C63FF"/>
            <stop offset="100%" stop-color="${color}"/>
        </linearGradient>`;
    document.getElementById('ringFill').setAttribute('stroke', 'url(#ringGrad)');
}

// ── CTA ACTIONS ─────────────────────────────
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function retakeQuiz() {
    current = 0;
    answers.fill(null);
    document.getElementById('ringFill').style.strokeDashoffset = '314';
    renderQuestion();
    showScreen('quizScreen');
}

// ── INIT ─────────────────────────────────────
(function init() {
    // If language already saved, jump straight to quiz
    if (lang) {
        renderQuestion(false);
        showScreen('quizScreen');
    } else {
        showScreen('langScreen');
    }
})();
