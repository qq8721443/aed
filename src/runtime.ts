import type { Store } from "./store";

export class Runtime {
  private definitionMap: Record<
    string,
    {
      resolve?: ({
        events,
        page,
        session,
        journey,
        entities,
      }: {
        events?: unknown;
        page?: Record<string, unknown>;
        session?: Record<string, unknown>;
        journey?: Record<string, unknown>;
        entities?: Record<string, Record<string, unknown>>;
      }) => Record<string, unknown>;
      dispatch?: (events?: Record<string, unknown>) => void;
    }
  > = {};

  constructor(private readonly store: Store) {}

  define(
    name: string,
    definition: {
      resolve?: (params: {
        events?: unknown;
        page?: Record<string, unknown>;
        session?: Record<string, unknown>;
        journey?: Record<string, unknown>;
        entities?: Record<string, Record<string, unknown>>;
      }) => Record<string, unknown>;
      dispatch?: (events?: Record<string, unknown>) => void;
    },
  ) {
    this.definitionMap[name] = definition;
  }
  // emit과 inspect는 동작은 같지만 production 용인지 development 용인지에 따라 나뉨
  emit(name: string, params?: unknown) {
    // definitionMap[name]이 없을 경우 에러를 반환하도록 의도함
    this.definitionMap[name].dispatch?.(
      this.definitionMap[name]?.resolve?.({
        events: params,
        page: this.store.page.data,
        session: this.store.session.data,
        journey: this.store.journey.data,
        entities: this.store.entities.data,
      }),
    );
  }
  inspect(name: string, params?: unknown) {
    // definitionMap[name]이 없을 경우 에러를 반환하도록 의도함
    this.definitionMap[name].resolve?.({
      events: params,
      page: this.store.page.data,
      session: this.store.session.data,
      journey: this.store.journey.data,
      entities: this.store.entities.data,
    });
  }
}
