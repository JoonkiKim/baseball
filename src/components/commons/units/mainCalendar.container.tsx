import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
  StatusBox,
  Team,
  TeamName,
  TeamsContainer,
  TeamScore,
  VsText,
} from "./mainCalendar.style";
import { formatDate2 } from "../../../commons/libraries/utils";

// Match 객체에 대한 타입 정의
interface Match {
  time: string;
  team1: string;
  team1Score?: number;
  team2: string;
  team2Score?: number;
  gameStatus: string;
}

export default function MainCalendarPage() {
  const router = useRouter();

  // react-datepicker에서 사용할 날짜 (Date 타입)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // 달력이 열려 있는지 여부 (수동 제어용)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 경기 데이터 배열 (Match 객체들의 배열)
  const [matches, setMatches] = useState<Match[]>([
    {
      time: "09:00",
      team1: "자연대",
      team1Score: 9,
      team2: "공대",
      team2Score: 16,
      gameStatus: "경기종료",
    },
    {
      time: "11:00",
      team1: "자연대",
      team1Score: 9,
      team2: "건환공",
      team2Score: 6,
      gameStatus: "경기종료",
    },
    {
      time: "14:00",
      team1: "관악사",
      team1Score: 10,
      team2: "공대",
      team2Score: 6,
      gameStatus: "5회초",
    },
    {
      time: "16:30",
      team1: "건환공",
      team2: "자연대",
      gameStatus: "경기예정",
    },
    {
      time: "19:00",
      team1: "자연대",
      team2: "공대",
      gameStatus: "경기예정",
    },
  ]);

  useEffect(() => {
    // 초기값: 오늘 날짜 (이미 new Date()로 설정되어 있음)
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

  // 경기기록 버튼 클릭 시 gameStatus에 따라 라우팅 처리
  const handleRecordClick = (gameStatus: string) => {
    if (gameStatus === "경기종료") {
      router.push("/result");
    } else {
      router.push("/records");
    }
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
              src="/images/calendar-linear.png"
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
                  transform: "translateX(-50%) translateY(60%) scale(1.2)",
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
        {matches.map((match, index) => {
          // 두 점수가 모두 있을 경우에만 비교하여 승자를 결정
          const team1IsWinner =
            match.team1Score !== undefined &&
            match.team2Score !== undefined &&
            match.team1Score > match.team2Score;
          const team2IsWinner =
            match.team1Score !== undefined &&
            match.team2Score !== undefined &&
            match.team2Score > match.team1Score;

          return (
            <MatchCard key={index}>
              <MatchTimeLabel>{match.time}</MatchTimeLabel>
              <TeamsContainer>
                <Team>
                  <TeamName>{match.team1}</TeamName>
                  <TeamScore isWinner={team1IsWinner}>
                    {match.team1Score}
                  </TeamScore>
                </Team>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <StatusBox status={match.gameStatus}>
                    {match.gameStatus}
                  </StatusBox>
                  <VsText>vs</VsText>
                </div>
                <Team>
                  <TeamName>{match.team2}</TeamName>
                  <TeamScore isWinner={team2IsWinner}>
                    {match.team2Score}
                  </TeamScore>
                </Team>
              </TeamsContainer>
              {/* RecordButton 클릭 시 gameStatus에 따라 라우팅 */}
              <RecordButton onClick={() => handleRecordClick(match.gameStatus)}>
                경기기록
              </RecordButton>
            </MatchCard>
          );
        })}
      </MatchCardsContainer>
    </Container>
  );
}
