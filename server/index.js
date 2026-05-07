require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { app } = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ POSTMOM 서버 실행 중 → http://localhost:${PORT}`);
});
