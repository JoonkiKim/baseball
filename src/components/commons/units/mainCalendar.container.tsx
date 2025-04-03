import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRecoilState } from "recoil";
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
  StyledDatePicker,
  Team,
  TeamName,
  TeamsContainer,
  TeamScore,
  VsText,
} from "./mainCalendar.style";
import { formatDate2, formatDateToYMD } from "../../../commons/libraries/utils";
// import axios from "axios";
import API from "../../../commons/apis/api";
import { previousDateState } from "../../../commons/stores";

interface RawMatch {
  date: string;
  dayOfWeek: string;
  matches: Match[];
}

interface Match {
  time: string;
  status: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  currentInning?: number;
  inning_half?: string;
}

export default function MainCalendarPage() {
  const router = useRouter();

  // Recoil의 전역 상태를 사용하여 선택된 날짜를 관리합니다.
  const [selectedDate, setSelectedDate] = useRecoilState(previousDateState);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [allMatchData, setAllMatchData] = useState<RawMatch[]>([]);
  const [matchesForSelectedDate, setMatchesForSelectedDate] = useState<Match[]>(
    []
  );

  // 로딩 상태와 타임아웃 상태를 관리합니다.
  const [isLoading, setIsLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await API.get("/matches"); // 이건 mock baseURL에 맞게 바꿔주세요!
        setAllMatchData(res.data);
      } catch (err) {
        console.error("❌ 경기 데이터 요청 에러:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // 3초가 지나도 데이터가 도착하지 않으면 timedOut 상태를 true로 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setTimedOut(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = formatDateToYMD(selectedDate); // 예: "2025-04-13"
    const matchDay = allMatchData.find((day) => day.date === dateStr);
    setMatchesForSelectedDate(matchDay?.matches || []);
  }, [selectedDate, allMatchData]);

  const handleDecreaseDate = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
    }
  };

  const handleIncreaseDate = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
    }
  };

  const handleCalendarIconClick = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
    setIsCalendarOpen(false);
  };

  const handleRecordClick = (status: string) => {
    if (status === "FINALIZED") {
      router.push("/result");
    } else if (status === "SCHEDULED") {
      router.push("/teamRegistration");
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
            <DateDisplay>
              {selectedDate ? formatDate2(selectedDate) : "날짜 선택"}
            </DateDisplay>

            <CalendarIcon
              src="/images/calendar-new.png"
              alt="Calendar Icon"
              onClick={handleCalendarIconClick}
            />

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
                <StyledDatePicker
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
        {isLoading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            {timedOut
              ? "해당 날짜의 경기가 없습니다."
              : "경기 일정을 불러오는 중입니다"}
          </p>
        ) : matchesForSelectedDate.length > 0 ? (
          matchesForSelectedDate.map((match, index) => {
            const team1Score = match.homeTeamScore;
            const team2Score = match.awayTeamScore;
            const team1IsWinner =
              team1Score !== null &&
              team2Score !== null &&
              team1Score > team2Score;
            const team2IsWinner =
              team1Score !== null &&
              team2Score !== null &&
              team2Score > team1Score;

            return (
              <MatchCard key={index}>
                <MatchTimeLabel>{match.time}</MatchTimeLabel>
                <TeamsContainer>
                  <Team>
                    <TeamName>{match.homeTeamName}</TeamName>
                    <TeamScore
                      isWinner={team1IsWinner}
                      gameStatus={match.status}
                    >
                      {team1Score ?? "-"}
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
                    <StatusBox status={match.status}>
                      {match.status === "SCHEDULED"
                        ? "경기예정"
                        : match.status === "FINALIZED"
                        ? "경기종료"
                        : match.status === "IN_PROGRESS" && match.currentInning
                        ? `${match.currentInning}회${
                            match.inning_half === "TOP" ? "초" : "말"
                          }`
                        : match.status}
                    </StatusBox>

                    <VsText>vs</VsText>
                  </div>

                  <Team>
                    <TeamName>{match.awayTeamName}</TeamName>
                    <TeamScore
                      isWinner={team2IsWinner}
                      gameStatus={match.status}
                    >
                      {team2Score ?? "-"}
                    </TeamScore>
                  </Team>
                </TeamsContainer>

                <RecordButton onClick={() => handleRecordClick(match.status)}>
                  경기기록
                </RecordButton>
              </MatchCard>
            );
          })
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            해당 날짜의 경기가 없습니다.
          </p>
        )}
      </MatchCardsContainer>
    </Container>
  );
}
