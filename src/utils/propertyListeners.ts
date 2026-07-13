type ChangeCallback<Value> = (newValue: Value, oldValue?: Value) => void
type InternalChangeCallback = ChangeCallback<unknown>

class LiveProperty {
  private object: object | null = null
  private value: unknown
  private readonly listeners = new Set<InternalChangeCallback>()

  constructor(
    object: object,
    private readonly propertyName: PropertyKey,
  ) {
    this.setValue = this.setValue.bind(this)
    this.attach(object)
  }

  get listenerCount() {
    return this.listeners.size
  }

  addListener(listener: InternalChangeCallback, callImmediately: boolean) {
    if (callImmediately) {
      listener(this.value)
    }
    this.listeners.add(listener)
  }

  removeListener(listener: InternalChangeCallback) {
    this.listeners.delete(listener)
  }

  release() {
    if (!this.object) {
      return
    }
    Object.defineProperty(this.object, this.propertyName, {
      configurable: true,
      enumerable: true,
      value: this.value,
      writable: true,
    })
    this.object = null
  }

  private attach(object: object) {
    this.object = object
    this.value = (object as Record<PropertyKey, unknown>)[this.propertyName]
    Object.defineProperty(object, this.propertyName, {
      configurable: true,
      enumerable: true,
      get: () => this.value,
      set: this.setValue,
    })
  }

  private setValue(value: unknown) {
    if (this.value === value) {
      return
    }
    const oldValue = this.value
    this.value = value
    for (const listener of this.listeners) {
      listener(value, oldValue)
    }
  }
}

const liveProperties = new Map<object, Map<PropertyKey, LiveProperty>>()

function getLiveProperty(object: object, propertyName: PropertyKey) {
  let objectProperties = liveProperties.get(object)
  if (!objectProperties) {
    objectProperties = new Map<PropertyKey, LiveProperty>()
    liveProperties.set(object, objectProperties)
  }

  let liveProperty = objectProperties.get(propertyName)
  if (!liveProperty) {
    liveProperty = new LiveProperty(object, propertyName)
    objectProperties.set(propertyName, liveProperty)
  }
  return liveProperty
}

export function listenToProperty<Obj extends object, Key extends keyof Obj>(
  object: Obj,
  propertyName: Key,
  listener: ChangeCallback<Obj[Key]>,
  callImmediately = true,
) {
  getLiveProperty(object, propertyName).addListener(
    listener as InternalChangeCallback,
    callImmediately,
  )
}

export function stopListeningToProperty<
  Obj extends object,
  Key extends keyof Obj,
>(
  object: Obj,
  propertyName: Key,
  listener: ChangeCallback<Obj[Key]>,
) {
  const objectProperties = liveProperties.get(object)
  const liveProperty = objectProperties?.get(propertyName)
  if (!objectProperties || !liveProperty) {
    return
  }

  liveProperty.removeListener(listener as InternalChangeCallback)
  if (liveProperty.listenerCount === 0) {
    liveProperty.release()
    objectProperties.delete(propertyName)
  }
  if (objectProperties.size === 0) {
    liveProperties.delete(object)
  }
}
