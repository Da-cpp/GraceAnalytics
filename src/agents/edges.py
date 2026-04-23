from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from ..config import get_llm

class GradeDocuments(BaseModel):
    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )
    reasoning: str = Field(
        description="Brief explanation of why documents are or aren't relevant"
    )

def create_grade_documents():
    llm = get_llm()
    structured_llm = llm.with_structured_output(GradeDocuments)
    
    def grade_documents(state):
        messages = state["messages"]
        
        question = "Unknown Question"
        for m in messages:
            if isinstance(m, HumanMessage):
                question = m.content
                break
        
        last_message = messages[-1]
        
        if not hasattr(last_message, 'content'):
            return "generate"
        
        documents_content = last_message.content
        
        grade_instructions = """You are a strict document grader. 
Your job is to determine if the retrieved documents contain SPECIFIC and DIRECT information to answer the user's question.
Be STRICT:
- Only grade 'yes' if the context is sufficient to answer.
- Grade 'no' if the information is missing, vague, or unrelated."""

        grade = structured_llm.invoke([
            SystemMessage(content=grade_instructions),
            HumanMessage(content=f"Question: {question}\n\nRetrieved Documents: {documents_content[:1500]}")
        ])
        
        print(f"\n🔍 Grading Result: {grade.binary_score.upper()}")
        print(f"💭 Reasoning: {grade.reasoning}\n")
        
        if grade.binary_score.lower() == "yes":
            return "generate"
        else:
            return "rewrite"
    
    return grade_documents

def route_after_agent(state):
    messages = state["messages"]
    last_message = messages[-1]
    
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "retrieve"
    else:
        return "end"