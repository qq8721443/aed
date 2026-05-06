# AED (All Event Delegation) Project Overview

## 1. 프로젝트 개요

### 프로젝트명
- `aed`
- 의미: `all event delegation`

### 현재 정의된 프로젝트 방향
AED는 웹 애플리케이션에서 발생하는 유저 액션과 앱 컨텍스트를 결합해, analytics 이벤트를 중앙에서 조합하고 실행하는 JavaScript/TypeScript 라이브러리다.

초기 아이디어는 DOM 이벤트 위임을 통해 클릭, 제출, 변경 등의 이벤트를 상위에서 수집하고 필요한 액션을 처리하는 것이었다. 그러나 검토 과정에서 단순 delegation만으로는 실제 analytics 문제를 충분히 해결하기 어렵다는 점이 드러났다.

현재 AED의 핵심 방향은 다음과 같다.

- 이벤트 발생 지점을 애플리케이션 전역에서 일관되게 관리한다.
- analytics에 필요한 비즈니스 데이터를 중앙 store에 적재하고 관리한다.
- 특정 semantic event가 발생하면 store에 쌓인 컨텍스트와 이벤트 인자를 조합해 최종 payload를 만든다.
- 최종 payload를 mixpanel, GA, 내부 로거 등 원하는 provider 형식으로 변환해 전송한다.

즉, AED는 단순한 이벤트 위임 유틸리티가 아니라, `event runtime + context store + resolver + dispatcher` 구조를 가진 analytics orchestration layer로 설계된다.

## 2. 해결하려는 문제

현대 웹 애플리케이션에서는 유저 행동을 추적하기 위해 다음과 같은 코드가 서비스 곳곳에 흩어지기 쉽다.

- `mixpanel.track(...)`
- `ga(...)`
- 내부 이벤트 로깅 호출
- 공통 메타데이터 조합 로직
- 이전 유저 액션과 현재 액션의 연관 관계 계산

이 방식은 다음과 같은 문제를 만든다.

- 실제 이벤트 핸들러와 analytics 후처리 로직이 강하게 결합된다.
- 동일한 payload 조합 로직이 여러 파일에 반복된다.
- 유지보수 시 "어디서 어떤 track이 호출되는지" 추적하기 어렵다.
- 상품 목록 진입, 상품 상세, 주문 완료처럼 유저 여정에 따라 필요한 데이터 조합이 복잡해진다.
- analytics에 필요한 맥락을 전달하기 위해 불필요한 props drilling이 생기고, 컴포넌트 인터페이스가 오염되기 쉽다.
- user tracking 요구사항 때문에 실제 UI 구조와 컴포넌트 책임이 왜곡되기 쉽다.

AED는 이 문제를 중앙 runtime 관점에서 해결하고자 한다.

## 3. 프로젝트의 핵심 가치

AED의 메인 강점은 다음과 같이 정리할 수 있다.

- 앱이 이미 알고 있는 데이터를 중앙 store에 모아둘 수 있다.
- 유저가 특정 플로우로 행동했을 때 필요한 데이터만 골라 조합할 수 있다.
- 실제 이벤트 핸들러에서는 `emit()`만 호출하면 된다.
- analytics provider별 전송 포맷 차이를 중앙에서 관리할 수 있다.
- 이벤트 정의를 domain 단위로 응집도 높게 구성할 수 있다.

한 줄 정의:

> AED는 유저 이벤트와 앱 컨텍스트를 결합해, flow 기반 analytics payload를 중앙에서 조합하고 실행하는 라이브러리다.

## 4. 왜 순수 delegation만으로는 부족한가

초기 컨셉은 DOM 이벤트 위임이었다. 하지만 실제 웹 플랫폼 제약을 고려하면 delegation만으로는 충분하지 않다.

### delegation의 한계
- `stopPropagation()`, `stopImmediatePropagation()`에 의해 이벤트 전파가 끊길 수 있다.
- `focus`, `blur`처럼 원래 버블링하지 않는 이벤트가 있다.
- Shadow DOM 경계를 넘지 못하는 이벤트가 있다.
- closed shadow root 내부는 외부에서 자동 추적이 어렵다.
- iframe 내부 이벤트는 부모 document에서 직접 수집할 수 없다.
- cross-origin iframe은 직접 DOM 접근이 불가능하다.

### 결론
AED의 코어는 pure delegation이 아니라 `semantic emit 중심 구조`가 더 적합하다.

즉, 실제 UI 핸들러에서는 다음과 같이 의미 있는 이벤트를 직접 발생시키는 방식이 코어가 된다.

```ts
aed.emit("product.clicked", { productId })
aed.emit("order.completed", { orderId })
```

delegation은 나중에 옵션 기능이나 플러그인 형태로 붙일 수 있다.

