import styled from "@emotion/styled";

const small = "@media only screen and (max-width: 480px)";
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)";
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)";
const xlarge = "@media only screen and (min-width: 1025px)";

// 메인 컨테이너
export const GameRecordContainer = styled.div`
  width: 90%;
  max-width: 768px;
  margin: 0 auto;
  margin-top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Inter-Regular", sans-serif;
`;

export const ScoreBoardWrapper = styled.div`
  width: 100%;
  /* height: 20vh; */
`;

/** ─────────────────────────────────────────────────────────
 *  1) 상단 이닝 헤더
 *  팀 이름 열 + 이닝(1~9) + R + H = 총 12개 열
 *  ───────────────────────────────────────────────────────── */
export const InningHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12개 열 */
  width: 100%;

  border-bottom: 1px solid #ccc;
`;

export const InningCell = styled.div`
  text-align: center;
  padding: 12px 0;
  font-weight: 600;

  ${small} {
    font-size: 12px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
`;

/** ─────────────────────────────────────────────────────────
 *  2) 각 팀 득점 표시
 *  (예: [팀이름, 0, 2, 4, ..., R, H])
 *  ───────────────────────────────────────────────────────── */
export const TeamScoreRow = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12개 열 */
  width: 100%;
  border-bottom: 1px solid #ccc;
`;

export const TeamScoreCell = styled.div`
  text-align: center;
  padding: 12px 0;
  font-weight: 400;

  ${small} {
    font-size: 12px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
`;

/** ─────────────────────────────────────────────────────────
 *  3) 공수교대 / 경기종료 버튼 섹션
 *  ───────────────────────────────────────────────────────── */
export const ControlButtonsRow = styled.div`
  display: flex;
  width: 100%;
  /* height: 15vh; */
  justify-content: space-around;
  border-bottom: 1px solid #ccc;
  padding: 12px 0;
`;

export const ControlButton = styled.button`
  background-color: #bdbdbd;
  border: 1px solid #999;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  font-family: "Inter-Regular", sans-serif;

  &:hover {
    background-color: #bdbdbd;
  }

  ${small} {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

/** ─────────────────────────────────────────────────────────
 *  4) 이번 이닝 득점 (텍스트 + ± 버튼)
 *  ───────────────────────────────────────────────────────── */
export const InningScoreContainer = styled.div`
  width: 100%;
  /* height: 20vh; */
  border-bottom: 1px solid #ccc;
  text-align: center;
  /* padding: 16px 0; */
  padding-top: 4vh;
  padding-bottom: 4vh;
`;

// "이번 이닝 득점" 문구
export const InningScoreTitle = styled.div`
  margin-bottom: 8px;
  font-weight: 500;

  ${small} {
    font-size: 14px;
  }
  ${medium} {
    font-size: 15px;
  }
  ${large}, ${xlarge} {
    font-size: 16px;
  }
`;

// 득점 조절(± 버튼 + 득점수)
export const InningScoreControls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 16px;
`;

export const ScoreButton = styled.button`
  background-color: #bdbdbd;
  border: 1px solid #999;
  border-radius: 4px;
  font-size: 18px;
  width: 40px;
  height: 40px;
  cursor: pointer;

  &:hover {
    background-color: #bdbdbd;
  }

  ${small} {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
`;

export const ScoreDisplay = styled.div`
  font-size: 20px;
  min-width: 24px;
  text-align: center;
  ${small} {
    font-size: 16px;
  }
`;

/** ─────────────────────────────────────────────────────────
 *  5) 현재 타자 / 투수 정보 (2개 박스)
 *  ───────────────────────────────────────────────────────── */
export const PlayersRow = styled.div`
  display: flex;
  width: 100%;
  height: 25vh;
  border-bottom: 1px solid #ccc;
`;

export const PlayerBox = styled.div`
  /* margin-top: 8vh; */
  flex: 1;
  /* padding: 12px; */
  border-right: 1px solid #ccc;
  text-align: center;

  &:last-child {
    border-right: none;
  }
`;

export const PlayerInfo = styled.div`
  /* margin-top: 7vh; */
  font-weight: 500;
  margin-top: 5vh;
  /* margin-bottom: 8px; */

  ${small} {
    font-size: 14px;
  }
  ${medium} {
    font-size: 15px;
  }
  ${large}, ${xlarge} {
    font-size: 16px;
  }
`;

// "선수교체" 버튼
export const PlayerChangeButton = styled.button`
  background-color: #bdbdbd;
  border: 1px solid #999;
  margin-top: 5vh;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  font-family: "Inter-Regular", sans-serif;

  &:hover {
    background-color: #bdbdbd;
  }

  ${small} {
    font-size: 12px;
  }
`;

/** ─────────────────────────────────────────────────────────
 *  6) 하단 기록 입력 버튼 (안타 / 볼넷·사구 / 아웃 / etc)
 *  ───────────────────────────────────────────────────────── */
export const RecordActionsRow = styled.div`
  display: grid;
  width: 100%;
  height: 12.5vh;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #ccc;
  padding: 12px 0;
`;

export const RecordActionButton = styled.button`
  border: 1px solid #999;
  background-color: #bdbdbd;
  font-size: 14px;
  padding: 16px 0;
  cursor: pointer;
  font-family: "Inter-Regular", sans-serif;

  &:hover {
    background-color: #bdbdbd;
  }

  ${small} {
    font-size: 12px;
    padding: 12px 0;
  }
  ${medium} {
    font-size: 13px;
  }
  ${large}, ${xlarge} {
    font-size: 14px;
  }
`;
