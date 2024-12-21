const version = "0.0.1";
const domain = "https://hcsb.synology.me:6555";
const pushKey =
  "BNTNlbgs6jawRIR-1Q9VLbYcT3ZuZP8qbregBP7iYN3cAXjtaZ2gFyoqf8ESy-MSNUjcaUNjAuFL18spAWsMSZs";
const STATIC_ASSETS = [
  { url: "/dist/", cacheName: "static-assets-" + version },
  { url: "/dist/index.html", cacheName: "static-assets-" + version },
  { url: "/dist/assets/", cacheName: "static-assets-" + version },
];
// const version = "SW_VERSION";
// const domain = "SERVER_URL";
// const pushKey = "VAPID_PUBLIC_KEY";

// 버전이 오르면 다시 등록 되면서 install 실행
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all(
      STATIC_ASSETS.map(async (asset) => {
        const cache = await caches.open(asset.cacheName);
        return cache.add(asset.url);
      })
    )
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
// 정적 파일 요청 처리 함수
const handleStaticRequest = async (request) => {
  try {
    // URL 스키마 확인
    const url = new URL(request.url);
    const isValidScheme = url.protocol === "http:" || url.protocol === "https:";

    // 캐시 확인 (유효한 스키마인 경우만)
    if (isValidScheme) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // 네트워크 요청
    const response = await fetch(request);

    // 유효한 응답이고 지원되는 스키마인 경우만 캐시에 저장
    if (response.status === 200 && isValidScheme) {
      const responseClone = response.clone();
      const cache = await caches.open(version);
      await cache.put(request, responseClone);
    }

    return response;
  } catch (error) {
    console.error("Static request failed:", error);
    return new Response("Network error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api")) {
    event.respondWith(handleApiRequest(event.request));
  } else {
    event.respondWith(handleStaticRequest(event.request));
  }
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

const checkIfUpdateNeeded = async () => {
  // 현재 캐시된 버전들 확인
  const cacheNames = await caches.keys();

  // static-assets으로 시작하는 캐시 확인
  const staticCacheName = "static-assets-" + version;
  if (!cacheNames.includes(staticCacheName)) {
    return true;
  }

  // 캐시된 리소스 확인
  const cache = await caches.open(staticCacheName);
  const cachedUrls = await cache.keys();

  // 현재 캐시된 URL들과 새로운 STATIC_ASSETS 비교
  const isMissingUrls = STATIC_ASSETS.some(
    (asset) =>
      !cachedUrls.some((cachedUrl) => cachedUrl.url.includes(asset.url))
  );

  return isMissingUrls;
};

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    (async () => {
      const needsUpdate = await checkIfUpdateNeeded();

      if (needsUpdate) {
        // 캐시 스토리지만 관리하고 로컬스토리지는 건드리지 않도록 수정
        await caches.keys().then((cacheNames) => {
          const cacheDeletePromises = cacheNames.map((cacheName) => {
            // static assets 캐시만 관리
            if (cacheName !== version && cacheName.startsWith("static-")) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          });
          return Promise.all(cacheDeletePromises);
        });

        // 새로운 서비스워커가 페이지를 제어하기 전에 상태를 보존
        const allClients = await self.clients.matchAll();
        allClients.forEach((client) => {
          // 클라이언트에게 서비스워커 업데이트 알림
          client.postMessage({
            type: "SW_UPDATE",
            payload: { version },
          });
        });

        await self.clients.claim();
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
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
  event.waitUntil(
    // 새로운 구독 정보 생성
    self.registration.pushManager
      .subscribe({
        applicationServerKey: pushKey,
        userVisibleOnly: true,
      })
      .then(function (subscription) {
        // 서버에 새로운 구독 정보 전송
        return sendSubscriptionToServer(subscription, "subscribe");
      })
      .catch((error) => {
        console.error("Error during service worker unregistration:", error);
      })
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
self.addEventListener("unregister", async function () {
  try {
    const subscription = await self.registration.pushManager.getSubscription();
    if (subscription) {
      // 서버에 구독 취소 알림
      await sendSubscriptionToServer(subscription, "unsubscribe");
      // 구독 취소
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.error("Error during service worker unregistration:", error);
  }
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
