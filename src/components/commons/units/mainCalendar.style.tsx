import styled from "@emotion/styled";
import DatePicker from "react-datepicker";

// ─── 전체 컨테이너 ─────────────────────────────
export const Container = styled.div`
  margin-top: 120px; /* 헤더 높이와 동일 */
  box-sizing: border-box;
  margin-bottom: 80px;
  background: #ffffff;
  min-height: 500px;
  display: flex;
  flex-direction: column;

  /* Small (max-width: 480px) */
  @media only screen and (max-width: 480px) {
    padding: 10px;
  }
  /* Medium (481px - 768px) */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    padding: 15px;
  }
  /* Large (769px - 1024px) */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    padding: 20px;
  }
  /* Extra Large (1025px 이상) */
  @media only screen and (min-width: 1025px) {
    padding: 20px;
  }
`;

// ─── 헤더 영역 (배경 + 날짜 영역 포함) ─────────────────────────────
export const Background = styled.div`
  background: #5db075;
  width: 100%;
`;

export const PageHeader = styled.div`
  text-align: center;
  /* 기본값 (Large 구간 내에서 사용될 수 있음) */
  padding-top: 50px;

  /* Small */
  @media only screen and (max-width: 480px) {
    padding-top: 30px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    padding-top: 40px;
  }
  /* Large */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    padding-top: 50px;
  }
  /* Extra Large */
  @media only screen and (min-width: 1025px) {
    padding-top: 60px;
  }
`;

export const PageTitle = styled.h1`
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  font-size: 30px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    font-size: 24px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 28px;
  }
  /* Large */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    font-size: 32px;
  }
  /* Extra Large */
  @media only screen and (min-width: 1025px) {
    font-size: 36px;
  }
`;

export const DaysOfWeekContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* background-color: red; */
  padding: 16px; /* 기본값 */
  margin-top: 2vh;

  /* Small */
  @media only screen and (max-width: 480px) {
    padding: 10px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    padding: 12px;
  }
  /* Large */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    padding: 14px;
  }
  /* Extra Large */
  @media only screen and (min-width: 1025px) {
    padding: 16px;
  }
`;

export const DaysOfWeekWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  /* background-color: red; */
  justify-content: space-between;
  width: 95%; /* 기본값 */
`;

export const DateWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* background-color: red; */
`;

export const Arrow = styled.div`
  font-weight: 1000;
  color: #000;
  font-size: 16px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    font-size: 14px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 15px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    font-size: 16px;
  }
`;

export const DateDisplay = styled.div`
  align-self: center;
  font-weight: 1000;
  color: #000;
  font-size: 20px; /* 기본값 */
  margin-right: 13px;

  /* Small */
  @media only screen and (max-width: 480px) {
    font-size: 18px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 19px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    font-size: 20px;
  }
`;

export const CalendarIcon = styled.img`
  width: 25px; /* 기본값 */
  height: 21px;
  object-fit: cover;
`;

export const MatchCardsContainer = styled.div`
  display: flex;
  /* background-color: red; */
  margin-top: 2%;
  flex-direction: column;
  gap: 16px; /* 기본값 */
  padding: 16px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    gap: 12px;
    padding: 12px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    gap: 14px;
    padding: 14px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    gap: 16px;
    padding: 16px;
  }
`;

export const MatchCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  padding: 8px 0;
  /* background-color: red; */
  height: 10vh;
  /* margin-top: 10px; */

  /* Small */
  @media only screen and (max-width: 480px) {
    padding: 6px 0;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    padding: 7px 0;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    padding: 8px 0;
  }
`;

export const MatchTimeLabel = styled.div`
  font-weight: 500;
  color: #000;
  margin-right: 8px;
  font-size: 16px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    font-size: 14px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 15px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    font-size: 16px;
  }
`;

export const TeamsContainer = styled.div`
  display: flex;
  align-items: center;
  /* background-color: red; */
  flex: 1;
  justify-content: center;
  gap: 16px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    gap: 12px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    gap: 14px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    gap: 16px;
  }
`;

export const Team = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* background-color: aqua; */
  min-width: 50px;
  min-height: 45px;
`;

export const TeamName = styled.div`
  font-weight: 500;
  color: #000;
  font-size: 16px; /* 기본값 */
  margin-bottom: 7px;
`;

export const TeamScore = styled.div<{ isWinner?: boolean }>`
  font-weight: 500;
  color: ${({ isWinner }) => (isWinner ? "red" : "#000")};
  font-size: 12px; /* 기본값 */
`;

export const StatusBox = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 22px;
  background-color: ${({ status }) =>
    status === "경기종료"
      ? "#000000"
      : status === "경기예정"
      ? "#F3A231"
      : "#37DC21"};
  color: white;
  font-size: 10px;
  font-weight: 500;
  border-radius: 50px;
  margin-bottom: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const TeamsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const VsText = styled.div`
  font-weight: 500;
  margin: 0 8px;
  font-size: 16px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    font-size: 14px;
    margin: 0 6px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 15px;
    margin: 0 7px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    font-size: 16px;
    margin: 0 8px;
  }
`;

export const RecordButton = styled.button`
  font-family: "KBO-Dia-Gothic_light";
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  /* padding: 8px 16px; */
  font-size: 12px; /* 기본값 */
  min-width: 60px;
  min-height: 30px;
  text-align: center;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const StyledDatePicker = styled(DatePicker)`
  /* 전체 캘린더 컨테이너 스타일 */
  .react-datepicker {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }

  /* 헤더 영역 */
  .react-datepicker__header {
    background-color: #5db075;
    border: none;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 12px 0;
  }

  .react-datepicker__current-month {
    font-size: 18px;
    color: #ffffff;
    font-weight: 600;
  }

  /* 네비게이션 버튼 (이전, 다음) */
  .react-datepicker__navigation {
    top: 14px;
    line-height: 1.7rem;
    border: none;
    cursor: pointer;
  }

  .react-datepicker__navigation--previous {
    margin-left: 10px;
  }

  .react-datepicker__navigation--next {
    margin-right: 10px;
  }

  /* 요일 이름 */
  .react-datepicker__day-name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    margin: 0.2rem;
  }

  /* 날짜 셀 스타일 */
  .react-datepicker__day {
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    margin: 0.2rem;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s ease-in-out;
    cursor: pointer;
  }

  .react-datepicker__day:hover {
    background-color: #f0f0f0;
    border-radius: 4px;
  }

  /* 선택된 날짜 스타일 */
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #bdbdbd;
    color: #ffffff;
    border-radius: 4px;
  }

  /* 오늘 날짜 스타일 */
  .react-datepicker__day--today {
    border: 1px solid #5db075;
    border-radius: 4px;
  }

  /* 월 컨테이너 패딩 */
  .react-datepicker__month-container {
    padding: 8px;
  }
`;
