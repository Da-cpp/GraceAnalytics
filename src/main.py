import os
from langchain_core.messages import HumanMessage
from .retriever import ingest_documents, get_retriever_tool
from .agents.graph import build_graph

def main():
    print("🚀 Initializing Agentic RAG System...")
    

    current_file_dir = os.path.dirname(os.path.abspath(__file__))

    pdf_path = os.path.join(current_file_dir, "media", "GK25split.pdf")
    if not os.path.exists(pdf_path):
        print(f"❌ ERROR: Could not find the file at: {pdf_path}")
        print("Please ensure the 'media' folder is in the project root.")
        return

    file_paths = [pdf_path]
    
    print("\n📚 Ingesting documents into FAISS vector store...")
    try:
        vectorstore = ingest_documents(file_paths)
        print("✅ Documents ingested successfully!")
    except Exception as e:
        print(f"⚠️  Warning: Could not ingest documents: {e}")
        import traceback
        traceback.print_exc()
        return
    
    retriever_tool = get_retriever_tool(vectorstore)
    tools = [retriever_tool]
    
    print("\n🔧 Building LangGraph state machine...")
    app = build_graph(tools)
    print("✅ Graph built successfully!")
    
    print("\n" + "="*60)
    print("🤖 Grace Intelligence Agent Ready!")
    print("="*60)
    
    questions = [
        "Who did the audit reports for Grace Kennedy in 2025?",
    ]
    
    for question in questions:
        print(f"\n\n{'='*60}")
        print(f"❓ Question: {question}")
        print('='*60)
        
        inputs = {"messages": [HumanMessage(content=question)]}
        
        print("\n🔄 Processing nodes...\n")
        
        try:
            for output in app.stream(inputs):
                for key, value in output.items():
                    print(f"📍 Node: {key}")
                    if "messages" in value:
                        last_msg = value["messages"][-1]
                        if hasattr(last_msg, 'content') and last_msg.content:
                            print(f"💬 Output: {last_msg.content[:200]}...")
                        elif hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
                            print(f"🔧 Tool Call: {last_msg.tool_calls[0]['name']}")
                    print("-" * 20)
            
            final_node = list(output.keys())[-1]
            final_message = output[final_node]["messages"][-1]
            
            print("\n" + "="*60)
            print("✨ FINAL ANSWER:")
            print("="*60)
            print(final_message.content)
            print("="*60)
            
        except Exception as e:
            print(f"❌ Error during graph execution: {e}")

if __name__ == "__main__":
    main()