const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const uvicorn = isWin ? 'venv/Scripts/uvicorn' : 'venv/bin/uvicorn';
const ragDir = path.resolve(__dirname, '../../postmom-rag');

const proc = spawn(uvicorn, ['main:app', '--reload', '--port', '8000'], {
  cwd: ragDir,
  stdio: 'inherit',
  shell: true,
});

proc.on('error', (err) => {
  console.error('[RAG] 실행 실패:', err.message);
  process.exit(1);
});
