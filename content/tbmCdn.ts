/**
 * TBM 상세·설문 등 **도메인 문구** — CDN(JSON) 또는 API `content` 필드로 내려받는 값.
 *
 * **역할 분리**
 * - `lang/*.json` — 앱 껍데기 UI(버튼, 섹션 제목, 에러 메시지 등) · 앱과 함께 배포
 * - 이 모듈 — 현장/일정별로 바뀌는 긴 문장, 설문 항목, 체크리스트 라벨 등 · CDN/서버
 *
 * 상세 화면(`app/tbm/[id].tsx`)·세션(`app/tbm/session/[id].tsx`)은 `getTbmById` 결과에
 * `mergeTbmWithCdnContent`로 원격 문구를 합친 뒤 렌더링하면 됩니다.
 */

import type { TbmItem, TbmSurveyItem } from '@/constants/tbm';

/** CDN에 `done` 없이 올 수 있음 — 완료 여부는 API/로컬 세션 상태와 id로 매칭 */
export type TbmCdnSurveyItem = {
  id: string;
  hazardFactor: string;
  harmfulFactor: string;
  question: string;
};

export type TbmCdnChecklistItem = {
  id: string;
  label: string;
};

/**
 * 한 TBM에 대해 CDN에서 내려올 수 있는 필드(부분 갱신 가능).
 * 키가 없으면 기존(목업/API 본문) 값 유지.
 */
export type TbmCdnDetailContent = {
  title?: string;
  siteName?: string;
  workSummary?: string;
  riskFactors?: string[];
  safetyMeasures?: string[];
  specialNotice?: string;
  cautionItems?: TbmCdnSurveyItem[];
  ppeItems?: TbmCdnSurveyItem[];
  checklist?: TbmCdnChecklistItem[];
};

/** 문서화·검색용 — 실제 CDN 스키마 버전 관리는 서버와 맞추면 됨 */
export const TBM_CDN_DETAIL_KEYS = [
  'title',
  'siteName',
  'workSummary',
  'riskFactors',
  'safetyMeasures',
  'specialNotice',
  'cautionItems',
  'ppeItems',
  'checklist',
] as const satisfies readonly (keyof TbmCdnDetailContent)[];

function mergeSurveyItems(local: TbmSurveyItem[], remote: TbmCdnSurveyItem[]): TbmSurveyItem[] {
  const doneById = new Map(local.map((x) => [x.id, x.done]));
  return remote.map((r) => ({
    ...r,
    done: doneById.get(r.id) ?? false,
  }));
}

function mergeChecklist(
  local: TbmItem['checklist'],
  remote: TbmCdnChecklistItem[],
): TbmItem['checklist'] {
  const labels = new Map(remote.map((x) => [x.id, x.label]));
  return local.map((c) => ({
    ...c,
    label: labels.get(c.id) ?? c.label,
  }));
}

/**
 * 목업/API `TbmItem`에 CDN 문구를 덮어씀. `remote`가 null이면 `base` 그대로.
 * 설문·체크리스트는 **id 기준**으로 텍스트만 바꾸고 `done` 등 상태는 `base` 유지.
 */
export function mergeTbmWithCdnContent(base: TbmItem, remote: TbmCdnDetailContent | null | undefined): TbmItem {
  if (remote == null) return base;

  return {
    ...base,
    ...(remote.title !== undefined && { title: remote.title }),
    ...(remote.siteName !== undefined && { siteName: remote.siteName }),
    ...(remote.workSummary !== undefined && { workSummary: remote.workSummary }),
    ...(remote.riskFactors !== undefined && { riskFactors: remote.riskFactors }),
    ...(remote.safetyMeasures !== undefined && { safetyMeasures: remote.safetyMeasures }),
    ...(remote.specialNotice !== undefined && { specialNotice: remote.specialNotice }),
    ...(remote.cautionItems !== undefined && {
      cautionItems: mergeSurveyItems(base.cautionItems, remote.cautionItems),
    }),
    ...(remote.ppeItems !== undefined && {
      ppeItems: mergeSurveyItems(base.ppeItems, remote.ppeItems),
    }),
    ...(remote.checklist !== undefined && {
      checklist: mergeChecklist(base.checklist, remote.checklist),
    }),
  };
}

/**
 * 예: `GET https://cdn.example.com/tbm/{tbmId}.json` 또는 API 응답의 `content` 필드.
 * `EXPO_PUBLIC_TBM_CDN_BASE` 가 비어 있으면 항상 null (로컬 목업만 사용).
 */
export async function fetchTbmCdnDetailContent(tbmId: string): Promise<TbmCdnDetailContent | null> {
  const base = process.env.EXPO_PUBLIC_TBM_CDN_BASE?.replace(/\/$/, '');
  if (!base) return null;

  const url = `${base}/${encodeURIComponent(tbmId)}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as unknown;
  if (json == null || typeof json !== 'object') return null;
  return json as TbmCdnDetailContent;
}
