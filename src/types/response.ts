export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ExtendedApiResponse<T> extends ApiResponse {
  data: T;
}
