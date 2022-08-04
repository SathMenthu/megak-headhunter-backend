export interface BaseOfSort {
  sortDirection?: boolean;
  sortTarget?: string;
  search: string | null;
}

export interface ConvertedPayload<T> {
  text: string;
  value: T;
}
