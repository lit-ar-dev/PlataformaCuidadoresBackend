import { Test, TestingModule } from '@nestjs/testing';
import { UtilidadesController } from './utilidades.controller';

describe('UtilidadesController', () => {
  let controller: UtilidadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilidadesController],
    }).compile();

    controller = module.get<UtilidadesController>(UtilidadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
