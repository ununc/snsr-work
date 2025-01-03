const version = "0.1.6";
const domain = "https://hcsb.synology.me:6555";
// const domain = "http://localhost:3000";
const pushKey =
  "BNTNlbgs6jawRIR-1Q9VLbYcT3ZuZP8qbregBP7iYN3cAXjtaZ2gFyoqf8ESy-MSNUjcaUNjAuFL18spAWsMSZs";

const STATIC_CACHE_NAME = "static-assets-" + version;
const STATIC_ASSETS = [
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/version.json",
  "/sw.js",
  "/icons/android-chrome-192x192.svg",
  "/icons/android-chrome-512x512.svg",
  "/icons/apple-touch-icon.svg",
  "/icons/favicon.svg",
];

// 버전이 오르면 다시 등록 되면서 install 실행
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // 단일 캐시로 통합하여 기본 정적 파일들 캐싱
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // 대기 없이 바로 활성화
      self.skipWaiting(),
    ])
  );
});
/*
발생 시점:
서비스 워커가 처음 설치될 때 발생합니다
사용자가 웹사이트를 처음 방문하거나 서비스 워커 파일이 변경되었을 때 실행됩니다
한번 설치되면 브라우저를 닫았다 열어도 다시 실행되지 않습니다 (파일이 변경되지 않는 한)

주요 용도:
앱에서 필요한 정적 리소스들을 미리 캐시에 저장합니다
앱의 "기초 공사" 단계라고 생각하시면 됩니다
예: HTML, CSS, JS, 이미지 등의 파일을 캐시에 저장
*/

