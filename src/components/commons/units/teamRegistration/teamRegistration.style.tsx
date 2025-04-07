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
  display: flex;
  flex-direction: column;
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
  align-self: center;
  margin-bottom: 30px;
  width: 300px;
  margin-top: 20px;
  /* background-color: red; */
  /* height: 30px; */
`;

export const Title = styled.h1`
  text-align: center;
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 16px;
  margin-bottom: 30px;
`;

export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PlayerRow = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  height: 4vh;
`;

export const BlankPlayerRow = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  height: 4vh;
`;

export const OrderNumber = styled.div`
  width: 9px;
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

// export const NameWrapper = styled.div<{ hasValue: boolean }>`
//   display: flex;
//   width: 10vh;
//   min-width: 110px;
//   align-items: center;
//   justify-content: ${(props) => (props.hasValue ? "center" : "flex-start")};
//   border-bottom: 1px solid #e8e8e8;
//   gap: 0;
//   position: relative;
//   @media (max-width: 380px) {
//     width: 14vh;
//     min-width: 114px;
//   }
// `;

export const NameWrapper = styled.div<{ hasValue: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between; /* 좌우 끝에 자식들이 배치됨 */
  border-bottom: 1px solid #e8e8e8;
  width: 12vh;
  min-width: 110px;
  @media (max-width: 380px) {
    width: 14vh;
    min-width: 114px;
  }
`;

export const PlayerNameInput = styled.input`
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  margin-left: 30px;
  color: #000;
  border: none;
  outline: none;
  width: 70%;
  /* padding: 0; */
  /* background-color: aqua; */
  text-align: left;

  &::placeholder {
    color: #999;
  }
  @media (max-width: 380px) {
    font-size: 11px;
  }
`;

export const WildCardBox = styled.div`
  width: 25px;
  height: 8px;
  font-size: 6px;
  background-color: #f3a231;
  font-family: "KBO-Dia-Gothic_light";
  color: #ffffff;
  border-radius: 35px;
  text-align: center;
  margin-right: 5px;
`;

export const NoWildCardBox = styled.div`
  width: 23px;
  height: 8px;
  border: none;
  outline: none;
  /* background-color: red; */
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
  min-width: 110px;
  border: none;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media (max-width: 380px) {
    font-size: 11px;
    width: 14vh;
    min-width: 114px;
  }
`;

// teamRegistration.style.tsx

export const ArrowIcon = styled.span`
  margin-left: 4px; /* 원하는 여백 값으로 조정 */
`;

export const ArrowIconNone = styled.span`
  margin-left: 4px; /* 원하는 여백 값으로 조정 */
  color: white;
`;

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
    font-family: "KBO-Dia-Gothic_medium";
    font-size: 12px;
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

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-right: 20px;

  ${small} {
    padding-right: 10px;
  }
  ${medium} {
    padding-right: 15px;
  }
  ${large}, ${xlarge} {
    padding-right: 20px;
  }
`;

export const ControlButton = styled.button`
  margin-top: 30px;
  margin-right: 10px;
  background-color: #000000;
  display: block;
  height: 30px;
  width: 75px;
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

export const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
`;

export const SuggestionItem = styled.li`
  padding: 8px;
  cursor: pointer;
  &:hover {
    background: #f2f2f2;
  }
`;
