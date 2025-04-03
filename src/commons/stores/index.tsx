import { atom } from "recoil";

export interface IPlayer {
  department: string;
  name: string;
  wc?: string;
}

export const playerListState = atom<IPlayer[]>({
  key: "playerListState", // 전역 상태의 고유 key
  default: [
    { department: "수학교육과", name: "윤동현" },
    { department: "언론정보학과", name: "김준기" },
    { department: "사회학과", name: "김야구", wc: "WC" },
    { department: "컴퓨터공학과", name: "박야구1" },
    { department: "컴퓨터공학과", name: "박야구2", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구3", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구4", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구5", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구6", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구7", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구8", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구9", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구10", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구11", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구12", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구13", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구14", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구15", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구16", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구17", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구18", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구19", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구20", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "박야구21", wc: "선출/WC" },
    { department: "컴퓨터공학과", name: "김지찬", wc: "선출" },
    { department: "삼성라이온즈", name: "이재현", wc: "선출" },
    { department: "삼성라이온즈", name: "디아즈", wc: "선출" },
    { department: "삼성라이온즈", name: "구자욱", wc: "선출" },
    { department: "삼성라이온즈", name: "김헌곤", wc: "선출/WC" },
    { department: "삼성라이온즈", name: "양도근", wc: "선출" },
    { department: "삼성라이온즈", name: "김영웅", wc: "선출" },
    { department: "삼성라이온즈", name: "강민호", wc: "선출/WC" },
    { department: "삼성라이온즈", name: "박병호", wc: "선출/WC" },
    { department: "삼성라이온즈", name: "원태인", wc: "선출" },
    // ... (추가 데이터)
  ],
});

// 타자 기록 데이터 인터페이스
export interface HitterStat {
  playerName: string;
  teamName: string;
  AB: number;
  H: number;
  "2B": number;
  "3B": number;
  HR: number;
  BB: number;
  AVG: number;
  OBP: number;
  SLG: number;
  OPS: number;
}
// 투수 기록 데이터 인터페이스
export interface PitcherStat {
  playerName: string;
  teamName: string;
  K: number;
}

// Recoil atom에 타입 적용
export const hitterStatsState = atom<HitterStat[]>({
  key: "hitterStatsState",
  default: [],
});

export const pitcherStatsState = atom<PitcherStat[]>({
  key: "pitcherStatsState",
  default: [],
});

interface PlayerInfo {
  order: number | string;
  name?: string;
  position?: string;
  // 추가: 돋보기 버튼(모달)로 선택되었는지 여부
  selectedViaModal?: boolean;
}

export const defaultplayerList = atom<PlayerInfo[]>({
  key: "defaultplayerList", // 전역 상태의 고유 key
  default: [
    { order: 1, name: "김지찬", position: "CF" },
    { order: 2, name: "이재현", position: "SS" },
    { order: 3, name: "디아즈", position: "1B" },
    { order: 4, name: "구자욱", position: "LF" },
    { order: 5, name: "김헌곤", position: "RF" },
    { order: 6, name: "양도근", position: "2B" },
    { order: 7, name: "김영웅", position: "3B" },
    { order: 8, name: "강민호", position: "C" },
    { order: 9, name: "박병호", position: "DH" },
    { order: 10, name: "원태인", position: "P" },
  ],
});

export const previousDateState = atom<Date>({
  key: "previousDateState",
  default: new Date(), // 초기값 설정 (원하는 경우 null로 설정 후 useEffect로 초기화 가능)
});
