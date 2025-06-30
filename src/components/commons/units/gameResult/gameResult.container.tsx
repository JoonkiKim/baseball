// FinalGameRecordPage.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Container,
  ScoreBoardWrapper,
  InningHeader,
  InningCell,
  TeamScoreCell,
  TeamTitle,
  TableWrapper,
  TableTitle,
  RecordTable,
  ControlButton,
  HomeButton,
  ButtonContainer,
  RecordTableP,
  TeamRow,
  TeamNameCell,
  EditableInput,
  EditableInputScore,
} from "./gameResult.style";
import Link from "next/link";
import { useRouter } from "next/router";
import ResultSubmitModal from "../../modals/submitModal/resultSubmitModal";
import API from "../../../../commons/apis/apicopy";
import ScorePatchModal from "../../modals/scorePatchModal";
import { authMe, errorGlobal, gameId } from "../../../../commons/stores";
import { useRecoilState } from "recoil";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import { getAccessToken } from "../../../../commons/libraries/getAccessToken";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitleSmaller,
} from "../../modals/modal.style";
import API2 from "../../../../commons/apis/api2";

interface ISelectedCell {
  cellValue: string;
  team: "A" | "B";
  cellIndex: number; // 이닝 인덱스(0-based)
}

// 점수 배열 초기값 (1~7회, R, H)
const defaultTeamAScores = ["", "", "", "", "", "", "", "", ""];
const defaultTeamBScores = ["", "", "", "", "", "", "", "", ""];

