import { BaseModel } from './deserializable.model';

import { ApiMethod } from './apimethod.model';

/**
 * Model of configuration
 */
export class ConfigModel extends BaseModel {
  public apiKey: string;
  public apiMethods: ApiMethod[];

  deserialize(input: any): this {
    // Assign input to our object BEFORE deserialize our cars to prevent already deserialized cars from being overwritten.
    Object.assign(this, input);
    this.apiMethods = input.apiMethods.map(apiMethod => new ApiMethod().deserialize(apiMethod));
    return this;
  }
}
