import { Injectable } from '@nestjs/common';

/**
 * Represents a service for handling app base services in the system.
 * @class
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
