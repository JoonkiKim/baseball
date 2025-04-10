import styled from "@emotion/styled";

// ─── 공통 미디어 쿼리 ──────────────────────────────────────────────
const small = "@media only screen and (max-width: 480px)";
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)";
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)";
const xlarge = "@media only screen and (min-width: 1025px)";

// ─── 공통 컨테이너 ──────────────────────────────────────────────
export const Container = styled.div`
  margin-top: 140px;
  width: 100%;
  max-width: 768px;
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

// ─── 타이틀 ──────────────────────────────────────────────
export const LargeTitle = styled.h1`
  text-align: center;
  font-family: "KBO-Dia-Gothic_bold";
  font-size: 20px;
  align-self: center;
  margin-top: 20px;
  margin-bottom: 30px;
  width: 300px;

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

// ─── 리스트 및 행 ──────────────────────────────────────────────
export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PlayerRow = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 4vh;
`;

// ─── 주문번호 (첫 번째 열) ──────────────────────────────────────────────
export const OrderNumber = styled.div`
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

// ─── 선수명 입력 래퍼 ──────────────────────────────────────────────
export const NameWrapper = styled.div<{ hasValue: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8e8e8;
  width: 12vw;
  /* background-color: red; */
  min-width: 110px;

  @media (max-width: 380px) {
    width: 14vw;
    min-width: 114px;
  }
`;

// ─── 입력 필드 (선수명) ──────────────────────────────────────────────
export const PlayerNameInput = styled.input`
  background-color: white;
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;
  color: #000;
  border: none;
  outline: none;
  width: 50%;
  /* background-color: red; */
  text-align: center;
  padding: 0;

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

// ─── 와일드카드 박스 ──────────────────────────────────────────────
export const WildCardBox = styled.div`
  position: absolute;
  right: 3vw;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 10px;
  font-size: 6px;
  background-color: #f3a231;
  font-family: "KBO-Dia-Gothic_light";
  color: #ffffff;
  border-radius: 35px;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
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

// ─── 검색 아이콘 ──────────────────────────────────────────────
export const SearchIcon = styled.img`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  cursor: pointer;
`;

// ─── 포지션 선택 래퍼 ──────────────────────────────────────────────
export const PositionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-bottom: 1px solid #e8e8e8;
`;

// ─── 포지션 텍스트 ──────────────────────────────────────────────
export const PositionText = styled.span<{
  isPlaceholder?: boolean;
  isFocused?: boolean;
}>`
  font-family: "KBO-Dia-Gothic_medium";
  font-size: 14px;

  color: #000;
  width: 12vh;
  min-width: 110px;
  border: none;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;

  @media (max-width: 380px) {
    font-size: 11px;
    width: 14vh;
    min-width: 114px;
  }
`;

// ─── 드롭다운 (포지션 선택) ──────────────────────────────────────────────
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

// ─── 교체완료 버튼 (컨트롤 버튼) ──────────────────────────────────────────────
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

// ─── 추천 목록 ──────────────────────────────────────────────
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