export default function FinalGameRecordPage() {
  const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  // ➊ 초기값은 “비어 있음”으로 설정
  const [, setMatchStr] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  // const [recordId] = useRecoilState(gameId);
  const [authInfo, setAuthInfo] = useRecoilState(authMe);
  // const [recordId, setRecordId] = useState(router.query.recordId);
  // const recordId = router.query.recordId;
  // const [error, setError] = useState(null);
  const [error, setError] = useRecoilState(errorGlobal);
  /* ───────── 클라이언트(브라우저)에서만 실행 ───────── */
  const recordId = router.query.recordId;
  useEffect(() => {
    // localStorage 접근은 반드시 브라우저에서!
    const stored = localStorage.getItem("selectedMatch");
    setMatchStr(stored);

    if (stored) {
      try {
        const status: string | null = JSON.parse(stored).status ?? null;
        setMatchStatus(status);
        setIsFinalized(status === "FINALIZED");
      } catch (error) {
        // 파싱 오류 대비
        setError(error);
        const errorCode = error?.response?.data?.errorCode; // 에러코드 추출
        console.error(error, "errorCode:", errorCode);
        setMatchStatus(null);
        setIsFinalized(false);
      }
    } else {
      // 값이 없을 때
      setMatchStatus(null);
      setIsFinalized(false);
    }
  }, [recordId]); // 필요하다면 router.query 등 의존성 추가

  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      try {
        const authRes = await API2.get("/auth/me");
        setAuthInfo(authRes.data);
        console.log("Fetched auth info:", authRes.data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch auth info:", err);
      }
    })();
  }, [router.isReady]);
  // console.log(authInfo);

  // const currentGameId = typeof recordId === "string" ? Number(recordId) : null;

  // console.log(currentGameId);
  // console.log(matchStatus); // 확인용

  // 팀 이름 상태
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  // 점수 상태
  const [teamAScores, setTeamAScores] = useState(defaultTeamAScores);
  const [teamBScores, setTeamBScores] = useState(defaultTeamBScores);

  // 선수 기록 상태
  const [awayBatters, setAwayBatters] = useState<any[]>([]);
  const [homeBatters, setHomeBatters] = useState<any[]>([]);
  const [awayPitchers, setAwayPitchers] = useState<any[]>([]);
  const [homePitchers, setHomePitchers] = useState<any[]>([]);

  // 제출 모달
  const [isResultSubmitModalOpen, setIsResultSubmitModalOpen] = useState(false);

  // ScorePatchModal 열림 여부 + 데이터
  const [isScorePatchModalOpen, setIsScorePatchModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<ISelectedCell | null>(null);

  // (A) 모달이 열리는 이유(모드)
  const [modalMode, setModalMode] = useState<"score" | "batter" | "pitcher">(
    "score"
  );
  // (B) 모달에서 띄울 알림 메시지 (타자/투수)
  const [alertMessage, setAlertMessage] = useState<string>("");

  // 마지막 이닝 정보 보관(ref)
  const lastEntryRef = useRef<{ inning: number; inningHalf: string } | null>(
    null
  );
  // scoreboard DOM 컨테이너 ref
  const scoreboardRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (!recordId) return;
  //   API.get(`/games/${recordId}/results`)
  //     .then((response) => {
  //       const { scoreboard, teamSummary, batterStats, pitcherStats } =
  //         response.data;
  //       console.log(recordId);
  //       console.log("응답이 왔어요!", response.data);
  //       // 마지막 이닝 정보 저장
  //       const lastEntry = scoreboard[scoreboard.length - 1] || {
  //         inning: 0,
  //         inningHalf: "",
  //       };
  //       lastEntryRef.current = lastEntry;

  //       // console.log 메시지
  //       // const { inning, inningHalf } = lastEntry;
  //       // if (inningHalf === "TOP") {
  //       //   console.log(`${inning}회초에 공격끝남`);
  //       // } else {
  //       //   console.log(`${inning}회말에 공격끝남`);
  //       // }

  //       // 팀 이름 셋팅
  //       setTeamAName(teamSummary.away.name.substring(0, 3));
  //       setTeamBName(teamSummary.home.name.substring(0, 3));

  //       // 스코어보드 배열 복사
  //       const newTeamAScores = [...defaultTeamAScores];
  //       const newTeamBScores = [...defaultTeamBScores];

  //       // scoreboard 데이터 채우기
  //       scoreboard.forEach((item: any) => {
  //         const idx = item.inning - 1;
  //         if (item.inningHalf === "TOP") {
  //           newTeamAScores[idx] = String(item.runs);
  //         } else {
  //           newTeamBScores[idx] = String(item.runs);
  //         }
  //       });

  //       // 최종 R/H 칸 채우기
  //       newTeamAScores[7] = String(teamSummary.home.runs);
  //       newTeamAScores[8] = String(teamSummary.away.hits);

  //       newTeamBScores[7] = String(teamSummary.away.runs);
  //       newTeamBScores[8] = String(teamSummary.home.hits);

  //       setTeamAScores(newTeamAScores);
  //       setTeamBScores(newTeamBScores);

  //       // 타자/투수 기록
  //       setAwayBatters(batterStats.away);
  //       setHomeBatters(batterStats.home);
  //       setAwayPitchers(pitcherStats.away);
  //       setHomePitchers(pitcherStats.home);
  //     })
  //     .catch((error) => {
  //       const errorCode = error?.response?.data?.errorCode; // 에러코드 추출
  //       console.error(error, "errorCode:", errorCode);
  //       console.error("API GET 요청 에러:", error);
  //     });
  // }, [recordId]);

  // 렌더 후 DOM 조작: “끝난 이닝” 반대 half 칸에 "-" 삽입

  // ➊ Fetch results callback
  const fetchResults = useCallback(async () => {
    if (!recordId) return;
    try {
      const { data } = await API.get(`/games/${recordId}/results`);
      const { scoreboard, teamSummary, batterStats, pitcherStats } = data;
      // 마지막 이닝 정보 저장
      const lastEntry = scoreboard[scoreboard.length - 1] || {
        inning: 0,
        inningHalf: "",
      };
      lastEntryRef.current = lastEntry;
      // Update scoreboard
      const newA = Array(9).fill("");
      const newB = Array(9).fill("");
      scoreboard.forEach((item: any) => {
        const idx = item.inning - 1;
        if (item.inningHalf === "TOP") newA[idx] = String(item.runs);
        else newB[idx] = String(item.runs);
      });

      // 마지막 이닝이 TOP이면 홈팀(배열 B)에 "-" 표시
      if (lastEntry.inningHalf === "TOP" && lastEntry.inning > 0) {
        newB[lastEntry.inning - 1] = "-";
      }
      newA[7] = String(teamSummary.away.runs);
      newA[8] = String(teamSummary.away.hits);
      newB[7] = String(teamSummary.home.runs);
      newB[8] = String(teamSummary.home.hits);
      setTeamAScores(newA);
      setTeamBScores(newB);
      setTeamAName(teamSummary.away.name);
      setTeamBName(teamSummary.home.name);

      // Update stats
      setAwayBatters(batterStats.away);
      setHomeBatters(batterStats.home);
      setAwayPitchers(pitcherStats.away);
      setHomePitchers(pitcherStats.home);
      console.log("결과요청됨");
      console.log(data);
    } catch (e) {
      console.error("results GET 실패:", e);
      setError(e);
    }
  }, [recordId]);

  // console.log(awayPitchers);
  // Mount: load initial results
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Manual DOM fallback if needed
  useLayoutEffect(() => {
    const entry = lastEntryRef.current;
    const root = scoreboardRef.current;
    if (!entry || entry.inningHalf !== "TOP" || !root) return;
    const rows = root.querySelectorAll<HTMLElement>(".team-row");
    const idx = entry.inning - 1;
    if (rows.length > 1) {
      const botCells = rows[1].querySelectorAll<HTMLElement>(".score-cell");
      if (botCells[idx]) botCells[idx].textContent = "-";
    }
  }, [teamAScores, teamBScores]);

  // 제출 버튼
  const handleSubmitClick = () => {
    setIsResultSubmitModalOpen(true);
  };

  // (1) 스코어보드 셀 클릭 → 모달 열기 (mode="score")
  const handleScoreCellClick = (
    score: string,
    team: "A" | "B",
    idx: number
  ) => {
    if (!score || score === "-" || idx === 7 || idx === 8) return;
    setSelectedCell({ cellValue: score, team, cellIndex: idx });
    setModalMode("score");
    setAlertMessage("");
    setIsScorePatchModalOpen(true);
  };
  const [selectedStatId, setSelectedStatId] = useState<number | null>(null);

  // (2) 타자 칸 클릭 → 모달 열기 (mode="batter")
  const handleBatterClick = (player: any) => {
    setSelectedStatId(player.batterGameStatsId);
    const msg =
      `id: ${player.batterGameStatsId}\n` +
      `플레이어: ${player.playerName}\n` +
      `타석: ${player.PA}\n` +
      `타수: ${player.AB}\n` +
      `안타: ${player["H"]}\n` +
      `볼넷/사구: ${player.BB}\n` +
      `2루타: ${player["2B"]}\n` +
      `3루타: ${player["3B"]}\n` +
      `홈런: ${player["HR"]}\n` +
      `희플: ${player["SAC"]}\n`;
    setAlertMessage(msg);
    setModalMode("batter");
    setSelectedCell({ cellValue: "", team: "A", cellIndex: 0 });
    setIsScorePatchModalOpen(true);
  };

  // (3) 투수 칸 클릭 → 모달 열기 (mode="pitcher")
  const handlePitcherClick = (pitcher: any) => {
    setSelectedStatId(pitcher.pitcherGameStatsId);
    const msg =
      `id: ${pitcher.pitcherGameStatsId}\n` +
      `플레이어: ${pitcher.playerName}\n` +
      `K: ${pitcher.K}`;
    setAlertMessage(msg);
    setModalMode("pitcher");
    setSelectedCell({ cellValue: "", team: "A", cellIndex: 0 });
    setIsScorePatchModalOpen(true);
  };

  // 타자 표에서 "battingOrder" 표시 로직
  const getDisplayOrder = (
    currentIndex: number,
    batters: any[]
  ): string | number => {
    const currentOrder = batters[currentIndex].battingOrder;
    // 해당 order가 배열에 몇 번 등장하는지 확인
    const occurrences = batters.filter(
      (b) => b.battingOrder === currentOrder
    ).length;
    if (occurrences <= 1) {
      // 중복이 아니면 그냥 숫자 반환
      return currentOrder;
    }
    // 중복이면, 첫 등장 위치를 구해서
    const firstIndex = batters.findIndex(
      (b) => b.battingOrder === currentOrder
    );
    // 현재 인덱스가 첫 번째면 숫자, 아니면 화살표
    return currentIndex === firstIndex ? currentOrder : "↑";
  };

  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // useEffect(() => {
  //   const token = getAccessToken();
  //   setIsAuthenticated(!!token); // accessToken이 있으면 true
  // }, []);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      setValidationError(msg);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <Container>
      {/* 스코어보드 */}
      <ScoreBoardWrapper ref={scoreboardRef}>
        <InningHeader>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>{inn}</InningCell>
          ))}
        </InningHeader>

        {/* 팀 A (원정) */}
        <TeamRow className="team-row">
          <TeamNameCell>{teamAName.slice(0, 3)}</TeamNameCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell
              key={idx}
              className="score-cell"
              // onClick={() => handleScoreCellClick(score, "A", idx)}
              onClick={
                isFinalized
                  ? undefined
                  : () => handleScoreCellClick(score, "A", idx)
              }
            >
              <EditableInputScore type="number" value={score} readOnly />
            </TeamScoreCell>
          ))}
        </TeamRow>

        {/* 팀 B (홈) */}
        <TeamRow className="team-row">
          <TeamNameCell>{teamBName.slice(0, 3)}</TeamNameCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell
              key={idx}
              className="score-cell"
              // onClick={() => handleScoreCellClick(score, "B", idx)}
              onClick={
                isFinalized
                  ? undefined
                  : () => handleScoreCellClick(score, "B", idx)
              }
            >
              <EditableInputScore type="number" value={score} readOnly />
            </TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>

      {/* 원정팀 타자 기록 */}
      <TeamTitle>{teamAName} 야구부</TeamTitle>
      <TableWrapper>
        <TableTitle>타자기록</TableTitle>
        <RecordTable>
          <thead>
            <tr>
              <th></th>
              <th>이름</th>
              <th>타석</th>
              <th>타수</th>
              <th>안타</th>
              <th>볼넷</th>
              <th>2루타</th>
              <th>3루타</th>
              <th>홈런</th>
              <th>희플</th>
            </tr>
          </thead>
          <tbody>
            {awayBatters.map((player, idx) => (
              <tr key={player.batterGameStatsId}>
                <td>{getDisplayOrder(idx, awayBatters)}</td>
                <td>{player.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.PA}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.AB}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player["H"]}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.BB}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player["2B"]}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player["3B"]}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.HR}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.SAC}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTable>
      </TableWrapper>

      {/* 원정팀 투수 기록 */}
      <TableWrapper>
        <TableTitle>투수기록</TableTitle>
        <RecordTableP>
          <thead>
            <tr>
              <th></th>
              <th>이름</th>
              <th>삼진</th>
            </tr>
          </thead>
          <tbody>
            {awayPitchers.map((pitcher, idx) => (
              <tr key={pitcher.pitcherGameStatsId}>
                <td>{idx === 0 ? "" : "↑"}</td>
                <td>{pitcher.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    value={pitcher.K}
                    readOnly
                    // onClick={() => handlePitcherClick(pitcher)}
                    onClick={
                      isFinalized
                        ? undefined
                        : () => handlePitcherClick(pitcher)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTableP>
      </TableWrapper>

      {/* 홈팀 타자 기록 */}
      <TeamTitle>{teamBName} 야구부</TeamTitle>
      <TableWrapper>
        <TableTitle>타자기록</TableTitle>
        <RecordTable>
          <thead>
            <tr>
              <th></th>
              <th>이름</th>
              <th>타석</th>
              <th>타수</th>
              <th>안타</th>
              <th>볼넷</th>
              <th>2루타</th>
              <th>3루타</th>
              <th>홈런</th>
              <th>희플</th>
            </tr>
          </thead>
          <tbody>
            {homeBatters.map((player, idx) => (
              <tr key={player.batterGameStatsId}>
                <td>{getDisplayOrder(idx, homeBatters)}</td>
                <td>{player.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.PA}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.AB}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player["H"]}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.BB}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player["2B"]}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player["3B"]}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.HR}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    value={player.SAC}
                    readOnly
                    // onClick={() => handleBatterClick(player)}
                    onClick={
                      isFinalized ? undefined : () => handleBatterClick(player)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTable>
      </TableWrapper>

      {/* 홈팀 투수 기록 */}
      <TableWrapper>
        <TableTitle>투수기록</TableTitle>
        <RecordTableP>
          <thead>
            <tr>
              <th></th>
              <th>이름</th>
              <th>삼진</th>
            </tr>
          </thead>
          <tbody>
            {homePitchers.map((pitcher, idx) => (
              <tr key={pitcher.pitcherGameStatsId}>
                <td>{idx === 0 ? "" : "↑"}</td>
                <td>{pitcher.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    value={pitcher.K}
                    readOnly
                    // onClick={() => handlePitcherClick(pitcher)}
                    onClick={
                      isFinalized
                        ? undefined
                        : () => handlePitcherClick(pitcher)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTableP>
      </TableWrapper>

      {/* 하단 버튼 */}
      <ButtonContainer>
        <Link href="/" passHref>
          <a>
            <HomeButton>홈으로</HomeButton>
          </a>
        </Link>
        {matchStatus !== "FINALIZED" &&
          // && isAuthenticated
          authInfo.role === "UMPIRE" &&
          // && currentGameId !== null
          authInfo.gameIds.includes(Number(router.query.recordId)) && (
            <ControlButton onClick={handleSubmitClick}>제출하기</ControlButton>
          )}
      </ButtonContainer>

      {authInfo.role === "UMPIRE" &&
        // && currentGameId !== null
        authInfo.gameIds.includes(Number(router.query.recordId)) &&
        isResultSubmitModalOpen && (
          <ResultSubmitModal
            setIsResultSubmitModalOpen={setIsResultSubmitModalOpen}
          />
        )}

      {authInfo.role === "UMPIRE" &&
        // && currentGameId !== null
        authInfo.gameIds.includes(Number(router.query.recordId)) &&
        isScorePatchModalOpen &&
        selectedCell && (
          <ScorePatchModal
            setIsModalOpen={setIsScorePatchModalOpen}
            cellValue={selectedCell.cellValue}
            team={selectedCell.team}
            cellIndex={selectedCell.cellIndex}
            mode={modalMode}
            statId={selectedStatId}
            alertMessage={alertMessage}
            onSuccess={fetchResults}
            // setError={setError}
            // isSubmitting={isSubmitting}
            // setIsSubmitting={setIsSubmitting}
          />
        )}
      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      <ErrorAlert
        error={error}
        onClose={() => {
          setError(null); // ErrorAlert 언마운트
        }}
      />
      {!isSubmitting && validationError && (
        <ModalOverlay>
          <ModalContainer>
            <ModalTitleSmaller>{validationError}</ModalTitleSmaller>

            <ModalButton onClick={() => setValidationError(null)}>
              확인
            </ModalButton>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
}
