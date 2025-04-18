import { atom } from "recoil";
import { string } from "yup";

export interface ITeamList {
  homeTeamName: string;
  homeTeamId: number;
  awayTeamName: string;
  awayTeamId: number;
}

export const TeamListState = atom<ITeamList[]>({
  key: "teamListState",
  default: [
    { homeTeamName: "", homeTeamId: 1, awayTeamName: "", awayTeamId: 2 },
  ],
});

export interface IPlayer {
  playerId: number;
  department: string;
  name: string;
  wc?: string;
}

export const playerListState = atom<IPlayer[]>({
  key: "playerListState", // 전역 상태의 고유 key
  default: [
    { playerId: 101, department: "수학교육과", name: "윤동현" },
    { playerId: 102, department: "언론정보학과", name: "김준기" },
    { playerId: 103, department: "사회학과", name: "김야구", wc: "WC" },
    // 컴퓨터공학과의 "박야구"를 아래와 같이 각각 다른 이름으로 변경
    { playerId: 104, department: "컴퓨터공학과", name: "박진우" },
    {
      playerId: 105,
      department: "컴퓨터공학과",
      name: "박성민",
      wc: "선출/WC",
    },
    {
      playerId: 106,
      department: "컴퓨터공학과",
      name: "박민수",
      wc: "선출/WC",
    },
    {
      playerId: 107,
      department: "컴퓨터공학과",
      name: "박영수",
      wc: "선출/WC",
    },
    {
      playerId: 108,
      department: "컴퓨터공학과",
      name: "박지훈",
      wc: "선출/WC",
    },
    {
      playerId: 109,
      department: "컴퓨터공학과",
      name: "박재훈",
      wc: "선출/WC",
    },
    {
      playerId: 110,
      department: "컴퓨터공학과",
      name: "박준호",
      wc: "선출/WC",
    },
    {
      playerId: 111,
      department: "컴퓨터공학과",
      name: "박하준",
      wc: "선출/WC",
    },
    {
      playerId: 112,
      department: "컴퓨터공학과",
      name: "박승민",
      wc: "선출/WC",
    },
    {
      playerId: 113,
      department: "컴퓨터공학과",
      name: "박동현",
      wc: "선출/WC",
    },
    {
      playerId: 114,
      department: "컴퓨터공학과",
      name: "박상우",
      wc: "선출/WC",
    },
    {
      playerId: 115,
      department: "컴퓨터공학과",
      name: "박세진",
      wc: "선출/WC",
    },
    {
      playerId: 116,
      department: "컴퓨터공학과",
      name: "박형준",
      wc: "선출/WC",
    },
    {
      playerId: 117,
      department: "컴퓨터공학과",
      name: "박문수",
      wc: "선출/WC",
    },
    {
      playerId: 118,
      department: "컴퓨터공학과",
      name: "박태현",
      wc: "선출/WC",
    },
    {
      playerId: 119,
      department: "컴퓨터공학과",
      name: "박현우",
      wc: "선출/WC",
    },
    {
      playerId: 120,
      department: "컴퓨터공학과",
      name: "박재영",
      wc: "선출/WC",
    },
    {
      playerId: 121,
      department: "컴퓨터공학과",
      name: "박민재",
      wc: "선출/WC",
    },
    {
      playerId: 122,
      department: "컴퓨터공학과",
      name: "박용준",
      wc: "선출/WC",
    },
    {
      playerId: 123,
      department: "컴퓨터공학과",
      name: "박지호",
      wc: "선출/WC",
    },
    {
      playerId: 124,
      department: "컴퓨터공학과",
      name: "박준혁",
      wc: "선출/WC",
    },
    { playerId: 125, department: "컴퓨터공학과", name: "김지찬", wc: "선출" },
    { playerId: 126, department: "삼성라이온즈", name: "이재현", wc: "선출" },
    { playerId: 127, department: "삼성라이온즈", name: "디아즈", wc: "선출" },
    { playerId: 128, department: "삼성라이온즈", name: "구자욱", wc: "선출" },
    {
      playerId: 129,
      department: "삼성라이온즈",
      name: "김헌곤",
      wc: "선출/WC",
    },
    { playerId: 130, department: "삼성라이온즈", name: "양도근", wc: "선출" },
    { playerId: 131, department: "삼성라이온즈", name: "김영웅", wc: "선출" },
    {
      playerId: 132,
      department: "삼성라이온즈",
      name: "강민호",
      wc: "선출/WC",
    },
    {
      playerId: 133,
      department: "삼성라이온즈",
      name: "박병호",
      wc: "선출/WC",
    },
    { playerId: 134, department: "삼성라이온즈", name: "원태인", wc: "선출" },
    // ... (추가 데이터)
  ],
});

export interface IHAPlayer {
  id: number;
  departmentName: string;
  order: number | string;
  name: string;
  isElite: boolean;
  isWc: boolean;
  position?: string;
  isSubstitutable: boolean;
}

export const HomeTeamPlayerListState = atom<IHAPlayer[]>({
  key: "HomeTeamPlayerListState", // 전역 상태의 고유 key
  default: [],
});

export const AwayTeamPlayerListState = atom<IHAPlayer[]>({
  key: "AwayTeamPlayerListState", // 전역 상태의 고유 key
  default: [],
});

// 타자 기록 데이터 인터페이스
export interface HitterStat {
  playerName: string;
  teamName: string;
  teamGameCount: number;
  PA: number;
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
    { order: 6, name: "심재훈", position: "2B" },
    { order: 7, name: "김영웅", position: "3B" },
    { order: 8, name: "강민호", position: "C" },
    { order: 9, name: "박병호", position: "DH" },
    { order: 10, name: "원태양", position: "P" },
  ],
});

export const previousDateState = atom<Date>({
  key: "previousDateState",
  default: new Date(), // 초기값 설정 (원하는 경우 null로 설정 후 useEffect로 초기화 가능)
});

export const homeBatterNumberState = atom<number>({
  key: "homeBatterNumberState",
  default: 1,
});

export const awayBatterNumberState = atom<number>({
  key: "awayBatterNumberState",
  default: 101,
});

export const substitutionSwappedState = atom<boolean>({
  key: "substitutionSwappedState",
  default: true,
});
