import { BaseTable } from 'src/shared/base/base.table';
import { DecimalColumnToNumberTransformer } from 'src/shared/utils/column-transformer';
import { Check, Column, Entity, OneToMany } from 'typeorm';
import { TransactionHistory } from './transaction-history.entity';

/**
 * The wallet entity in the system.
 * inherits from the base entity
 */
@Entity({
  name: 'wallet',
})
@Check(`"balance" >= 0`)
export class Wallet extends BaseTable {
  // Inherits id, created_at, updated_at, version from base entity

  @Column({
    type: 'varchar',
    default: 'USD',
  })
  currency: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new DecimalColumnToNumberTransformer(),
  })
  balance: number;

  @OneToMany(
    () => TransactionHistory,
    (transaction) => transaction.sender_wallet,
  )
  sentTransactions: TransactionHistory[];

  @OneToMany(
    () => TransactionHistory,
    (transaction) => transaction.receiver_wallet,
  )
  receivedTransactions: TransactionHistory[];
}
