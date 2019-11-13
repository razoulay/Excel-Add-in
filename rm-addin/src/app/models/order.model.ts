import { BaseModel } from './deserializable.model';

export class Order extends BaseModel {
  public user_token: string;
  public account: string;
  public amount_ordered: string;
  public instructions: string;
  public order_id: string;
  public status: string;
}
