import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { Wallet } from '../entities/wallet.entity';
import { SuccessResponse } from 'src/shared/utils/response.util';
import { FundWalletDto } from '../dto/fund-wallet.dto';
import { TransactionHistory } from '../entities/transaction-history.entity';
import { TransferFundDto } from '../dto/transfer-fund.dto';
import { wallet } from 'src/shared/utils/routes';

@Controller(wallet)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Creates a new wallet
   * @param {CreateWalletDto} body - The wallet data
   * @returns {Promise<Object>} The response object containing the wallet data
   */
  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateWalletDto) {
    const wallet = await this.walletService.createWallet(body);
    return SuccessResponse<Wallet>('Wallet Created', wallet);
  }

  /**
   * Find all wallets.
   * @method
   *
   * @param {Object} req - The request object.
   *
   * @returns {Promise<Wallet>} The response object containing the wallet data
   */
  @Get()
  @HttpCode(200)
  async findAll(@Req() req: Request) {
    const wallets = await this.walletService.getWallets();
    return SuccessResponse<Wallet[]>('Wallet List', wallets);
  }

  /**
   * Finds a transfer made in the system by a user by ID.
   * @method
   *
   * @param {Object} req - The request object.
   * @param {string} walletId - The wallet ID.
   *
   * @returns {Promise<Transfer>} A promise that resolves when the transfer is completed.
   */
  @Get(':id')
  @HttpCode(200)
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const data = await this.walletService.getWallet(id);
    return SuccessResponse<{
      wallet: Wallet;
      transactions: TransactionHistory[];
    }>('Wallet found', data);
  }

  /**
   * Funds a wallet
   * @param {FundWalletDto} body - The wallet funding data
   * @returns {Promise<Wallet>} The response object containing the wallet data
   */
  @Patch()
  @HttpCode(200)
  async update(@Body() body: FundWalletDto) {
    const wallet = await this.walletService.fundWallet(body);
    return SuccessResponse<{
      wallet: Wallet;
      transactions: TransactionHistory;
    }>('Wallet Funded', wallet);
  }

  /**
   * Transfer funds to a different wallet
   * @param {TransferFundDto} body - The wallet fund transfer data
   * @returns {Promise<Wallet>} The response object containing the sender wallet data
   */
  @Patch('transfer')
  @HttpCode(200)
  async transfer(@Body() body: TransferFundDto) {
    const wallet = await this.walletService.transferFund(body);
    return SuccessResponse<Wallet>('Fund Transfer Successful', wallet);
  }

  /**
   * Find all wallet transaction histories.
   * @method
   *
   * @param {Object} req - The request object.
   * @returns {Promise<TransactionHistory[]>} The response object containing the transaction histories data
   */
  @Get(':id/transactions')
  @HttpCode(200)
  async transactions(@Req() req: Request, @Param('id') id: string) {
    const transactionHistories =
      await this.walletService.getWalletTransactionHistories(id);
    return SuccessResponse<TransactionHistory[]>(
      'Transaction Histories',
      transactionHistories,
    );
  }
}
