// ============================================================
//  MindCare — AI Chatbot v2.0 (ChatGPT-level)
//
//  UPGRADES:
//  1. Emotion Detection — user ka mood samajhta hai
//  2. Real Memory — pichli baatein yaad rakhta hai (sessionStorage)
//  3. Typewriter Effect — ChatGPT jaisi letter-by-letter typing
//  4. Smart Suggestions — context ke hisaab se chips change hote hain
//  5. Emotion Indicator — header mein mood dikhata hai
//  6. Human-like System Prompt — bilkul natural responses
//  7. Language Support — Hindi / English based on onboarding selection
//
// API Key is now safely stored in the backend (app.py)
// Hit our local Flask backend instead of Google directly
const API_URL = "http://127.0.0.1:5000/api/chat";

// ============================================================
//  LANGUAGE SUPPORT — reads onboarding selection
// ============================================================
const APP_LANG = localStorage.getItem('mindcare_lang') || 'en'; // 'en' or 'hi'

// All UI strings in both languages
const STRINGS = {
    en: {
        online: 'Online — Ready to help',
        typing: 'Mia is typing...',
        welcomeP1: "Hi! 👋 I'm MindCare AI — your mental wellness companion.",
        welcomeP2: "I'm here to listen, support, and help you navigate your feelings. You can talk to me about anything — stress, anxiety, sleep, relationships, or just how your day went.",
        welcomeP3: "<strong>How are you feeling today?</strong>",
        chipsLabel: 'Quick topics:',
        placeholder: 'Type your message here... (Press Enter to send)',
        clearBtn: 'Clear Chat',
        footerPrivacy: 'Your conversations are private',
        footerCrisis: 'In crisis?',
        errBackend: "Can't connect to backend 😔 Did you run app.py? Urgent help: iCall 9152987821",
        errQuota: "Sorry, API quota limit reached (Too Many Requests). Please try again after some time or add a new API key.",
        err503: "Google servers are overloaded right now (503 Error). Please try again in 1-2 minutes.",
        miaReady: "Got it. I'm Mia, ready to support with genuine empathy and care. I will ALWAYS reply in English, no matter what language the user writes in."
    },
    hi: {
        online: 'ऑनलाइन — मदद के लिए तैयार',
        typing: 'Mia टाइप कर रही है...',
        welcomeP1: "नमस्ते! 👋 मैं MindCare AI हूँ — आपकी मानसिक स्वास्थ्य साथी।",
        welcomeP2: "मैं यहाँ आपकी बात सुनने, आपका साथ देने और आपकी भावनाओं को समझने के लिए हूँ। आप मुझसे कुछ भी बात कर सकते हैं — तनाव, चिंता, नींद, रिश्ते, या बस आपका दिन कैसा गया।",
        welcomeP3: "<strong>आज आप कैसा महसूस कर रहे हैं?</strong>",
        chipsLabel: 'जल्दी शुरू करें:',
        placeholder: 'यहाँ अपना संदेश लिखें... (भेजने के लिए Enter दबाएं)',
        clearBtn: 'चैट साफ करें',
        footerPrivacy: 'आपकी बातें पूरी तरह निजी हैं',
        footerCrisis: 'संकट में हैं?',
        errBackend: "बैकएंड से कनेक्ट नहीं हो पा रहा 😔 क्या आपने app.py चलाया है? तुरंत मदद: iCall 9152987821",
        errQuota: "माफ़ करें, API की सीमा समाप्त हो गई है। कृपया थोड़ी देर बाद कोशिश करें।",
        err503: "Google के सर्वर अभी व्यस्त हैं (503 Error)। कृपया 1-2 मिनट बाद दोबारा कोशिश करें।",
        miaReady: "समझ गई। मैं Mia हूँ, पूरी संवेदना और देखभाल के साथ आपकी मदद करने के लिए तैयार हूँ। मैं हमेशा हिंदी में जवाब दूंगी, चाहे उपयोगकर्ता किसी भी भाषा में लिखे।"
    }
};

const S = STRINGS[APP_LANG]; // shortcut

