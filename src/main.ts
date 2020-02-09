import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CryptoService } from './crypto/crypto.service';
import { FileService } from './file/file.service';
import * as path from 'path';

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

  const file = await app.get(FileService);
  const filePath = path.join(__dirname, 'test-file.txt');
  console.log('creating file', filePath);
  await file.create(password, filePath, 'hello');
  console.log('file created');
  try {
    const resultFile = await file.decryptFile(password, filePath + '.enc');
    console.log('decrypted file', resultFile);
  } catch (e) {
    console.log('error decrypting', e);
  }
}
bootstrap();
