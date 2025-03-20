export interface PaginationQuery {
    page: number;
    pageSize: number;
}

export interface PaginatedResult<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}