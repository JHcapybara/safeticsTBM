/**
 * CDN·원격에서 내려받는 **도메인 문구** 타입·병합·페치.
 * UI 셸 문자열은 `lang/` 참고.
 */

export {
  fetchTbmCdnDetailContent,
  mergeTbmWithCdnContent,
  TBM_CDN_DETAIL_KEYS,
} from './tbmCdn';
export type { TbmCdnChecklistItem, TbmCdnDetailContent, TbmCdnSurveyItem } from './tbmCdn';
