// FinalGameRecordPage.tsx

import React, { useState, useEffect } from "react";
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

  // 팀 이름 상태
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  // 점수 상태
  const [teamAScores, setTeamAScores] = useState(defaultTeamAScores);
  const [teamBScores, setTeamBScores] = useState(defaultTeamBScores);

  // 선수 기록 상태
  const [awayBatters, setAwayBatters] = useState([]);
  const [homeBatters, setHomeBatters] = useState([]);
  const [awayPitchers, setAwayPitchers] = useState([]);
  const [homePitchers, setHomePitchers] = useState([]);

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

  useEffect(() => {
    API.get(`/games/${router.query.recordId}/results`)
      .then((response) => {
        console.log("응답:", response.data);

        const {
          scoreboard,
          awayTeam,
          homeTeam,
          awayBatters,
          homeBatters,
          awayPitchers,
          homePitchers,
        } = response.data;

        // 팀 이름
        setTeamAName(awayTeam.name.substring(0, 3));
        setTeamBName(homeTeam.name.substring(0, 3));

        // 스코어보드 설정
        const newTeamAScores = [...teamAScores];
        const newTeamBScores = [...teamBScores];

        scoreboard.forEach((item: any) => {
          const inningIndex = item.inning - 1;
          if (item.inning_half === "TOP") {
            newTeamAScores[inningIndex] = String(item.runs);
          } else if (item.inning_half === "BOT") {
            newTeamBScores[inningIndex] = String(item.runs);
          }
        });

        // 마지막(R, H) 칸에 기록
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
        console.error("API GET 요청 에러:", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
    // 빈 점수거나 R(7)/H(8) 인덱스면 열지 않음
    if (!score || idx === 7 || idx === 8) return;

    setSelectedCell({ cellValue: score, team, cellIndex: idx });
    setModalMode("score");
    setAlertMessage(""); // 스코어보드 수정은 alertMessage 사용 안 함
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

    // 스코어보드 관련 정보는 사용 안 하므로 임시 값
    setSelectedCell({ cellValue: "", team: "A", cellIndex: 0 });

    // 모달 열기
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

    // 스코어보드 관련 정보는 사용 안 하므로 임시 값
    setSelectedCell({ cellValue: "", team: "A", cellIndex: 0 });

    setIsScorePatchModalOpen(true);
  };

  // 타자 표에서 "order" 표시를 결정하는 함수
  // - 첫 번째로 나온 선수의 order는 숫자로 표시
  // - 같은 order가 연속으로 등장하는 경우 두 번째부터는 '↑'로 표시
  const getDisplayOrder = (
    currentIndex: number,
    batters: any[]
  ): string | number => {
    if (currentIndex === 0) return batters[currentIndex].order; // 첫 선수
    // 이전 선수와 order가 동일하면 '↑' 표시
    if (batters[currentIndex].order === batters[currentIndex - 1].order) {
      return "↑";
    }
    // 아니면 그냥 order 숫자를 표시
    return batters[currentIndex].order;
  };

  return (
    <Container>
      {/* 스코어보드 */}
      <ScoreBoardWrapper>
        <InningHeader>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>{inn}</InningCell>
          ))}
        </InningHeader>

        {/* 팀 A (원정) */}
        <TeamRow>
          <TeamNameCell>{teamAName}</TeamNameCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell
              key={idx}
              onClick={() => handleScoreCellClick(score, "A", idx)}
            >
              <EditableInputScore type="number" defaultValue={score} readOnly />
            </TeamScoreCell>
          ))}
        </TeamRow>

        {/* 팀 B (홈) */}
        <TeamRow>
          <TeamNameCell>{teamBName}</TeamNameCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell
              key={idx}
              onClick={() => handleScoreCellClick(score, "B", idx)}
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
            {awayBatters.map((player: any, idx: number) => {
              const displayOrder = getDisplayOrder(idx, awayBatters);
              return (
                <tr key={idx}>
                  <td>{displayOrder}</td>
                  <td>{player.playerName}</td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.AB}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player["1B"]}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.BB}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player["2B"]}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player["3B"]}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.HR}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.SAC}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                </tr>
              );
            })}
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
            {awayPitchers.map((pitcher: any, idx: number) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{pitcher.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={pitcher.K}
                    readOnly
                    onClick={() => handlePitcherClick(pitcher)}
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
            {homeBatters.map((player: any, idx: number) => {
              const displayOrder = getDisplayOrder(idx, homeBatters);
              return (
                <tr key={idx}>
                  <td>{displayOrder}</td>
                  <td>{player.playerName}</td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.AB}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player["1B"]}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.BB}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player["2B"]}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player["3B"]}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.HR}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                  <td>
                    <EditableInput
                      type="number"
                      defaultValue={player.SAC}
                      readOnly
                      onClick={() => handleBatterClick(player)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </RecordTable>
      </TableWrapper>

      {/* 홈팀 투수기록 */}
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
            {homePitchers.map((pitcher: any, idx: number) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{pitcher.playerName}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={pitcher.K}
                    readOnly
                    onClick={() => handlePitcherClick(pitcher)}
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
        <ControlButton onClick={handleSubmitClick}>제출하기</ControlButton>
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
          mode={modalMode} // 추가: 어떤 이유로 열렸는지
          statId={selectedStatId}
          alertMessage={alertMessage} // 추가: 타자/투수 클릭 시 알림 내용
        />
      )}
    </Container>
  );
}
