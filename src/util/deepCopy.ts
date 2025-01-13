export function deepCopy<T>(obj: T): T {
  // null이거나 객체가 아닌 경우 그대로 반환
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Date 객체 처리
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // 배열 처리
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item)) as T;
  }

  // 일반 객체 처리
  const copy = {} as { [K in keyof T]: T[K] };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }

  return copy as T;
}
