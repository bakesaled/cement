import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EncryptedValueModel } from '../crypto/encrypted-value.model';
import { config } from '../config';
import { gzip, ungzip } from 'node-gzip';

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

    const writeStream = await fs.createWriteStream(
      path.join(filePath + '.enc'),
    );
    const zipped = await gzip(encryptedValue.toString());
    writeStream.write(zipped);
    writeStream.end();
  }

  async decryptFile(password: string, filePath: string) {
    const data = await fs.readFile(filePath);
    const unzippedData = await ungzip(data);
    const encryptedValue = EncryptedValueModel.fromString(
      unzippedData.toString(config.UTF8_ENCODING),
    );
    const valid = await this.cryptoService.verifyHash(
      encryptedValue.hash,
      password,
    );
    if (!valid) {
      throw Error('Invalid password');
    }
    return await this.cryptoService.decrypt(
      encryptedValue.hash,
      EncryptedValueModel.fromString(
        unzippedData.toString(config.UTF8_FILE_ENCODING),
      ),
    );
  }
}
