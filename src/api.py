import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from .agents.graph import build_graph
from .retriever import ingest_documents, get_retriever_tool, get_propensity_tool

app = FastAPI(title="Grace Intelligence API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


current_file_dir = os.path.dirname(os.path.abspath(__file__))
pdf_path = os.path.join(current_file_dir, "media", "GK25split.pdf")

print("🚀 API: Ingesting documents...")
vectorstore = ingest_documents([pdf_path])
retriever_tool = get_retriever_tool(vectorstore)
propensity_tool = get_propensity_tool()

graph = build_graph([retriever_tool, propensity_tool])

print("✅ API: System Ready.")

class ChatQuery(BaseModel):
    text: str


@app.post("/ask")
async def ask_ai(query: ChatQuery):
    try:
        
        inputs = {"messages": [HumanMessage(content=query.text)]}
        
       
        result = graph.invoke(inputs)
        
      
        final_message = result["messages"][-1].content
        
        return {"answer": final_message}
    
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)