@echo off
cd /d "%~dp0..\postmom-rag"
venv\Scripts\uvicorn.exe main:app --reload --port 8000
