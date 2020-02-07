import { Injectable } from '@nestjs/common';
// import * as argon2 from 'argon2-ffi';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { EncryptedValueModel } from './encrypted-value.model';
import { config } from '../config';

@Injectable()
export class CryptoService {
  async generateHash(password: string) {
    const salt = crypto.randomBytes(config.KEY_LENGTH);

    let hash;
    try {
      hash = await argon2.hash(password, {
        salt: salt,
        type: argon2.argon2i,
        hashLength: config.KEY_LENGTH,
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
        const iv = crypto.randomBytes(config.IV_LENGTH);
        const hashPart = EncryptedValueModel.extractHashPart(hash);

        const cipher = crypto.createCipheriv(
          config.CIPHER_ALGORITHM,
          Buffer.from(hashPart, config.BASE64_ENCODING),
          iv,
        );
        let result = cipher.update(
          value,
          config.UTF8_ENCODING,
          config.BASE64_ENCODING,
        );
        result += cipher.final(config.BASE64_ENCODING);
        const tag = (cipher as any).getAuthTag();
        resolve(new EncryptedValueModel(hash, iv, tag, result));
      } catch (e) {
        reject(e);
      }
    });
  }

  decrypt(hash: string, encryptedValue: EncryptedValueModel) {
    return new Promise((resolve, reject) => {
      try {
        const iv = encryptedValue.ivAsBuffer;
        const tag = encryptedValue.tagAsBuffer;
        const decipher = crypto.createDecipheriv(
          config.CIPHER_ALGORITHM,
          Buffer.from(
            EncryptedValueModel.extractHashPart(hash),
            config.BASE64_ENCODING,
          ),
          iv,
        );
        (decipher as any).setAuthTag(tag);
        decipher.on('error', err => {
          reject(err);
        });
        let result = decipher.update(
          encryptedValue.value,
          config.BASE64_ENCODING,
          config.UTF8_ENCODING,
        );
        result += decipher.final(config.UTF8_ENCODING);
        resolve(result.toString());
      } catch (e) {
        reject(e);
      }
    });
  }
}
