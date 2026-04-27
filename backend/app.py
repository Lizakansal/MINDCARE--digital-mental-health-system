from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from pymongo import MongoClient
from datetime import datetime, timedelta
from functools import wraps
from bson import ObjectId
from dotenv import load_dotenv
from twilio.rest import Client as TwilioClient
import bcrypt
import hashlib
import jwt
import os
import random
import re
import requests

load_dotenv()

app = Flask(__name__, static_folder=".")
CORS(app, supports_credentials=True)

app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
app.config["MAIL_USE_SSL"] = os.environ.get("MAIL_USE_SSL", "false").lower() == "true"
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_DEFAULT_SENDER", app.config["MAIL_USERNAME"])

mail = Mail(app)

SECRET_KEY = os.environ.get("SECRET_KEY", "mindcare-secret-key-change-in-prod")
MONGO_URI   = os.environ.get("MONGO_URI", "mongodb+srv://menkamathur962:menka@mentalhealthsystem.cnlvw0r.mongodb.net/?appName=mentalHealthSystem")
PASSWORD_RESET_SECRET = os.environ.get("PASSWORD_RESET_SECRET", SECRET_KEY)

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "").strip()

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

client = MongoClient(MONGO_URI)
try:
    client.server_info()
    print("MongoDB Connected ✅")
except Exception as e:
    print("MongoDB Error ❌", e)

db      = client["mindcare"]
users   = db["users"]
moods   = db["moods"]
quizzes = db["quizzes"]
password_resets = db["password_resets"]


# ==============================
# Auth Helpers
# ==============================

def make_token(user_id):
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return None

def make_password_reset_token(user_id, reset_id):
    payload = {
        "sub": user_id,
        "rid": reset_id,
        "typ": "password_reset",
        "exp": datetime.utcnow() + timedelta(minutes=10)
    }
    return jwt.encode(payload, PASSWORD_RESET_SECRET, algorithm="HS256")

def verify_password_reset_token(token):
    try:
        payload = jwt.decode(token, PASSWORD_RESET_SECRET, algorithms=["HS256"])
        if payload.get("typ") != "password_reset":
            return None
        return payload
    except Exception:
        return None

def normalize_phone(raw):
    phone = re.sub(r"\D", "", (raw or "").strip())
    if len(phone) == 10:
        return f"+91{phone}"
    if len(phone) == 12 and phone.startswith("91"):
        return f"+{phone}"
    if len(phone) > 10 and (raw or "").strip().startswith("+"):
        return (raw or "").strip()
    return None

def otp_hash(identifier, otp):
    return hashlib.sha256(f"{identifier}:{otp}".encode("utf-8")).hexdigest()

def send_otp_email(email, otp):
    if not app.config.get("MAIL_USERNAME") or not app.config.get("MAIL_PASSWORD"):
        raise RuntimeError("Mail credentials missing. Set MAIL_USERNAME and MAIL_PASSWORD.")
    msg = Message(
        subject="MindCare Password Reset OTP",
        recipients=[email],
        body=f"Your MindCare password reset OTP is {otp}. It expires in 5 minutes."
    )
    mail.send(msg)

def send_otp_sms(phone, otp):
    if not twilio_client or not TWILIO_PHONE_NUMBER:
        raise RuntimeError("Twilio credentials missing. Set SID, token, and phone number.")
    twilio_client.messages.create(
        body=f"Your MindCare reset OTP is {otp}. Valid for 5 minutes.",
        from_=TWILIO_PHONE_NUMBER,
        to=phone
    )

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


# ==============================
# Static Pages
# ==============================

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/dashboard")
def serve_dashboard():
    return send_from_directory(".", "dashboard.html")


# ==============================
# Auth APIs
# ==============================

