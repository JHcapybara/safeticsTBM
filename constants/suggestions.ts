/** 조치 완료 · 조치중 · 미조치 */
export type SuggestionStatus = 'completed' | 'in_progress' | 'pending';

export type SuggestionItem = {
  id: string;
  ticketNo: string;
  title: string;
  preview: string;
  author: string;
  timeLabel: string;
  siteLabel: string;
  status: SuggestionStatus;
  priority: 'high' | 'normal' | 'low';
  category: string;
  actionHistory: {
    id: string;
    createdAt: string;
    author: string;
    content: string;
  }[];
};

export const MOCK_CURRENT_USER_NAME = '김관리';

export function getSuggestionStats(items: SuggestionItem[]) {
  const completed = items.filter((s) => s.status === 'completed').length;
  const inProgress = items.filter((s) => s.status === 'in_progress').length;
  const pending = items.filter((s) => s.status === 'pending').length;
  return { total: items.length, completed, inProgress, pending };
}

export function getSuggestionById(id: string): SuggestionItem | undefined {
  return MOCK_SUGGESTIONS.find((s) => s.id === id);
}

export function getMySuggestions(items: SuggestionItem[], author: string): SuggestionItem[] {
  return items.filter((s) => s.author === author);
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
    ticketNo: '260323-001',
    title: 'TBM 자료에 사진 용량 제한 완화 요청',
    preview:
      '현장 사진을 여러 장 올리다 보면 10MB 제한에 걸립니다. 압축 없이 원본 몇 장만 올릴 수 있게 늘려 주실 수 있을까요?',
    author: '이현장',
    timeLabel: '2시간 전',
    siteLabel: '강남 사업장',
    status: 'pending',
    priority: 'normal',
    category: 'TBM',
    actionHistory: [],
  },
  {
    id: '2',
    ticketNo: '260323-002',
    title: '체크리스트에 「석면·유해물질」 항목 추가',
    preview:
      '철거 구간 작업 시 석면 가능성이 있는데, 기본 체크리스트에 해당 항목이 없어 매번 메모로 남깁니다. 공통 항목으로 넣어 주시면 좋겠습니다.',
    author: '박안전',
    timeLabel: '어제',
    siteLabel: '강남 사업장',
    status: 'in_progress',
    priority: 'high',
    category: '체크리스트',
    actionHistory: [
      {
        id: 'h-2-1',
        createdAt: '2026.03.23 11:02',
        author: '관리자',
        content: '현장 의견 확인. 다음 배포 체크리스트 후보로 등록했습니다.',
      },
    ],
  },
  {
    id: '3',
    ticketNo: '260323-003',
    title: '오프라인에서도 출입 QR 인식 가능할까요?',
    preview:
      '지하층·막사 구간은 통신이 불안정해서 QR이 자주 실패합니다. 오프라인 캐시나 재시도 UX 개선을 건의드립니다.',
    author: '최도장',
    timeLabel: '3일 전',
    siteLabel: '수원 물류센터',
    status: 'completed',
    priority: 'normal',
    category: '출입',
    actionHistory: [
      {
        id: 'h-3-1',
        createdAt: '2026.03.21 09:40',
        author: '김개발',
        content: '오프라인 캐시 기능을 적용했고 QA 검증 완료했습니다.',
      },
    ],
  },
  {
    id: '4',
    ticketNo: '260323-004',
    title: 'TBM 시작 알림 시간 사용자 지정',
    preview:
      '현재 30분 전 고정인데, 현장마다 집합 시간이 달라서 1시간 전·당일 아침 등 선택할 수 있으면 편할 것 같습니다.',
    author: '김관리',
    timeLabel: '1주 전',
    siteLabel: '강남 사업장',
    status: 'completed',
    priority: 'low',
    category: '알림',
    actionHistory: [
      {
        id: 'h-4-1',
        createdAt: '2026.03.18 16:20',
        author: '운영팀',
        content: '알림 시간 옵션(10분/30분/60분) 반영 완료.',
      },
    ],
  },
  {
    id: '5',
    ticketNo: '260324-005',
    title: '건의사항 상세 화면에서 조치 이력 강조 요청',
    preview:
      '모바일에서는 조치 이력이 댓글과 섞여 보입니다. 이력은 읽기 전용 타임라인처럼 강조되면 좋겠습니다.',
    author: '김관리',
    timeLabel: '5시간 전',
    siteLabel: '강남 사업장',
    status: 'in_progress',
    priority: 'normal',
    category: 'UI',
    actionHistory: [
      {
        id: 'h-5-1',
        createdAt: '2026.03.26 09:15',
        author: '운영팀',
        content: '모바일 상세 레이아웃 개선 작업을 진행 중입니다.',
      },
    ],
  },
  {
    id: '6',
    ticketNo: '260324-006',
    title: '건의 작성 양식에서 그룹 구분 기본값 지정',
    preview:
      '새 건의 작성 시 그룹 구분이 비어 있어 등록이 번거롭습니다. 최근 선택값을 기본값으로 유지해 주세요.',
    author: '한현장',
    timeLabel: '어제',
    siteLabel: '부산 사업장',
    status: 'pending',
    priority: 'low',
    category: '폼 개선',
    actionHistory: [],
  },
  {
    id: '7',
    ticketNo: '260324-007',
    title: '내가 쓴 글 필터 버튼 고정 영역 제안',
    preview:
      '스크롤이 길어질 때 필터/액션 버튼이 사라집니다. 상단에 고정되면 빠르게 전환할 수 있어요.',
    author: '김관리',
    timeLabel: '2일 전',
    siteLabel: '강남 사업장',
    status: 'completed',
    priority: 'normal',
    category: 'UX',
    actionHistory: [
      {
        id: 'h-7-1',
        createdAt: '2026.03.24 13:40',
        author: '기획',
        content: '고정 액션바 시안 반영 완료. 다음 배포에 포함합니다.',
      },
    ],
  },
];
