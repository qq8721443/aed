import { Runtime } from "./runtime";
import { Store } from "./store";

export class AED<TEvents extends AEDEventMap> {
  // store 생성
  private readonly store = new Store();
  // aed runtime 생성
  private readonly runtime = new Runtime(this.store);

  constructor(events: TEvents) {
    this.defineEvents(events)
  }

  defineEvents(events: TEvents) {
    for (const [name, definition] of Object.entries(events)) {
      this.runtime.define(name, {
        resolve: definition.resolve,
        dispatch: definition.dispatch,
      });
    }
  }
  emit(name: Extract<keyof TEvents, string>, params?: unknown) {
    this.runtime.emit(name, params);
  }
  inspect(name: Extract<keyof TEvents, string>, params?: unknown) {
    this.runtime.inspect(name, params);
  }
}

export const createAED = <TEvents extends AEDEventMap = AEDEventMap>(events: TEvents) => {
  const aed = new AED(events);
  return aed;
};
