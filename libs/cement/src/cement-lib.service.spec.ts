import { Test, TestingModule } from '@nestjs/testing';
import { CementLibService } from './cement-lib.service';

describe('CementLibService', () => {
  let service: CementLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CementLibService],
    }).compile();

    service = module.get<CementLibService>(CementLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
