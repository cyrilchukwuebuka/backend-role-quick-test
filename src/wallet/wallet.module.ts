import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TransactionHistory } from './entities/transaction-history.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

/**
 * Represents a module for handling wallet in the system.
 * @class
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, TransactionHistory, IdempotencyKey]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
