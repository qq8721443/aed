import { Runtime } from "./runtime";
import { Store } from "./store";

export class AED<
  TEvents extends AEDEventMap,
  TDefinition extends AEDEventDefinition["dispatch"],
> {
  // store 생성
  readonly store = new Store();
  // aed runtime 생성
  private readonly runtime = new Runtime(this.store);

  constructor(events: TEvents, globalDispatch: TDefinition) {
    this.defineEvents(events, globalDispatch);
  }

  defineEvents(events: TEvents, globalDispatch: TDefinition) {
    for (const [name, definition] of Object.entries(events)) {
      this.runtime.define(name, {
        resolve: definition.resolve,
        dispatch: definition.dispatch || globalDispatch,
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

export const createAED = <
  TEvents extends AEDEventMap,
  TDefinition extends AEDEventDefinition["dispatch"],
>({
  events,
  globalDispatch,
}: {
  events: TEvents;
  globalDispatch?: TDefinition;
}) => {
  const aed = new AED(events, globalDispatch);
  return aed;
};
