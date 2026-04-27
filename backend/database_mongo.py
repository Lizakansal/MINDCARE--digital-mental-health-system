from pymongo import MongoClient
from dotenv import load_dotenv
import os

# 🔹 Load .env variables
load_dotenv()

# 🔹 Get Mongo URI
MONGO_URI = os.getenv("MONGO_URI")

# 🔹 Connect to MongoDB
client = MongoClient(MONGO_URI)

# 🔹 Select database (from URI or default name)
db = client.get_database()

# 🔹 Collection
users_collection = db["users"]

