require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[startup] 필수 환경변수 누락: ${missing.join(', ')}`);
  process.exit(1);
}

const { app } = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ POSTMOM 서버 실행 중 → http://localhost:${PORT}`);
});
