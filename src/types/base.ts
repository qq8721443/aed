export type AEDStore = {
  page?: Record<string, unknown>;
  session?: Record<string, unknown>;
  journey?: Record<string, unknown>;
  entities?: Record<string, Record<string, unknown>>;
};

export type AEDResolveParams<TStore extends AEDStore = AEDStore> = TStore & {
  events?: unknown;
};

export type AEDEventDefinition<TStore extends AEDStore = AEDStore> = {
  resolve?: (params: AEDResolveParams<TStore>) => Record<string, unknown>;
  dispatch?: (events?: Record<string, unknown>) => void | Promise<void>;
};

export type AEDEventMap<TStore extends AEDStore = AEDStore> = {
  [eventName: string]: AEDEventDefinition<TStore>;
};

export type AEDDefinition = {
  events: AEDEventMap;
  globalDispatch?: AEDEventDefinition["dispatch"];
};
