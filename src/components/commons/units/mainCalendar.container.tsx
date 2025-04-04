import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import "react-datepicker/dist/react-datepicker.css";
import { useRecoilState } from "recoil";
import {
  Arrow,
  CalendarIcon,
  Container,
  DateDisplay,
  DatePickTotalWrapper,
  DatePickWrapper,
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
  const [isLoading, setIsLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  // 캘린더 영역을 감싸는 ref 추가
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await API.get("/matches");
        setAllMatchData(res.data);
      } catch (err) {
        console.error("❌ 경기 데이터 요청 에러:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

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
    const dateStr = formatDateToYMD(selectedDate);
    const matchDay = allMatchData.find((day) => day.date === dateStr);
    setMatchesForSelectedDate(matchDay?.matches || []);
  }, [selectedDate, allMatchData]);

  // 캘린더 외부 클릭 시 캘린더를 닫는 로직
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

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
              <DatePickTotalWrapper ref={calendarRef}>
                <DatePickWrapper>
                  <StyledDatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    inline
                    renderDayContents={(day, date) => {
                      const dateStr = moment(date).format("YYYY-MM-DD");
                      const hasMatch = allMatchData.some(
                        (matchData) => matchData.date === dateStr
                      );
                      return (
                        <div
                          style={{
                            position: "relative",
                            width: "2.8rem",
                            height: "2.8rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {hasMatch && (
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "50%",
                                backgroundColor: "rgba(74, 144, 226, 0.3)",
                                zIndex: 0,
                              }}
                            />
                          )}
                          <span style={{ position: "relative", zIndex: 1 }}>
                            {day}
                          </span>
                        </div>
                      );
                    }}
                  />
                </DatePickWrapper>
              </DatePickTotalWrapper>
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