## 5. 현재 합의된 핵심 아키텍처

AED는 다음 레이어로 구성된다.

### 1) Store Layer
앱 컨텍스트와 유저 여정 데이터를 저장한다.

### 2) Event Definition Layer
`define()`을 통해 semantic event가 어떤 데이터를 필요로 하고, 어떻게 payload를 만들고, 어디로 전송할지 정의한다.

### 3) Resolver Layer
이벤트 실행 시 필요한 데이터만 store에서 선택적으로 꺼내 조합한다.

### 4) Dispatcher Layer
최종 payload를 provider별 포맷으로 변환하고 실제 전송 메서드를 호출한다.

### 5) Runtime Layer
`emit()`이 entry point가 되어 resolve -> dispatch 전 과정을 오케스트레이션한다.

## 6. Public API 초안

현재까지 필요한 public API는 크게 세 가지다.

### 1) Store 적재 API
앱이 이미 보유한 데이터를 AED에 적재한다.

예시:

```ts
aed.page.set({ pageType: "product_list", categoryId: "outer" })
aed.session.merge({ anonymousId: "abc", utmSource: "google" })
aed.entities.upsert("product", "p1", product)
aed.entities.upsertMany("product", products)
aed.journey.remember("selectedProduct", { productId: "p1" })
```

### 2) `define()` API
특정 semantic event가 발생했을 때 어떤 데이터를 resolve하고 어떤 방식으로 dispatch할지 등록한다.

예시:

```ts
aed.define("order.completed", {
  resolve: ({ event, journey, entities, session }) => {
    const productId = journey.get("selectedProductId")
    const product = entities.get("product", productId)

    return {
      orderId: event.orderId,
      productId,
      productName: product?.name,
      utmSource: session.get("utmSource"),
    }
  },
  dispatch: {
    mixpanel: ({ payload, client }) => {
      client.track("order_completed", payload)
    },
  },
})
```

### 3) `emit()` API
핸들러에서 semantic event를 발생시키고, 등록된 정의에 따라 실제 동작을 실행한다.

예시:

```ts
aed.emit("order.completed", { orderId: order.id })
```

## 7. Store 구조 초안

store는 데이터의 수명과 역할 기준으로 분리한다.

### `appStore`
앱 전역 메타데이터.

예:
- `appName`
- `env`
- `platform`

### `pageStore`
현재 페이지/화면 단위 컨텍스트.

예:
- `pageType`
- `categoryId`
- `searchQuery`
- `listId`

### `sessionStore`
이번 방문 세션 전체에 걸쳐 유지되는 컨텍스트.

예:
- `sessionId`
- `anonymousId`
- `userId`
- `utmSource`
- `referrer`
- `experiment`

### `entityStore`
실제 비즈니스 데이터를 정규화해 저장하는 캐시.

예:
- `product`
- `order`
- `user`
- `cart`

### `journeyStore`
현재 액션까지 도달하는 유저 흐름 데이터를 저장한다.

예:
- `selectedProductId`
- `selectedProduct`
- `checkoutEntryPoint`
- `lastClickedListId`

## 8. 핵심 설계 원칙

### 1) analytics에 필요한 데이터는 다시 API로 가져오기보다 미리 store에 적재한다
AED는 데이터를 생성하는 시스템이 아니라, 이미 앱이 알고 있는 데이터를 재사용하고 조합하는 시스템이다.

### 2) 이벤트마다 필요한 데이터만 resolve한다
store 전체를 통째로 읽는 것이 아니라, 각 이벤트 정의에서 필요한 필드만 선언적으로 조회해야 한다.

### 3) UI 핸들러는 최대한 단순해야 한다
핸들러에서는 `emit("semantic.event", hints)`만 호출하고, payload 조합과 provider 호출은 AED 내부가 담당해야 한다.

### 4) semantic event와 provider payload를 분리한다
`order.completed`라는 내부 이벤트 의미와 `mixpanel.track("order_completed", ...)` 같은 외부 포맷은 별도로 관리해야 한다.

### 5) domain별로 정의를 나눈다
한 파일에 전부 몰아넣기보다 feature/domain 단위 파일 구성이 더 적합하다.

예:
- `analytics/product.events.ts`
- `analytics/cart.events.ts`
- `analytics/order.events.ts`
- `analytics/registerEvents.ts`

### 6) analytics runtime는 기본적으로 fail-soft 해야 한다
`emit()` 시점에 store에 필요한 데이터가 없더라도, 일반적인 user flow를 깨뜨리는 예외를 기본 동작으로 삼으면 안 된다.

권장 정책은 다음과 같다.

