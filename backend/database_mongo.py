from config.db import db
from datetime import datetime

# Collection
users_collection = db["users"]


# Save user + quiz response
def save_response(data):
    data["created_at"] = datetime.now()
    result = users_collection.insert_one(data)
    return str(result.inserted_id)


# Get all responses
def get_all_responses():
    return list(users_collection.find({}, {"_id": 0}))


# Get user by email (optional)
def get_user_by_email(email):
    return users_collection.find_one({"email": email}, {"_id": 0})


# Delete all data (optional)
def delete_all_responses():
    users_collection.delete_many({})
    return "All data deleted"