@app.route("/api/register", methods=["POST"])
def register():
    data     = request.get_json(silent=True) or {}
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    phone_raw = (data.get("phone") or "").strip()
    phone    = normalize_phone(phone_raw) if phone_raw else None
    password = data.get("password") or ""
    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    if phone and users.find_one({"phone": phone}):
        return jsonify({"error": "Phone number already registered"}), 409
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    result = users.insert_one({
        "name": name, "email": email, "phone": phone, "password": hashed,
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

@app.route("/api/forgot-password/request-otp", methods=["POST"])
def forgot_password_request_otp():
    data = request.get_json(silent=True) or {}
    channel = (data.get("channel") or "").strip().lower()
    identifier = (data.get("identifier") or "").strip().lower()

    if channel not in ["email", "phone"]:
        return jsonify({"error": "Channel must be email or phone"}), 400
    if not identifier:
        return jsonify({"error": "Identifier is required"}), 400

    lookup_key = "email"
    lookup_val = identifier
    if channel == "email":
        if not re.match(r"[^@]+@[^@]+\.[^@]+", identifier):
            return jsonify({"error": "Invalid email address"}), 400
    else:
        normalized_phone = normalize_phone(identifier)
        if not normalized_phone:
            return jsonify({"error": "Invalid phone number"}), 400
        lookup_key = "phone"
        lookup_val = normalized_phone
        identifier = normalized_phone

    user = users.find_one({lookup_key: lookup_val})
    if not user:
        return jsonify({"message": "If account exists, OTP has been sent"}), 200

    now = datetime.utcnow()
    recent = password_resets.find_one({
        "identifier": identifier,
        "verified": False,
        "used": False,
        "expires_at": {"$gt": now}
    }, sort=[("created_at", -1)])
    if recent and (now - recent["created_at"]).total_seconds() < 60:
        return jsonify({"error": "Please wait 60 seconds before requesting a new OTP"}), 429

    otp = f"{random.randint(0, 999999):06d}"
    reset_doc = {
        "user_id": str(user["_id"]),
        "channel": channel,
        "identifier": identifier,
        "otp_hash": otp_hash(identifier, otp),
        "expires_at": now + timedelta(minutes=5),
        "created_at": now,
        "attempts": 0,
        "verified": False,
        "used": False
    }
    password_resets.insert_one(reset_doc)

    try:
        if channel == "email":
            send_otp_email(identifier, otp)
        else:
            send_otp_sms(identifier, otp)
    except Exception as e:
        return jsonify({"error": f"Failed to send OTP: {str(e)}"}), 500

    return jsonify({"message": "If account exists, OTP has been sent"}), 200

@app.route("/api/forgot-password/verify-otp", methods=["POST"])
def forgot_password_verify_otp():
    data = request.get_json(silent=True) or {}
    channel = (data.get("channel") or "").strip().lower()
    identifier = (data.get("identifier") or "").strip().lower()
    otp = (data.get("otp") or "").strip()

    if channel not in ["email", "phone"]:
        return jsonify({"error": "Channel must be email or phone"}), 400
    if not identifier or not otp:
        return jsonify({"error": "Identifier and OTP are required"}), 400

    if channel == "phone":
        normalized_phone = normalize_phone(identifier)
        if not normalized_phone:
            return jsonify({"error": "Invalid phone number"}), 400
        identifier = normalized_phone

    reset_doc = password_resets.find_one({
        "channel": channel,
        "identifier": identifier,
        "verified": False,
        "used": False
    }, sort=[("created_at", -1)])

    if not reset_doc:
        return jsonify({"error": "No OTP request found"}), 404
    if datetime.utcnow() > reset_doc["expires_at"]:
        return jsonify({"error": "OTP expired"}), 400
    if reset_doc.get("attempts", 0) >= 5:
        return jsonify({"error": "Too many invalid attempts"}), 429

    if otp_hash(identifier, otp) != reset_doc["otp_hash"]:
        password_resets.update_one({"_id": reset_doc["_id"]}, {"$inc": {"attempts": 1}})
        return jsonify({"error": "Invalid OTP"}), 400

    password_resets.update_one({"_id": reset_doc["_id"]}, {"$set": {"verified": True, "verified_at": datetime.utcnow()}})
    token = make_password_reset_token(reset_doc["user_id"], str(reset_doc["_id"]))
    return jsonify({"message": "OTP verified", "reset_token": token}), 200

@app.route("/api/forgot-password/reset-password", methods=["POST"])
def forgot_password_reset_password():
    data = request.get_json(silent=True) or {}
    reset_token = (data.get("reset_token") or "").strip()
    new_password = data.get("new_password") or ""

    if not reset_token or not new_password:
        return jsonify({"error": "Reset token and new password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    payload = verify_password_reset_token(reset_token)
    if not payload:
        return jsonify({"error": "Invalid or expired reset token"}), 401

    reset_id = payload.get("rid")
    user_id = payload.get("sub")
    if not reset_id or not user_id:
        return jsonify({"error": "Invalid reset token payload"}), 401

    reset_doc = password_resets.find_one({"_id": ObjectId(reset_id)})
    if not reset_doc:
        return jsonify({"error": "Reset request not found"}), 404
    if reset_doc.get("used"):
        return jsonify({"error": "Reset token already used"}), 400
    if not reset_doc.get("verified"):
        return jsonify({"error": "OTP not verified"}), 400
    if datetime.utcnow() > reset_doc["expires_at"] + timedelta(minutes=10):
        return jsonify({"error": "Reset session expired"}), 400

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
    users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed}})
    password_resets.update_one({"_id": reset_doc["_id"]}, {"$set": {"used": True, "used_at": datetime.utcnow()}})

    return jsonify({"message": "Password updated successfully"}), 200

@app.route("/api/me", methods=["GET"])
@auth_required
def get_me():
    user = users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"name": user["name"], "email": user["email"], "streak": user.get("streak", 0)})


