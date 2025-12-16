import { IsNumber, Min } from 'class-validator';

export class CreateWalletDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