const handleApiRequest = async (request) => {
  try {
    const pathAfterApi = request.url.split("/api")[1];
    const newUrl = `${domain}${pathAfterApi}`;

    const headers = new Headers(request.headers);
    headers.set("Origin", new URL(domain).origin);
    const requestInit = {
      method: request.method,
      headers: request.headers,
      credentials: request.credentials,
      mode: request.mode,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      integrity: request.integrity,
    };

    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const clonedBody = await request.clone().blob();
      requestInit.body = clonedBody;
      requestInit.duplex = "half";
    }
    const newRequest = new Request(newUrl, requestInit);

    const response = await fetch(newRequest);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("API request failed:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const handleMinioRequest = async (request) => {
  try {
    // PUT 요청은 직접 전달
    if (request.method === "PUT") {
      const response = await fetch(request.clone());
      if (!response.ok) {
        throw new Error(`MinIO upload failed: ${response.status}`);
      }
      return response;
    }

    // GET 등 다른 요청은 일반적인 fetch 수행
    return fetch(request);
  } catch {
    console.error("MinIO request failed:");
    return new Response("Storage operation failed", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Minio 서버 요청 처리
  if (url.hostname === "hcsb.synology.me" && url.port === "5401") {
    event.respondWith(handleMinioRequest(event.request));
    return;
  }

  // API 요청 처리
  if (url.pathname.startsWith("/api")) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // assets 폴더와 STATIC_ASSETS 처리 (둘 다 STATIC_CACHE_NAME 사용)
  if (
    url.pathname.includes("/assets/") ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(event.request).then(async (response) => {
        // 캐시에 있으면 반환
        if (response) {
          // 네트워크 요청을 백그라운드로 수행하여 캐시 업데이트
          fetch(event.request)
            .then(async (networkResponse) => {
              if (networkResponse.ok) {
                const cache = await caches.open(STATIC_CACHE_NAME);
                await cache.put(event.request, networkResponse.clone());
              }
            })
            .catch(() => {
              /* 에러 무시 */
            });

          return response;
        }

        // 캐시에 없으면 네트워크 요청
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // 네트워크 요청 실패시 오프라인 페이지 반환
          return caches.match("/offline.html");
        }
      })
    );
    return;
  }

  // 그 외 요청들
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match("/offline.html"))
  );
});
/*
발생 시점:
웹 앱에서 네트워크 요청이 발생할 때마다 실행됩니다
페이지 로드시 필요한 모든 리소스 요청 (HTML, CSS, JS, 이미지 등)
API 호출이나 데이터 요청
사용자의 브라우저가 서버로 어떤 요청을 보낼 때마다 발생

주요 용도:
네트워크 요청을 가로채서 어떻게 처리할지 결정합니다
캐시된 리소스를 반환할지, 네트워크 요청을 할지 결정합니다
오프라인 동작을 가능하게 만듭니다
다양한 캐싱 전략을 구현할 수 있습니다:

Cache First: 캐시 먼저 확인, 없으면 네트워크
Network First: 네트워크 먼저 시도, 실패하면 캐시
Stale While Revalidate: 캐시 반환하면서 백그라운드에서 업데이트
*/

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    Promise.all([
      // 모든 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // 캐시 스토리지 정리
      (async () => {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const keys = await cache.keys();
        const currentAssets = STATIC_ASSETS.concat(
          Array.from(keys)
            .filter((request) => request.url.includes("/assets/"))
            .map((request) => request.url)
        );

        for (const request of keys) {
          if (!currentAssets.includes(request.url)) {
            await cache.delete(request);
          }
        }
      })(),
      self.clients.claim(),
    ])
  );
});
self.addEventListener("message", (event) => {
  if (event?.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  // 이후에 react code 에 새로고침을 넣어줄 필요가 있다
});
/*
서비스 워커는 설치될 때 다음과 같은 단계를 거칩니다:

새로운 서비스 워커가 설치됨 (installing → installed)
대기 상태 (waiting)
활성화 (activated)

skipWaiting()을 호출하면:

이 대기 과정을 건너뛰고
새로운 서비스 워커를 즉시 활성화시킵니다
기존 서비스 워커를 바로 대체합니다
*/

// Push 알림 수신 처리
self.addEventListener("push", function (event) {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  // 푸시 데이터 파싱
  const data = event.data.json();

  // 알림 옵션 설정
  const options = {
    body: data.body,
    data: data.data,
    // 추가 알림 옵션들
    icon: "/icons/android-chrome-192x192.svg", // 192x192px 권장
    badge: "/icons/apple-touch-icon.svg", // 72x72px 권장
    renotify: true,
    tag: "default-tag",
    actions: [
      // iOS는 최대 2개의 액션 버튼 지원
      { action: "view", title: "보기" },
      { action: "close", title: "닫기" },
    ],
  };
  event.waitUntil(
    // 알림 표시
    self.registration.showNotification(data.title, options)
  );
});
/*
발생 시점:
서버에서 웹 푸시 API를 통해 푸시 메시지를 전송했을 때 발생
사용자의 브라우저가 오프라인 상태여도 발생 가능
앱이 백그라운드 상태에서도 동작

주요 용도:
서버로부터 받은 푸시 데이터를 처리
알림 표시 여부 결정 및 알림 내용 구성
백그라운드 동기화 작업 수행
캐시 업데이트나 데이터 프리페칭 수행
*/

// 알림 클릭 처리
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // 알림 클릭시 해당 URL로 이동
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
/*
발생 시점:
사용자가 서비스 워커가 생성한 알림을 클릭했을 때 발생
알림 액션 버튼을 클릭했을 때도 발생 가능

주요 용도:
알림 클릭에 대한 사용자 인터랙션 처리
특정 URL로 페이지 이동
앱 창 포커싱
알림 관련 데이터 처리나 상태 업데이트
*/

// Push 구독 정보 서버로 전송
const sendSubscriptionToServer = async (subscription, action = "subscribe") => {
  try {
    const response = await fetch(`${domain}/api/push/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Push subscription server request failed");
    }

    return response.json();
  } catch (error) {
    console.error("Error sending push subscription to server:", error);
    throw error;
  }
};

// Push 구독 변경 처리
self.addEventListener("pushsubscriptionchange", function (event) {
  const subscribeOptions = {
    applicationServerKey: pushKey,
    userVisibleOnly: true,
  };

  event.waitUntil(
    (async () => {
      try {
        // 기존 구독 확인 및 취소
        const oldSubscription =
          await self.registration.pushManager.getSubscription();
        if (oldSubscription) {
          await sendSubscriptionToServer(oldSubscription, "unsubscribe");
          await oldSubscription.unsubscribe();
        }

        // 새로운 구독 생성
        const newSubscription = await self.registration.pushManager.subscribe(
          subscribeOptions
        );
        await sendSubscriptionToServer(newSubscription, "subscribe");
      } catch (error) {
        console.error("Subscription change failed:", error);
        // 사용자에게 재구독이 필요하다는 메시지를 보낼 수 있음
      }
    })()
  );
});
/*
발생 시점:
푸시 구독이 만료되었을 때
브라우저가 구독을 자동으로 갱신할 때
사용자가 푸시 권한을 변경했을 때
브라우저가 구독 정보를 갱신해야 한다고 판단했을 때

주요 용도:
구독 정보 자동 갱신
새로운 구독 정보를 서버에 전송
구독 상태 동기화 유지
*/

// 서비스 워커 등록 해제시
self.addEventListener("unregister", async function (event) {
  event.waitUntil(
    (async () => {
      try {
        const subscription =
          await self.registration.pushManager.getSubscription();
        if (subscription) {
          // 구독 취소 전에 서버에 알림
          await sendSubscriptionToServer(subscription, "unsubscribe");

          // 구독 취소 시도
          const unsubscribed = await subscription.unsubscribe();
          if (!unsubscribed) {
            throw new Error("Unsubscribe failed");
          }

          // 서비스 워커 등록 취소
          const unregistered = await self.registration.unregister();
          if (!unregistered) {
            throw new Error("Unregister failed");
          }
        }
      } catch (error) {
        console.error("Unregistration process failed:", error);
        // 에러 발생 시 재시도 로직을 추가할 수 있습니다
      }
    })()
  );
});
/*
생 시점:
서비스 워커가 수동으로 등록 해제될 때
serviceWorkerRegistration.unregister() 메서드가 호출될 때
사용자가 브라우저 설정에서 사이트 데이터를 삭제할 때
주요 용도:
구독 정보 정리
서버에 구독 취소 알림
캐시 데이터 정리
리소스 정리 작업 수행
*/
