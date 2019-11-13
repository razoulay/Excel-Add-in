import { BaseModel } from './deserializable.model';

/**
 * Model of Api methods used in configuration
 */
export class ApiMethod extends BaseModel {
  public host: string;
  public name: string;
  public method: string;
}
