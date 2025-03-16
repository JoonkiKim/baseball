import styled from "@emotion/styled";

// ─── 전체 컨테이너 ─────────────────────────────
export const Container = styled.div`
  box-sizing: border-box;
  background: #ffffff;
  min-height: 600px;
  display: flex;
  flex-direction: column;
`;

// ─── 헤더 영역 (배경 + 날짜 영역 포함) ─────────────────────────────
export const Background = styled.div`
  background: #5db075;
  width: 100%;
`;

export const PageHeader = styled.div`
  padding-top: 50px;
  text-align: center;
`;

export const PageTitle = styled.h1`
  font-family: "Inter-SemiBold", sans-serif;
  font-size: 30px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

export const DaysOfWeekContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const DaysOfWeekWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  /* background-color: red; */
`;

export const DateWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const Arrow = styled.div`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #000;
`;

export const DateDisplay = styled.div`
  font-family: "Inter-Regular", sans-serif;
  /* background-color: black; */
  align-self: center;
  font-size: 20px;
  font-weight: 400;
  color: #000;
`;

export const CalendarIcon = styled.img`
  position: absolute;
  left: calc(100% + 10px); /* DateDisplay 오른쪽에 4px 여백 */
  top: 55%;
  transform: translateY(-50%);
  width: 21px;
  height: 21px;
  object-fit: cover;
`;

// ─── 경기 카드 목록 ─────────────────────────────
export const MatchCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

export const MatchCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  padding: 8px 0;
`;

export const MatchTimeLabel = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-right: 8px;
`;

export const TeamsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: center;
`;

export const Team = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const TeamName = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000;
`;

export const TeamScore = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #000;
`;

export const VsText = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  margin: 0 8px;
`;

export const RecordButton = styled.button`
  background: #bdbdbd;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  cursor: pointer;
`;

// ─── 최종 버튼 (예: 심판등록) ─────────────────────────────

export const ButtonWrapper = styled.div`
  /* background-color: white; */
  width: 95%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const FinalButton = styled.button`
  background: #bdbdbd;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  cursor: pointer;
  align-self: flex-end;
  margin: 16px 0;
`;

// ─── 하단 네비게이션 ─────────────────────────────
export const BottomNav = styled.div`
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 83px;
  width: 100%;
  box-sizing: border-box;

  border-top: 1px solid #000;
  /* border-right: 1px solid #000; */
  margin-top: 8%;
`;

export const NavItem = styled.div`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #000;
  text-align: center;
  /* border-right: 1px solid black; */
`;
