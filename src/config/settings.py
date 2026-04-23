import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 

if not ANTHROPIC_API_KEY:
    print("Warning: ANTHROPIC_API_KEY is not set in your .env file")