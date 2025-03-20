export class KeycloakError extends Error {
  code?: string;
  details?: Array<{ field: string; message: string }>;

  constructor(
    message: string, 
    options: { 
      code?: string; 
      details?: Array<{ field: string; message: string }> 
    } = {}
  ) {
    super(message);
    this.name = "KeycloakError";
    this.code = options.code;
    this.details = options.details;
  }
}
export class ApiError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
        this.name = 'ApiError';
    }
}