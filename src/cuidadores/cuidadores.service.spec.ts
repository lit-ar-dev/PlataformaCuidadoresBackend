import { Test, TestingModule } from '@nestjs/testing';
import { CuidadoresService } from './cuidadores.service';

describe('CuidadoresService', () => {
  let service: CuidadoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuidadoresService],
    }).compile();

    service = module.get<CuidadoresService>(CuidadoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
