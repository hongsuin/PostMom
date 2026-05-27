import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWin = process.platform === 'win32';
const ragDir = resolve(process.env.POSTMOM_RAG_DIR || process.env.RAG_DIR || join(__dirname, '../../postmom-rag'));
const appTarget = process.env.RAG_APP || 'main:app';
const port = process.env.RAG_PORT || '8000';

function venvPythonPath(venvName) {
  return join(ragDir, venvName, isWin ? 'Scripts\\python.exe' : 'bin/python');
}

function setupHint() {
  console.error('[RAG] Setup example:');
  console.error(`  cd "${ragDir}"`);
  console.error('  python -m venv venv');
  console.error(isWin
    ? '  .\\venv\\Scripts\\python.exe -m pip install -r requirements.txt'
    : '  ./venv/bin/python -m pip install -r requirements.txt');
}

function resolvePythonCommand() {
  const configuredPython = process.env.POSTMOM_RAG_PYTHON || process.env.RAG_PYTHON;
  if (configuredPython) {
    return { command: configuredPython, args: ['-m', 'uvicorn'], label: configuredPython };
  }

  for (const venvName of ['venv', '.venv']) {
    const pythonPath = venvPythonPath(venvName);
    if (existsSync(pythonPath)) {
      return { command: pythonPath, args: ['-m', 'uvicorn'], label: `${venvName} virtualenv` };
    }
  }

  const fallback = isWin
    ? { command: 'py', args: ['-3', '-m', 'uvicorn'], label: 'system Python launcher' }
    : { command: 'python3', args: ['-m', 'uvicorn'], label: 'system python3' };

  console.warn('[RAG] No virtualenv found at "venv" or ".venv"; trying system Python.');
  setupHint();
  return fallback;
}

if (!existsSync(ragDir)) {
  console.error(`[RAG] Project directory not found: ${ragDir}`);
  console.error('[RAG] Set POSTMOM_RAG_DIR if the RAG project lives somewhere else.');
  process.exit(1);
}

const python = resolvePythonCommand();
const args = [...python.args, appTarget, '--reload', '--port', port];

console.log(`[RAG] Starting ${appTarget} on port ${port} using ${python.label}`);

const proc = spawn(python.command, args, {
  cwd: ragDir,
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, PYTHONUTF8: '1' },
});

proc.on('error', (err) => {
  console.error(`[RAG] Failed to start: ${err.message}`);
  setupHint();
  process.exit(1);
});

proc.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[RAG] Stopped by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
