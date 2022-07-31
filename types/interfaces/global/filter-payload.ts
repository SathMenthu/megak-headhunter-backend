export interface FilterPayload<T> {
  page: number;
  limit: number;
  filters: T;
}
