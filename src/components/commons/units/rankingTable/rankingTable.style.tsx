import styled from "@emotion/styled";

// 공통 미디어 쿼리 구간 (원하는 대로 수정 가능)
const small = "@media only screen and (max-width: 480px)"; // Small
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)"; // Medium
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)"; // Large
const xlarge = "@media only screen and (min-width: 1025px)"; // Extra Large

export const RankingContainer = styled.div`
  margin-top: 140px;
`;

// 그룹 선택 영역 (예: "A조 ▼")
export const GroupSelectorContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-top: 50px;
  /* background-color: red; */
`;

export const GroupSelector = styled.div`
  display: inline-flex;
  align-items: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  color: #000;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;

  ${small} {
    font-size: 14px;
    padding: 6px 10px;
  }

  ${medium} {
    font-size: 15px;
    padding: 7px 10px;
  }

  ${large}, ${xlarge} {
    font-size: 16px;
    padding: 8px 12px;
  }

  /* 화살표(▼) 아이콘 위치 조정 예시 */
  &::after {
    content: "▼";
    display: inline-block;
    margin-left: 8px;
    font-size: 0.8em;
  }
`;

// 표를 감싸는 래퍼 (가로 스크롤용 오버플로우 설정)
export const TableWrapper = styled.div`
  width: 100%;
  margin-top: 20px;
  padding: 0 20px;
  overflow-x: auto; // 테이블이 화면보다 넓어지면 가로 스크롤

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

// 실제 테이블 스타일
export const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 480px; // 컬럼이 많을 경우 최소 너비 확보 (필요 시 조정)

  thead {
    background-color: #f9f9f9;
    tr {
      th {
        font-family: "Inter-SemiBold", sans-serif;
        font-weight: 600;
        color: #000;
        padding: 12px;
        border-bottom: 1px solid #ddd;
        text-align: center;

        ${small} {
          font-size: 12px;
          padding: 8px;
        }
        ${medium} {
          font-size: 14px;
        }
        ${large}, ${xlarge} {
          font-size: 16px;
        }
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e8e8e8;

      &:last-of-type {
        border-bottom: none; // 마지막 행에는 경계선 제거
      }

      td {
        font-family: "Inter-Regular", sans-serif;
        font-weight: 400;
        color: #000;
        text-align: center;
        padding: 12px;

        ${small} {
          font-size: 12px;
          padding: 8px;
        }
        ${medium} {
          font-size: 14px;
        }
        ${large}, ${xlarge} {
          font-size: 16px;
        }
      }
    }
  }
`;
