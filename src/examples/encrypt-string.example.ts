import * as path from 'path';
import { CryptoService } from '../crypto';
import { FileService } from '../file';
import { config } from '../config';

export class EncryptStringExample {
  async run() {
    const crypto = new CryptoService();
    const password = 'pass';
    const hash = await crypto.generateHash(password);
    const valid = await crypto.verifyHash(hash, password);
    console.log('valid', valid);
    const encryptedValue = await crypto.encrypt(hash, 'blah');
    console.log('encrypted', encryptedValue);
    const decryptedValue = await crypto.decrypt(
      encryptedValue.hash,
      encryptedValue
    );
    console.log('dec', decryptedValue);

    const file = new FileService(crypto);
    const filePath = path.join(__dirname, 'test-file.txt');
    console.log('creating file', filePath);
    await file.create(password, filePath, 'hello');
    console.log('file created');
    try {
      const resultFile = await file.decryptFile(
        password,
        filePath + config.FILE_EXTENSION
      );
      console.log('decrypted file', resultFile);
    } catch (e) {
      console.log('error decrypting', e);
    }
  }
}
