import styled from "@emotion/styled";

// ─── 공통 미디어 쿼리 구간 ────────────────────────────────────────────────────
const small = "@media only screen and (max-width: 480px)"; // Small
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)"; // Medium
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)"; // Large
const xlarge = "@media only screen and (min-width: 1025px)"; // Extra Large

// ─── 메인 컨테이너 ──────────────────────────────────────────────────────────
export const Container = styled.div`
  margin-top: 140px;
  width: 100%;
  max-width: 768px;
  min-height: 1000px; // 이걸로 포지션 드롭다운 여유를 만들어줌

  margin-left: auto;
  margin-right: auto;
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

// ─── 상단 타이틀 (관악사 야구부) ─────────────────────────────────────────────
export const Title = styled.h1`
  text-align: center;
  font-family: "Inter-SemiBold", sans-serif;
  font-size: 20px;
  margin-bottom: 30px;

  ${small} {
    font-size: 18px;
  }
  ${medium} {
    font-size: 19px;
  }
  ${large}, ${xlarge} {
    font-size: 20px;
  }
`;

// ─── 선수 목록을 감싸는 래퍼 ────────────────────────────────────────────────
export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px; /* 각 행 간 간격 */
`;

// ─── 개별 선수 행 (예: 1 김지찬 CF) ─────────────────────────────────────────
export const PlayerRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 8px 0;

  ${small} {
    grid-template-columns: 30px 1fr 1fr;
    padding: 6px 0;
  }
`;

// ─── 타순 번호 영역 ─────────────────────────────────────────────────────────
export const OrderNumber = styled.div`
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;

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

// ─── 선수명 + 돋보기 아이콘 묶음 ────────────────────────────────────────────
export const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-left: 10px;
`;

// ─── 선수명 (이미 등록된 경우: 텍스트, 미등록: "선수명 입력") ──────────────
export const PlayerName = styled.span<{ isPlaceholder?: boolean }>`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  margin-right: 10px;
  color: ${(props) => (props.isPlaceholder ? "#999" : "#000")};

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

// ─── 돋보기 아이콘 ──────────────────────────────────────────────────────────
export const SearchIcon = styled.img`
  width: 18px;
  height: 18px;
  cursor: pointer;

  ${small} {
    width: 16px;
    height: 16px;
  }
`;

// ─── 포지션 래퍼 ────────────────────────────────────────────────────────────
// 드롭다운이 나타날 수 있도록 relative 설정
export const PositionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
`;

// ─── 포지션 텍스트 (이미 등록된 경우: C, SS, CF 등, 미등록: "포지션 입력 ▼") ─
export const PositionText = styled.span<{ isPlaceholder?: boolean }>`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  color: ${(props) => (props.isPlaceholder ? "#999" : "#000")};

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

export const PositionDropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 50;
  margin: 0;
  padding: 0;
  width: 80px;
  list-style: none;
  background: #fff;
  border: 1px solid #ccc;
  border-top: none; /* 상단 border 제거 */
  z-index: 999;

  box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 4px 4px; /* 하단만 둥글게 처리 */

  li {
    text-align: center;
    padding: 8px;
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      background-color: #f7f7f7;
    }
  }
`;

// ─── 하단 버튼 ──────────────────────────────────────────────────────────────
export const NextButton = styled.button`
  margin-top: 30px;
  display: block;
  margin-left: auto; /* 오른쪽 정렬 예시 */
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;

  &:hover {
    background-color: #f7f7f7;
  }

  ${small} {
    font-size: 14px;
    padding: 8px 16px;
  }
  ${medium} {
    font-size: 15px;
  }
  ${large}, ${xlarge} {
    font-size: 16px;
  }
`;