- 필수 필드가 없으면 event 전송을 skip하고 경고를 남긴다.
- 선택 필드는 partial payload 또는 default value로 처리한다.
- 개발 환경에서는 strict mode를 통해 누락 필드를 더 강하게 검증할 수 있다.
- 어떤 필드가 왜 resolve되지 않았는지 inspect/debug 정보가 남아야 한다.

## 9. TypeScript 채택

이 프로젝트는 TypeScript 기반으로 작성하는 것이 적절하다.

그 이유는 다음과 같다.

- `event name -> emit input -> resolved payload -> provider dispatch` 관계를 타입으로 연결할 수 있다.
- 이벤트 이름별 인자 형태를 안전하게 강제할 수 있다.
- provider별 payload 변환 시 누락 필드를 더 빨리 검증할 수 있다.
- 외부 사용자는 JS 환경에서도 사용할 수 있도록 빌드 산출물은 JS + `.d.ts`를 제공하면 된다.

즉:

- 내부 구현: TypeScript
- 배포 형태: JavaScript + 타입 선언 파일

## 10. define/emit 기반 실행 흐름

AED의 런타임 흐름은 아래와 같다.

1. 앱이 API 응답, 페이지 정보, 세션 정보 등을 store에 적재한다.
2. 개발자는 domain 단위로 `define()`을 사용해 semantic event를 등록한다.
3. 실제 핸들러에서는 `emit()`으로 등록된 이벤트 이름을 호출한다.
4. AED는 해당 이벤트 정의를 찾아 필요한 데이터만 resolve한다.
5. 최종 payload를 만든 뒤 provider별 dispatcher를 호출한다.
6. 필요하다면 후처리로 journey 데이터를 갱신한다.

## 11. Missing Data Handling 전략

write API로 필요한 데이터를 적재하지 않은 상태에서 `emit()`이 먼저 호출될 가능성은 항상 존재한다.

이 문제를 해결하기 위해 AED는 기본적으로 다음 정책을 가져야 한다.

### 1) `emit()`은 기본적으로 앱을 깨뜨리지 않는다
analytics는 중요하지만, 실제 user action보다 우선될 수는 없다.

즉 기본 동작은 다음 중 하나여야 한다.

- 필요한 필드가 없으면 event를 skip한다.
- 일부 필드만 없는 경우 partial payload로 전송한다.
- default value를 사용한다.

### 2) 필드 단위로 required/optional 정책을 둔다
각 event definition은 resolve 단계에서 필수 필드와 선택 필드를 구분해야 한다.

예:

```ts
aed.define("order.completed", {
  resolve: {
    orderId: required(from.event("orderId")),
    productId: required(from.journey("selectedProductId")),
    productName: optional(from.entity("product", ref("productId"), "name")),
    utmSource: optional(from.session("utmSource")).default(null),
  },
})
```

### 3) 개발 환경에서는 strict mode를 둔다
운영 환경에서는 skip/warn 정책을 사용하되, 개발 환경에서는 누락 필드가 있을 때 강하게 경고하거나 예외를 던질 수 있어야 한다.

### 4) `inspect()` 또는 debug source map이 필요하다
어떤 필드가 어떤 store에서 resolve되었고, 어떤 필드는 왜 비어 있는지 확인할 수 있어야 한다.

즉 missing data 문제는 "에러를 막는다"보다, `정책적으로 통제한다`가 핵심이다.

## 12. 예시 시나리오

### 상품 목록 -> 상품 상세 -> 주문 완료

1. 상품 목록 API 응답 수신
2. 상품 데이터들을 `entityStore.product`에 저장
3. 현재 페이지 정보를 `pageStore`에 저장
4. 유저가 특정 상품 클릭
5. 앱은 `aed.emit("product.clicked", { productId })` 호출
6. 해당 정의에서 `journeyStore`에 `selectedProductId` 또는 관련 컨텍스트 저장
7. 이후 주문 완료 시 `aed.emit("order.completed", { orderId })` 호출
8. AED는 `journeyStore`, `entityStore`, `sessionStore`, `pageStore` 등을 조합해 최종 analytics payload 생성
9. dispatcher가 `mixpanel.track()` 수행

## 13. 현재 기준의 프로젝트 요약

AED는 단순히 "상위에서 이벤트를 위임받아 처리하는 라이브러리"가 아니다.

현재 합의된 방향에서 AED는 다음과 같은 성격을 가진다.

- semantic event 중심 런타임
- analytics용 컨텍스트 저장소
- 유저 여정 기반 데이터 조합 엔진
- provider별 전송 전략을 감추는 dispatcher

핸들러에서 해야 하는 일은 최소화된다.

```ts
aed.emit("order.completed", { orderId })
```

그리고 이벤트의 해석과 실행 규칙은 응집도 높게 `define()`에 모인다.

이 구조가 AED의 핵심 설계 철학이다.
