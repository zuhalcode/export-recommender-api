import { Test, TestingModule } from '@nestjs/testing';
import { TrademapController } from './trademap.controller';

describe('TrademapController', () => {
  let controller: TrademapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrademapController],
    }).compile();

    controller = module.get<TrademapController>(TrademapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
