import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate2 } from "../../../commons/libraries/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function MainCalendarPage() {
  // 카드(경기) 갯수
  const [cardCount, setCardCount] = useState(3);

  // react-datepicker에서 사용할 날짜 (Date 타입)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // 달력이 열려 있는지 여부 (수동 제어용)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    // 초기값: 오늘 날짜 (이미 new Date()이므로 별도 처리 필요 없음)
  }, []);

  // 왼쪽 Arrow 클릭 시: 날짜 하루 감소
  const handleDecreaseDate = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
    }
  };

  // 오른쪽 Arrow 클릭 시: 날짜 하루 증가
  const handleIncreaseDate = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
    }
  };

  // 달력 아이콘 클릭 시 열림/닫힘 토글
  const handleCalendarIconClick = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  // 날짜 선택 시 state 업데이트
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
    setIsCalendarOpen(false);
  };

  return (
    <Container>
      <DaysOfWeekContainer>
        <DaysOfWeekWrapper>
          <Arrow onClick={handleDecreaseDate}>&lt;</Arrow>

          <DateWrapper>
            {/* 현재 선택된 날짜 표시 */}
            <DateDisplay>
              {selectedDate ? formatDate2(selectedDate) : "날짜 선택"}
            </DateDisplay>

            {/* 달력 아이콘 클릭 시 달력 토글 */}
            <CalendarIcon
              src="/images/calendar.png"
              alt="Calendar Icon"
              style={{ cursor: "pointer" }}
              onClick={handleCalendarIconClick}
            />

            {/* 달력이 열려 있으면 DatePicker 표시 */}
            {isCalendarOpen && (
              <div
                style={{
                  position: "absolute",

                  zIndex: 999,
                  left: "50%",
                  transform: "translateX(-50%) scale(1.2)", // 2배 확대
                  transformOrigin: "top center",
                }}
              >
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                />
              </div>
            )}
          </DateWrapper>

          <Arrow onClick={handleIncreaseDate}>&gt;</Arrow>
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
            <Link href="/teamRegistration" passHref>
              <RecordButton as="a">경기기록</RecordButton>
            </Link>
          </MatchCard>
        ))}
      </MatchCardsContainer>
    </Container>
  );
}
