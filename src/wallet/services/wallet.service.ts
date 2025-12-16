import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { Wallet } from '../entities/wallet.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { TransactionHistory } from '../entities/transaction-history.entity';
import { TransferFundDto } from '../dto/transfer-fund.dto';
import { FundWalletDto } from '../dto/fund-wallet.dto';
import { IdempotencyKey } from '../entities/idempotency-key.entity';

/**
 * Represents a service for handling wallet in the system.
 * @class
 *
 * @method createWallet
 * @method updateWallet
 * @method getWallet
 * @method getWalletList
 * @method fundWallet
 * @method transferFund */
@Injectable()
export class WalletService {
  /**
   * Creates an instance of WalletService.
   * @param {Repository<Wallet>} walletRepository - The repository for accessing wallet data.
   * @param {Repository<TransactionHistory>} transactionHistoryRepository - The repository for accessing transaction history data.
   */
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(TransactionHistory)
    private readonly transactionHistoryRepository: Repository<TransactionHistory>,
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyKeyRepository: Repository<IdempotencyKey>,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Generates a cache key based on the wallet ID.
   * @param walletId The ID of the wallet.
   * @returns The cache key for the wallet.
   */
  private createCacheKeyForWallet(walletId: string): string {
    return `wallet_${walletId}`;
  }

  /**
   * Create a new wallet
   * @method
   *
   * @param {CreateWalletDto} createWalletDto - The wallet data.
   * @returns {Promise<Wallet>} A promise that resolves when wallet is created.
   * @throws {BadRequestException} If wallet creation fails.
   */
  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      const { amount } = createWalletDto;

      if (amount < 0) {
        throw new BadRequestException('Amount is invalid');
      }

      const wallet = await this.walletRepository.save({
        balance: amount,
      });

      const transactionHistory = await this.transactionHistoryRepository.save({
        receiver_wallet: wallet,
        amount: amount,
        description: `Initial wallet creation with USD${amount} to wallet ID: ${wallet.id}`,
      });

