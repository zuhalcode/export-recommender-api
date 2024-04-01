import { Test, TestingModule } from '@nestjs/testing';
import { RegressionController } from './regression.controller';
import { RegressionService } from './regression.service';

describe('RegressionController', () => {
  let controller: RegressionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegressionController],
      providers: [RegressionService],
    }).compile();

    controller = module.get<RegressionController>(RegressionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
