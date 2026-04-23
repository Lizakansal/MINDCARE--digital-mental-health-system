from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

# ==============================
# 🔹 Setup
# ==============================
load_dotenv()

app = Flask(__name__)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["mindcare"]

users = db["users"]
responses = db["responses"]

FRONTEND_FOLDER = "../frontend"   # adjust if needed


# ==============================
# 🔹 Serve Frontend Pages
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


# ==============================
# 🔹 REGISTER API
# ==============================

@app.route('/register', methods=['POST'])
def register():
    data = request.form

    name = data.get("fullname")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not email or not password:
        return "Missing required fields"

    # Check if user exists
    if users.find_one({"email": email}):
        return '''
        <script>
            alert("User already exists!");
            window.location.href="/register.html";
        </script>
        '''

    users.insert_one({
        "name": name,
        "email": email,
        "phone": phone,
        "password": password,
        "created_at": datetime.now()
    })

    return '''
    <script>
        alert("Registration successful!");
        window.location.href="/login.html";
    </script>
    '''


# ==============================
# 🔹 LOGIN API
# ==============================

@app.route('/login', methods=['POST'])
def login():
    data = request.form

    username = data.get("username")
    password = data.get("password")

    user = users.find_one({
        "$or": [
            {"email": username},
            {"name": username}
        ]
    })

    if not user:
        return '''
        <script>
            alert("User not found!");
            window.location.href="/login.html";
        </script>
        '''

    if user["password"] != password:
        return '''
        <script>
            alert("Incorrect password!");
            window.location.href="/login.html";
        </script>
        '''

    return '''
    <script>
        alert("Login successful!");
        window.location.href="/dashboard.html";
    </script>
    '''


# ==============================
# 🔹 QUIZ SUBMIT API
# ==============================

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json

    if not data:
        return jsonify({"error": "No data"}), 400

    data["created_at"] = datetime.now()

    responses.insert_one(data)

    return jsonify({"message": "Quiz saved"})


# ==============================
# 🔹 VIEW DATA (Testing)
# ==============================

@app.route('/users', methods=['GET'])
def get_users():
    return jsonify(list(users.find({}, {"_id": 0})))

@app.route('/responses', methods=['GET'])
def get_responses():
    return jsonify(list(responses.find({}, {"_id": 0})))


# ==============================
# 🔹 DELETE (Testing)
# ==============================

@app.route('/delete-all', methods=['DELETE'])
def delete_all():
    users.delete_many({})
    responses.delete_many({})
    return jsonify({"message": "All data deleted"})


# ==============================
# 🔹 Run Server
# ==============================

if __name__ == "__main__":
    app.run(debug=True)