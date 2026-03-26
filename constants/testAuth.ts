/** 데모/개발용 — 실제 API 연동 시 제거·교체 */
export const TEST_LOGIN_ID = 'test';
export const TEST_LOGIN_PASSWORD = '1234';

export function validateTestCredentials(userId: string, password: string): boolean {
  return userId.trim() === TEST_LOGIN_ID && password === TEST_LOGIN_PASSWORD;
}
