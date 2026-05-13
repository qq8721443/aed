export class Store {
  readonly page = new PageStore();
  readonly session = new SessionStore();
  readonly journey = new JourneyStore();
  readonly entities = new EntitiesStore();
}

// TODO: 여기에 Record<string, unknown>을 안 쓸 수 있는 방법이 없을까?
class KeyValueStore {
  name: string;
  data: Record<string, unknown>;

  constructor(name: string, data?: Record<string, unknown>) {
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
    this.data[key] = value;
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
  private store = new KeyValueStore("entity");

  upsert(name: string, id: string, entity: unknown) {}
  get(name: string, id: string) {}
}
