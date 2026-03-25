/** 조치 완료 · 조치중 · 미조치 */
export type SuggestionStatus = 'completed' | 'in_progress' | 'pending';

export type SuggestionItem = {
  id: string;
  title: string;
  preview: string;
  author: string;
  authorInitial: string;
  timeLabel: string;
  siteLabel: string;
  status: SuggestionStatus;
  tags: string[];
};

export function getSuggestionStats(items: SuggestionItem[]) {
  const completed = items.filter((s) => s.status === 'completed').length;
  const inProgress = items.filter((s) => s.status === 'in_progress').length;
  const pending = items.filter((s) => s.status === 'pending').length;
  return { total: items.length, completed, inProgress, pending };
}

export function suggestionStatusLabel(status: SuggestionStatus): string {
  switch (status) {
    case 'completed':
      return '조치 완료';
    case 'in_progress':
      return '조치중';
    case 'pending':
      return '미조치';
  }
}

/** 건의사항 목업 (현장·TBM 맥락) */
export const MOCK_SUGGESTIONS: SuggestionItem[] = [
  {
    id: '1',
    title: 'TBM 자료에 사진 용량 제한 완화 요청',
    preview:
      '현장 사진을 여러 장 올리다 보면 10MB 제한에 걸립니다. 압축 없이 원본 몇 장만 올릴 수 있게 늘려 주실 수 있을까요?',
    author: '이현장',
    authorInitial: '이',
    timeLabel: '2시간 전',
    siteLabel: '강남 사업장',
    status: 'pending',
    tags: ['TBM', '앱개선'],
  },
  {
    id: '2',
    title: '체크리스트에 「석면·유해물질」 항목 추가',
    preview:
      '철거 구간 작업 시 석면 가능성이 있는데, 기본 체크리스트에 해당 항목이 없어 매번 메모로 남깁니다. 공통 항목으로 넣어 주시면 좋겠습니다.',
    author: '박안전',
    authorInitial: '박',
    timeLabel: '어제',
    siteLabel: '강남 사업장',
    status: 'in_progress',
    tags: ['체크리스트', '안전'],
  },
  {
    id: '3',
    title: '오프라인에서도 출입 QR 인식 가능할까요?',
    preview:
      '지하층·막사 구간은 통신이 불안정해서 QR이 자주 실패합니다. 오프라인 캐시나 재시도 UX 개선을 건의드립니다.',
    author: '최도장',
    authorInitial: '최',
    timeLabel: '3일 전',
    siteLabel: '수원 물류센터',
    status: 'completed',
    tags: ['출입', 'UX'],
  },
  {
    id: '4',
    title: 'TBM 시작 알림 시간 사용자 지정',
    preview:
      '현재 30분 전 고정인데, 현장마다 집합 시간이 달라서 1시간 전·당일 아침 등 선택할 수 있으면 편할 것 같습니다.',
    author: '김관리',
    authorInitial: '김',
    timeLabel: '1주 전',
    siteLabel: '강남 사업장',
    status: 'completed',
    tags: ['알림', 'TBM'],
  },
];
