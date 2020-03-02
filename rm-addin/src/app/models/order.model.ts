import { BaseModel } from './deserializable.model';

export class Order extends BaseModel {
  public user_token: string;
  public account: string;
  public amount_ordered: string;
  public instructions: string;
  public order_id: string;
  public status: string;
}

export class ExtendedOrder extends BaseModel {
  public id: string;
  public user_token: string;
  public account: string;
  public parseketable: string;
  public isin: string;
  public op_type: string;
  public amount_ordered: string;
  public limit_price: string;
  public tif: string;
  public instructions: string;
  public security_name: string;
  public side: string;
  public filled_name: string;
  public working: string;
  public amnt_left: string;
  public pct_left: string;
  public average_price: string;
  public broker_name: string;
  public status: string;
  public portfolio_manager: string;
  public trader_name: string;
  public order_date: string;
  public order_creation: string;
  public last_touched: string;
  public ts_order_date: string;
  public settle_date: string;
  public security_id: string;
  public order_number: string;
  public ticket_number: string;
  public asset_type: string;
}
