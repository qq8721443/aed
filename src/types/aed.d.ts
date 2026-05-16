type AEDEventDefinition = {
  resolve?: (params: {
    events?: unknown;
    page?: Record<string, unknown>;
    session?: Record<string, unknown>;
    journey?: Record<string, unknown>;
    entities?: Record<string, Record<string, unknown>>;
  }) => Record<string, unknown>;
  dispatch?: (events?: Record<string, unknown>) => void | Promise<void>;
};

type AEDParameter = {
  events: AEDEventMap;
  dispatch?: (events?: Record<string, unknown>) => void | Promise<void>;
};

type AEDEventMap = {
  [eventName: string]: AEDEventDefinition;
};

type AEDDefinition = {
  events: AEDEventMap;
  globalDispatch?: AEDEventDefinition["dispatch"];
};
