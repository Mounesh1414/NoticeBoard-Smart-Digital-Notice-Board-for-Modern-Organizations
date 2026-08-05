import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { attachSocketServer } from './services/socket.js';
import { startNoticeLifecycleLoop } from './services/store.js';

dotenv.config();

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  attachSocketServer(server);
  startNoticeLifecycleLoop();

  server.listen(port, () => {
    console.log(`NoticeBoard API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
