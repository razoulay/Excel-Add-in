export interface Deserializable {
    serialize(): string;
    deserialize(input: any): this;
}

export abstract class BaseModel implements Deserializable {

    serialize(): string {
        return JSON.stringify(this);
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
