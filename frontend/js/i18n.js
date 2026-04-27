const APP_LANG = localStorage.getItem('mindcare_lang') || 'en';

const I18N_DICT = {
    hi: {
        // Sidebar & General
        "Dashboard": "डैशबोर्ड",
        "AI Chat": "एआई चैट",
        "Mood Tracker": "मूड ट्रैकर",
        "Logout": "लॉग आउट",
        "Sign Out": "लॉग आउट",
        "Home": "होम",

        // Home Page
        "Good Morning": "सुप्रभात",
        "Good Afternoon": "शुभ दोपहर",
        "Good Evening": "शुभ संध्या",
        "Good Night": "शुभ रात्रि",
        "Welcome back,": "वापसी पर स्वागत है,",
        "How are you feeling today? We're here for you.": "आज आप कैसा महसूस कर रहे हैं? हम आपके लिए यहाँ हैं।",
        "Today's mood:": "आज का मूड:",
        "Where would you like to go?": "आप कहाँ जाना चाहेंगे?",
        "Choose an area to explore or continue your journey": "एक क्षेत्र चुनें या अपनी यात्रा जारी रखें",
        "My Dashboard": "मेरा डैशबोर्ड",
        "View your wellness score, mood history, your latest check-ins, and personalised insights.": "अपना वेलनेस स्कोर, मूड इतिहास, हालिया चेक-इन और व्यक्तिगत सुझाव देखें।",
        "Talk to MindBot": "MindBot से बात करें",
        "Need someone to listen? Chat with our AI companion — available 24/7, always judgement-free.": "क्या आपको किसी की ज़रूरत है जो सुने? हमारे AI साथी से चैट करें — 24/7 उपलब्ध, बिना किसी जजमेंट के।",
        "Resources": "संसाधन",
        "Explore guided meditations, breathing exercises, articles, and coping strategies.": "गाइडेड मेडिटेशन, सांस लेने के व्यायाम, लेख और सामना करने की रणनीतियाँ खोजें।",
        "Mental Health Assessment": "मानसिक स्वास्थ्य मूल्यांकन",
        "Retake the quiz to get a fresh look at your current mental wellness status and updated recommendations.": "अपने वर्तमान मानसिक स्वास्थ्य की ताज़ा स्थिति और अपडेटेड सुझावों के लिए क्विज़ दोबारा दें।",
        "Your Space": "आपका स्पेस",
        "Live": "लाइव",
        "Explore": "खोजें",
        "≈ 5 min": "≈ 5 मिनट",
        "In crisis? Call": "संकट में हैं? कॉल करें",

        // Login Page
        "Welcome Back": "वापसी पर स्वागत है",
        "Sign in to continue your wellness journey": "अपनी वेलनेस यात्रा जारी रखने के लिए साइन इन करें",
        "Username or Email": "यूजरनेम या ईमेल",
        "Password": "पासवर्ड",
        "Enter your username or email": "अपना यूजरनेम या ईमेल दर्ज करें",
        "Enter your password": "अपना पासवर्ड दर्ज करें",
        "Remember me": "मुझे याद रखें",
        "Forgot password?": "पासवर्ड भूल गए?",
        "Sign In": "साइन इन",
        "Don't have an account?": "खाता नहीं है?",
        "Create one — it's free": "नया बनाएं — यह मुफ़्त है",
        "Signing in…": "साइन इन हो रहा है...",
        "Your safe space for mental wellness and support": "मानसिक स्वास्थ्य और सहायता के लिए आपका सुरक्षित स्थान",
        "Confidential & Secure": "गोपनीय और सुरक्षित",
        "24/7 Support Access": "24/7 सहायता पहुंच",
        "Connect with Professionals": "पेशेवरों से जुड़ें",

        // Register Page
        "Create Account": "खाता बनाएं",
        "Join MindCare today": "आज ही MindCare से जुड़ें",
        "Full Name": "पूरा नाम",
        "Enter your full name": "अपना पूरा नाम दर्ज करें",
        "Email Address": "ईमेल पता",
        "Enter your email": "अपना ईमेल दर्ज करें",
        "Confirm Password": "पासवर्ड की पुष्टि करें",
        "I agree to the Terms & Conditions": "मैं नियम और शर्तों से सहमत हूँ",
        "Already have an account?": "पहले से ही खाता है?",
        "Log in here": "यहाँ लॉग इन करें",
        "Success! Redirecting…": "सफलता! रीडायरेक्ट हो रहा है...",
        "Invalid credentials. Please try again.": "अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।",
        "Network error. Please check your connection.": "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।",
        "Username or email is required.": "यूजरनेम या ईमेल आवश्यक है।",
        "Password is required.": "पासवर्ड आवश्यक है।",
        "Password must be at least 8 characters.": "पासवर्ड कम से कम 8 वर्णों का होना चाहिए।",
        "⚠ Weak password": "⚠ कमजोर पासवर्ड",
        "→ Medium strength": "→ मध्यम मजबूती",
        "✔ Strong password": "✔ मजबूत पासवर्ड",
        "Full name is required.": "पूरा नाम आवश्यक है।",
        "Name must be at least 2 characters.": "नाम कम से कम 2 वर्णों का होना चाहिए।",
        "Email address is required.": "ईमेल पता आवश्यक है।",
        "Please enter a valid email.": "कृपया एक मान्य ईमेल दर्ज करें।",
        "Enter a valid 10-digit Indian mobile number.": "एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।",
        "Please confirm your password.": "कृपया अपने पासवर्ड की पुष्टि करें।",
        "Passwords do not match.": "पासवर्ड मेल नहीं खाते।",
        "You must agree to the Terms of Service.": "आपको सेवा की शर्तों से सहमत होना चाहिए।",
        "Creating account…": "खाता बनाया जा रहा है...",
        "Account Created!": "खाता बनाया गया!",
        "Registration failed. Try again.": "पंजीकरण विफल रहा। पुनः प्रयास करें।",
        "Network error. Is the server running?": "नेटवर्क त्रुटि। क्या सर्वर चल रहा है?",
        "Sign in here": "यहाँ साइन इन करें",
        "Begin your journey to better mental health today": "आज ही बेहतर मानसिक स्वास्थ्य के लिए अपनी यात्रा शुरू करें",
        "Free & Easy Sign Up": "मुफ़्त और आसान साइन अप",
        "100% Confidential": "100% गोपनीय",
        "Access Expert Resources": "विशेषज्ञ संसाधनों तक पहुंच",
        "24/7 Community Support": "24/7 सामुदायिक सहायता",
        "Terms of Service": "सेवा की शर्तें",
        "Privacy Policy": "गोपनीयता नीति",
        "I agree to the": "मैं सहमत हूँ",
        "Join MindCare — your wellness journey starts here": "MindCare से जुड़ें — आपकी वेलनेस यात्रा यहाँ से शुरू होती है",
        "Create a strong password": "एक मजबूत पासवर्ड बनाएं",
        "Re-enter your password": "अपना पासवर्ड दोबारा दर्ज करें",
        "Enter your phone number": "अपना फोन नंबर दर्ज करें",
        "Phone Number": "फ़ोन नंबर",
        "or": "या",
        "Wellness Score": "वेलनेस स्कोर",
        "Looking good!": "बहुत बढ़िया!",
        "Take a quiz to see your score": "अपना स्कोर देखने के लिए क्विज़ लें",
        "Needs attention. Reach out for support.": "ध्यान देने की आवश्यकता है। सहायता के लिए संपर्क करें।",
        "Doing okay. Take it easy.": "ठीक चल रहा है। आराम से लें।",
        "Thriving & Excellent!": "शानदार और उत्कृष्ट!",
        "Check-ins": "चेक-इन",
        "Total mood logs & sessions": "कुल मूड लॉग और सेशन",
        "Mood History": "मूड का इतिहास",
        "Last 7 Days": "पिछले 7 दिन",
        "Last 30 Days": "पिछले 30 दिन",
        "Personal Insights": "व्यक्तिगत सुझाव",
        "Self-Awareness:": "आत्म-जागरूकता:",
        "Checking in whenever you feel overwhelmed helps in understanding your thought patterns over time.": "जब भी आप परेशान महसूस करें तो चेक-इन करने से समय के साथ आपके विचारों को समझने में मदद मिलती है।",
        "Take Your Time:": "अपना समय लें:",
        "Wellness is not a straight line. Give yourself grace on difficult days, and celebrate the good ones.": "वेलनेस कोई सीधी रेखा नहीं है। कठिन दिनों में खुद को समय दें और अच्छे दिनों का जश्न मनाएं।",
        "Recommendation:": "सुझाव:",
        "Based on your recent \"Okay\" days, trying out a 5-minute deep breathing exercise might give you a boost.": "आपके हाल के \"ठीक\" दिनों के आधार पर, 5 मिनट गहरी सांस लेने का व्यायाम आज़माने से आपको ऊर्जा मिल सकती है।",
        "Explore Resources": "संसाधन खोजें",
        "Upward Trend": "सुधार का रुझान",
        "Dipping Slightly": "थोड़ी गिरावट",
        "Steady State": "स्थिर स्थिति",
        "Building a Habit": "आदत बन रही है",
        "Get Started": "शुरू करें",
        "Welcome!": "स्वागत है!",
        "Avg Wellness:": "औसत वेलनेस:",
        "Struggling": "संघर्ष कर रहे हैं",
        "Low": "कम",
        "Okay": "ठीक",
        "Good": "अच्छा",
        "Keep doing what works for you!": "जो आपके लिए काम कर रहा है उसे जारी रखें!",
        "A 5-minute breathing exercise could give you a boost.": "5 मिनट का सांस लेने का व्यायाम आपको ऊर्जा दे सकता है।",
        "Reach out to someone you trust. You don't have to face this alone.": "किसी विश्वसनीय व्यक्ति से संपर्क करें। आपको अकेले इसका सामना करने की ज़रूरत नहीं है।",

        // Resources Page
        "Resource Type:": "संसाधन प्रकार:",
        "All Types": "सभी प्रकार",
        "Videos": "वीडियो",
        "Audio": "ऑडियो",
        "Posters": "पोस्टर",
        "Guides": "गाइड",
        "Books": "किताबें",
        "Quotes": "सुविचार",
        "Mood Tag:": "मूड टैग:",
        "All Moods": "सभी मूड",
        "Happy": "खुश",
        "Sad": "उदास",
        "Fear": "डर",
        "Angry": "गुस्सा",
        "Neutral": "सामान्य",
        "Search:": "खोजें:",
        "Search resources...": "संसाधन खोजें...",
        "Clear Filters": "फ़िल्टर हटाएं",
        "✖ Clear Filters": "✖ फ़िल्टर हटाएं",
        "Loading resources...": "संसाधन लोड हो रहे हैं...",
        "No resources found": "कोई संसाधन नहीं मिला",
        "Failed to load resources": "संसाधन लोड करने में विफल",

        // Resource Content
        "Breathing Exercises for Anxiety": "चिंता के लिए सांस लेने के व्यायाम",
        "Learn simple breathing techniques to manage anxiety and stress in daily life.": "दैनिक जीवन में चिंता और तनाव को प्रबंधित करने के लिए सरल श्वसन तकनीक सीखें।",
        "Mindfulness Meditation for Students": "छात्रों के लिए माइंडफुलनेस मेडिटेशन",
        "A guided meditation session designed specifically for students to reduce stress and improve focus.": "तनाव कम करने और ध्यान सुधारने के लिए छात्रों के लिए विशेष रूप से डिज़ाइन किया गया गाइडेड मेडिटेशन सत्र।",
        "Dealing with Academic Pressure": "अकादमिक दबाव से निपटना",
        "Tips and strategies for managing academic stress and maintaining mental health.": "अकादमिक तनाव के प्रबंधन और मानसिक स्वास्थ्य बनाए रखने के लिए सुझाव और रणनीतियाँ।",
        "Calming Nature Sounds": "शांत प्रकृति की आवाज़ें",
        "Relaxing sounds of rain, forest, and ocean waves to help you unwind.": "तनाव दूर करने में मदद करने के लिए बारिश, जंगल और समुद्र की लहरों की आरामदायक आवाज़ें।",
        "Sleep Meditation": "नींद के लिए ध्यान",
        "A gentle guided meditation to help you fall asleep peacefully.": "शांति से सोने में आपकी मदद करने के लिए एक सौम्य गाइडेड मेडिटेशन।",
        "Confidence Boosting Affirmations": "आत्मविश्वास बढ़ाने वाले सकारात्मक विचार",
        "Positive affirmations to build self-confidence and self-esteem.": "आत्मविश्वास और आत्म-सम्मान बनाने के लिए सकारात्मक विचार।",
        "Mental Health Awareness": "मानसिक स्वास्थ्य जागरूकता",
        "Informative poster about recognizing signs of mental health issues.": "मानसिक स्वास्थ्य समस्याओं के संकेतों को पहचानने के बारे में जानकारीपूर्ण पोस्टर।",
        "Stress Management Tips": "तनाव प्रबंधन के सुझाव",
        "Visual guide with practical tips for managing daily stress.": "दैनिक तनाव के प्रबंधन के लिए व्यावहारिक सुझावों वाली विज़ुअल गाइड।",
        "Positive Mindset Poster": "सकारात्मक मानसिकता पोस्टर",
        "Motivational poster to encourage positive thinking and resilience.": "सकारात्मक सोच और लचीलापन प्रोत्साहित करने के लिए प्रेरक पोस्टर।",
        "Student Mental Health Guide": "छात्र मानसिक स्वास्थ्य गाइड",
        "Comprehensive guide covering mental health resources and strategies for students.": "छात्रों के लिए मानसिक स्वास्थ्य संसाधनों और रणनीतियों को कवर करने वाली व्यापक गाइड।",
        "Anxiety Management Workbook": "चिंता प्रबंधन कार्यपुस्तिका",
        "Step-by-step workbook with exercises and techniques for managing anxiety.": "चिंता के प्रबंधन के लिए व्यायाम और तकनीकों के साथ चरण-दर-चरण कार्यपुस्तिका।",
        "Building Resilience": "लचीलापन बनाना",
        "Guide to developing emotional resilience and coping strategies.": "भावनात्मक लचीलापन और सामना करने की रणनीतियाँ विकसित करने के लिए गाइड।",
        "The Anxiety and Worry Workbook": "चिंता और फिक्र की कार्यपुस्तिका",
        "A comprehensive workbook with cognitive behavioral therapy techniques.": "संज्ञानात्मक व्यवहार थेरेपी तकनीकों के साथ एक व्यापक कार्यपुस्तिका।",
        "Mindfulness for Students": "छात्रों के लिए माइंडफुलनेस",
        "Practical mindfulness techniques adapted for student life.": "छात्र जीवन के लिए अनुकूलित व्यावहारिक माइंडफुलनेस तकनीकें।",
        "Emotional Intelligence Guide": "भावनात्मक बुद्धिमत्ता गाइड",
        "Learn to understand and manage your emotions effectively.": "अपनी भावनाओं को प्रभावी ढंग से समझना और प्रबंधित करना सीखें।",
        "happy": "खुश",
        "sad": "उदास",
        "fear": "डर",
        "angry": "गुस्सा",
        "neutral": "सामान्य",
        "surprise": "आश्चर्य",

        // Titles & Meta
        "Welcome — MindCare": "स्वागत है — MindCare",
        "Login — Mental Health Support System": "लॉगिन — मानसिक स्वास्थ्य सहायता प्रणाली",
        "Register — Mental Health Support System": "पंजीकरण — मानसिक स्वास्थ्य सहायता प्रणाली",
        "My Dashboard — MindCare": "मेरा डैशबोर्ड — MindCare",
        "MindCare Dashboard - Track your mental wellness journey.": "MindCare डैशबोर्ड - अपनी मानसिक वेलनेस यात्रा को ट्रैक करें।",
        "MindCare — AI Chatbot": "MindCare — एआई चैटबॉट"
    }
};

