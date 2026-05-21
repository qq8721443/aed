import { Runtime } from "./runtime";
import { Store } from "./store";
import type { AEDEventDefinition, AEDEventMap, AEDStore } from "./types/base";

export class AED<
  TStore extends AEDStore = AEDStore,
  TEvents extends AEDEventMap<TStore> = AEDEventMap<TStore>,
  TDefinition extends AEDEventDefinition<TStore>["dispatch"] =
    AEDEventDefinition<TStore>["dispatch"],
> {
  // store 생성
  readonly store = new Store();
  // aed runtime 생성
  private readonly runtime = new Runtime(this.store);

  constructor(events: TEvents, globalDispatch?: TDefinition) {
    this.defineEvents(events, globalDispatch);
  }

  defineEvents(events: TEvents, globalDispatch?: TDefinition) {
    for (const [name, definition] of Object.entries(events)) {
      const dispatch = definition.dispatch || globalDispatch;

      this.runtime.define(name, {
        resolve: definition.resolve as AEDEventDefinition["resolve"],
        dispatch: dispatch as AEDEventDefinition["dispatch"],
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

type CreateAEDConfig<
  TStore extends AEDStore,
  TEvents extends AEDEventMap<TStore>,
  TDefinition extends AEDEventDefinition<TStore>["dispatch"],
> = {
  events: TEvents;
  globalDispatch?: TDefinition;
};

export function createAED<
  const TEvents extends AEDEventMap,
  TDefinition extends AEDEventDefinition["dispatch"],
>(
  config: CreateAEDConfig<AEDStore, TEvents, TDefinition>,
): AED<AEDStore, TEvents, TDefinition>;
export function createAED<TStore extends AEDStore>(): <
  const TEvents extends AEDEventMap<TStore>,
  TDefinition extends AEDEventDefinition<TStore>["dispatch"],
>(
  config: CreateAEDConfig<TStore, TEvents, TDefinition>,
) => AED<TStore, TEvents, TDefinition>;
export function createAED(config?: unknown): unknown {
  const build = <
    TStore extends AEDStore,
    const TEvents extends AEDEventMap<TStore>,
    TDefinition extends AEDEventDefinition<TStore>["dispatch"],
  >({
    events,
    globalDispatch,
  }: CreateAEDConfig<TStore, TEvents, TDefinition>) => {
    const aed = new AED<TStore, TEvents, TDefinition>(events, globalDispatch);
    return aed;
  };

  if (config === undefined) {
    return build;
  }

  return build(
    config as CreateAEDConfig<
      AEDStore,
      AEDEventMap,
      AEDEventDefinition["dispatch"]
    >,
  );
}
