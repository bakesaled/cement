import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CryptoService } from './crypto/crypto.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const crypto = await app.get(CryptoService);
  const password = 'pass';
  const hash = await crypto.generateHash(password);
  const valid = await crypto.verifyHash(hash, password);
  console.log('valid', valid);
  const encryptedValue = await crypto.encrypt(hash, 'blah');
  console.log('encrypted', encryptedValue);
  const decryptedValue = await crypto.decrypt(
    encryptedValue.hash,
    encryptedValue,
  );
  console.log('dec', decryptedValue);
}
bootstrap();
