from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

app = Flask(__name__)

# 🔹 Load environment variables
load_dotenv()

# 🔹 Get Mongo URI from .env
mongo_uri = os.getenv("MONGO_URI")

# 🔹 Connect to MongoDB
client = MongoClient(mongo_uri)
db = client.get_database()   # automatically uses DB from URI
users_collection = db["users"]

# 🔹 Register Route
@app.route('/register', methods=['POST'])
def register():
    try:
        # ✅ form-data (no change needed)
        fullname = request.form.get('fullname')
        email = request.form.get('email')
        phone = request.form.get('phone')
        password = request.form.get('password')

        print(fullname, email, phone, password)

        # ❌ Validation
        if not fullname or not email or not password:
            return "Missing required fields", 400

        # ❌ Check duplicate email
        if users_collection.find_one({"email": email}):
            return "Email already registered", 400

        # ✅ Insert user
        user_data = {
            "fullname": fullname,
            "email": email,
            "phone": phone,
            "password": password
        }

        users_collection.insert_one(user_data)

        return "User registered successfully", 200

    except Exception as e:
        print(e)
        return "Error occurred", 500


# 🔹 Run server
if __name__ == '__main__':
    app.run(debug=True)