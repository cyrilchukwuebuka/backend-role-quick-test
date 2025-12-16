import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable, OperatorFunction, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from 'src/wallet/entities/idempotency-key.entity';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyKeyRepository: Repository<IdempotencyKey>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKeyHeader = request.headers['idempotency-key'];

    if (!idempotencyKeyHeader) {
      throw new BadRequestException('Missing Idempotency-Key header.');
    }

    const existingKey = await this.idempotencyKeyRepository.findOneBy({
      key: idempotencyKeyHeader,
    });

    if (existingKey) {
      if (existingKey.status === 'completed') {
        return new Observable((observer) =>
          observer.next(existingKey.responseBody),
        );
      }

      if (existingKey.status === 'processing') {
        throw new BadRequestException('Request is still in progress');
      }
    }

    // Create a new key entry before processing
    await this.idempotencyKeyRepository.save({
      key: idempotencyKeyHeader,
      status: 'processing',
    });

    return next.handle().pipe(
      tap(async (response: any) => {
        try {
          await this.idempotencyKeyRepository.update(idempotencyKeyHeader, {
            status: 'completed',
            responseBody: response,
          });
        } catch (error) {
          await this.idempotencyKeyRepository.update(idempotencyKeyHeader, {
            status: 'failed',
            responseBody: response,
          });
        } finally {
          return response;
        }
      }),
    );
  }
}
