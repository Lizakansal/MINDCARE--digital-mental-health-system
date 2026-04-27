# from flask import Flask, request, jsonify, send_from_directory
# from pymongo import MongoClient
# from dotenv import load_dotenv
# import os
# from datetime import datetime
# import requests

# # ==============================
# # Setup
# # ==============================
# load_dotenv()

# app = Flask(__name__)

# MONGO_URI = os.getenv("MONGO_URI")
# try:
#     client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
#     # Trigger a call to check connection
#     client.server_info()
#     db = client["mindcare"]
#     users = db["users"]
#     responses = db["responses"]
#     print("Connected to MongoDB successfully!")
# except Exception as e:
#     print(f"CRITICAL: Could not connect to MongoDB. Error: {e}")
#     # Fallback to dummy objects to prevent crash, but operations will fail
#     db = None
#     users = None
#     responses = None

# FRONTEND_FOLDER = "../frontend/html"   # Corrected path to HTML files


# # ==============================
# # Serve Frontend Pages
# # ==============================

# @app.route('/')
# def home():
#      return "Backend is running"

# @app.route('/login.html')
# def login_page():
#     return send_from_directory(FRONTEND_FOLDER, 'login.html')

# @app.route('/register.html')
# def register_page():
#     return send_from_directory(FRONTEND_FOLDER, 'register.html')

# @app.route('/dashboard.html')
# def dashboard_page():
#     return send_from_directory(FRONTEND_FOLDER, 'dashboard.html')

# @app.route('/onboarding.html')
# def onboarding_page():
#     return send_from_directory(FRONTEND_FOLDER, 'onboarding.html')

# @app.route('/home.html')
# def home_page():
#     return send_from_directory(FRONTEND_FOLDER, 'home.html')

# # Serve Static Files (CSS, JS, Images)
# @app.route('/css/<path:filename>')
# def serve_css(filename):
#     return send_from_directory('../frontend/css', filename)

# @app.route('/js/<path:filename>')
# def serve_js(filename):
#     return send_from_directory('../frontend/js', filename)

# @app.route('/assets/<path:filename>')
# def serve_assets(filename):
#     return send_from_directory('../frontend/assets', filename)


# # ==============================
# #  REGISTER API     
# # ==============================

# @app.route('/register', methods=['POST'])
# def register():
#     if users is None:
#         return jsonify({"error": "Database connection failed"}), 500
#     data = request.json if request.is_json else request.form

#     name = data.get("fullname")
#     email = data.get("email")
#     phone = data.get("phone")
#     password = data.get("password")

#     if not email or not password:
#         return jsonify({"error": "Missing required fields"}), 400

#     if users.find_one({"email": email}):
#         return jsonify({"error": "User already exists"}), 409

#     users.insert_one({
#         "name": name,
#         "email": email,
#         "phone": phone,
#         "password": password,
#         "created_at": datetime.now()
#     })

#     return jsonify({"message": "Registration successful", "redirect": "/login.html"}), 201


# # ==============================
# # LOGIN API
# # ==============================

# @app.route('/login', methods=['POST'])
# def login():
#     if users is None:
#         return jsonify({"error": "Database connection failed"}), 500
#     data = request.json if request.is_json else request.form

#     username = data.get("username")
#     password = data.get("password")

#     user = users.find_one({
#         "$or": [
#             {"email": username},
#             {"name": username}
#         ]
#     })

#     if not user:
#         return jsonify({"error": "User not found"}), 404

#     if user["password"] != password:
#         return jsonify({"error": "Incorrect password"}), 401

#     return jsonify({
#         "message": "Login successful",
#         "redirect": "/dashboard.html",
#         "user": {
#             "name": user.get("name"),
#             "email": user.get("email")
#         }
#     }), 200


# # ==============================
# # QUIZ SUBMIT API
# # ==============================

# @app.route('/submit', methods=['POST'])
# def submit():
#     if responses is None:
#         return jsonify({"error": "Database connection failed"}), 500
#     data = request.json

#     if not data:
#         return jsonify({"error": "No data"}), 400

#     email = data.get("email")
#     if email:
#         # Update or insert response for this user
#         data["created_at"] = datetime.now()
#         responses.insert_one(data)
#         return jsonify({"message": "Quiz saved successfully"})
#     else:
#         # Fallback for anonymous
#         data["created_at"] = datetime.now()
#         responses.insert_one(data)
#         return jsonify({"message": "Quiz saved anonymously"})


# @app.route('/api/dashboard', methods=['GET'])
# def dashboard_data():
#     if responses is None:
#         return jsonify({"error": "Database connection failed"}), 500
#     email = request.args.get('email')
#     if not email:
#         return jsonify({"error": "Email required"}), 400

#     # Get latest quiz result
#     latest_response = responses.find_one({"email": email}, sort=[("created_at", -1)])
    
#     # Get all mood history
#     all_responses = list(responses.find({"email": email}, {"_id": 0, "score": 1, "created_at": 1}).sort("created_at", 1))
    
