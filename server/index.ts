import { app } from './app';
import { env } from './config/env';

app.listen(env.API_PORT, () => {
  console.log(`🚀 CadanPlus API rodando em http://${env.API_HOST}:${env.API_PORT}`);
});
