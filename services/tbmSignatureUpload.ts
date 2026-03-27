/**
 * 서명 이미지를 스토리지용 업로드 API로 전송하고, 응답의 public URL을 반환합니다.
 *
 * - `EXPO_PUBLIC_TBM_API_BASE` 가 있으면 `POST {base}/signatures/upload` 로 요청합니다.
 * - 기대 JSON: `{ "imageUrl": "https://..." }` 또는 `{ "image_url": "..." }`
 * - 베이스 URL이 없고 `__DEV__` 이면 목 응답(짧은 지연 후 mock URL)을 반환합니다.
 */

export type UploadSignatureParams = {
  tbmId: string;
  /** data:image/jpeg;base64,... 형식 등 */
  imageDataUrl: string;
};

export type UploadSignatureResult = {
  imageUrl: string;
};

function parseUploadJson(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.imageUrl === "string" && o.imageUrl.length > 0) return o.imageUrl;
  if (typeof o.image_url === "string" && o.image_url.length > 0) return o.image_url;
  const nested = o.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    if (typeof d.imageUrl === "string" && d.imageUrl.length > 0) return d.imageUrl;
    if (typeof d.image_url === "string" && d.image_url.length > 0) return d.image_url;
  }
  return null;
}

export async function uploadSignatureToStorage(params: UploadSignatureParams): Promise<UploadSignatureResult> {
  const base = process.env.EXPO_PUBLIC_TBM_API_BASE?.replace(/\/$/, "");

  if (!base) {
    if (__DEV__) {
      await new Promise((r) => setTimeout(r, 550));
      return {
        imageUrl: `https://mock.storage.local/tbm/${encodeURIComponent(params.tbmId)}/${Date.now()}.jpg`,
      };
    }
    throw new Error("EXPO_PUBLIC_TBM_API_BASE 가 설정되지 않았습니다.");
  }

  const url = `${base}/signatures/upload`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tbmId: params.tbmId,
      image: params.imageDataUrl,
    }),
  });

  const bodyText = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(
      bodyText ? `업로드 실패 (${res.status}): ${bodyText.slice(0, 200)}` : `업로드 실패 (${res.status})`,
    );
  }

  let parsed: unknown;
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error("서버 응답이 올바른 JSON이 아닙니다.");
  }

  const imageUrl = parseUploadJson(parsed);
  if (!imageUrl) {
    throw new Error("응답에 imageUrl(또는 image_url)이 없습니다.");
  }

  return { imageUrl };
}
