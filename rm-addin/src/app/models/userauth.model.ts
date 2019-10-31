import { BaseModel } from './deserializable.model';

export class UserAuth extends BaseModel {
  public email: string;
  public password: string;
}

export class UserSession extends BaseModel {
  public userToken: string;
}
