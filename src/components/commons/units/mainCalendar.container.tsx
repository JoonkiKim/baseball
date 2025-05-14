import { useEffect, useRef, useState } from "react";
import moment from "moment-timezone";
import { useRouter } from "next/router";
import "react-datepicker/dist/react-datepicker.css";
import { useRecoilState } from "recoil";
import {
  Arrow,
  BraketText,
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
  lastRouteState,
  previousDateState,
  TeamListState,
} from "../../../commons/stores";
import { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale";
// import { getAccessToken } from "../../../commons/libraries/getAccessToken";
import ErrorAlert from "../../../commons/libraries/showErrorCode";

// 새 객체 구조에 맞춘 인터페이스 정의 (matchId → gameId)
interface RawMatch {
  date: string;
  dayOfWeek: string;
  games: Game[];
}

interface Game {
  time: string;
  status: string;
  winnerTeamId?: number;
  stage: string;
  homeTeam: {
    id: number;
    name: string;
    score: number | null | string;
  };
  awayTeam: {
    id: number;
    name: string;
    score: number | null | string;
  };
  inning?: number;
  inningHalf?: string;
  gameId?: number; // gameId로 변경 (예: 1001, 1002, 1003 등)
  isForfeit: boolean;
}
const LOCAL_KEY = "calendarSelectedDate";

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
  // 에러 상태
  const [error, setError] = useState(null);

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

  // const [fromDate, setFromDate] = useState("2025-05-01");
  // const [toDate, setToDate] = useState("2025-06-10");

  const [fromDate, setFromDate] = useState("2025-03-01");
  const [toDate, setToDate] = useState("2025-06-10");

  useEffect(() => {
    const fetchMatches = async () => {
      if (!router) return;
      setIsLoading(true);
      try {
        const res = await API.get(
          `/games?from=${fromDate}&to=${toDate}`
          // , {
          //   withCredentials: true,
          // }
        );

        // const kstDays: RawMatch[] = res.data.days.map((day: RawMatch) => {
        //   const kst = moment.utc(day.date).tz("Asia/Seoul");
        //   const games = day.games.map((game: Game) => {
        //     // 시간 UTC→KST 변환
        //     const utcDate = day.date.substring(0, 10);
        //     const utcDateTime = moment.utc(`${utcDate}T${game.time}:00Z`);
        //     const kstTime = utcDateTime
        //       .clone()
        //       .tz("Asia/Seoul")
        //       .format("HH:mm");
        //     if (
        //       game.winnerTeamId != null &&
        //       game.homeTeam.score == null &&
        //       game.awayTeam.score == null
        //     ) {
        //       if (game.winnerTeamId === game.homeTeam.id) {
        //         return {
        //           ...game,
        //           time: kstTime,
        //           homeTeam: { ...game.homeTeam, score: "몰수승" },
        //         };
        //       } else {
        //         return {
        //           ...game,
        //           time: kstTime,
        //           awayTeam: { ...game.awayTeam, score: "몰수승" },
        //         };
        //       }
        //     }
        //     return { ...game, time: kstTime };
        //   });

        //   return {
        //     ...day,
        //     date: kst.format("YYYY-MM-DD"),
        //     dayOfWeek: kst.locale("ko").format("dd"),
        //     games,
        //   };
        // });
        const authRes = await API.get(`/auth/me`, {
          withCredentials: true,
        });
        setAuthInfo(authRes.data);
        console.log(authInfo);
        // setAllMatchData(kstDays);
        setAllMatchData(res.data.days);
        console.log("allMatchData", allMatchData);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [fromDate, toDate, router]);
  console.log(authInfo);

  console.log("allMatchData", allMatchData);
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

  /* ───── ① 첫 로드: localStorage 값이 있으면 복원 ───── */
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      // "YYYY-MM-DD" 형태로 저장했으므로 moment로 파싱
      setSelectedDate(moment(saved, "YYYY-MM-DD").toDate());
    }
  }, []);
  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem(LOCAL_KEY, formatDateToYMD(selectedDate));
    }
  }, [selectedDate]);

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

  const [lastRoute, setLastRoute] = useRecoilState(lastRouteState);

  // console.log("lastRoute", lastRoute);
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
            const canRecord =
              authInfo.role === "UMPIRE" &&
              Array.isArray(authInfo.gameIds) &&
              authInfo.gameIds.includes(match.gameId!);
            // 기존 구조: homeTeam을 team1, awayTeam을 team2로 사용
            // const team1Score = match.homeTeam.score;
            // const team2Score = match.awayTeam.score;
            // const team1IsWinner =
            //   team1Score !== null &&
            //   team2Score !== null &&
            //   team1Score > team2Score;
            // const team2IsWinner =
            //   team1Score !== null &&
            //   team2Score !== null &&
            //   team2Score > team1Score;
            /* ────────── ⬇︎ ① map 안, team 스코어 계산 위치를 교체/추가 ────────── */
            const team1Score = match.homeTeam.score;
            const team2Score = match.awayTeam.score;

            /* 몰수 경기(isForfeit)면 표시용 스코어를 가공한다 */
            let displayHomeScore: number | string | null = team1Score;
            let displayAwayScore: number | string | null = team2Score;

            if (match.isForfeit && match.winnerTeamId) {
              if (match.winnerTeamId === match.homeTeam.id) {
                displayHomeScore = "몰수승";
                displayAwayScore = "-";
              } else if (match.winnerTeamId === match.awayTeam.id) {
                displayAwayScore = "몰수승";
                displayHomeScore = "-";
              }
            }

            /* 승패 하이라이트 계산도 몰수 여부에 따라 달리 계산 */
            const team1IsWinner = match.isForfeit
              ? match.winnerTeamId === match.homeTeam.id
              : team1Score !== null &&
                team2Score !== null &&
                team1Score > team2Score;

            const team2IsWinner = match.isForfeit
              ? match.winnerTeamId === match.awayTeam.id
              : team1Score !== null &&
                team2Score !== null &&
                team2Score > team1Score;
            /* ─────────────────────────────────────────────────────────────────────── */
            // 📍 ① map 내부 – 팀 이름/스코어에 들어갈 표시값 먼저 계산
            const awayTeamNameDisplay =
              match.awayTeam.name && match.awayTeam.id != null
                ? match.awayTeam.name.length >= 6
                  ? match.awayTeam.name.slice(0, 6)
                  : match.awayTeam.name.padEnd(6, " ")
                : "-";

            const homeTeamNameDisplay =
              match.homeTeam.name && match.homeTeam.id != null
                ? match.homeTeam.name.length >= 6
                  ? match.homeTeam.name.slice(0, 6)
                  : match.homeTeam.name.padEnd(6, " ")
                : "-";

            // 스코어가 null 이거나 팀 정보(id·name) 자체가 없으면 “-”로 통일
            const awayScoreDisplay =
              displayAwayScore == null ? "-" : displayAwayScore;

            const homeScoreDisplay =
              displayHomeScore == null ? "-" : displayHomeScore;

            /* ────────── ⬇︎ ① map 안, stage 라벨 계산 추가 ────────── */
            const stageLabel = (() => {
              switch (match.stage) {
                case "FINAL":
                  return "결승";
                case "SEMI_FINAL":
                  return "준결승";
                case "QUARTER_FINAL":
                  return "8강";
                case "THIRD_PLACE":
                  return "3,4위전";
                default:
                  return ""; // stage 값이 없으면 표시하지 않음
              }
            })();
            /* ─────────────────────────────────────────────────────── */

            return (
              <MatchCard key={index}>
                <MatchTimeLabel>{match.time}</MatchTimeLabel>
                <TeamsContainer>
                  {/* awayTeam을 왼쪽에 노출 */}
                  <Team>
                    <TeamName>{awayTeamNameDisplay}</TeamName>
                    <TeamScore
                      isWinner={team2IsWinner}
                      gameStatus={match.status}
                      isForfeit={awayScoreDisplay === "몰수승"}
                    >
                      {match.status === "SCHEDULED" ? "-" : awayScoreDisplay}
                    </TeamScore>
                  </Team>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      // marginBottom: "20px",
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
                    <BraketText>{stageLabel}</BraketText>
                  </div>

                  {/* homeTeam을 오른쪽에 노출 */}
                  <Team>
                    <TeamName>{homeTeamNameDisplay}</TeamName>
                    <TeamScore
                      isWinner={team1IsWinner}
                      gameStatus={match.status}
                      isForfeit={homeScoreDisplay === "몰수승"}
                    >
                      {match.status === "SCHEDULED" ? "-" : homeScoreDisplay}
                    </TeamScore>
                  </Team>
                </TeamsContainer>

                {canRecord ||
                match.status === "FINALIZED" ||
                match.status === "EDITING" ? (
                  // ||
                  // match.status === "SCHEDULED"
                  // <RecordButton
                  //   onClick={() => {
                  //     const selectedMatchInfo = {
                  //       gameId: match.gameId,
                  //       awayTeam: {
                  //         id: match.awayTeam.id,
                  //         name: match.awayTeam.name,
                  //       },
                  //       homeTeam: {
                  //         id: match.homeTeam.id,
                  //         name: match.homeTeam.name,
                  //       },
                  //       status: match.status,
                  //     };
                  //     localStorage.setItem(
                  //       "selectedMatch",
                  //       JSON.stringify(selectedMatchInfo)
                  //     );
                  //     if (match.status === "SCHEDULED") {
                  //       setTeamList([
                  //         {
                  //           homeTeamName: match.homeTeam.name,
                  //           homeTeamId: match.homeTeam.id,
                  //           awayTeamName: match.awayTeam.name,
                  //           awayTeamId: match.awayTeam.id,
                  //         },
                  //       ]);
                  //     }
                  //     let route = "";

                  //     // (1) 경기 종료(FINALIZED) + recoil-persist 에 저장된 lastRoute 안에
                  //     //     현재 match.gameId 가 포함돼 있으면, 그 lastRoute 로 이동
                  //     if (match.status === "FINALIZED") {
                  //       // lastRouteState 가 비어있거나 gameId 가 없으면 빈 문자열
                  //       const persistedRoute =
                  //         lastRoute && lastRoute.includes(String(match.gameId))
                  //           ? lastRoute
                  //           : "";

                  //       route =
                  //         persistedRoute !== ""
                  //           ? persistedRoute // 예) /matches/3/homeTeamRegistration/homeTeamSubRegistration
                  //           : `/matches/${match.gameId}/result`;
                  //     } else if (match.status === "EDITING") {
                  //       route = `/matches/${match.gameId}/result`;
                  //     } else if (match.status === "SCHEDULED") {
                  //       route = `/matches/${match.gameId}/homeTeamRegistration`;
                  //     } else if (match.status === "IN_PROGRESS") {
                  //       route = `/matches/${match.gameId}/records`;
                  //     }

                  //     router.push(route);
                  //   }}
                  // >
                  //   경기기록
                  // </RecordButton>
                  <RecordButton
                    onClick={() => {
                      /* ① recoil-persist(로컬스토리지)에서 마지막 경로 가져오기 */
                      const persistedRoute = (() => {
                        try {
                          const stored = JSON.parse(
                            localStorage.getItem("recoil-persist") ?? "{}"
                          );
                          // recoil-persist로 저장된 lastRouteState 값
                          return stored.lastRouteState ?? "";
                        } catch {
                          return "";
                        }
                      })();

                      /* ② 경기 정보 로컬스토리지에 저장(기존 그대로) */
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
                      localStorage.setItem(
                        "selectedMatch",
                        JSON.stringify(selectedMatchInfo)
                      );

                      /* ③ SCHEDULED 인 경우 팀목록 세팅(기존 그대로) */
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

                      /* ④ 이동 경로 결정 — 요 부분이 변경됨 */
                      let route = "";
                      if (
                        match.status === "FINALIZED" ||
                        match.status === "EDITING"
                      ) {
                        route = `/matches/${match.gameId}/result`;
                      } else if (match.status === "SCHEDULED") {
                        /* ­이전 방문 경로(persistedRoute)에 현재 gameId가 포함돼 있으면 그곳으로,
         아니면 기본 homeTeamRegistration 으로   */
                        route =
                          persistedRoute &&
                          persistedRoute.includes(String(match.gameId))
                            ? persistedRoute
                            : `/matches/${match.gameId}/homeTeamRegistration`;
                      } else if (match.status === "IN_PROGRESS") {
                        route = `/matches/${match.gameId}/records`;
                      }

                      /* ⑤ 최종 라우팅 */
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
      <ErrorAlert error={error} />
    </Container>
  );
}
