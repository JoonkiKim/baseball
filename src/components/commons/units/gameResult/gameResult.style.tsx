// gameResult.style.tsx
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
  /* margin-bottom: 50px; */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// ─── 상단 점수판 영역 ─────────────────────────────
export const ScoreBoardWrapper = styled.div`
  width: calc((100% - 2px));
  /* margin-top: 2vh; */
  margin-top: calc((100vh - 120px) * 0.01);
  height: calc((100vh - 120px) * 0.2);
  background-color: #f2f2f2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  border-radius: 4px;
`;

/** ─────────────────────────────────────────────────────────
 *  1) 상단 이닝 헤더 (총 12열: 이닝(1~9) + R + H)
 * ───────────────────────────────────────────────────────── */
export const InningHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  font-family: "KBO-Dia-Gothic_medium";
  width: 100%;
  height: 33%;
  align-items: center;
  border-bottom: 1px solid #ccc;
  /* background-color: red; */
`;

export const InningCell = styled.div`
  text-align: center;
  font-family: "KBO-Dia-Gothic_medium";
  /* padding-top: 1vh; */
  /* background-color: red; */
  /* padding-bottom: 1vh; */
  /* font-weight: 600; */

  ${small} {
    font-size: 17px;
  }
  ${medium} {
    font-size: 20px;
  }
  ${large}, ${xlarge} {
    font-size: 20px;
  }
`;

export const EditableInputScore = styled.input`
  width: 100%;
  border: none;
  text-align: center;
  font-family: "KBO-Dia-Gothic_light";
  background-color: #f2f2f2;
  ${small} {
    font-size: 17px;
  }
  ${medium} {
    font-size: 20px;
  }
  ${large}, ${xlarge} {
    font-size: 20px;
  }
  &:focus {
    outline: none;
  }
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: none;
  appearance: none;
`;

/** ─────────────────────────────────────────────────────────
 *  2) 팀 이름과 점수를 한 행으로 구성 (총 12열)
 *     첫 번째 열: 팀 이름 (별도 스타일)
 *     나머지 11열: 이닝별 점수 (팀 점수 셀)
 * ───────────────────────────────────────────────────────── */
export const TeamRow = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr); /* 12개의 동일한 너비 */
  width: 100%;
  align-items: center;
  /* border-bottom: 1px solid #ccc; */
  /* background-color: aqua; */
  height: 33%;
`;

export const TeamNameCell = styled.div`
  text-align: center;
  padding: 1vh 0;
  font-weight: 500;
  font-family: "KBO-Dia-Gothic_medium";
  font-style: normal;
  margin-left: 4px;

  ${small || medium} {
    font-size: 12px;
  }
  ${large}, ${xlarge} {
    font-size: 14px;
  }
`;

export const TeamScoreCell = styled.div`
  text-align: center;
  font-family: "KBO-Dia-Gothic_light";
  padding: 1vh 0;
  font-weight: 400;
  ${small} {
    font-size: 15px;
  }
  ${medium} {
    font-size: 20px;
  }
  ${large}, ${xlarge} {
    font-size: 20px;
  }
`;

// ─── 팀명 헤더 ─────────────────────────────
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
  /* background-color: red; */
  border-bottom: 1px solid #000;
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

// 타자 기록 테이블
export const RecordTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
  text-align: center;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  th,
  td {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  th {
    font-weight: 500;
    border-bottom: 1px solid #000;
    /* background-color: #f9f9f9; */
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
  /* 순번, 이름 열 너비 지정 */
  th:nth-of-type(1),
  td:nth-of-type(1) {
    width: 5vh;
  }
  th:nth-of-type(2),
  td:nth-of-type(2) {
    width: 10vh;
  }
`;

// 투수 기록 테이블
export const RecordTableP = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  th,
  td {
    padding: 8px;
    /* border-top: 1px solid #000; */
    border-bottom: 1px solid #eee;
  }
  th {
    font-weight: 500;
    border-bottom: 1px solid #000;
    /* background-color: #f9f9f9; */
  }
  th:nth-of-type(1),
  td:nth-of-type(1) {
    width: 5vh;
  }
  th:nth-of-type(2),
  td:nth-of-type(2) {
    width: 10vh;
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

// 버튼 영역
export const ButtonContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: space-between;
  width: 90%;
`;

export const ControlButton = styled.button`
  background-color: #000000;
  width: 26vw;
  height: 4.5vh;
  border: 1px solid #999;
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
`;

export const HomeButton = styled.button`
  background-color: #000000;
  width: 26vw;
  height: 4.5vh;
  border: 1px solid #999;
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
`;

// ─── 수정 가능한 input 컴포넌트 ─────────────────────────────
export const EditableInput = styled.input`
  width: 100%;
  border: none;
  font-family: "KBO-Dia-Gothic_medium";
  text-align: center;
  background-color: #f2f2f2;

  &:focus {
    outline: none;
  }
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: none;
  appearance: none;
`;
