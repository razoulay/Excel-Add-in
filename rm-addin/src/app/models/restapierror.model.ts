import { BaseModel } from './deserializable.model';

export enum CustomErrorCode {
  CommonNetworkError = 1001
}

export class RestApiError extends BaseModel {
  public context: any;
  public message: string;
  public code: number;

  constructor(message: string = '', code: number = 0) {
    super();
    this.message = message;
    this.code = code;
  }
}
