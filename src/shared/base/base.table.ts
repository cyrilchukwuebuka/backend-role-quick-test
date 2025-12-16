import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * The base entity in the system.
 */
export class BaseTable {
  /**
   * The unique identifier of the record.
   * @type {string}
   * @example "d69b5a20-02e6-11eb-adc1-0242ac120002"
   */
  @Index({ unique: true })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The creation timestamp.
   * @type {Date}
   * @example "2024-10-04T12:34:56Z"
   */
  @Index({ unique: true })
  @CreateDateColumn()
  created_at: Date;

  /**
   * The update timestamp.
   * @type {Date}
   * @example "2024-10-04T12:34:56Z"
   */
  @UpdateDateColumn()
  updated_at: Date;

  /**
   * The update timestamp.
   * @type {number}
   * @example 1
   */
  @VersionColumn()
  version: number;
}
