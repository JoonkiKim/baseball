import { useEffect, useState } from "react";
import {
  Arrow,
  CalendarIcon,
  Container,
  DateDisplay,
  DateWrapper,
  DaysOfWeekContainer,
  DaysOfWeekWrapper,
  MatchCard,
  MatchCardsContainer,
  MatchTimeLabel,
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
  const [cardCount, setCardCount] = useState(3);

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(formatDate2(new Date())); // 현재 날짜를 포맷팅
  }, []);

  return (
    <Container>
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
    </Container>
  );
}
