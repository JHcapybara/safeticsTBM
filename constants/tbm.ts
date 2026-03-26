export type TbmStatus = "scheduled" | "completed" | "incomplete";

/** 주의사항 / PPE 항목 */
export type TbmSurveyItem = {
  id: string;
  hazardFactor: string;   // 위험인자 (대분류)
  harmfulFactor: string;  // 유해요인 (소분류)
  question: string;       // 설문 내용
  done: boolean;
};

export type TbmItem = {
  id: string;
  title: string;
  siteName: string;
  workArea: string;
  scheduledAt: string;
  supervisor: string;
  attendeeCount: number;
  status: TbmStatus;
  workSummary: string;
  /** 주의사항 — 위험인자/유해요인/설문 */
  cautionItems: TbmSurveyItem[];
  /** 개인안전보호구(PPE) — 위험인자/유해요인/설문 */
  ppeItems: TbmSurveyItem[];
  /** 오늘의 특별 공지 — 줄글 */
  specialNotice: string;
  // legacy (이전 화면과의 하위 호환)
  riskFactors: string[];
  safetyMeasures: string[];
  checklist: { id: string; label: string; done: boolean }[];
  /**
   * 이전 기록 목록에 노출 — 오늘 날짜이지만 참여 완료해 과거 기록처럼 볼 때
   * (과거 날짜 TBM은 별도 플래그 없이 항상 목록에 포함)
   */
  appearsInHistoryList?: boolean;
  /** 완료·참여 시 서명 목업(SVG Path d). 미참여/미완료는 없음 */
  signatureSvgPaths?: string[];
};

/** 목업 서명 필기 (실제 저장 서명 연동 시 교체) */
export const DEFAULT_MOCK_SIGNATURE_PATHS = [
  "M 12 52 C 28 28 48 28 68 52 S 108 58 132 44",
  "M 96 36 Q 118 22 138 34",
  "M 104 48 L 128 36",
];

