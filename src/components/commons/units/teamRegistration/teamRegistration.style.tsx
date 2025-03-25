import styled from "@emotion/styled";

// ─── 공통 미디어 쿼리 ──────────────────────────────────────────────
const small = "@media only screen and (max-width: 480px)";
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)";
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)";
const xlarge = "@media only screen and (min-width: 1025px)";

// ─── 기존 스타일 컴포넌트 ─────────────────────────────────────────
export const Container = styled.div`
  margin-top: 140px;
  width: 100%;
  max-width: 768px;
  min-height: 1000px;
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

export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PlayerRow = styled.div`
  display: grid;
  grid-template-columns: 40px 0.6fr 1fr;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 8px 0;

  ${small} {
    grid-template-columns: 30px 0.6fr 1fr;
    padding: 6px 0;
  }
`;

export const OrderNumber = styled.div`
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  margin-left: 2vh;

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

export const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0; /* gap 제거 */
  margin-left: 10px;
`;
// 기존 PlayerName는 그대로 두되, 이제 입력필드용 컴포넌트를 따로 생성합니다.

// ─── 새로운 선수명 입력 필드 ───────────────────────────────────────
export const PlayerNameInput = styled.input`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  /* margin-right 제거 */
  text-align: center;
  width: 20vh;
  border: none;
  outline: none;
  background: transparent;
  color: #000;
  /* background-color: red; */
  &::placeholder {
    color: #999;
  }

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

export const SearchIcon = styled.img`
  width: 18px;
  height: 18px;
  cursor: pointer;
  /* background-color: red; */

  ${small} {
    width: 16px;
    height: 16px;
  }
`;

export const PositionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
`;

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
  border-top: none;
  z-index: 999;
  box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 4px 4px;

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

export const NextButton = styled.button`
  margin-top: 30px;
  display: block;
  margin-left: auto;
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
