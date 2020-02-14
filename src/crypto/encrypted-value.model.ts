interface EncryptedValue {
  hash: string;
  iv: string;
  tag: string;
  value: string;
}
export class EncryptedValueModel implements EncryptedValue {
  static readonly newLine = '\n';
  static readonly separator = '#';
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

  public get hashPart() {
    return EncryptedValueModel.extractHashPart(this.hash);
  }

  public get header() {
    return (
      `cement${EncryptedValueModel.separator}${this.iv}` +
      `${EncryptedValueModel.separator}${this.tag}` +
      `${EncryptedValueModel.separator}${this.hash}` +
      `${EncryptedValueModel.separator}`
    );
  }

  constructor(hash: string, iv: Buffer, tag: Buffer, value: string) {
    this.hash = hash;
    this.iv = iv.toString('hex');
    this.tag = tag.toString('hex');
    this.value = value;
  }

  /**
   * Assumes argon2i hash format
   * @param argon2iHash
   */
  public static extractHashPart(argon2iHash: string) {
    return argon2iHash.split(',')[2].split('$')[2];
  }

  public static fromString(source: string) {
    const sourceParts = EncryptedValueModel.validateString(source);
    return new EncryptedValueModel(
      sourceParts[3], // hash
      Buffer.from(sourceParts[1], 'hex'), // iv
      Buffer.from(sourceParts[2], 'hex'), // tag
      sourceParts[4] // value
    );
  }

  private static validateString(source: string) {
    const sourceParts = source.split('#');
    if (sourceParts.length !== 5) {
      throw new Error('String has invalid parts.');
    }
    if (sourceParts[0] !== 'cement') {
      throw new Error('String is corrupt.');
    }

    return sourceParts;
  }

  public toString() {
    return `${this.header}${EncryptedValueModel.newLine}${this.value}`;
  }
}
