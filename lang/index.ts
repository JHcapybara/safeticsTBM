import koCommon from './ko/common.json';
import enCommon from './en/common.json';

export type SupportedLang = 'ko' | 'en';

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type Strings = DeepReadonly<typeof koCommon>;

export const catalog: Record<SupportedLang, Strings> = {
  ko: koCommon,
  en: enCommon as unknown as Strings,
};

let _lang: SupportedLang = 'ko';

/** 현재 언어를 변경합니다. */
export function setLang(lang: SupportedLang) {
  _lang = lang;
}

/** 현재 언어를 반환합니다. */
export function getLang(): SupportedLang {
  return _lang;
}

/**
 * 현재 언어의 문구 객체를 반환합니다.
 *
 * @example
 * import { strings } from '@/lang';
 * <Text>{strings().tbm.startButton}</Text>
 */
export function strings(): Strings {
  return catalog[_lang];
}

/**
 * 점(.) 구분 키 경로로 문구를 조회합니다. 키를 찾지 못하면 키 자체를 반환합니다.
 *
 * @example
 * t('tbm.startButton')  // → "TBM 시작하기"
 * t('emergency.sos.title')  // → "긴급 SOS"
 */
export function t(path: string): string {
  const keys = path.split('.');
  let node: unknown = catalog[_lang];
  for (const k of keys) {
    if (typeof node !== 'object' || node === null) return path;
    node = (node as Record<string, unknown>)[k];
  }
  return typeof node === 'string' ? node : path;
}
