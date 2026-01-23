import { createApp } from './index.js';
import { config } from './config/environment.js';

const app = createApp();

const PORT = config.port;
const HOST = '0.0.0.0'; // Listen on all interfaces for Cloud Run

app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend server running on http://${HOST}:${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API: http://${HOST}:${PORT}/api`);
  console.log(`❤️  Health: http://${HOST}:${PORT}/api/health`);
});
