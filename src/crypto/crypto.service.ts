import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { EncryptedValueModel } from './encrypted-value.model';
import { config } from '../config';

export class CryptoService {
  async generateHash(password: string) {
    const salt = crypto.randomBytes(config.KEY_LENGTH);

    let hash;
    try {
      hash = await argon2.hash(password, {
        salt: salt,
        type: argon2.argon2i,
        hashLength: config.KEY_LENGTH
      });
    } catch (e) {
      console.error('error', e);
    }
    return hash;
  }

  async verifyHash(hash, password) {
    return await argon2.verify(hash, password);
  }

  encrypt(hash: string, value: string): Promise<EncryptedValueModel> {
    return new Promise((resolve, reject) => {
      try {
        const encryptedValue = this.encryptSync(hash, value);
        resolve(encryptedValue);
      } catch (e) {
        reject(e);
      }
    });
  }

  encryptSync(hash: string, value: string): EncryptedValueModel {
    const iv = crypto.randomBytes(config.IV_LENGTH);
    const hashPart = EncryptedValueModel.extractHashPart(hash);

    const cipher = crypto.createCipheriv(
      config.CIPHER_ALGORITHM,
      Buffer.from(hashPart, config.BASE64_ENCODING),
      iv
    );
    let result = cipher.update(
      value,
      config.UTF8_ENCODING,
      config.BASE64_ENCODING
    );
    result += cipher.final(config.BASE64_ENCODING);
    const tag = (cipher as any).getAuthTag();
    return new EncryptedValueModel(hash, iv, tag, result);
  }

  decrypt(hash: string, encryptedValue: EncryptedValueModel) {
    return new Promise((resolve, reject) => {
      try {
        const result = this.decryptSync(hash, encryptedValue);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  decryptSync(hash: string, encryptedValue: EncryptedValueModel) {
    const iv = encryptedValue.ivAsBuffer;
    const tag = encryptedValue.tagAsBuffer;
    const decipher = crypto.createDecipheriv(
      config.CIPHER_ALGORITHM,
      Buffer.from(
        EncryptedValueModel.extractHashPart(hash),
        config.BASE64_ENCODING
      ),
      iv
    );
    (decipher as any).setAuthTag(tag);
    let result = decipher.update(
      encryptedValue.value,
      config.BASE64_ENCODING,
      config.UTF8_ENCODING
    );
    result += decipher.final(config.UTF8_ENCODING);
    return result.toString();
  }
}
