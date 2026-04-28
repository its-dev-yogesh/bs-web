export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type Paginated<T> = {
  items: T[];
  nextCursor: string | null;
  total?: number;
};

export type Id = string;
