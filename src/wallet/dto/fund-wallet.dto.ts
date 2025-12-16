import { IsNumber, IsUUID, Min } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsUUID()
  sender_wallet_id: string;
}
