import { expect, test, vi } from "vitest";
import { AED, createAED } from "./aed";

test("createAED 메서드는 AED 인스턴스를 반환한다.", () => {
  const aed = createAED({
    events: {},
  });

  expect(aed).toBeInstanceOf(AED);
});

test("createAED에 정의한 event를 emit하면 resolve 결과를 dispatch에 전달한다.", () => {
  const dispatch = vi.fn();

  const aed = createAED({
    events: {
      project_list_click: {
        resolve: () => ({
          test: 123,
        }),
        dispatch,
      },
    },
  });

  aed.emit("project_list_click");

  expect(dispatch).toHaveBeenCalledOnce();
  expect(dispatch).toHaveBeenCalledWith({
    test: 123,
  });
});

test("정의되지 않은 이벤트를 emit 했을 때 에러가 발생한다.", () => {
  const aed = createAED({
    events: {
      event1: {
        resolve: () => ({}),
      },
    },
  });
  // emit의 타입 에러는 의도된 에러
  // @ts-expect-error
  expect(() => aed.emit("undefined-event")).toThrow();
});

test("정의되지 않은 이벤트를 inspect 했을 때 에러가 발생한다.", () => {
  const aed = createAED({
    events: {},
  });
  // inspect의 타입 에러는 의도된 에러
  // @ts-expect-error
  expect(() => aed.inspect("undefined-event")).toThrow();
});

test("emit의 두 번째 인자는 resolve의 events로 전달되어야 한다.", () => {
  const dispatch = vi.fn();
  const aed = createAED({
    events: {
      click: {
        resolve: ({ events }) => {
          return {
            events,
          };
        },
        dispatch,
      },
    },
  });

  aed.emit("click", {
    hello: "world",
  });

  expect(dispatch).toHaveBeenCalledWith({
    events: {
      hello: "world",
    },
  });
});

test("정의된 여러 event 중 emit한 이벤트의 dispatch만 실행되어야 한다.", () => {
  const clickDispatch = vi.fn();
  const submitDispatch = vi.fn();

  const aed = createAED({
    events: {
      click: {
        resolve: () => ({ type: "click" }),
        dispatch: clickDispatch,
      },
      submit: {
        resolve: () => ({ type: "submit" }),
        dispatch: submitDispatch,
      },
    },
  });

  aed.emit("click");

  expect(clickDispatch).toHaveBeenCalledOnce();
  expect(clickDispatch).toHaveBeenCalledWith({ type: "click" });
  expect(submitDispatch).not.toHaveBeenCalled();
});

test("AED 인스턴스끼리는 이벤트 정의를 공유하지 않는다.", () => {
  const dispatch1 = vi.fn();
  const dispatch2 = vi.fn();

  const aed1 = createAED({
    events: {
      click: {
        resolve: () => ({}),
        dispatch: dispatch1,
      },
    },
  });
  const aed2 = createAED({
    events: {
      submit: {
        resolve: () => ({}),
        dispatch: dispatch2,
      },
    },
  });

  aed1.emit("click");
  aed2.emit("submit");

  expect(dispatch1).toHaveBeenCalled();
  expect(dispatch2).toHaveBeenCalled();
});
