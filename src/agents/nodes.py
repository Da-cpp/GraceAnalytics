from langchain_core.messages import HumanMessage, SystemMessage
from ..config import get_llm
from ..retriever import format_docs


def create_agent_node(tools):
    llm = get_llm()
    llm_with_tools = llm.bind_tools(tools)

    def agent(state):
        response = llm_with_tools.invoke(state["messages"])
        return {"messages": [response]}

    return agent


def create_rewrite_node():
    llm = get_llm()

    def rewrite(state):
        question = next(
            (m.content for m in state["messages"] if isinstance(m, HumanMessage)),
            state["messages"][0].content
        )

        response = llm.invoke([
            SystemMessage(content="Rewrite query for better retrieval."),
            HumanMessage(content=question)
        ])

        return {"messages": [HumanMessage(content=response.content)]}

    return rewrite



def create_generate_node():
    llm = get_llm()

    def generate(state):
        messages = state["messages"]
        retrieved_docs = state.get("retrieved_docs", [])

        context = format_docs(retrieved_docs)

        question = next(
            (m.content for m in messages if isinstance(m, HumanMessage)),
            messages[0].content
        )

        system_prompt = """You are the Grace Intelligence System.
Your goal is to answer the user's question using the provided PDF context.

CITATION RULES:
1. You MUST cite every claim using a bracketed number, e.g., "The revenue grew by 10% [1]."
2. At the end of your response, create a "SOURCES & FOOTNOTES" section.
3. In that section, list the sources like this: [1] GK25split.pdf, Page 14.

Strictness: If the answer isn't in the context, state 'Information not found in current internal records.'"""

        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"CONTEXT:\n{context}\n\nQUESTION:\n{question}")
        ])

        return {"messages": [response]}

    return generate