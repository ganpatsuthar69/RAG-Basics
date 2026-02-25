from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_qdrant import QdrantVectorStore
from config import GOOGLE_API_KEY, QDRANT_URL, QDRANT_API_KEY, COLLECTION_NAME

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector_db = QdrantVectorStore.from_existing_collection(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    collection_name=COLLECTION_NAME,
    embedding=embedding_model)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0)

def ask_question(query: str):
    search_results = vector_db.max_marginal_relevance_search(query=query, k=8, fetch_k=20  )

    context = "\n\n".join([f"Page {doc.metadata.get('page_label', 'N/A')}:\n{doc.page_content}" for doc in search_results])

    prompt = f"""
                    You are an expert document analyst.

                    Answer the question strictly using the provided context.
                    If the answer is partially available, explain clearly.
                    If not found, say: "The document does not contain this information."

                    Be precise and structured.

                    Context:
                    {context}

                    Question:
                    {query}
             """

    response = llm.invoke(prompt)
    return response.content