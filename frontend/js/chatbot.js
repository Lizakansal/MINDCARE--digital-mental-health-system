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
//
//  SETUP: Line 11 pe apni Gemini API key daalo
//  Key: aistudio.google.com → Get API Key
// ============================================================

// API Key is now safely stored in the backend (app.py)
// Hit our local Flask backend instead of Google directly
const API_URL = "http://127.0.0.1:5000/api/chat";

// ============================================================
//  UPGRADE 1 — HUMAN-LIKE SYSTEM PROMPT
//  Yahi cheez ChatGPT jaisi responses deti hai
//  Generic nahi, context-aware, emotionally intelligent
// ============================================================
const SYSTEM_PROMPT = `You are Mia, MindCare's AI mental wellness companion. You are NOT a typical chatbot — you are warm, deeply human, and genuinely caring.

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
- PERSONAL — refer back to what they told you earlier ("You mentioned earlier that...")
- NEVER start with "I understand" or "That's great" — be more varied and natural
- Mix Hindi and English naturally if the user does (Hinglish is fine)
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
    anxious: ['Tell me more about it', 'Breathing exercise batao', 'Yeh kab se ho raha hai?', '5-4-3-2-1 grounding try karein?'],
    sad: ['Kya hua baat karo', 'Kab se aisa feel ho raha hai?', 'Koi hai baat karne ko?', 'Kuch helpful activity suggest karo'],
    angry: ['Kya trigger hua?', 'Anger release technique batao', 'Deep breathing try karein?', 'Baat karo kya hua'],
    stressed: ['Priority list banana hai?', 'Study break tips chahiye', 'Kya overwhelm kar raha hai?', '5 min relaxation technique'],
    lonely: ['Baat karo — main hoon', 'Connection badhane ke tips', 'Self-care ideas chahiye?', 'Aaj kya kiya?'],
    happy: ['Aur batao!', 'Kya hua acha?', 'Is feeling ko maintain kaise karein?'],
    default: ['😟 I feel anxious', '😔 I feel low today', '😴 I can\'t sleep', '😤 I\'m very stressed', '💬 I need to talk', '🧘 Breathing exercise']
};

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
    if (conversationHistory.length > 0) {
        restoreChatUI();
    }
});

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
    const chips = SMART_CHIPS[emotion] || SMART_CHIPS.default;
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
    botStatus.textContent = 'Online — Ready to help';
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
    botStatus.textContent = 'Mia is typing...';

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
        typingEl.remove();
        console.error('API Error:', error);

        const errMsg = "Backend se connect nahi ho pa raha 😔 Kya aapne app.py run kiya hai? Urgent help: iCall 9152987821";

        addMessageToUI(errMsg, 'bot', true);
    }

    sendBtn.disabled = false;
    botStatus.textContent = 'Online — Ready to help';
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
        { role: 'model', parts: [{ text: `Got it. I'm Mia, ready to support with genuine empathy and care.` }] },
        ...conversationHistory
    ];

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: messages,
            generationConfig: {
                temperature: 0.92,      // High creativity — human-like variation
                maxOutputTokens: 400,   // Concise but complete
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
        statusEl.textContent = 'Online — Ready to help';
        statusEl.style.color = '';
        return;
    }
    statusEl.innerHTML = `${emotionData.emoji} ${emotionData.label}`;
    statusEl.style.color = emotionData.color;

    // Reset after 4 seconds
    setTimeout(() => {
        statusEl.textContent = 'Online — Ready to help';
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