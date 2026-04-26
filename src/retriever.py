from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.tools import Tool
from .config import get_embeddings
import os
import json
from datetime import datetime

def get_model_context():
    current_file_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_file_dir, "media", "rag_documents.json")
    with open(json_path, 'r') as f:
        return json.load(f)

def get_propensity_tool():
    def query_model(query: str):
        data = get_model_context()
        today = datetime.now()
        

        query_clean = query.lower().replace(".", "")
        relevant_data = []
        
        for item in data:
            parish_in_json = item.get('metadata', {}).get('parish', '').lower().replace(".", "")
            if parish_in_json in query_clean or query_clean in parish_in_json:
                relevant_data.append(item)

       
        is_payday_period = 25 <= today.day <= 31 or 1 <= today.day <= 2
        payday_context = "CRITICAL: Today is in the PEAK PAYDAY period. Propensity is boosted." if is_payday_period else ""

        if not relevant_data:
            return {"error": "No specific data found for that region.", "payday": payday_context}

        return {
            "payday_alert": payday_context,
            "data": relevant_data,
            "timestamp": today.strftime("%B %d, %Y")
        }

    return Tool(
        name="query_propensity_model",
        func=query_model,
        description="Query the model for parish-level stats like St Andrew, Kingston, etc."
    )

def ingest_documents(file_paths: list[str]):
    all_docs = []

    for path in file_paths:
        print(f"📄 Loading local file: {path}")
        loader = PyPDFLoader(path)
        docs = loader.load()

        for doc in docs:
            doc.metadata["source"] = os.path.basename(path)
            doc.metadata["page"] = doc.metadata.get("page", "unknown")

        all_docs.extend(docs)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200
    )

    splits = splitter.split_documents(all_docs)

    vectorstore = FAISS.from_documents(
        documents=splits,
        embedding=get_embeddings()
    )

    print("✅ Vector store created successfully.")
    return vectorstore


def get_retriever_tool(vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    def retrieve(query: str):
        docs = retriever.invoke(query)
        
        content = "\n\n".join([d.page_content for d in docs])
        return content, docs 

    return Tool(
        name="retrieve_documents",
        func=retrieve,
        description="Retrieve relevant documents from the knowledge base.",
        response_format="content_and_artifact" 
    )


def format_docs(docs):
    if not docs or not isinstance(docs, list):
        return "No documents retrieved."
        
    formatted = []
    for i, d in enumerate(docs):

        source = d.metadata.get('source', 'GraceKennedy_Internal')
        
        page = d.metadata.get('page', 0)
        actual_page = page + 1 if isinstance(page, int) else '?'
        
        content = f"--- [Document {i+1}] ---\n"
        content += f"SOURCE: {source}\n"
        content += f"PAGE: {actual_page}\n"
        content += f"CONTENT: {d.page_content}\n"
        formatted.append(content)

    return "\n\n".join(formatted)