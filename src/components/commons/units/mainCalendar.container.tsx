import { useEffect, useState } from "react";
import {
  Arrow,
  Background,
  BottomNav,
  ButtonWrapper,
  CalendarIcon,
  Container,
  DateDisplay,
  DateWrapper,
  DaysOfWeekContainer,
  DaysOfWeekWrapper,
  FinalButton,
  MatchCard,
  MatchCardsContainer,
  MatchTimeLabel,
  NavItem,
  PageHeader,
  PageTitle,
  RecordButton,
  Team,
  TeamName,
  TeamsContainer,
  TeamScore,
  VsText,
} from "./mainCalendar.style";
import { formatDate, formatDate2 } from "../../../commons/libraries/utils";

export default function MainCalendarPage() {
  // cardCount 상태에 따라 MatchCard가 반복되어 렌더링됩니다.
  const [cardCount, setCardCount] = useState(5);

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(formatDate2(new Date())); // 현재 날짜를 포맷팅
  }, []);

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
        <DaysOfWeekWrapper>
          <Arrow>&lt;</Arrow>
          <DateWrapper>
            <DateDisplay>{currentDate}</DateDisplay>
            <CalendarIcon src="/images/calendar.png" alt="Calendar Icon" />
          </DateWrapper>

          <Arrow>&gt;</Arrow>
        </DaysOfWeekWrapper>
      </DaysOfWeekContainer>

      <MatchCardsContainer>
        {Array.from({ length: cardCount }).map((_, index) => (
          <MatchCard key={index}>
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
        ))}
      </MatchCardsContainer>

      <BottomNav>
        <NavItem>경기일정</NavItem>
        <NavItem>팀순위</NavItem>
        <NavItem>선수기록</NavItem>
      </BottomNav>
    </Container>
  );
}
