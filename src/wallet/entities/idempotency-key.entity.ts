import { BaseTable } from 'src/shared/base/base.table';
import { Column, Entity, Index } from 'typeorm';

export type Transaction_Status = 'processing' | 'completed' | 'failed';

/**
 * The IdempotencyKey entity in the system.
 * inherits from the base entity
 *
 * Used to track, maintain atomicity
 * and idempotency of transactions
 */
@Entity({
  name: 'idempotency_key',
})
export class IdempotencyKey extends BaseTable {
  // Inherits id, created_at, updated_at, version from base entity

  @Index({ unique: true })
  @Column('uuid')
  key: string;

  @Column({ type: 'jsonb' })
  responseBody: any;

  @Column({ default: 'processing' })
  status: Transaction_Status;
}
