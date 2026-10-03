import { Test, TestingModule } from '@nestjs/testing';
import { IncomeandexpensessService } from './incomeandexpensess.service';

describe('IncomeandexpensessService', () => {
  let service: IncomeandexpensessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncomeandexpensessService],
    }).compile();

    service = module.get<IncomeandexpensessService>(IncomeandexpensessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
