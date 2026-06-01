# RAG deployment

Run this folder as a separate Python/FastAPI service.

Environment:

```env
GOOGLE_API_KEY=
```

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

The Node server must point to this service with `RAG_URL`.

```env
RAG_URL=https://your-rag-service.example.com
```

For local development from the repository root:

```bash
python -m venv rag/venv
rag/venv/Scripts/python.exe -m pip install -r rag/requirements.txt
npm.cmd run dev
```

