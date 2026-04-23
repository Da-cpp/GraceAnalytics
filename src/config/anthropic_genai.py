from langchain_anthropic import ChatAnthropic
from langchain_community.embeddings import HuggingFaceEmbeddings # Free local embeddings
from .settings import ANTHROPIC_API_KEY

def get_llm():
    """Returns the Claude model for the 'Agent' and 'Generate' nodes."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not found in settings")
        
    return ChatAnthropic(
        # model="claude-4-5-sonnet-20250929", 
        model="claude-sonnet-4-6",
        anthropic_api_key=ANTHROPIC_API_KEY,
        temperature=0
    )

def get_embeddings():
    """Returns a model to turn your PDF/Text documents into searchable numbers."""
    # This runs locally on your machine for free
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")