import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../services/wallet.service';
import { WalletController } from './wallet.controller';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { Wallet } from '../entities/wallet.entity';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  const mockWalletService = {
    createCacheKeyForWallet: jest.fn(),
    createWallet: jest.fn(),
    getWallet: jest.fn(),
    getWallets: jest.fn(),
    fundWallet: jest.fn(),
    transferFund: jest.fn(),
    executeTransferInTransaction: jest.fn(),
    getWalletTransactionHistories: jest.fn(),
    clearWalletCache: jest.fn(),
  };

  const mockSuccessResponse = (message: string, data: any) => ({
    success: true,
    message,
    data,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create wallet', () => {
    it('should create a new wallet and return a success response', async () => {
      const mockReq = { currentUser: { id: 'tester' } };
      const mockBody: CreateWalletDto = {
        amount: 100,
      };

      const mockWallet: Partial<Wallet> = {
        id: 'a5b5e23a-ee04-432e-a7e2-b5bcd89d9e8f',
        currency: 'USD',
        balance: 100,
      };

      mockWalletService.createWallet.mockResolvedValue(mockWallet);

      const result = await controller.create(mockBody);

      expect(result).toEqual(mockSuccessResponse('Wallet Created', mockWallet));
    });
  });
});
