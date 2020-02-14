import { Transform } from 'stream';
import { EncryptedValueModel } from './encrypted-value.model';
import { CryptoService } from './crypto.service';
import { config } from '../config';

export class DecryptTransform extends Transform {
  prev;
  header;
  constructor(private cryptoService: CryptoService, options?) {
    super(options);
  }

  _transform(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void,
  ) {
    if (this.header) {
      this.extractBody(chunk);
    } else {
      this.prev = null;
      this.extractHeader(chunk);
    }
    callback();
  }

  _flush(callback: (error?: Error | null) => void) {
    if (!this.header) {
      callback(new Error('Header is invalid'));
    }
    try {
      const encryptedValue = EncryptedValueModel.fromString(this.header);
      const value = this.cryptoService.decryptSync(
        encryptedValue.hash,
        encryptedValue,
      );
      this.push(value);
    } catch (e) {
      callback(e);
    }
    callback();
  }

  private extractHeader(chunk: any) {
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk);
    }
    let buffer: Buffer = chunk;
    let start = 0;

    if (this.prev) {
      start = this.prev.length;
      buffer = Buffer.concat([this.prev, chunk]);
      this.prev = null;
    }

    const bufferLength = buffer.length;
    for (let i = start; i < bufferLength; i++) {
      const char = buffer[i];
      if (char === EncryptedValueModel.newLine.charCodeAt(0)) {
        this.header = buffer.toString(config.UTF8_FILE_ENCODING);
      }
    }

    this.prev = buffer;
  }

  private extractBody(chunk: any) {
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk);
    }
    let buffer: Buffer = chunk;
    if (this.prev) {
      buffer = Buffer.concat([this.prev, chunk]);
      this.prev = null;
    }
    this.prev = buffer;
  }
}
