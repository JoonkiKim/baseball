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
  /* min-height: 1000px; */
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

export const LargeTitle = styled.h1`
  text-align: center;
  font-family: "KBO-Dia-Gothic_bold";
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

export const Title = styled.h1`
  text-align: center;
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 16px;
  margin-bottom: 30px;

  ${small} {
    font-size: 14px;
  }
  ${medium} {
    font-size: 17px;
  }
  ${large}, ${xlarge} {
    font-size: 26px;
  }
`;

export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PlayerRow = styled.div`
  display: flex;
  /* background-color: red; */
  /* align-items: center; */
  justify-content: space-around;
  padding: 8px 0;
`;

// 첫 번째 열 (주문 번호)
export const OrderNumber = styled.div`
  width: 1vh;
  /* background-color: red; */
  text-align: center;
  font-family: "KBO-Dia-Gothic_medium";
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

// 두 번째 열 (NameWrapper)
export const NameWrapper = styled.div<{ hasValue: boolean }>`
  display: flex;
  width: 12vh;
  align-items: center;
  justify-content: ${(props) => (props.hasValue ? "center" : "flex-start")};
  border-bottom: 1px solid #e8e8e8;
  gap: 0;
  position: relative;
  @media (max-width: 380px) {
    width: 14vh;
  }
`;

// ─── 새로운 선수명 입력 필드 ───────────────────────────────────────
export const PlayerNameInput = styled.input`
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  /* background-color: red; */
  color: #000;
  border: none;
  outline: none;
  width: 50%;
  padding: 0;
  text-align: center;

  &::placeholder {
    color: #999;
  }
  @media (max-width: 380px) {
    font-size: 11px;
  }
`;

export const WildCardBox = styled.div`
  width: 16px;
  height: 8px;
  font-size: 7px;
  background-color: #f3a231;
  font-family: "KBO-Dia-Gothic_light";
  color: #ffffff;
  border-radius: 35px;
  text-align: center;
`;

export const NoWildCardBox = styled.div`
  width: 23px;
  height: 8px;
  border: none;
  outline: none;
  display: inline-block;
`;

export const NoWildCardBoxL = styled.div`
  width: 23px;
  height: 8px;
  border: none;
  outline: none;
  display: inline-block;
`;

export const SearchIcon = styled.img`
  width: 13px;
  height: 13px;
  cursor: pointer;
`;

export const PositionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
`;

export const PositionText = styled.span<{ isPlaceholder?: boolean }>`
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  color: ${(props) => (props.isPlaceholder ? "#999" : "#000")};
  width: 12vh;
  border: none;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;

  @media (max-width: 380px) {
    font-size: 11px;
    width: 14vh;
  }
`;

// ─── 수정된 PositionDropdown: dropUp prop에 따라 위/아래 위치 결정 ─────────
export const PositionDropdown = styled.ul<{ dropUp?: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  width: 80px;
  list-style: none;
  background: #fff;
  z-index: 999;
  ${(props) =>
    props.dropUp
      ? `
      bottom: 100%;
      top: auto;
      border-top: 1px solid #ccc;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      box-shadow: 0 -4px 4px -2px rgba(0, 0, 0, 0.15);
    `
      : `
      top: 100%;
      bottom: auto;
      border-top: none;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.15);
    `}

  li {
    text-align: center;
    padding: 8px;
    font-family: "KBO-Dia-Gothic_light";
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
  font-family: "KBO-Dia-Gothic_medium";
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

export const ControlButton = styled.button`
  margin-top: 30px;
  background-color: #000000;
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  height: 4vh;
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 25px;

  ${small} {
    font-size: 12px;
  }
`;
