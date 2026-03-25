import { Test, TestingModule } from '@nestjs/testing';
import { CaregiversService } from './caregivers.service';

describe('CaregiversService', () => {
  let service: CaregiversService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaregiversService],
    }).compile();

    service = module.get<CaregiversService>(CaregiversService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
