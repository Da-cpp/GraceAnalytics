from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.tools import Tool
from .config import get_embeddings
import os


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