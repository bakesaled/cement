import { HexBase64BinaryEncoding, Utf8AsciiBinaryEncoding } from 'crypto';

export const config = {
  KEY_LENGTH: 32,
  IV_LENGTH: 12,
  BASE64_ENCODING: 'base64' as HexBase64BinaryEncoding,
  UTF8_ENCODING: 'utf8' as Utf8AsciiBinaryEncoding,
  CIPHER_ALGORITHM: 'aes-256-gcm',
  UTF8_FILE_ENCODING: 'utf-8',
};
