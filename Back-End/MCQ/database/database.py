import os
import time
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Load environment variables
load_dotenv()

# Get MongoDB URI from .env
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in the .env file!")

# Connect to MongoDB Atlas with retry mechanism
while True:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client.get_database("mcq_quiz_platform")  # Update database name if needed
        users_collection = db["users"]
        quizzes_collection = db["quizzes"]
        responses_collection = db["user_responses"]
        unit_quizzes = db["unit_quizzes"]
        unit_quiz_responses = db["unit_quiz_responses"]
        print(" Connected to MongoDB Atlas")
        break
    except ConnectionFailure as e:
        print(" Database connection failed:", e)
        time.sleep(2)  # Retry every 2 seconds
