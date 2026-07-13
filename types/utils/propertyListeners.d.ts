type ChangeCallback<Value> = (newValue: Value, oldValue?: Value) => void;
export declare function listenToProperty<Obj extends object, Key extends keyof Obj>(object: Obj, propertyName: Key, listener: ChangeCallback<Obj[Key]>, callImmediately?: boolean): void;
export declare function stopListeningToProperty<Obj extends object, Key extends keyof Obj>(object: Obj, propertyName: Key, listener: ChangeCallback<Obj[Key]>): void;
export {};
