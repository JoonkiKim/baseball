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
  width: 85%;
  max-width: 768px;
  height: 100%;
  /* background-color: red; */
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
  justify-content: space-between;
  align-items: center;
  /* padding: 8px 0; */
  height: 4vh;
`;

export const BlankPlayerRow = styled.div`
  display: flex;
  justify-content: space-evenly;
  padding: 8px 0;
  height: 4vh;
`;

export const OrderNumber = styled.div`
  /* width: 9px; */
  text-align: center;
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 16px;
  /* background-color: red; */
  /* margin-bottom: 11px; */

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

export const NameWrapper = styled.div<{ hasValue: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8e8e8;
  width: 12vw;
  min-width: 110px;

  @media (max-width: 380px) {
    width: 14vh;
    min-width: 114px;
  }
`;

// InputWrapper: PlayerNameInput을 감싸는 컨테이너
export const InputWrapper = styled.div<{ hasValue: boolean }>`
  position: relative;
  display: flex;

  flex-direction: row;
  justify-content: center;
  /* hasValue가 true이면 50%, 아니면 70% */
  width: ${({ hasValue }) => (hasValue ? "70%" : "80%")};
`;

export const PlayerNameInput = styled.input`
  background-color: white;
  /* background-color: red; */

  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  color: #000;
  border: none;
  outline: none;
  width: 100%;
  text-align: center;

  &::placeholder {
    color: #999;
  }

  &:focus::placeholder {
    color: #000;
  }

  @media (max-width: 380px) {
    font-size: 11px;
  }
`;

// WildCardBox는 InputWrapper의 오른쪽 끝에 항상 붙도록 right: 0 사용
export const WildCardBox = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 10px;
  font-size: 6px;
  background-color: #f3a231;
  font-family: "KBO-Dia-Gothic_light";
  color: #ffffff;
  border-radius: 35px;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const NoWildCardBox = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 10px;
  font-size: 6px;
  background-color: white;
  font-family: "KBO-Dia-Gothic_light";
  color: #ffffff;
  border-radius: 35px;
  text-align: center;
`;

export const NoWildCardBoxL = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 10px;
  font-size: 6px;
  background-color: white;
  font-family: "KBO-Dia-Gothic_light";
  color: #ffffff;
  border-radius: 35px;
  text-align: center;
`;

export const SearchIcon = styled.img`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
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
  border-bottom: 1px solid #e8e8e8;
`;

export const PositionText = styled.span<{
  isPlaceholder?: boolean;
  isFocused?: boolean;
}>`
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  color: ${(props) =>
    props.isFocused ? "#000" : props.isPlaceholder ? "#999" : "#000"};
  width: 12vw;
  min-width: 110px;
  border: none;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media (max-width: 380px) {
    font-size: 11px;
    width: 12vw;
    min-width: 114px;
  }
`;

export const PitcherPositionText = styled.span`
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  color: #000000;
  width: 12vw;
  min-width: 110px;
  border: none;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;

  @media (max-width: 380px) {
    font-size: 11px;
    width: 14vw;
    min-width: 114px;
  }
`;

export const ArrowIcon = styled.span`
  margin-left: 4px;
  font-weight: 500;
  color: #000000;
`;

export const ArrowIconNone = styled.span`
  margin-left: 4px;
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
  align-items: center;
  justify-content: center;
`;

export const ControlButton = styled.button`
  margin-top: 30px;
  background-color: #000000;
  align-self: center;
  justify-self: center;
  height: 30px;
  width: 90%;
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
