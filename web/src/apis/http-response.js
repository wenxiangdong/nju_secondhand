export interface HttpResponse<T> {
    data: T;
    message: string;
    code: number | string;
}