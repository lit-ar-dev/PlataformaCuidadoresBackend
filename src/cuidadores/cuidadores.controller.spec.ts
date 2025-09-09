import { Test, TestingModule } from '@nestjs/testing';
import { CuidadoresController } from './cuidadores.controller';

describe('CuidadoresController', () => {
  let controller: CuidadoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuidadoresController],
    }).compile();

    controller = module.get<CuidadoresController>(CuidadoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
