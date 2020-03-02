import { BaseModel } from './deserializable.model';

export class UserAuth extends BaseModel {
  public username: string;
  public password: string;

  constructor(username: string, password: string) {
    super();
    this.username = username;
    this.password = password;
  }
}

export class UserSession extends BaseModel {
  public userToken: string;
  public allowUpdateOrders: boolean;
  public userType: number;
}
