from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime
import requests

# ==============================
# Setup
# ==============================
load_dotenv()

app = Flask(__name__)

MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    # Trigger a call to check connection
    client.server_info()
    db = client["mindcare"]
    users = db["users"]
    responses = db["responses"]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"CRITICAL: Could not connect to MongoDB. Error: {e}")
    # Fallback to dummy objects to prevent crash, but operations will fail
    db = None
    users = None
    responses = None

FRONTEND_FOLDER = "../frontend/html"   # Corrected path to HTML files


# ==============================
# Serve Frontend Pages
# ==============================

@app.route('/')
def home():
     return "Backend is running"

@app.route('/login.html')
def login_page():
    return send_from_directory(FRONTEND_FOLDER, 'login.html')

@app.route('/register.html')
def register_page():
    return send_from_directory(FRONTEND_FOLDER, 'register.html')

@app.route('/dashboard.html')
def dashboard_page():
    return send_from_directory(FRONTEND_FOLDER, 'dashboard.html')

@app.route('/onboarding.html')
def onboarding_page():
    return send_from_directory(FRONTEND_FOLDER, 'onboarding.html')

@app.route('/home.html')
def home_page():
    return send_from_directory(FRONTEND_FOLDER, 'home.html')

# Serve Static Files (CSS, JS, Images)
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('../frontend/css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('../frontend/js', filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('../frontend/assets', filename)


# ==============================
#  REGISTER API     
# ==============================

@app.route('/register', methods=['POST'])
def register():
    if users is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json if request.is_json else request.form

    name = data.get("fullname")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 409

    users.insert_one({
        "name": name,
        "email": email,
        "phone": phone,
        "password": password,
        "created_at": datetime.now()
    })

    return jsonify({"message": "Registration successful", "redirect": "/login.html"}), 201


# ==============================
# LOGIN API
# ==============================

@app.route('/login', methods=['POST'])
def login():
    if users is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json if request.is_json else request.form

    username = data.get("username")
    password = data.get("password")

    user = users.find_one({
        "$or": [
            {"email": username},
            {"name": username}
        ]
    })

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != password:
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({
        "message": "Login successful",
        "redirect": "/dashboard.html",
        "user": {
            "name": user.get("name"),
            "email": user.get("email")
        }
    }), 200


# ==============================
# QUIZ SUBMIT API
# ==============================

@app.route('/submit', methods=['POST'])
def submit():
    if responses is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json

    if not data:
        return jsonify({"error": "No data"}), 400

    email = data.get("email")
    if email:
        # Update or insert response for this user
        data["created_at"] = datetime.now()
        responses.insert_one(data)
        return jsonify({"message": "Quiz saved successfully"})
    else:
        # Fallback for anonymous
        data["created_at"] = datetime.now()
        responses.insert_one(data)
        return jsonify({"message": "Quiz saved anonymously"})


@app.route('/api/dashboard', methods=['GET'])
def dashboard_data():
    if responses is None:
        return jsonify({"error": "Database connection failed"}), 500
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400

    # Get latest quiz result
    latest_response = responses.find_one({"email": email}, sort=[("created_at", -1)])
    
    # Get all mood history
    all_responses = list(responses.find({"email": email}, {"_id": 0, "score": 1, "created_at": 1}).sort("created_at", 1))
    
    # Format mood history for chart
    mood_history = []
    for idx, resp in enumerate(all_responses):
        # Using a simple value from score for mood (1-5 scale)
        # Assuming score is 0-40, we can map it or use the 'answers'
        # For simplicity, let's just return what we have
        mood_history.append({
            "session": f"Check-in {idx+1}",
            "val": (resp.get("score", 0) // 8) + 1 # Simple mapping 0-40 to 1-5
        })

    return jsonify({
        "score": latest_response.get("score", 0) if latest_response else 0,
        "sessions": len(all_responses),
        "history": mood_history
    })


# ==============================
# CHATBOT API (Gemini Backend)
# ==============================

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat_api():
    # Handle CORS for VS Code Live Server
    if request.method == 'OPTIONS':
        return '', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    data = request.json
    # API key is safely stored on the backend now
    api_key = "AIzaSyASGNXbBsqspCym-jqdGWUxA8I8gtgUrx0" 
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={api_key}"
    
    try:
        response = requests.post(url, json=data)
        return jsonify(response.json()), response.status_code, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500, {'Access-Control-Allow-Origin': '*'}


# ==============================
# VIEW DATA (Testing)
# ==============================

@app.route('/users', methods=['GET'])
def get_users():
    return jsonify(list(users.find({}, {"_id": 0})))

@app.route('/responses', methods=['GET'])
def get_responses():
    return jsonify(list(responses.find({}, {"_id": 0})))


# ==============================
# DELETE (Testing)
# ==============================

@app.route('/delete-all', methods=['DELETE'])
def delete_all():
    users.delete_many({})
    responses.delete_many({})
    return jsonify({"message": "All data deleted"})


# ==============================
# Run Server
# ==============================

if __name__ == "__main__":
    app.run(debug=True)