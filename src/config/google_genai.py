# import os
# from dotenv import load_dotenv
# from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

# load_dotenv()

# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# def get_llm():
#     """Returns the free Gemini model for your RAG nodes."""
#     return ChatGoogleGenerativeAI(
#         model="gemini-2.0-flash", 
#         google_api_key=GOOGLE_API_KEY,
#         temperature=0
#     )

# def get_embeddings():
#     key = os.getenv("GOOGLE_API_KEY")
#     return GoogleGenerativeAIEmbeddings(
#         model="models/text-embedding-004",
#         google_api_key=key,
#         task_type="retrieval_document"
#     )

# def get_embeddings():
#     key = os.getenv("GOOGLE_API_KEY")
#     return GoogleGenerativeAIEmbeddings(
#         model="models/text-embedding-004",
#         google_api_key=key,

#         version="v1" 
#     )