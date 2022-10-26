export enum SORT {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export interface QuerySort {
  page?: number;
  sort?: SORT;
  page_size?: number;
}

export interface SortValue<T = any> {
  [key: string]: T
}
export interface ParamsSort extends Omit<QuerySort, 'sort'> {
  search?: {
    [key: string]: any
  }
}