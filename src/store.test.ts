import { expect, test, vi } from "vitest";
import { createAED } from "./aed";

test("page store에 저장하면 resolve 함수에 저장한 값이 인자로 전달된다.", () => {
  const dispatch = vi.fn();
  const aed = createAED<{
    page: {
      home: {
        name: "home";
        utm_source: "test";
      };
    };
    session: {
      anonymous: {
        "anonymous-id": "1234";
      };
    };
    journey: {
      user: {
        "user-id": "12321";
      };
    };
    entities: {
      project: {
        "123": {
          projectId: "123";
          name: "프로젝트 이름";
          rating: 3.4;
          author: {
            id: "user";
            name: "user1";
          };
        };
      };
    };
  }>()({
    events: {
      "test-event": {
        resolve: ({ page, session, journey, entities }) => {
          return {
            ...page,
            session,
            userId: journey?.user["user-id"],
            entities,
          };
        },
      },
    },
    globalDispatch: dispatch,
  });

  aed.store.page.set("home", {
    name: "home",
    utm_source: "test",
  });
  aed.store.session.set("anonymous", {
    "anonymous-id": "1234",
  });
  aed.store.journey.set("user", {
    "user-id": "12321",
  });
  aed.store.entities.upsert("project", "123", {
    projectId: "123",
    name: "프로젝트 이름",
    rating: 3.4,
    author: {
      id: "user",
      name: "user1",
    },
  });

  aed.emit("test-event");

  expect(dispatch).toHaveBeenCalledWith({
    home: { name: "home", utm_source: "test" },
    session: {
      anonymous: {
        "anonymous-id": "1234",
      },
    },
    userId: "12321",
    entities: {
      project: {
        "123": {
          projectId: "123",
          name: "프로젝트 이름",
          rating: 3.4,
          author: {
            id: "user",
            name: "user1",
          },
        },
      },
    },
  });
});
