import { createServer } from './server.js';
import { connectDb } from './config/db.js';
import dotenv from 'dotenv';

import { DEFAULT_LMS_DATA } from './data/defaultLmsData.js';
import { seedDefaultAppData } from './services/appData.service.js';

dotenv.config();

const initialPort = Number(process.env.PORT || 5000);

const dbConnected = await connectDb();
if (dbConnected) {
  await seedDefaultAppData(DEFAULT_LMS_DATA);
}

const app = createServer();

function listenWithRetry(startPort, maxAttempts = 10) {
  let port = startPort;

  const attempt = () => {
    const server = app.listen(port, () => {
      process.env.PORT = String(port);
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err?.code === 'EADDRINUSE' && port < startPort + maxAttempts - 1) {
        // eslint-disable-next-line no-console
        console.warn(`Port ${port} is in use, trying ${port + 1}...`);
        port += 1;
        attempt();
        return;
      }

      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
  };

  attempt();
}

listenWithRetry(initialPort);
