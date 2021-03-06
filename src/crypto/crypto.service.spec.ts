import { CryptoService } from './crypto.service';
import { EncryptedValueModel } from './encrypted-value.model';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    service = new CryptoService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate hash', async () => {
    const value = 'hulk#123';
    const result = await service.generateHash(value);
    expect(result).toContain('argon2');
  });

  it('should encrypt value with password', async () => {
    const password = 'incredible!';
    const value = 'hulk!';
    const hash = await service.generateHash(password);

    const result: EncryptedValueModel = await service.encrypt(hash, value);
    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
    expect(result.iv).toBeDefined();
    expect(result.tag).toBeDefined();
    expect(result.value).toBeDefined();
  });

  it('should decrypt value with password', async () => {
    const password = 'incredible!';
    const value = 'hulk!';
    const hash = await service.generateHash(password);
    const encryptedValue: EncryptedValueModel = await service.encrypt(
      hash,
      value
    );

    const decryptedValue = await service.decrypt(hash, encryptedValue);
    expect(decryptedValue).toBe(value);
  });
});