#     # Format mood history for chart
#     mood_history = []
#     for idx, resp in enumerate(all_responses):
#         # Using a simple value from score for mood (1-5 scale)
#         # Assuming score is 0-40, we can map it or use the 'answers'
#         # For simplicity, let's just return what we have
#         mood_history.append({
#             "session": f"Check-in {idx+1}",
#             "val": (resp.get("score", 0) // 8) + 1 # Simple mapping 0-40 to 1-5
#         })

#     return jsonify({
#         "score": latest_response.get("score", 0) if latest_response else 0,
#         "sessions": len(all_responses),
#         "history": mood_history
#     })


# # ==============================
# # CHATBOT API (Gemini Backend)
# # ==============================

# @app.route('/api/chat', methods=['POST', 'OPTIONS'])
# def chat_api():
#     # Handle CORS for VS Code Live Server
#     if request.method == 'OPTIONS':
#         return '', 204, {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Headers': 'Content-Type'
#         }
    
#     data = request.json
#     # API key is safely stored on the backend now
#     api_key = "AIzaSyASGNXbBsqspCym-jqdGWUxA8I8gtgUrx0" 
#     url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={api_key}"
    
#     try:
#         response = requests.post(url, json=data)
#         return jsonify(response.json()), response.status_code, {'Access-Control-Allow-Origin': '*'}
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500, {'Access-Control-Allow-Origin': '*'}


# # ==============================
# # VIEW DATA (Testing)
# # ==============================

# @app.route('/users', methods=['GET'])
# def get_users():
#     return jsonify(list(users.find({}, {"_id": 0})))

# @app.route('/responses', methods=['GET'])
# def get_responses():
#     return jsonify(list(responses.find({}, {"_id": 0})))


# # ==============================
# # DELETE (Testing)
# # ==============================

# @app.route('/delete-all', methods=['DELETE'])
# def delete_all():
#     users.delete_many({})
#     responses.delete_many({})
#     return jsonify({"message": "All data deleted"})


# # ==============================
# # Run Server
# # ==============================

# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from functools import wraps
from bson import ObjectId
from email.message import EmailMessage
import smtplib
import bcrypt
import jwt
import os
import re
import requests
import secrets
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder=".")
CORS(app, supports_credentials=True)

SECRET_KEY = os.environ.get("SECRET_KEY", "mindcare-secret-key-change-in-prod")
MONGO_URI  = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASS = os.environ.get("SMTP_PASS", "").strip()
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER).strip()
RESET_URL_BASE = os.environ.get("RESET_URL_BASE", "http://127.0.0.1:5500/reset-password.html").strip()

client  = MongoClient(MONGO_URI)
db      = client["mindcare"]
users   = db["users"]
moods   = db["moods"]
quizzes = db["quizzes"]

def make_token(user_id):
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return None

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Unauthorised"}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        request.user_id = payload["sub"]
        return f(*args, **kwargs)
    return decorated

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/dashboard")
def serve_dashboard():
    return send_from_directory(".", "dashboard.html")

@app.route("/api/register", methods=["POST"])
def register():
    data     = request.get_json(silent=True) or {}
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    result = users.insert_one({
        "name": name, "email": email, "password": hashed,
        "created_at": datetime.utcnow(), "streak": 0, "last_mood_date": None
    })
    return jsonify({"token": make_token(str(result.inserted_id)), "name": name}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user     = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    return jsonify({"token": make_token(str(user["_id"])), "name": user["name"]}), 200

def build_reset_link(reset_token):
    return f"{RESET_URL_BASE}?token={reset_token}"

def send_reset_email(to_email, reset_link):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM):
        return False, "SMTP settings are incomplete"
    if "your_email@gmail.com" in {SMTP_USER, SMTP_FROM} or "your_app_password" == SMTP_PASS:
        return False, "SMTP settings still use placeholder values"

    msg = EmailMessage()
    msg["Subject"] = "MindCare Password Reset"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(
        "We received a password reset request for your MindCare account.\n\n"
        f"Use this link to reset your password (valid for 30 minutes):\n{reset_link}\n\n"
        "If you did not request this, you can ignore this email."
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

    return True, ""

@app.route("/forgot-password", methods=["POST"])
@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "No account found for this email"}), 404

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=30)
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expires_at": expires_at}}
    )

    reset_link = build_reset_link(reset_token)
    try:
        email_sent, reason = send_reset_email(email, reset_link)
    except Exception as e:
        return jsonify({"error": f"Failed to send reset email: {str(e)}"}), 500

    if email_sent:
        return jsonify({"message": "Password reset link sent to your email"}), 200

    # Fallback for local development when SMTP is not configured.
    return jsonify({
        "message": f"Email not sent ({reason}). Use this local reset link.",
        "resetLink": reset_link
    }), 200

@app.route("/reset-password/<token>", methods=["POST"])
@app.route("/api/reset-password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json(silent=True) or {}
    new_password = data.get("password") or ""
    if not token:
        return jsonify({"error": "Reset token is required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    now = datetime.utcnow()
    user = users.find_one({
        "reset_token": token,
        "reset_token_expires_at": {"$gt": now}
    })
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed, "password_updated_at": now},
         "$unset": {"reset_token": "", "reset_token_expires_at": ""}}
    )
    return jsonify({"message": "Password reset successful"}), 200

