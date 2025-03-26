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
  width: 90%;
  max-width: 768px;
  margin: 0 auto;
  margin-top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 배경색이나 추가 스타일 필요시 자유롭게 추가 */
`;

// ─── 상단 점수판 영역 ─────────────────────────────
export const ScoreBoardWrapper = styled.div`
  width: 100%;
  margin-bottom: 16px; /* 점수판과 아래 섹션 사이 간격 */
`;

// 이닝 헤더 (1~9, R, H)
export const InningHeader = styled.div`
  display: grid;
  /* 기존 repeat(11, 1fr) -> 12열로 변경 */
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
  /* 마찬가지로 12열로 변경 */
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
  width: 100%;
  margin-bottom: 32px;
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

// 테이블 (타자기록, 투수기록)
export const RecordTable = styled.table`
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
