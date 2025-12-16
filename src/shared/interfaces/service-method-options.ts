import { Pagination } from './pagination.interface';

export interface ServiceMethodOptions {
  /** An instance of the `query` field on the Express.Request object */
  query?: any;
  /** A pagination object */
  pagination?: Pagination;
}
