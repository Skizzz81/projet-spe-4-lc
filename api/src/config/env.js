import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envFilePath = fileURLToPath(new URL('../../../.env', import.meta.url));

if (existsSync(envFilePath)) {
  process.loadEnvFile(envFilePath);
}