      return wallet;
    } catch (error) {
      throw new BadRequestException('Wallet creation failed');
    }
  }

  /**
   * Fetch wallet, first checking the cache
   * @method
   *
   * @param {string} walletId - The wallet ID.
   * @returns {Promise<Wallet>} A promise that resolves when wallet is found.
   * @throws {NotFoundException} If the wallet with the given wallet ID is not found.
   */
  async getWallet(
    walletId: string,
  ): Promise<{ wallet: Wallet; transactions: TransactionHistory[] }> {
    const cacheKey = this.createCacheKeyForWallet(walletId);

    const cachedWallet = await this.cacheManager.get<Wallet>(cacheKey);

    const transactions = await this.getWalletTransactionHistories(walletId);

    if (cachedWallet !== null && cachedWallet !== undefined) {
      return { wallet: cachedWallet, transactions };
    }

    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.cacheManager.set(cacheKey, wallet);

    return { wallet, transactions };
  }

  /**
   * Fetch wallets
   * @method
   *
   * @returns {Promise<Wallet[]>} A promise that resolves when wallet is found.
   * @throws {NotFoundException} If the wallet with the given wallet ID is not found.
   */
  async getWallets() {
    const wallets = await this.walletRepository.find();

    return wallets;
  }

  /**
   * Update wallet wallet and reset the cache
   * @method
   *
   * @param {FundWalletDto} fundWalletDto - The wallet funding data.
   * @returns {Promise<Wallet>} A promise that resolves when wallet is updated.
   * @throws {NotFoundException} If the wallet with the given wallet ID is not found.
   */
  async fundWallet(
    fundWalletDto: FundWalletDto,
  ): Promise<{ wallet: Wallet; transactions: TransactionHistory }> {
    const { amount, sender_wallet_id } = fundWalletDto;

    return await this.dataSource.transaction(async (entityManager) => {
      const wallet = await entityManager.findOne(Wallet, {
        where: { id: sender_wallet_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('Account not found');
      }

      wallet.balance += amount;

      const updatedWallet = await entityManager.save(wallet);

      await this.clearWalletCache(wallet.id);

      await this.cacheManager.set(
        this.createCacheKeyForWallet(wallet.id),
        updatedWallet,
      );

      const newTransaction = entityManager.create(TransactionHistory, {
        amount: amount,
        receiver_wallet: wallet,
        type: 'deposit',
        description: `Deposited ${amount} into wallet ${sender_wallet_id}}`,
      });

      return {
        wallet: updatedWallet,
        transactions: await entityManager.save(
          TransactionHistory,
          newTransaction,
        ),
      };
    });
  }

  /**
   * Transfers funds between sender wallet and receiver wallet.
   * @method
   *
   * @param {TransferFundDto} transferFundDto - The data for transfering fund.
   * @param {number} retries - The number of retry if transaction fails.
   * @returns {Promise<TransactionHistory>} A promise that resolves to the TransactionHistory data of the sender.
   * @throws {BadRequestException} If an error or malformed data is found.
   * @throws {NotFoundException} If the wallet with the given wallet ID is not found.
   */
  async transferFund(transferFundDto: TransferFundDto, retries = 3) {
    const { sender_wallet_id, receiver_wallet_id, amount } = transferFundDto;

    if (sender_wallet_id === receiver_wallet_id) {
      throw new BadRequestException(
        'Cannot transfer funds to the same wallet.',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        return this.executeTransferInTransaction(
          manager,
          sender_wallet_id,
          receiver_wallet_id,
          amount,
        );
      });
    } catch (error) {
      if (error.code === '40001' && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return this.transferFund(transferFundDto, retries - 1);
      } else {
        throw new BadRequestException(error?.message);
      }
    }
  }

  async executeTransferInTransaction(
    manager: EntityManager,
    sender_wallet_id: string,
    receiver_wallet_id: string,
    amount: number,
  ) {
    const senderWallet = await manager.findOne(Wallet, {
      where: { id: sender_wallet_id },
      lock: { mode: 'pessimistic_write' },
    });
    
    if (!senderWallet) {
      throw new BadRequestException('Sender not found.');
    }

    if (Number(senderWallet.balance) < amount) {
      throw new BadRequestException('Insufficient funds.');
    }

    const receiverWallet = await manager.findOne(Wallet, {
      where: { id: receiver_wallet_id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!receiverWallet) {
      throw new NotFoundException('Receiver wallet not found.');
    }

    senderWallet.balance = Number(senderWallet.balance) - amount;
    receiverWallet.balance = Number(receiverWallet.balance) + amount;

    await manager.save(Wallet, senderWallet);
    await manager.save(Wallet, receiverWallet);

    const newTransaction = manager.create(TransactionHistory, {
      amount: amount,
      sender_wallet: senderWallet,
      receiver_wallet: receiverWallet,
      type: 'transfer',
      description: `Transfer: ${amount} from sender wallet ID: ${sender_wallet_id} to receiver wallet ID: ${receiver_wallet_id}`,
    });

    await this.clearWalletCache(sender_wallet_id);
    await this.clearWalletCache(receiver_wallet_id);

    return await manager.save(TransactionHistory, newTransaction);
  }

  /**
   * Fetch wallet transactions, first checking the cache
   * @method
   *
   * @param {string} walletId - The wallet ID.
   * @returns {Promise<TransactionHistory[]>} A promise that resolves when transactions are found.
   */
  async getWalletTransactionHistories(walletId: string) {
    const cacheKey = this.createCacheKeyForWallet('transactions-' + walletId);

    const cachedWalletTransactions =
      await this.cacheManager.get<TransactionHistory[]>(cacheKey);

    if (
      cachedWalletTransactions !== null &&
      cachedWalletTransactions !== undefined
    ) {
      return cachedWalletTransactions;
    }

    const transactions = await this.transactionHistoryRepository.find({
      where: [
        { sender_wallet: { id: walletId } },
        { receiver_wallet: { id: walletId } },
      ],
    });

    if (transactions.length === 0) {
      await this.cacheManager.del(cacheKey);
    }

    return transactions.map((tx) => ({
      ...tx,
      displayAmount: tx.sender_wallet.id === walletId ? -tx.amount : +tx.amount,
    })) as TransactionHistory[];
  }

  /**
   * Clears all cache history associated with a wallet ID
   * @method
   *
   * @param {string} walletId - The wallet ID.
   * @returns {Promise<void>} A promise that resolves to void.
   */
  async clearWalletCache(walletId: string) {
    // clear wallet cache
    const walletCacheKey = this.createCacheKeyForWallet(walletId);
    await this.cacheManager.del(walletCacheKey);

    // clear transaction history cache
    const transactionCacheKey = this.createCacheKeyForWallet(
      'transactions-' + walletId,
    );
    await this.cacheManager.del(transactionCacheKey);
  }
}
