// 비밀번호를 그대로 쿠키에 저장하지 않기 위해 간단히 해시해서 비교하는 유틸입니다.
// (Edge Runtime에서도 동작하도록 Web Crypto API 사용)
export async function hashValue(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const ADMIN_COOKIE_NAME = "admin_token";

// 현재 설정된 관리자 비밀번호를 해시한 값 (매 요청마다 비교용으로 계산)
export async function getExpectedAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  return hashValue(password);
}
