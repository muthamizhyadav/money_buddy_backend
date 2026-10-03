import { Test, TestingModule } from '@nestjs/testing';
import { IncomeandexpensessController } from './incomeandexpensess.controller';

describe('IncomeandexpensessController', () => {
  let controller: IncomeandexpensessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeandexpensessController],
    }).compile();

    controller = module.get<IncomeandexpensessController>(IncomeandexpensessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
