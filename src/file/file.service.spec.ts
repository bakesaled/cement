import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { CryptoService } from '../crypto/crypto.service';
import * as mock from 'mock-fs';
import * as path from 'path';
import * as fs from 'fs-extra';

describe('FileService', () => {
  let service: FileService;
  let tempPath;

  beforeEach(async () => {
    mock({
      temp: {
        'test-file.cmt': 'test-file',
      },
    });
    tempPath = path.join('temp');
    await fs.ensureDir(tempPath);
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService, CryptoService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(async () => {
    await fs.remove(tempPath);
    mock.restore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create file', async () => {
    const filePath = `${tempPath}/test.txt`;
    const content = 'batman';
    const password = 'skeleton';
    await service.create(password, filePath, content);
    const result = await service.decryptFile(password, filePath + '.enc');
    expect(result).toEqual(content);
  });

  it('should throw error decrypting invalid file', async () => {
    const filePath = `${tempPath}/test.txt`;
    const content = 'batman';
    const password = 'skeleton';
    await service.create(password, filePath, content);
    const fileContent = await fs.readFile(filePath + '.enc');
    const invalidFileContent = fileContent
      .toString('utf-8')
      .replace('cement#', 'nope');
    // process.stdout.write(invalidFileContent);
    await fs.writeFile(filePath + '.enc', invalidFileContent);
    let error;
    try {
      await service.decryptFile(password, filePath + '.enc');
    } catch (e) {
      error = e;
    }
    expect(error).toEqual(new Error('String has invalid parts.'));
  });
});