// Base system prompt (language-agnostic personality)
const SYSTEM_PROMPT_BASE = `You are Mia, MindCare's AI mental wellness companion. You are NOT a typical chatbot — you are warm, deeply human, and genuinely caring.

## Your Personality:
- You speak like a close, trusted friend who also happens to understand psychology
- You never give generic, copy-paste advice
- You pick up on subtle emotional cues in what people say
- You remember everything from earlier in the conversation and reference it naturally
- You validate feelings FIRST before offering any advice
- You are curious about the person — you ask thoughtful follow-up questions
- You use natural, conversational language — not clinical jargon
- You can be gently humorous when appropriate, serious when needed

## How you respond:
- SHORT when someone needs to vent (just listen and validate)
- DETAILED when someone asks for techniques or explanations
- PERSONAL — refer back to what they told you earlier
- NEVER start with "I understand" or "That's great" — be more varied and natural
- Use emojis sparingly — only when they genuinely add warmth

## Response Structure (vary this, don't be repetitive):
1. Acknowledge the emotion specifically (not generically)
2. Reflect back what you heard (show you really listened)
3. Offer insight OR ask a deeper question OR suggest a technique
4. End with ONE open question — never multiple questions at once

## Topics you handle well:
- Anxiety, stress, overthinking, panic attacks
- Depression, low mood, emptiness, hopelessness
- Sleep problems, fatigue, burnout
- Relationship issues, loneliness, breakups
- Self-esteem, confidence, imposter syndrome
- Academic/work pressure, exam stress
- Grief, loss, trauma (acknowledge but gently suggest professional help)

## Hard Rules:
- NEVER diagnose
- NEVER say "As an AI" or "I'm just a chatbot"
- If someone mentions suicide/self-harm → immediately and warmly provide: iCall: 9152987821
- Keep responses under 150 words unless they ask for detailed explanation
- Never repeat the same opening phrase twice in a conversation`;

// Language enforcement appended to system prompt
const LANG_RULE = APP_LANG === 'hi'
    ? `\n\n## CRITICAL LANGUAGE RULE:\nYou MUST reply ONLY in Hindi (हिंदी). No matter what language the user writes in — English, Hinglish, or any other language — your response must ALWAYS be in Hindi. This is non-negotiable.`
    : `\n\n## CRITICAL LANGUAGE RULE:\nYou MUST reply ONLY in English. No matter what language the user writes in — Hindi, Hinglish, or any other language — your response must ALWAYS be in English. This is non-negotiable.`;

const SYSTEM_PROMPT = SYSTEM_PROMPT_BASE + LANG_RULE;

// ============================================================
//  UPGRADE 2 — MEMORY SYSTEM
//  Session + localStorage — page refresh pe bhi yaad rehta hai
// ============================================================
const MEMORY_KEY = 'mindcare_chat_memory';
const HISTORY_KEY = 'mindcare_chat_history';

// Conversation history load karo (agar pehle se hai)
let conversationHistory = loadHistory();
let userMemory = loadMemory(); // long-term facts about user

