import styled from "@emotion/styled";

// ─── 전체 컨테이너 ─────────────────────────────
export const Container = styled.div`
  margin-top: 120px; /* 헤더 높이와 동일 */
  box-sizing: border-box;
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
  font-family: "Inter-SemiBold", sans-serif;
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
  padding: 16px; /* 기본값 */

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
  justify-content: space-between;
  width: 90%; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    width: 100%;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    width: 95%;
  }
  /* Large */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    width: 90%;
  }
  /* Extra Large */
  @media only screen and (min-width: 1025px) {
    width: 90%;
  }
`;

export const DateWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const Arrow = styled.div`
  font-family: "Inter-Regular", sans-serif;
  font-weight: 400;
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
  font-family: "Inter-Regular", sans-serif;
  align-self: center;
  font-weight: 400;
  color: #000;
  font-size: 20px; /* 기본값 */

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
  position: absolute;
  left: calc(100% + 10px);
  top: 55%;
  transform: translateY(-50%);
  width: 21px; /* 기본값 */
  height: 21px;
  object-fit: cover;

  /* Small */
  @media only screen and (max-width: 480px) {
    width: 18px;
    height: 18px;
    left: calc(100% + 8px);
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    width: 20px;
    height: 20px;
    left: calc(100% + 9px);
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    width: 21px;
    height: 21px;
    left: calc(100% + 10px);
  }
`;

// ─── 경기 카드 목록 ─────────────────────────────
export const MatchCardsContainer = styled.div`
  display: flex;
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
  padding: 8px 0; /* 기본값 */

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
  font-family: "Inter-Medium", sans-serif;
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
`;

export const TeamName = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-weight: 500;
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

export const TeamScore = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-weight: 500;
  color: #000;
  font-size: 12px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    font-size: 10px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 11px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    font-size: 12px;
  }
`;

export const VsText = styled.div`
  font-family: "Inter-Medium", sans-serif;
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
  background: #bdbdbd;
  border: none;
  border-radius: 4px;
  font-family: "Inter-Regular", sans-serif;
  cursor: pointer;
  padding: 8px 16px; /* 기본값 */
  font-size: 12px; /* 기본값 */

  /* Small */
  @media only screen and (max-width: 480px) {
    padding: 6px 12px;
    font-size: 10px;
  }
  /* Medium */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    padding: 7px 14px;
    font-size: 11px;
  }
  /* Large & Extra Large */
  @media only screen and (min-width: 769px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;
