require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { app, prisma } = require('./app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ POSTMOM 서버 실행 중 → http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} 수신, 서버를 종료합니다...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