@app.route("/api/me", methods=["GET"])
@auth_required
def get_me():
    user = users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"name": user["name"], "email": user["email"], "streak": user.get("streak", 0)})

MOOD_SUGGESTIONS = {
    1: ["Take slow deep breaths", "Call a trusted friend", "Try a 5-min meditation", "Write in a journal"],
    2: ["Go for a short walk", "Listen to calming music", "Drink a warm beverage", "Rest if you need"],
    3: ["Keep up your routine", "Connect with someone", "Read something uplifting", "Light stretching"],
    4: ["Channel energy creatively", "Share your positivity", "Exercise or dance", "Set a new goal"],
    5: ["Celebrate your mood!", "Help someone today", "Try something new", "Express gratitude"]
}

@app.route("/api/mood", methods=["POST"])
@auth_required
def log_mood():
    data  = request.get_json(silent=True) or {}
    score = data.get("score")
    note  = (data.get("note") or "").strip()
    if score not in [1, 2, 3, 4, 5]:
        return jsonify({"error": "Score must be 1-5"}), 400
    today = datetime.utcnow().date()
    user  = users.find_one({"_id": ObjectId(request.user_id)})
    streak = user.get("streak", 0)
    last_date = user.get("last_mood_date")
    if last_date:
        last = last_date.date() if isinstance(last_date, datetime) else last_date
        if last == today - timedelta(days=1):
            streak += 1
        elif last != today:
            streak = 1
    else:
        streak = 1
    moods.insert_one({"user_id": request.user_id, "score": score, "note": note, "date": datetime.utcnow()})
    users.update_one({"_id": ObjectId(request.user_id)},
                     {"$set": {"streak": streak, "last_mood_date": datetime.utcnow()}})
    return jsonify({"message": "Mood logged", "suggestions": MOOD_SUGGESTIONS.get(score, []), "streak": streak}), 201

@app.route("/api/mood", methods=["GET"])
@auth_required
def get_moods():
    days  = int(request.args.get("days", 30))
    since = datetime.utcnow() - timedelta(days=days)
    records = list(moods.find(
        {"user_id": request.user_id, "date": {"$gte": since}},
        {"_id": 0, "score": 1, "note": 1, "date": 1}
    ).sort("date", 1))
    for r in records:
        r["date"] = r["date"].strftime("%Y-%m-%d")
    return jsonify(records)

@app.route("/api/mood/stats", methods=["GET"])
@auth_required
def mood_stats():
    all_moods = list(moods.find({"user_id": request.user_id}, {"score": 1}))
    if not all_moods:
        return jsonify({"average": 0, "total": 0, "distribution": {}})
    scores = [m["score"] for m in all_moods]
    dist   = {str(i): scores.count(i) for i in range(1, 6)}
    return jsonify({"average": round(sum(scores) / len(scores), 2), "total": len(scores), "distribution": dist})

QUIZ_QUESTIONS = [
    {"id": 1, "text": "How often have you felt little interest or pleasure in doing things?",
     "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]},
    {"id": 2, "text": "How often have you felt down, depressed, or hopeless?",
     "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]},
    {"id": 3, "text": "How often have you had trouble falling or staying asleep?",
     "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]},
    {"id": 4, "text": "How often have you felt tired or had little energy?",
     "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]},
    {"id": 5, "text": "How often have you felt nervous, anxious, or on edge?",
     "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]},
]

def interpret_score(total):
    if total <= 4:
        return {"level": "Minimal", "color": "#4ade80", "advice": "You seem to be doing well. Keep up your healthy habits!"}
    elif total <= 9:
        return {"level": "Mild", "color": "#facc15", "advice": "Some areas could use attention. Consider mindfulness and routine."}
    elif total <= 14:
        return {"level": "Moderate", "color": "#fb923c", "advice": "You may benefit from speaking with a counsellor or therapist."}
    else:
        return {"level": "Severe", "color": "#f87171", "advice": "Please seek professional support. You don't have to face this alone."}

@app.route("/api/quiz/questions", methods=["GET"])
def get_quiz_questions():
    return jsonify(QUIZ_QUESTIONS)

@app.route("/api/quiz/submit", methods=["POST"])
@auth_required
def submit_quiz():
    data    = request.get_json(silent=True) or {}
    answers = data.get("answers", [])
    if len(answers) != len(QUIZ_QUESTIONS):
        return jsonify({"error": "Incomplete answers"}), 400
    total  = sum(answers)
    result = interpret_score(total)
    quizzes.insert_one({"user_id": request.user_id, "answers": answers,
                         "score": total, "result": result, "date": datetime.utcnow()})
    return jsonify({"score": total, "result": result}), 201

@app.route("/api/quiz/latest", methods=["GET"])
@auth_required
def latest_quiz():
    q = quizzes.find_one({"user_id": request.user_id}, sort=[("date", -1)])
    if not q:
        return jsonify(None)
    return jsonify({"score": q["score"], "result": q["result"], "date": q["date"].strftime("%Y-%m-%d")})

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY is not configured on the server"}), 500
    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}",
            json=data,
            timeout=25
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)