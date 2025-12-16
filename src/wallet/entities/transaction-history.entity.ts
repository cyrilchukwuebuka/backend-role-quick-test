import { BaseTable } from 'src/shared/base/base.table';
import { DecimalColumnToNumberTransformer } from 'src/shared/utils/column-transformer';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type TransactionType = 'deposit' | 'transfer';

/**
 * The wallet entity in the system.
 * inherits from the base entity
 */
@Entity({
  name: 'transaction_history',
})
@Index(['receiver_wallet_id', 'sender_wallet_id'])
export class TransactionHistory extends BaseTable {
  // Inherits id, created_at, updated_at, version from base entity

  @Column('uuid', {
    nullable: true,
  })
  sender_wallet_id: string;

  @Column('uuid', {
    nullable: true,
  })
  receiver_wallet_id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.sentTransactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'sender_wallet_id' })
  sender_wallet: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.receivedTransactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'receiver_wallet_id' })
  receiver_wallet: Wallet;

  @Column({
    nullable: true,
  })
  type: TransactionType;

  @Column('varchar', {
    nullable: true,
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;
}