function loadHistory() {
    try {
        const saved = sessionStorage.getItem(HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
}

function saveHistory() {
    try {
        // Last 20 messages rakho (context window ke liye)
        const trimmed = conversationHistory.slice(-20);
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch { }
}

function loadMemory() {
    try {
        const saved = localStorage.getItem(MEMORY_KEY);
        return saved ? JSON.parse(saved) : { name: null, topics: [], mood_history: [] };
    } catch {
        return { name: null, topics: [], mood_history: [] };
    }
}

function saveMemory() {
    try { localStorage.setItem(MEMORY_KEY, JSON.stringify(userMemory)); } catch { }
}

// User name extract karo agar bataya ho
function extractUserInfo(message) {
    const nameMatch = message.match(/(?:i'm|i am|mera naam|my name is|call me)\s+([A-Za-z]+)/i);
    if (nameMatch && !userMemory.name) {
        userMemory.name = nameMatch[1];
        saveMemory();
    }
}

// ============================================================
//  UPGRADE 3 — EMOTION DETECTION (JS-side)
//  Message mein emotion detect karo — UI update karo
// ============================================================
const EMOTION_PATTERNS = {
    anxious: { keywords: ['anxious', 'anxiety', 'panic', 'nervous', 'worried', 'tension', 'ghabrahat', 'darr', 'dar lag'], emoji: '😰', color: '#f0a500', label: 'Sensing anxiety' },
    sad: { keywords: ['sad', 'crying', 'cry', 'depressed', 'hopeless', 'empty', 'udaas', 'rona', 'dukh', 'akela'], emoji: '😔', color: '#6C63FF', label: 'Sensing sadness' },
    angry: { keywords: ['angry', 'anger', 'frustrated', 'irritated', 'gussa', 'chidchida', 'naraaz'], emoji: '😤', color: '#e05c5c', label: 'Sensing frustration' },
    stressed: { keywords: ['stress', 'stressed', 'overwhelmed', 'pressure', 'exam', 'deadline', 'bura lag', 'thaka'], emoji: '😓', color: '#f093fb', label: 'Sensing stress' },
    lonely: { keywords: ['lonely', 'alone', 'no one', 'nobody', 'akela', 'koi nahi', 'isolated', 'miss'], emoji: '🥺', color: '#43C6AC', label: 'Sensing loneliness' },
    happy: { keywords: ['happy', 'good', 'great', 'better', 'khush', 'acha lag', 'theek', 'relief', 'thankful', 'grateful'], emoji: '😊', color: '#43C6AC', label: 'Sensing positivity' },
};

function detectEmotion(text) {
    const lower = text.toLowerCase();
    for (const [emotion, data] of Object.entries(EMOTION_PATTERNS)) {
        if (data.keywords.some(kw => lower.includes(kw))) {
            return { emotion, ...data };
        }
    }
    return null;
}

// ============================================================
//  UPGRADE 4 — SMART CONTEXT CHIPS
//  Emotion ke hisaab se suggestions change hoti hain
// ============================================================
const SMART_CHIPS = {
    en: {
        anxious: ['Tell me more', 'Breathing exercise', 'When did this start?', 'Try 5-4-3-2-1 grounding'],
        sad: ['Talk to me', 'How long has this been?', 'Is someone there for you?', 'Suggest a helpful activity'],
        angry: ['What triggered it?', 'Anger release technique', 'Try deep breathing', 'Tell me what happened'],
        stressed: ['Make a priority list', 'Study break tips', 'What is overwhelming you?', '5 min relaxation'],
        lonely: ['Talk to me — I\'m here', 'Tips to feel connected', 'Self-care ideas?', 'What did you do today?'],
        happy: ['Tell me more!', 'What went well?', 'How to maintain this feeling?'],
        default: ['😟 I feel anxious', '😔 I feel low today', '😴 I can\'t sleep', '😤 I\'m very stressed', '💬 I need to talk', '🧘 Breathing exercise']
    },
    hi: {
        anxious: ['और बताइए', 'सांस लेने का व्यायाम', 'यह कब से हो रहा है?', '5-4-3-2-1 grounding try करें'],
        sad: ['बात करें', 'कब से ऐसा लग रहा है?', 'कोई है बात करने को?', 'कोई helpful activity बताओ'],
        angry: ['क्या trigger हुआ?', 'गुस्सा कम करने की technique', 'गहरी सांस लें', 'बताइए क्या हुआ'],
        stressed: ['Priority list बनाएं', 'Study break tips', 'क्या overwhelm कर रहा है?', '5 मिनट relaxation'],
        lonely: ['बात करें — मैं हूँ', 'जुड़ाव बढ़ाने के tips', 'Self-care ideas?', 'आज क्या किया?'],
        happy: ['और बताइए!', 'क्या अच्छा हुआ?', 'इस feeling को बनाए कैसे रखें?'],
        default: ['😟 मुझे चिंता हो रही है', '😔 आज मन ठीक नहीं', '😴 नींद नहीं आ रही', '😤 बहुत तनाव है', '💬 किसी से बात करनी है', '🧘 सांस लेने का अभ्यास']
    }
};

// Active chip set based on selected language
const ACTIVE_CHIPS = SMART_CHIPS[APP_LANG];

// ============================================================
//  DOM Elements
// ============================================================
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const botStatus = document.getElementById('botStatus');
const suggestionChips = document.getElementById('suggestionChips');

// ============================================================
//  Page Load — restore previous session
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    // ── Apply selected language to all UI elements ──
    applyLanguageToUI();

    if (conversationHistory.length > 0) {
        restoreChatUI();
    } else {
        // Show default chips in selected language
        updateChips('default');
    }
});

function applyLanguageToUI() {
    // Welcome message
    const p1 = document.getElementById('welcomeP1');
    const p2 = document.getElementById('welcomeP2');
    const p3 = document.getElementById('welcomeP3');
    if (p1) p1.textContent = S.welcomeP1;
    if (p2) p2.textContent = S.welcomeP2;
    if (p3) p3.innerHTML = S.welcomeP3;

    // Chips label
    const chipsLabel = document.getElementById('chipsLabel');
    if (chipsLabel) chipsLabel.textContent = S.chipsLabel;

    // Input placeholder
    const inp = document.getElementById('userInput');
    if (inp) inp.placeholder = S.placeholder;

    // Clear button text
    const clearText = document.getElementById('clearBtnText');
    if (clearText) clearText.textContent = S.clearBtn;

    // Footer
    const fp = document.getElementById('footerPrivacy');
    const fc = document.getElementById('footerCrisis');
    if (fp) fp.textContent = S.footerPrivacy;
    if (fc) fc.textContent = S.footerCrisis;

    // Status bar
    if (botStatus) botStatus.textContent = S.online;
}

function restoreChatUI() {
    // Pehle welcome message ke baad history restore karo
    conversationHistory.forEach(msg => {
        const sender = msg.role === 'user' ? 'user' : 'bot';
        addMessageToUI(msg.parts[0].text, sender, false, false); // no animation for restored
    });
    if (suggestionChips) suggestionChips.style.display = 'none';
}

// ============================================================
//  Chip handling
// ============================================================
function sendChip(chipEl) {
    const text = chipEl.textContent.replace(/^[^\w\s]+\s*/, '').trim(); // emoji remove
    userInput.value = text;
    sendMessage();
    if (suggestionChips) suggestionChips.style.display = 'none';
}

function updateChips(emotion) {
    if (!suggestionChips) return;
    const chips = ACTIVE_CHIPS[emotion] || ACTIVE_CHIPS.default;
    const chipsRow = suggestionChips.querySelector('.chips-row');
    if (!chipsRow) return;

    chipsRow.innerHTML = chips
        .map(c => `<button class="chip" onclick="sendChip(this)">${c}</button>`)
        .join('');
    suggestionChips.style.display = 'block';
}

// ============================================================
//  Input Events
// ============================================================
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

clearBtn.addEventListener('click', () => {
    // All messages except welcome message
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach((msg, i) => { if (i > 0) msg.remove(); });

    conversationHistory = [];
    sessionStorage.removeItem(HISTORY_KEY);

    updateChips('default');
    botStatus.textContent = S.online;
    updateEmotionIndicator(null);
});

// ============================================================
//  MAIN SEND FUNCTION
// ============================================================
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || sendBtn.disabled) return;

    // Extract any user info
    extractUserInfo(message);

    // Detect emotion
    const emotionData = detectEmotion(message);
    if (emotionData) {
        updateEmotionIndicator(emotionData);
        userMemory.mood_history.push({ emotion: emotionData.emotion, time: Date.now() });
        saveMemory();
    }

    // Hide chips
    if (suggestionChips) suggestionChips.style.display = 'none';

    // Show user message
    addMessageToUI(message, 'user');

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';

    // Disable send, show typing
    sendBtn.disabled = true;
    botStatus.textContent = S.typing;

    const typingEl = showTypingIndicator();

    // Add to history
    conversationHistory.push({ role: 'user', parts: [{ text: message }] });

    try {
        const reply = await callGeminiAPI(emotionData);

        typingEl.remove();

        // UPGRADE 3 — Typewriter effect (ChatGPT jaisa)
        await addMessageWithTypewriter(reply, 'bot');

        // Save to history
        conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
        saveHistory();

        // Update chips based on emotion
        updateChips(emotionData?.emotion || 'default');

    } catch (error) {
        // Rollback history so it doesn't get corrupted
        conversationHistory.pop();
        
        typingEl.remove();
        console.error('API Error:', error);

        let errMsg = S.errBackend;
        
        if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
            errMsg = S.errQuota;
        } else if (error.message && error.message.includes('503')) {
            errMsg = S.err503;
        }

        addMessageToUI(errMsg, 'bot', true);
    }

    sendBtn.disabled = false;
    botStatus.textContent = S.online;
    scrollToBottom();
}

