import { IsUUID } from 'class-validator';
import { FundWalletDto } from './fund-wallet.dto';

export class TransferFundDto extends FundWalletDto {
  @IsUUID()
  receiver_wallet_id: string;
}
