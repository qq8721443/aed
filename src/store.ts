export class Store {
  readonly page = new PageStore();
  readonly session = new SessionStore();
  readonly journey = new JourneyStore();
  readonly entities = new EntitiesStore();
}

// TODO: 여기에 Record<string, unknown>을 안 쓸 수 있는 방법이 없을까?
class KeyValueStore<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  private name: string;
  data: T;

  constructor(name: string, data?: T) {
    this.name = name;
    this.data = data || Object.create(null);
  }

  get(key: string) {
    if (Object.hasOwn(this.data, key)) {
      return this.data[key];
    }
    throw new Error("Not Found");
  }
  set(key: string, value: unknown) {
    (this.data as any)[key] = value;
  }
  delete(key: string) {
    if (Object.hasOwn(this.data, key)) {
      delete this.data[key];
    }
  }
}

// TODO: PageStore를 자동화 할 수 있다면?
class PageStore extends KeyValueStore {
  constructor(data?: Record<string, unknown>) {
    super("page", data);
  }
}
class SessionStore extends KeyValueStore {
  constructor(data?: Record<string, unknown>) {
    super("session", data);
  }
}
class JourneyStore extends KeyValueStore {
  constructor(data?: Record<string, unknown>) {
    super("journey", data);
  }
}
/**
 * {
 *  "project": {
 *    "project1": {
 *      name: "project1",
 *      type: "type-A"
 *    },
 *   "project2": {
 *      name: "project2",
 *      type: "type-C"
 *    }
 *  },
 * }
 * 이런 식으로 2-depth로 entity별 데이터 관리
 */
class EntitiesStore {
  private store = new KeyValueStore<Record<string, Record<string, unknown>>>(
    "entity",
  );
  data = this.store.data;

  upsert(name: string, id: string, entity: unknown) {
    if (!Object.hasOwn(this.data, name)) {
      this.data[name] = Object.create(null);
    }
    (this.data[name] as any)[id] = entity;
  }
  get(name: string, id: string) {
    if (Object.hasOwn(this.data, name)) {
      return (this.data[name] as any)[id];
    }
    throw new Error("Not Found");
  }
}
