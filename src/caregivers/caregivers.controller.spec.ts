import { Test, TestingModule } from '@nestjs/testing';
import { CaregiversController } from './caregivers.controller';

describe('CaregiversController', () => {
  let controller: CaregiversController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaregiversController],
    }).compile();

    controller = module.get<CaregiversController>(CaregiversController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
