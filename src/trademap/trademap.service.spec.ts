import { Test, TestingModule } from '@nestjs/testing';
import { TrademapService } from './trademap.service';

describe('TrademapService', () => {
  let service: TrademapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrademapService],
    }).compile();

    service = module.get<TrademapService>(TrademapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
