export interface ListOptions {
  orderBy?: string;
  start?: number;
  limit?: number;
  filters?: string[];
  select?: string[];
  include?: string[];
  direction?: "asc" | "desc";
}
