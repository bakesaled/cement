import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import { EncryptTransform } from '../crypto/encrypt.transform';
import { DecryptTransform } from '../crypto/decrypt.transform';
import { Readable } from 'stream';
import { config } from '../config';

@Injectable()
export class FileService {
  constructor(private cryptoService: CryptoService) {}
  async create(password: string, filePath: string, content: string) {
    const resultStream = new Readable();
    resultStream.push(content);
    resultStream.push(null);
    await this.encryptToFile(password, filePath, resultStream);
  }

  async encryptExistingFile(password: string, filePath: string) {
    const readStream = fs.createReadStream(filePath);
    await this.encryptToFile(password, filePath, readStream);
  }

  async decryptFile(password: string, filePath: string) {
    return new Promise((resolve, reject) => {
      let decryptedData = '';
      const readStream = fs.createReadStream(filePath);
      const unzip = zlib.createGunzip();
      readStream
        .pipe(unzip)
        .pipe(new DecryptTransform(this.cryptoService))
        .on('data', (data: string) => {
          decryptedData += data;
        })
        .on('error', e => {
          reject(e);
        })
        .on('finish', () => {
          resolve(decryptedData);
        });
    });
  }

  private async encryptToFile(
    password: string,
    filePath: string,
    stream: Readable,
  ) {
    const hash = await this.cryptoService.generateHash(password);
    return new Promise((resolve, reject) => {
      const encryptTransform = new EncryptTransform(this.cryptoService, hash);
      const writeStream = fs.createWriteStream(
        path.join(filePath + config.FILE_EXTENSION),
      );
      stream
        // .pipe(resultStream)
        .pipe(encryptTransform)
        .pipe(zlib.createGzip())
        .pipe(writeStream)
        .on('error', e => reject(e))
        .on('finish', () => {
          resolve();
        });
    });
  }
}
