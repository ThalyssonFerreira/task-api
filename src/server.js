import { config } from 'dotenv';
config();

import { buildApp } from './app.js';

const PORT = process.env.PORT || 3000;

const app = await buildApp();
app.listen({ port: Number(PORT), host: '0.0.0.0' })
  .then(addr => app.log.info(`listening on ${addr}`))
  .catch(err => {
    app.log.error(err);
    process.exit(1);
  });