export const MOCK_TBMS: TbmItem[] = [
  {
    id: "1",
    title: "철골 조립 작업 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-25T09:00:00",
    supervisor: "김안전",
    attendeeCount: 12,
    status: "completed",
    workSummary: "데크플레이트 거치 및 볼트 체결. 크레인 협업 및 고소작업 병행.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "소음 환경",
        harmfulFactor: "소음",
        question: "소음 작업 구역에서 청력 보호구를 착용하고 있습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "진동 장비",
        harmfulFactor: "진동",
        question: "진동이 발생하는 장비 사용 시 안전 수칙을 확인하셨습니까?",
        done: true,
      },
      {
        id: "ca3",
        hazardFactor: "고소 작업",
        harmfulFactor: "추락 위험",
        question: "고소 작업 시 안전대를 착용하고 생명줄에 걸어두었습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "분진 환경",
        harmfulFactor: "흡입 위험",
        question: "분진 발생 작업 시 방진마스크를 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "고온 환경",
        harmfulFactor: "일사병/화상",
        question: "고온 작업 환경에서 충분한 수분 섭취 및 휴식을 취하고 있습니까?",
        done: true,
      },
      {
        id: "pp3",
        hazardFactor: "낙하물 위험",
        harmfulFactor: "두부 충격",
        question: "안전모를 올바르게 착용하고 턱끈을 조여두었습니까?",
        done: true,
      },
    ],
    specialNotice:
      "금일 작업 구역에서 타워크레인 인양 작업이 진행됩니다. 작업 반경 내 무단 접근을 금지합니다. 작업 시작 전 신호수와 눈맞춤 확인을 해 주세요. 강풍 주의보 시 즉시 작업 중단 후 관리자에게 보고하십시오.",
    riskFactors: [
      "소음·진동·고소 작업에 따른 청력 손상·추락·낙하물",
      "크레인 인양 경로 하부 및 협착 구역 내 충돌",
      "데크플레이트 거치·볼트 체결 시 재료·공구 낙하",
    ],
    safetyMeasures: [
      "청력 보호구·안전대 착용 및 생명줄(이중 걸이) 확인",
      "인양 반경 통제·신호수 배치·호각·무전 연락 체계 유지",
      "크레인 정격 하중·아웃리거·지반 상태 사전 점검",
    ],
    signatureSvgPaths: DEFAULT_MOCK_SIGNATURE_PATHS,
    checklist: [
      { id: "c1", label: "개인보호구(PPE) 착용 확인", done: true },
      { id: "c2", label: "비상연락망 공유", done: true },
      { id: "c3", label: "위험성평가 내용 숙지", done: true },
      { id: "c4", label: "작업허가서 확인", done: true },
    ],
  },
  {
    id: "2",
    title: "전기 분전반 점검 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-24T16:30:00",
    supervisor: "이전기",
    attendeeCount: 5,
    status: "completed",
    workSummary: "정전 절차 확인 후 퓨즈·릴레이 점검 및 측정.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "전기 설비",
        harmfulFactor: "감전",
        question: "작업 전 LOTO(잠금·꼬리표) 절차를 완료하셨습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "아크 방전",
        harmfulFactor: "아크섬광 화상",
        question: "아크 플래시 방호복 및 절연 장갑을 착용하셨습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "전기 설비",
        harmfulFactor: "감전",
        question: "절연 보호구(장갑, 장화, 안면 보호대)를 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "아크 방전",
        harmfulFactor: "열화상",
        question: "아크 방지 방화복을 착용하고 있습니까?",
        done: true,
      },
    ],
    specialNotice:
      "금일 분전반 점검 구역 정전 작업이 예정되어 있습니다. 해당 구역 내 모든 전원 차단 여부를 반드시 이중으로 확인하십시오.",
    riskFactors: ["활선·접촉에 의한 감전", "아크 방전에 의한 화상·눈 손상", "측정·시운전 시 오인 투입"],
    safetyMeasures: ["LOTO(잠금·꼬리표) 절차 준수", "절연 보호구·아크 방호구 착용", "점검 구역 출입 통제 및 표지"],
    signatureSvgPaths: DEFAULT_MOCK_SIGNATURE_PATHS,
    checklist: [
      { id: "c1", label: "LOTO 적용 확인", done: true },
      { id: "c2", label: "측정기기 교정 유효기간", done: true },
    ],
  },
  {
    id: "3",
    title: "콘크리트 타설 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-26T08:00:00",
    supervisor: "박현장",
    attendeeCount: 18,
    status: "completed",
    appearsInHistoryList: true,
    workSummary: "펌프카 타설, 진동다짐 및 양생 필름 시공.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "펌프카 운전",
        harmfulFactor: "협착·충돌",
        question: "펌프카 붐대 선회 반경 내 작업자 출입을 통제하고 있습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "습식 콘크리트",
        harmfulFactor: "피부 화학 화상",
        question: "콘크리트 직접 접촉 방지를 위한 방수 장갑 및 장화를 착용하고 있습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "분진 환경",
        harmfulFactor: "호흡기 자극",
        question: "시멘트 분진이 발생하는 구역에서 방진마스크를 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "미끄러운 노면",
        harmfulFactor: "미끄러짐·넘어짐",
        question: "미끄럼 방지 안전화를 착용하고 작업통로를 확인하셨습니까?",
        done: true,
      },
    ],
    specialNotice:
      "금일 타설 물량이 확정되었습니다. 펌프카 2대 동시 운영 예정으로 신호수 각 1명씩 배치합니다. 양생 기간 중 해당 구역 차량 통행을 금지합니다.",
    riskFactors: ["펌프 라인·호스 파열·협착", "습식 콘크리트 화학·미끄럼", "분진·소음"],
    safetyMeasures: ["펌프카 아웃리거·지반·붐 반경 확인", "작업통로·조명 확보 및 방진마스크", "양생·배수 계획 공유"],
    signatureSvgPaths: DEFAULT_MOCK_SIGNATURE_PATHS,
    checklist: [
      { id: "c1", label: "펌프카 세팅 검사", done: true },
      { id: "c2", label: "배수·양생 계획 공유", done: true },
    ],
  },
  {
    id: "4",
    title: "비계 해체 작업 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-23T08:30:00",
    supervisor: "정비계",
    attendeeCount: 8,
    status: "incomplete",
    workSummary: "외벽 비계 해체 및 자재 반출.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "고소 해체",
        harmfulFactor: "추락",
        question: "비계 해체 순서(상부→하부)를 준수하며 작업하고 있습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "낙하물",
        harmfulFactor: "두부/신체 충격",
        question: "해체 자재의 낙하 방지를 위한 안전망 및 하부 통제 구역을 설정하셨습니까?",
        done: false,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "고소 작업",
        harmfulFactor: "추락",
        question: "안전대(벨트형 이중 훅)를 착용하고 구조물에 체결하셨습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "낙하물",
        harmfulFactor: "두부 충격",
        question: "안전모 및 안전화를 올바르게 착용하고 있습니까?",
        done: false,
      },
    ],
    specialNotice:
      "비계 해체 시 인근 도로로 낙하물이 유입될 수 있습니다. 작업 시간 중 해당 도로 일시 통제를 실시하며, 통제 인원을 배치합니다.",
    riskFactors: ["추락", "낙하물", "구조물 붕괴"],
    safetyMeasures: ["해체 순서 준수", "안전대 이중 걸이", "자재 반출 통로 확보"],
    checklist: [
      { id: "c1", label: "해체 계획서 확인", done: true },
      { id: "c2", label: "하부 통제 구역 설정", done: false },
    ],
  },
  {
    id: "5",
    title: "배관 용접 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-22T09:00:00",
    supervisor: "최용접",
    attendeeCount: 6,
    status: "completed",
    workSummary: "소방 배관 용접 및 비파괴 검사 준비.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "화기 작업",
        harmfulFactor: "화재·폭발",
        question: "화기작업 허가서를 취득하고 인근 가연물을 제거하셨습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "용접 흄",
        harmfulFactor: "유해가스 흡입",
        question: "국소배기 또는 전체환기 설비를 가동하고 있습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "용접 불꽃",
        harmfulFactor: "화상·자외선",
        question: "용접용 차광 마스크 및 가죽 장갑을 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "용접 흄",
        harmfulFactor: "호흡기 질환",
        question: "방독 마스크(유기증기 카트리지)를 착용하고 있습니까?",
        done: true,
      },
    ],
    specialNotice:
      "기계실 내 산소 농도 측정 결과 기준을 충족한 뒤 작업에 진입합니다. 산소 결핍 또는 가연성 가스 검지 시 즉시 대피하고 관리자에게 보고하십시오.",
    riskFactors: ["화상", "유해가스 흡입", "화재"],
    safetyMeasures: ["화기작업 허가서 발급", "소화기 비치", "환기 설비 가동"],
    checklist: [
      { id: "c1", label: "화기작업 허가서 확인", done: true },
      { id: "c2", label: "소화기 비치 확인", done: true },
    ],
  },
  {
    id: "6",
    title: "크레인 작업 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-21T07:30:00",
    supervisor: "윤크레인",
    attendeeCount: 10,
    status: "incomplete",
    workSummary: "타워크레인 인양 작업 및 신호수 배치.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "중량물 인양",
        harmfulFactor: "낙하·협착",
        question: "인양 하중이 크레인 정격 하중의 80% 이하인지 확인하셨습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "강풍",
        harmfulFactor: "크레인 전도",
        question: "풍속 10m/s 초과 시 즉시 작업 중단 기준을 숙지하고 있습니까?",
        done: false,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "낙하물",
        harmfulFactor: "두부 충격",
        question: "작업 반경 내 모든 인원이 안전모를 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "신호 작업",
        harmfulFactor: "협착·충돌",
        question: "신호수는 반사 조끼 및 무전기를 휴대하고 있습니까?",
        done: false,
      },
    ],
    specialNotice: "금일 인양 작업물: H빔 12m × 8본. 인양 경로 하부 30m 구역을 완전 통제합니다. 신호수 외 크레인 운전원과 직접 통신 금지. 모든 신호는 지정 신호수를 통해 전달합니다.",
    riskFactors: ["인양물 낙하", "전도", "협착"],
    safetyMeasures: ["작업 반경 내 출입 통제", "인양물 하부 접근 금지", "신호 체계 사전 확인"],
    checklist: [
      { id: "c1", label: "인양 계획서 확인", done: true },
      { id: "c2", label: "풍속 확인", done: false },
    ],
  },
  {
    id: "7",
    title: "도장 작업 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-20T08:00:00",
    supervisor: "한도장",
    attendeeCount: 7,
    status: "completed",
    workSummary: "내부 벽체 도장 및 환기 설비 점검.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "도료 용제",
        harmfulFactor: "유기용제 중독",
        question: "도장 전 환기팬을 가동하고 공기 순환을 확인하셨습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "화기 반입",
        harmfulFactor: "화재·폭발",
        question: "도장 구역 내 화기 및 점화원(흡연 포함) 반입을 금지하고 있습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "도료 흄",
        harmfulFactor: "호흡기 질환",
        question: "유기용제용 방독 마스크(OV 카트리지)를 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "도료 비산",
        harmfulFactor: "피부·눈 자극",
        question: "내화학성 장갑 및 보안경을 착용하고 있습니까?",
        done: true,
      },
    ],
    specialNotice: "금일 사용 도료: 에폭시계 프라이머(인화점 23°C 이하). 화기 작업 동시 진행 절대 금지. 도장 완료 후 최소 4시간 환기 후 타 작업 진입 가능합니다.",
    riskFactors: ["유기용제 중독", "화재", "미끄러짐"],
    safetyMeasures: ["방독 마스크 착용", "환기 팬 가동", "화기 반입 금지"],
    checklist: [
      { id: "c1", label: "환기 설비 점검", done: true },
      { id: "c2", label: "방독 마스크 착용 확인", done: true },
    ],
  },
  {
    id: "8",
    title: "굴착 작업 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-19T08:00:00",
    supervisor: "이굴착",
    attendeeCount: 9,
    status: "completed",
    workSummary: "터파기 및 흙막이 공사.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "토사",
        harmfulFactor: "토사 붕괴",
        question: "굴착면 경사(1:1.5) 및 흙막이 지지재 상태를 점검하셨습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "매설물",
        harmfulFactor: "가스·전기 손상",
        question: "굴착 전 지하 매설물 도면을 확인하고 시험 굴착을 실시하셨습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "굴착 장비",
        harmfulFactor: "협착·충격",
        question: "굴착기 작업 반경(5m) 내 접근 금지 구역을 설정하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "분진",
        harmfulFactor: "호흡기 자극",
        question: "분진이 발생하는 작업 구역에서 방진마스크를 착용하고 있습니까?",
        done: true,
      },
    ],
    specialNotice:
      "굴착 심도는 계획서를 따릅니다. 인근 기존 구조물 기초와의 이격 거리를 반드시 유지하십시오. 강우 후 굴착면 상태를 재점검한 뒤 작업을 재개합니다.",
    riskFactors: ["토사 붕괴", "매설물 손상", "장비 전도"],
    safetyMeasures: ["지반 상태 사전 조사", "매설물 위치 확인", "굴착 경사면 관리"],
    checklist: [
      { id: "c1", label: "굴착 계획서 확인", done: true },
      { id: "c2", label: "매설물 도면 확인", done: true },
    ],
  },
  {
    id: "9",
    title: "방수 작업 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-18T09:00:00",
    supervisor: "박방수",
    attendeeCount: 5,
    status: "completed",
    workSummary: "옥상 우레탄 방수 시공.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "옥상 단부",
        harmfulFactor: "추락",
        question: "옥상 단부 1m 이내 안전 난간 또는 안전망이 설치되어 있습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "방수 재료",
        harmfulFactor: "화재",
        question: "토치 작업 시 소화기를 작업 반경 3m 이내에 비치하고 있습니까?",
        done: true,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "유기 용제",
        harmfulFactor: "피부 접촉",
        question: "우레탄 방수재 취급 시 내화학성 장갑을 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "옥상 고소",
        harmfulFactor: "추락",
        question: "안전대를 착용하고 안전 구명줄에 걸어두었습니까?",
        done: true,
      },
    ],
    specialNotice: "금일 기상 예보: 오후 2시 이후 강풍(10m/s 이상) 예고. 오전 중 우선 작업을 완료하고 오후에는 양생 상태 점검만 진행합니다.",
    riskFactors: ["추락", "유해물질 접촉", "화재"],
    safetyMeasures: ["안전 난간 설치 확인", "보호장갑 착용", "화기 사용 금지"],
    checklist: [
      { id: "c1", label: "난간 설치 확인", done: true },
      { id: "c2", label: "보호구 착용 확인", done: true },
    ],
  },
  {
    id: "10",
    title: "철근 가공 TBM",
    siteName: "세이프틱스 강남 사업장",
    workArea: "",
    scheduledAt: "2026-03-17T08:30:00",
    supervisor: "송철근",
    attendeeCount: 6,
    status: "incomplete",
    workSummary: "철근 절단·가공 및 배근 작업.",
    cautionItems: [
      {
        id: "ca1",
        hazardFactor: "절단 장비",
        harmfulFactor: "절단 상해",
        question: "철근 절단기의 안전 커버 및 비상 정지 장치를 점검하셨습니까?",
        done: true,
      },
      {
        id: "ca2",
        hazardFactor: "철근 끝부분",
        harmfulFactor: "찔림·베임",
        question: "배근된 철근 돌출 단부에 캡(단부 보호구)을 씌웠습니까?",
        done: false,
      },
    ],
    ppeItems: [
      {
        id: "pp1",
        hazardFactor: "금속 분진",
        harmfulFactor: "눈 손상",
        question: "철근 절단·가공 시 보안경을 착용하고 있습니까?",
        done: true,
      },
      {
        id: "pp2",
        hazardFactor: "중량물",
        harmfulFactor: "손가락 협착",
        question: "중량 철근 취급 시 방호 장갑을 착용하고 2인 1조로 작업하고 있습니까?",
        done: false,
      },
    ],
    specialNotice: "금일 가공 물량: D29 철근 200본. 절단 소음이 80dB 이상 예상되므로 가공장 내 전 인원 귀마개 착용을 의무화합니다.",
    riskFactors: ["절단면 베임", "끼임", "중량물 취급"],
    safetyMeasures: ["보안경·보호장갑 착용", "절단기 안전 커버 점검", "중량물 2인 취급"],
    checklist: [
      { id: "c1", label: "절단기 점검", done: true },
      { id: "c2", label: "보호구 착용 확인", done: false },
    ],
  },
];

export function getTbmById(id: string): TbmItem | undefined {
  return MOCK_TBMS.find((t) => t.id === id);
}

export function formatTbmDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "2026.03.25" 형식 */
export function formatTbmDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** TBM 기록 상세에 표시할 서명 경로 (완료·참여 시) */
export function getHistorySignaturePaths(tbm: TbmItem): string[] | null {
  if (tbm.status !== "completed") return null;
  return tbm.signatureSvgPaths?.length ? tbm.signatureSvgPaths : DEFAULT_MOCK_SIGNATURE_PATHS;
}
