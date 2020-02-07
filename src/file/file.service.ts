import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EncryptedValueModel } from '../crypto/encrypted-value.model';
import { config } from '../config';

@Injectable()
export class FileService {
  constructor(private cryptoService: CryptoService) {}
  async create(password: string, filePath: string, content: string) {
    await fs.createFile(filePath);
    await this.encryptFile(password, filePath, content);
  }

  async encryptFile(password: string, filePath: string, content?: string) {
    if (!(await fs.pathExists(filePath))) {
      throw Error(`File does not exist at path: ${filePath}`);
    }
    if (content === null) {
      const contentBuffer = await fs.readFile(filePath);
      content = contentBuffer.toString(config.UTF8_FILE_ENCODING);
    }
    const hash = await this.cryptoService.generateHash(password);
    const encryptedValue = await this.cryptoService.encrypt(hash, content);

    const readStream = await fs.createReadStream(filePath);
    const writeStream = await fs.createWriteStream(
      path.join(filePath + '.enc'),
    );
    writeStream.write(encryptedValue.toString());
    writeStream.end();
    readStream.pipe(writeStream);
  }

  async decryptFile(password: string, filePath: string) {
    const data = await fs.readFile(filePath, config.UTF8_FILE_ENCODING);
    const encryptedValue = EncryptedValueModel.fromString(data);
    const valid = await this.cryptoService.verifyHash(
      encryptedValue.hash,
      password,
    );
    if (!valid) {
      throw Error('Invalid password');
    }
    return await this.cryptoService.decrypt(
      encryptedValue.hash,
      EncryptedValueModel.fromString(data),
    );
  }
}
