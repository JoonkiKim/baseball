import styled from "@emotion/styled";

// 반응형 미디어 쿼리
const small = "@media only screen and (max-width: 480px)";
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)";
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)";
const xlarge = "@media only screen and (min-width: 1025px)";

// ─── 전체 컨테이너 ─────────────────────────────
export const Container = styled.div`
  width: 100%;
  background-color: #f2f2f2;
  margin: 0 auto;
  margin-top: 120px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// ─── 상단 점수판 영역 ─────────────────────────────
export const ScoreBoardWrapper = styled.div`
  width: 90%;
  margin-bottom: 16px;
`;

// 이닝 헤더 (1~9, R, H)
export const InningHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  border-bottom: 1px solid #ccc;
`;
export const InningCell = styled.div`
  text-align: center;
  padding: 1vh 0;
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

// 각 팀 점수 행
export const TeamScoreRow = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  border-bottom: 1px solid #ccc;
`;

export const TeamScoreCell = styled.div`
  text-align: center;
  padding: 1vh 0;
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

// ─── 팀명 (예: "관악사 야구부") 헤더 ─────────────────────────────
export const TeamTitle = styled.h2`
  margin: 24px 0 16px 0;
  font-weight: 600;
  text-align: center;

  ${small} {
    font-size: 18px;
  }
  ${medium} {
    font-size: 20px;
  }
  ${large}, ${xlarge} {
    font-size: 22px;
  }
`;

// ─── 테이블 영역 공통 스타일 ─────────────────────────────
export const TableWrapper = styled.div`
  width: 90%;
  margin-bottom: 32px;
  overflow-x: auto;
  padding: 0 20px;

  ${small} {
    padding: 0 10px;
  }
  ${medium} {
    padding: 0 15px;
  }
  ${large}, ${xlarge} {
    padding: 0 20px;
  }
`;

export const TableTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;

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

// 테이블 (타자기록)
export const RecordTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 480px; /* 열이 늘어날 경우 최소 너비 확보 */
  text-align: center;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;

  th,
  td {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 500;
    background-color: #f9f9f9;
  }

  ${small} {
    font-size: 12px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
  /* 첫 번째 열의 너비 지정 */
  th:nth-of-type(1),
  td:nth-of-type(1) {
    width: 5vh; /* 원하는 값으로 조정 */
  }

  /* 첫 번째 열의 너비 지정 */
  th:nth-of-type(2),
  td:nth-of-type(2) {
    width: 10vh; /* 원하는 값으로 조정 */
  }
`;

export const RecordTableP = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;

  th,
  td {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 500;
    background-color: #f9f9f9;
  }

  /* 첫 번째 열의 너비 지정 */
  th:nth-of-type(1),
  td:nth-of-type(1) {
    width: 5vh; /* 원하는 값으로 조정 */
  }

  /* 두 번째 열의 너비 지정 */
  th:nth-of-type(2),
  td:nth-of-type(2) {
    width: 10vh; /* 원하는 값으로 조정 */
  }

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

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 90%;
  /* margin-top: 20px; */
`;

export const ControlButton = styled.button`
  margin-top: 2cqh;
  background-color: #000000;
  display: block;
  margin-left: auto;
  height: calc((100vh - 120px) * 0.044);
  width: calc((100vh - 120px) * 0.11);
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;

  ${small} {
    font-size: 12px;
  }
`;

export const HomeButton = styled.button`
  margin-top: 20px;
  background-color: #000000;
  display: block;
  height: calc((100vh - 120px) * 0.044);
  width: calc((100vh - 120px) * 0.11);
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;

  ${small} {
    font-size: 12px;
  }
`;