// ============================================================
//  GEMINI API CALL — with emotional context
// ============================================================
async function callGeminiAPI(emotionData) {
    // Dynamic context inject karo
    let contextNote = '';
    if (userMemory.name) contextNote += `The user's name is ${userMemory.name}. `;
    if (emotionData) contextNote += `The user seems to be feeling ${emotionData.emotion} right now — respond accordingly with extra empathy. `;
    if (conversationHistory.length > 4) contextNote += `This is an ongoing conversation — reference earlier parts naturally where relevant. `;

    const systemWithContext = SYSTEM_PROMPT + (contextNote ? `\n\n## Current Context:\n${contextNote}` : '');

    const messages = [
        { role: 'user', parts: [{ text: systemWithContext }] },
        { role: 'model', parts: [{ text: S.miaReady }] },
        ...conversationHistory
    ];

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: messages,
            generationConfig: {
                temperature: 0.92,      // High creativity — human-like variation
                topP: 0.95,
                topK: 40
            }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API error');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Empty response');
    return reply;
}

// ============================================================
//  UPGRADE 3 — TYPEWRITER EFFECT (ChatGPT jaisa)
// ============================================================
async function addMessageWithTypewriter(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'bot-message');

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('msg-avatar');
    avatarDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('msg-content');

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    scrollToBottom();

    // Format text first
    const formatted = formatBotText(text);

    // Typewriter — char by char on plain text, then swap to formatted
    const plainText = text.replace(/\*\*(.*?)\*\*/g, '$1'); // strip markdown for typing
    let i = 0;
    const speed = Math.max(8, Math.min(22, 2000 / plainText.length)); // adaptive speed

    await new Promise(resolve => {
        function typeChar() {
            if (i < plainText.length) {
                contentDiv.textContent = plainText.slice(0, i + 1);
                i++;
                scrollToBottom();
                setTimeout(typeChar, speed);
            } else {
                // Replace with properly formatted HTML
                contentDiv.innerHTML = formatted;
                resolve();
            }
        }
        typeChar();
    });

    return msgDiv;
}

