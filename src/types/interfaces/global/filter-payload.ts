import { StudentStatus } from '../../enums';

export interface FilterPayload<T> {
  page: number;
  limit: number;
  filters: T;
}

export interface FilterPayloadForHr<T> extends FilterPayload<T> {
  id?: string;
  studentStatus: StudentStatus;
}
