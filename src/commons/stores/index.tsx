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
    // ... (추가 데이터)
  ],
});
