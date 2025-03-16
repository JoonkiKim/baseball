import styled from "@emotion/styled";

// ─── 전체 컨테이너 ─────────────────────────────
const Container = styled.div`
  box-sizing: border-box;
  background: #ffffff;
  min-height: 812px;
  display: flex;
  flex-direction: column;
`;

// ─── 헤더 영역 (배경 + 날짜 영역 포함) ─────────────────────────────
const Background = styled.div`
  background: #5db075;
  width: 100%;
`;

const PageHeader = styled.div`
  padding: 16px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-family: "Inter-SemiBold", sans-serif;
  font-size: 30px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const DaysOfWeekContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

const Arrow = styled.div`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #000;
`;

const DateDisplay = styled.div`
  font-family: "Inter-Regular", sans-serif;
  /* background-color: black; */
  align-self: center;
  font-size: 20px;
  font-weight: 400;
  color: #000;
`;

const CalendarIcon = styled.img`
  width: 21px;
  height: 21px;
  object-fit: cover;
`;

// ─── 경기 카드 목록 ─────────────────────────────
const MatchCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const MatchCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  padding: 8px 0;
`;

const MatchTimeLabel = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-right: 8px;
`;

const TeamsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: center;
`;

const Team = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TeamName = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000;
`;

const TeamScore = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #000;
`;

const VsText = styled.div`
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  margin: 0 8px;
`;

const RecordButton = styled.button`
  background: #bdbdbd;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  cursor: pointer;
`;

// ─── 최종 버튼 (예: 심판등록) ─────────────────────────────

const ButtonWrapper = styled.div`
  /* background-color: white; */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const FinalButton = styled.button`
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
const BottomNav = styled.div`
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 83px;
  border-top: 1px solid #000;
  margin-top: auto;
`;

const NavItem = styled.div`
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #000;
  text-align: center;
`;

export default function SchedulePage() {
  return (
    <Container>
      <Background>
        <PageHeader>
          <PageTitle>2025 총장배 야구대회</PageTitle>
          <ButtonWrapper>
            <FinalButton>심판등록</FinalButton>
          </ButtonWrapper>
        </PageHeader>
      </Background>
      <DaysOfWeekContainer>
        <Arrow>&lt;</Arrow>
        <DateDisplay>2025. 04. 13 (일)</DateDisplay>
        <CalendarIcon src="/images/calendar.png" alt="Calendar Icon" />
        <Arrow>&gt;</Arrow>
      </DaysOfWeekContainer>
      <MatchCardsContainer>
        <MatchCard>
          <MatchTimeLabel>11:00</MatchTimeLabel>
          <TeamsContainer>
            <Team>
              <TeamName>건환공</TeamName>
              <TeamScore>6</TeamScore>
            </Team>
            <VsText>vs</VsText>
            <Team>
              <TeamName>자연대</TeamName>
              <TeamScore>9</TeamScore>
            </Team>
          </TeamsContainer>
          <RecordButton>경기기록</RecordButton>
        </MatchCard>
      </MatchCardsContainer>

      <BottomNav>
        <NavItem>팀순위</NavItem>
        <NavItem>선수기록</NavItem>
        <NavItem>경기일정</NavItem>
      </BottomNav>
    </Container>
  );
}
