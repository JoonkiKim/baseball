import { useEffect, useRef, useState } from "react";
import moment from "moment-timezone";
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
  RecordButtonPlaceholder,
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
import {
  authMe,
  gameId,
  previousDateState,
  TeamListState,
} from "../../../commons/stores";
import { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
import { getAccessToken } from "../../../commons/libraries/getAccessToken";

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
  inning?: number;
  inningHalf?: string;
  gameId?: number; // gameId로 변경 (예: 1001, 1002, 1003 등)
}

export default function MainCalendarPage() {
  // const [recordId, setGameId] = useRecoilState(gameId);

  // 일반유저 열어놓기
  const [isAuthenticated] = useState(true);

  // 일반 유저 닫아놓기
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const token = getAccessToken();
  //   setIsAuthenticated(!!token); // accessToken이 있으면 true
  // }, []);

  registerLocale("ko", ko);
  moment.tz.setDefault("Asia/Seoul");
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

  const [authInfo, setAuthInfo] = useRecoilState(authMe);
  // 캘린더 영역 외부 클릭 감지를 위한 ref
  const calendarRef = useRef<HTMLDivElement>(null);

  const [fromDate, setFromDate] = useState("2025-04-23");
  const [toDate, setToDate] = useState("2025-04-26");

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await API.get(`/games?from=${fromDate}&to=${toDate}`, {
          withCredentials: true,
        });
        const authRes = await API.get(`/auth/me`);
        console.log(authRes.data);
        setAuthInfo(authRes.data);

        console.log(`/games?from=${fromDate}&to=${toDate}`);
        console.log(res.data);
        // 백엔드 테스트 시에는 아래의 코드드
        setAllMatchData(res.data.days);

        // setAllMatchData(res.data);
        console.log(allMatchData);
      } catch (err) {
        const errorCode = err?.response?.data?.errorCode; // 에러코드 추출
        console.error(err, "errorCode:", errorCode);
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

  const handleDecreaseDate = () =>
    selectedDate &&
    setSelectedDate(moment(selectedDate).subtract(1, "day").toDate());

  const handleIncreaseDate = () =>
    selectedDate &&
    setSelectedDate(moment(selectedDate).add(1, "day").toDate());

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
                    locale="ko"
                    dateFormatCalendar="M월"
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
                      {match.status === "SCHEDULED" ? "-" : team2Score ?? "-"}
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
                        : match.status === "IN_PROGRESS" && match.inning
                        ? `${match.inning}회${
                            match.inningHalf === "TOP" ? "초" : "말"
                          }`
                        : match.status === "EDITING"
                        ? "경기종료"
                        : ""}
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
                      {match.status === "SCHEDULED" ? "-" : team1Score ?? "-"}
                    </TeamScore>
                  </Team>
                </TeamsContainer>

                {isAuthenticated ||
                match.status === "FINALIZED" ||
                match.status === "EDITING" ? (
                  <RecordButton
                    onClick={() => {
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
                        status: match.status,
                      };
                      // 💡 Recoil 상태에도 저장
                      // setGameId(match.gameId);

                      // console.log("gameId", gameId);
                      localStorage.setItem(
                        "selectedMatch",
                        JSON.stringify(selectedMatchInfo)
                      );

                      if (match.status === "SCHEDULED") {
                        setTeamList([
                          {
                            homeTeamName: match.homeTeam.name,
                            homeTeamId: match.homeTeam.id,
                            awayTeamName: match.awayTeam.name,
                            awayTeamId: match.awayTeam.id,
                          },
                        ]);
                      }

                      let route = "";
                      if (
                        match.status === "FINALIZED" ||
                        match.status === "EDITING"
                      ) {
                        route = `/matches/${match.gameId}/result`;
                      } else if (match.status === "SCHEDULED") {
                        route = `/matches/${match.gameId}/homeTeamRegistration`;
                      } else if (match.status === "IN_PROGRESS") {
                        route = `/matches/${match.gameId}/records`;
                      }

                      router.push(route);
                    }}
                  >
                    경기기록
                  </RecordButton>
                ) : (
                  <RecordButtonPlaceholder />
                )}
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
