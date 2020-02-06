interface EncryptedValue {
  hash: string;
  iv: string;
  tag: string;
  value: string;
}
export class EncryptedValueModel implements EncryptedValue {
  hash: string;
  iv: string;
  tag: string;
  value: string;

  public get hashAsBuffer(): Buffer {
    return Buffer.from(this.hash, 'base64');
  }

  public get ivAsBuffer(): Buffer {
    return Buffer.from(this.iv, 'hex');
  }
  public get tagAsBuffer(): Buffer {
    return Buffer.from(this.tag, 'hex');
  }

  constructor(hash: string, iv: Buffer, tag: Buffer, value: string) {
    this.hash = hash;
    this.iv = iv.toString('hex');
    this.tag = tag.toString('hex');
    this.value = value;
  }
}