# ==============================
# Mood APIs
# ==============================

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


# ==============================
# Quiz APIs
# ==============================

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

@app.route("/api/quiz/history", methods=["GET"])
@auth_required
def quiz_history():
    """Return all quiz submissions for the user, mapped to a 1-5 wellness scale for charting."""
    days = int(request.args.get("days", 30))
    since = datetime.utcnow() - timedelta(days=days)
    all_quizzes = list(quizzes.find(
        {"user_id": request.user_id, "date": {"$gte": since}},
        {"_id": 0, "score": 1, "result": 1, "date": 1}
    ).sort("date", 1))

    def score_to_wellness(s):
        if s <= 4:   return 5
        elif s <= 9:  return 4
        elif s <= 14: return 2
        else:         return 1

    result = []
    for q in all_quizzes:
        result.append({
            "date": q["date"].strftime("%Y-%m-%d"),
            "quiz_score": q["score"],
            "wellness": score_to_wellness(q["score"]),
            "level": q.get("result", {}).get("level", "")
        })
    return jsonify(result)


# ==============================
# Dashboard Summary API
# ==============================

@app.route("/api/dashboard/summary", methods=["GET"])
@auth_required
def dashboard_summary():
    """Combined check-in count: quiz submissions + mood logs."""
    quiz_count = quizzes.count_documents({"user_id": request.user_id})
    mood_count = moods.count_documents({"user_id": request.user_id})
    total = quiz_count + mood_count
    user = users.find_one({"_id": ObjectId(request.user_id)})
    return jsonify({
        "total_checkins": total,
        "quiz_count": quiz_count,
        "mood_count": mood_count,
        "streak": user.get("streak", 0) if user else 0
    })

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# ==============================
# Chatbot API (Gemini Backend)
# ==============================

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat_api():
    if request.method == 'OPTIONS':
        return '', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

    data    = request.json
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    url     = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    try:
        response  = requests.post(url, json=data, timeout=30)
        resp_json = response.json()
        if response.status_code != 200:
            print(f"[Gemini Error] Status {response.status_code}: {resp_json}")
        return jsonify(resp_json), response.status_code, {'Access-Control-Allow-Origin': '*'}

    except requests.exceptions.Timeout:
        return jsonify({"error": "Gemini API timed out. Try again."}), 504, {'Access-Control-Allow-Origin': '*'}

    except Exception as e:
        print(f"[Gemini Error] {e}")
        return jsonify({"error": str(e)}), 500, {'Access-Control-Allow-Origin': '*'}


if __name__ == "__main__":
    app.run(debug=True, port=5000)