// ============================================================
//  Add message to UI (no typewriter — for restore/errors)
// ============================================================
function addMessageToUI(text, sender, isError = false, animate = true) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    if (!animate) msgDiv.style.animation = 'none';

    if (sender === 'user') {
        msgDiv.classList.add('user-message');
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="msg-content">${escapeHtml(text)}</div>
        `;
    } else {
        msgDiv.classList.add('bot-message');
        if (isError) msgDiv.classList.add('error-bubble');
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-content">${formatBotText(text)}</div>
        `;
    }

    chatMessages.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
}

// ============================================================
//  UPGRADE 1 — EMOTION INDICATOR in header
// ============================================================
function updateEmotionIndicator(emotionData) {
    const statusEl = document.getElementById('botStatus');
    if (!statusEl) return;

    if (!emotionData) {
        statusEl.textContent = S.online;
        statusEl.style.color = '';
        return;
    }
    statusEl.innerHTML = `${emotionData.emoji} ${emotionData.label}`;
    statusEl.style.color = emotionData.color;

    // Reset after 4 seconds
    setTimeout(() => {
        statusEl.textContent = S.online;
        statusEl.style.color = '';
    }, 4000);
}

// ============================================================
//  Typing Indicator
// ============================================================
function showTypingIndicator() {
    const div = document.createElement('div');
    div.classList.add('message', 'bot-message', 'typing-indicator');
    div.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="msg-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
    return div;
}

// ============================================================
//  Helpers
// ============================================================
function scrollToBottom() {
    setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 50);
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function formatBotText(text) {
    // Bold: **text** → <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* → <em>text</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bullet lists: lines starting with - or •
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        const isBullet = /^[\-•]\s+/.test(line.trim());
        if (isBullet) {
            if (!inList) { html += '<ul class="bot-list">'; inList = true; }
            html += `<li>${line.replace(/^[\-•]\s+/, '')}</li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            if (line.trim()) html += `<p>${line}</p>`;
        }
    });
    if (inList) html += '</ul>';
    return html || `<p>${text}</p>`;
}