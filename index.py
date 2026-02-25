from pathlib import Path
import pymupdf4llm
from langchain_core.documents import Document
from langchain_text_splitters import MarkdownTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from config import QDRANT_URL, QDRANT_API_KEY, COLLECTION_NAME

pdf_path = Path(__file__).parent / "icic.pdf"

# Extract Markdown from PDF (handles tables and OCR images natively)
md_text = pymupdf4llm.to_markdown(str(pdf_path))

# Wrap in Langchain Document format so downstream logic remains unchanged
docs = [Document(page_content=md_text, metadata={"source": str(pdf_path)})]

text_splitter = MarkdownTextSplitter(chunk_size=2500, chunk_overlap=300)

chunks = text_splitter.split_documents(docs)

# Huggingface
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


vector_store = QdrantVectorStore.from_documents(
    documents=chunks,
    embedding=embedding_model,
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    collection_name=COLLECTION_NAME)

print("Indexing Complete in Qdrant Cloud.")