window.t = function (key) {
    if (APP_LANG === 'hi' && I18N_DICT.hi[key]) {
        return I18N_DICT.hi[key];
    }
    return key;
};

window.addEventListener('DOMContentLoaded', () => {
    if (APP_LANG !== 'hi') return;

    // Translate Title
    const title = document.querySelector('title');
    if (title && I18N_DICT.hi[title.innerText]) {
        title.innerText = I18N_DICT.hi[title.innerText];
    }

    // Translate Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && I18N_DICT.hi[metaDesc.content]) {
        metaDesc.content = I18N_DICT.hi[metaDesc.content];
    }

    // Translate placeholders
    document.querySelectorAll('[placeholder]').forEach(el => {
        if (I18N_DICT.hi[el.placeholder]) {
            el.placeholder = I18N_DICT.hi[el.placeholder];
        }
    });

    // Translate text nodes using TreeWalker
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    let node;
    while ((node = walker.nextNode())) {
        const text = node.nodeValue.trim();
        // Skip script and style tags content
        if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') continue;

        if (text && I18N_DICT.hi[text]) {
            nodesToReplace.push({ node, text });
        } else if (text === "Home" || text === "Dashboard" || text === "Resources") {
            // Standard navigation terms
            nodesToReplace.push({ node, text });
        }
    }

    nodesToReplace.forEach(({ node, text }) => {
        node.nodeValue = node.nodeValue.replace(text, I18N_DICT.hi[text]);
    });
});
