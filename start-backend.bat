@echo off
start "RAG Server" cmd /k "cd /d "%~dp0..\postmom-rag" && venv\Scripts\uvicorn.exe main:app --reload --port 8000"
start "Node Server" cmd /k "cd /d "%~dp0server" && node index.js"
