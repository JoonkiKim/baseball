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
import { previousDateState, TeamListState } from "../../../commons/stores";

// 새 객체 구조에 맞춘 인터페이스 정의 (matchId → gameId)
interface RawMatch {
  date: string;
  dayOfWeek: string;
  games: Game[];
}

interface Game {
  time: string;
  status: string;
  homeTeam: {
    id: number;
    name: string;
    score: number | null;
  };
  awayTeam: {
    id: number;
    name: string;
    score: number | null;
  };
  currentInning?: number;
  inning_half?: string;
  gameId?: number; // gameId로 변경 (예: 1001, 1002, 1003 등)
}

export default function MainCalendarPage() {
  const router = useRouter();

  // TeamListState 및 날짜 상태 등 Recoil 상태 불러오기
  const [teamList, setTeamList] = useRecoilState(TeamListState);
  const [selectedDate, setSelectedDate] = useRecoilState(previousDateState);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [allMatchData, setAllMatchData] = useState<RawMatch[]>([]);
  const [matchesForSelectedDate, setMatchesForSelectedDate] = useState<Game[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  // 캘린더 영역 외부 클릭 감지를 위한 ref
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await API.get("/games");
        // 새 객체 구조가 반영된 데이터를 불러온다고 가정합니다.
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
    // 기존의 matches 대신 games 속성 사용
    const matchDay = allMatchData.find((day) => day.date === dateStr);
    setMatchesForSelectedDate(matchDay?.games || []);
  }, [selectedDate, allMatchData]);

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
            // 기존 구조: homeTeam을 team1, awayTeam을 team2로 사용
            const team1Score = match.homeTeam.score;
            const team2Score = match.awayTeam.score;
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
                  {/* awayTeam을 왼쪽에 노출 */}
                  <Team>
                    <TeamName>{match.awayTeam.name}</TeamName>
                    <TeamScore
                      isWinner={team2IsWinner}
                      gameStatus={match.status}
                    >
                      {team2Score ?? "-"}
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

                  {/* homeTeam을 오른쪽에 노출 */}
                  <Team>
                    <TeamName>{match.homeTeam.name}</TeamName>
                    <TeamScore
                      isWinner={team1IsWinner}
                      gameStatus={match.status}
                    >
                      {team1Score ?? "-"}
                    </TeamScore>
                  </Team>
                </TeamsContainer>

                {/* 경기기록 버튼 클릭 시, 관련 팀 정보 저장 순서도 awayTeam -> homeTeam로 변경 */}
                <RecordButton
                  onClick={() => {
                    // 선택된 경기 정보를 객체로 구성합니다.
                    const selectedMatchInfo = {
                      gameId: match.gameId,
                      awayTeam: {
                        id: match.awayTeam.id,
                        name: match.awayTeam.name,
                      },
                      homeTeam: {
                        id: match.homeTeam.id,
                        name: match.homeTeam.name,
                      },
                    };
                    localStorage.setItem(
                      "selectedMatch",
                      JSON.stringify(selectedMatchInfo)
                    );

                    // localStorage를 사용하지 않고, Recoil 스테이트 (TeamListState)를 업데이트 합니다.
                    // 경기 상태가 "SCHEDULED"인 경우에 팀 정보를 저장하는 예시입니다.
                    if (match.status === "SCHEDULED") {
                      setTeamList([
                        {
                          homeTeamName: match.homeTeam.name,
                          homeTeamId: match.homeTeam.id,
                          awayTeamName: match.awayTeam.name,
                          awayTeamId: match.awayTeam.id,
                        },
                      ]);
                      console.log("저장된 팀 정보:", {
                        homeTeamName: match.homeTeam.name,
                        homeTeamId: match.homeTeam.id,
                        awayTeamName: match.awayTeam.name,
                        awayTeamId: match.awayTeam.id,
                      });
                    }

                    // 경기 상태에 따라 이동할 route를 설정합니다.
                    let route = "";
                    if (match.status === "FINALIZED") {
                      route = `/matches/${match.gameId}/result`;
                    } else if (match.status === "SCHEDULED") {
                      route = `/matches/${match.gameId}/homeTeamRegistration`;
                    } else if (match.status === "IN_PROGRESS") {
                      route = `/matches/${match.gameId}/records`;
                    }

                    router.push(route);
                    // 설정된 route에 따라 쿼리 파라미터를 붙여 새 URL을 구성합니다.
                    // route에 "homeTeamRegistration"이 포함되어 있으면 homeTeam의 id를, 그렇지 않으면 awayTeam의 id를 사용합니다.
                    // if (route) {
                    //   if (route.includes("homeTeamRegistration")) {
                    //     // 예: /matches/1025/homeTeamRegistration?teamId=1
                    //     route = `${route}?teamId=${match.homeTeam.id}`;
                    //   } else {
                    //     // 예: /matches/1025/result?teamId=2 또는 기타 상태의 경우 awayTeam의 id 사용
                    //     route = `${route}?teamId=${match.awayTeam.id}`;
                    //   }

                    // }
                  }}
                >
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
