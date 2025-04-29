// FinalGameRecordPage.tsx

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
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
import API from "../../../../commons/apis/api";
import ScorePatchModal from "../../modals/scorePatchModal";

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

  // ➊ 초기값은 “비어 있음”으로 설정
  const [matchStr, setMatchStr] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  /* ───────── 클라이언트(브라우저)에서만 실행 ───────── */
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
        const errorCode = error?.response?.data?.error_code; // 에러코드 추출
        console.error(error, "error_code:", errorCode);
        setMatchStatus(null);
        setIsFinalized(false);
      }
    } else {
      // 값이 없을 때
      setMatchStatus(null);
      setIsFinalized(false);
    }
  }, [router.query]); // 필요하다면 router.query 등 의존성 추가

  console.log(matchStatus); // 확인용

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
  const lastEntryRef = useRef<{ inning: number; inning_half: string } | null>(
    null
  );
  // scoreboard DOM 컨테이너 ref
  const scoreboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    API.get(`/games/${router.query.recordId}/results`)
      .then((response) => {
        const {
          scoreboard,
          awayTeam,
          homeTeam,
          awayBatters,
          homeBatters,
          awayPitchers,
          homePitchers,
        } = response.data;

        // 마지막 이닝 정보 저장
        const lastEntry = scoreboard[scoreboard.length - 1] || {
          inning: 0,
          inning_half: "",
        };
        lastEntryRef.current = lastEntry;

        // console.log 메시지
        const { inning, inning_half } = lastEntry;
        if (inning_half === "TOP") {
          console.log(`${inning}회초에 공격끝남`);
        } else {
          console.log(`${inning}회말에 공격끝남`);
        }

        // 팀 이름 셋팅
        setTeamAName(awayTeam.name.substring(0, 3));
        setTeamBName(homeTeam.name.substring(0, 3));

        // 스코어보드 배열 복사
        const newTeamAScores = [...defaultTeamAScores];
        const newTeamBScores = [...defaultTeamBScores];

        // scoreboard 데이터 채우기
        scoreboard.forEach((item: any) => {
          const idx = item.inning - 1;
          if (item.inning_half === "TOP") {
            newTeamAScores[idx] = String(item.runs);
          } else {
            newTeamBScores[idx] = String(item.runs);
          }
        });

        // 최종 R/H 칸 채우기
        newTeamAScores[7] = String(awayTeam.runs);
        newTeamAScores[8] = String(awayTeam.hits);
        newTeamBScores[7] = String(homeTeam.runs);
        newTeamBScores[8] = String(homeTeam.hits);

        setTeamAScores(newTeamAScores);
        setTeamBScores(newTeamBScores);

        // 타자/투수 기록
        setAwayBatters(awayBatters);
        setHomeBatters(homeBatters);
        setAwayPitchers(awayPitchers);
        setHomePitchers(homePitchers);
      })
      .catch((error) => {
        const errorCode = error?.response?.data?.error_code; // 에러코드 추출
        console.error(error, "error_code:", errorCode);
        console.error("API GET 요청 에러:", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // 렌더 후 DOM 조작: “끝난 이닝” 반대 half 칸에 "-" 삽입
  useLayoutEffect(() => {
    const entry = lastEntryRef.current;
    const root = scoreboardRef.current;
    // entry가 없거나 TOP이 아니면 아무것도 하지 않음
    if (!entry || entry.inning_half !== "TOP" || !root) return;

    const idx = entry.inning - 1;
    const rows = root.querySelectorAll<HTMLElement>(".team-row");
    if (rows.length < 2) return;

    // 1) 홈팀(두 번째 row)의 해당 이닝 칸을 찾아  "-" 대입
    const botRow = rows[1];
    const cells = botRow.querySelectorAll<HTMLElement>(".score-cell");
    const targetCell = cells[idx];
    if (targetCell) {
      targetCell.textContent = "-";
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
    if (score === "" || score == null || idx === 7 || idx === 8) {
      return;
    }
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
      `타수: ${player.AB}\n` +
      `안타: ${player["1B"]}\n` +
      `볼넷/사구: ${player.BB}\n` +
      `2루타: ${player["2B"]}\n` +
      `3루타: ${player["3B"]}\n` +
      `홈런: ${player["HR"]}\n` +
      `희생타: ${player["SAC"]}\n`;
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
    if (currentIndex === 0) return batters[currentIndex].battingOrder;
    if (
      batters[currentIndex].battingOrder ===
      batters[currentIndex - 1].battingOrder
    ) {
      return "↑";
    }
    return batters[currentIndex].battingOrder;
  };

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
          <TeamNameCell>{teamAName}</TeamNameCell>
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
              <EditableInputScore type="number" defaultValue={score} readOnly />
            </TeamScoreCell>
          ))}
        </TeamRow>

        {/* 팀 B (홈) */}
        <TeamRow className="team-row">
          <TeamNameCell>{teamBName}</TeamNameCell>
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
              <EditableInputScore type="number" defaultValue={score} readOnly />
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
              <th>순번</th>
              <th>이름</th>
              <th>타수</th>
              <th>안타</th>
              <th>볼넷</th>
              <th>2루타</th>
              <th>3루타</th>
              <th>홈런</th>
              <th>희생타</th>
            </tr>
          </thead>
          <tbody>
            {awayBatters.map((player, idx) => (
              <tr key={idx}>
                <td>{getDisplayOrder(idx, awayBatters)}</td>
                <td>{player.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.AB}
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
                    defaultValue={player["1B"]}
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
                    defaultValue={player.BB}
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
                    defaultValue={player["2B"]}
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
                    defaultValue={player["3B"]}
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
                    defaultValue={player.HR}
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
                    defaultValue={player.SAC}
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
              <th>순번</th>
              <th>이름</th>
              <th>삼진</th>
            </tr>
          </thead>
          <tbody>
            {awayPitchers.map((pitcher, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{pitcher.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={pitcher.K}
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
              <th>순번</th>
              <th>이름</th>
              <th>타수</th>
              <th>안타</th>
              <th>볼넷</th>
              <th>2루타</th>
              <th>3루타</th>
              <th>홈런</th>
              <th>희생타</th>
            </tr>
          </thead>
          <tbody>
            {homeBatters.map((player, idx) => (
              <tr key={idx}>
                <td>{getDisplayOrder(idx, homeBatters)}</td>
                <td>{player.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.AB}
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
                    defaultValue={player["1B"]}
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
                    defaultValue={player.BB}
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
                    defaultValue={player["2B"]}
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
                    defaultValue={player["3B"]}
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
                    defaultValue={player.HR}
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
                    defaultValue={player.SAC}
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
              <th>순번</th>
              <th>이름</th>
              <th>삼진</th>
            </tr>
          </thead>
          <tbody>
            {homePitchers.map((pitcher, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{pitcher.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={pitcher.K}
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
        {matchStatus !== "FINALIZED" && (
          <ControlButton onClick={handleSubmitClick}>제출하기</ControlButton>
        )}
      </ButtonContainer>

      {isResultSubmitModalOpen && (
        <ResultSubmitModal
          setIsResultSubmitModalOpen={setIsResultSubmitModalOpen}
        />
      )}

      {isScorePatchModalOpen && selectedCell && (
        <ScorePatchModal
          setIsModalOpen={setIsScorePatchModalOpen}
          cellValue={selectedCell.cellValue}
          team={selectedCell.team}
          cellIndex={selectedCell.cellIndex}
          mode={modalMode}
          statId={selectedStatId}
          alertMessage={alertMessage}
        />
      )}
    </Container>
  );
}
