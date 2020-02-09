import { Transform } from 'stream';

export class EncryptTransform extends Transform {
  private prev;
  constructor(private cryptoService, private hash: string, options?) {
    super(options);
  }

  _transform(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void,
  ) {
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk);
    }
    let buffer: Buffer = chunk;

    if (this.prev) {
      buffer = Buffer.concat([this.prev, chunk]);
      this.prev = null;
    }

    this.prev = buffer;
    callback();
  }

  _flush(callback: (error?: Error | null) => void) {
    try {
      const value = this.cryptoService.encryptSync(this.hash, this.prev);
      this.push(value.toString());
    } catch (e) {
      callback(e);
    }
    callback();
  }
}
