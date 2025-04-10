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

// 기본 점수 배열 (1~7회, R, H)
const defaultTeamAScores = ["", "", "", "", "", "", "", "", ""];
const defaultTeamBScores = ["", "", "", "", "", "", "", "", ""];

export default function FinalGameRecordPage() {
  const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];
  const router = useRouter();

  // 팀 이름은 GET 응답으로 받아온 데이터 (읽기 전용, 일반 텍스트로 표시)
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  // 점수 배열 상태 (GET 응답 데이터 → 수정 가능)
  const [teamAScores, setTeamAScores] = useState(defaultTeamAScores);
  const [teamBScores, setTeamBScores] = useState(defaultTeamBScores);

  // 타자 및 투수 기록 상태 (GET 응답 데이터 → 수정 가능)
  const [awayBatters, setAwayBatters] = useState([]);
  const [homeBatters, setHomeBatters] = useState([]);
  const [awayPitchers, setAwayPitchers] = useState([]);
  const [homePitchers, setHomePitchers] = useState([]);

  const [isResultSubmitModalOpen, setIsResultSubmitModalOpen] = useState(false);

  useEffect(() => {
    API.get("/matches/1001/results")
      .then((response) => {
        console.log("GET /matches/1001/results 응답:", response.data);
        const {
          scoreboard,
          awayTeam,
          homeTeam,
          awayBatters,
          homeBatters,
          awayPitchers,
          homePitchers,
        } = response.data;

        // 팀 이름 업데이트 → 읽기 전용 (앞 3글자)
        setTeamAName(awayTeam.name.substring(0, 3));
        setTeamBName(homeTeam.name.substring(0, 3));

        // scoreboard 데이터를 반영하여 팀 점수 업데이트
        const newTeamAScores = [...teamAScores];
        const newTeamBScores = [...teamBScores];
        scoreboard.forEach((item) => {
          const inningIndex = item.inning - 1;
          if (item.inning_half === "TOP") {
            newTeamAScores[inningIndex] = String(item.runs);
          } else if (item.inning_half === "BOT") {
            newTeamBScores[inningIndex] = String(item.runs);
          }
        });
        // 8번째(index 7)와 9번째(index 8) 칸을 팀 정보(총 runs, hits)로 업데이트
        newTeamAScores[7] = String(awayTeam.runs);
        console.log(awayTeam.runs);
        newTeamAScores[8] = String(awayTeam.hits);
        newTeamBScores[7] = String(homeTeam.runs);
        newTeamBScores[8] = String(homeTeam.hits);
        setTeamAScores(newTeamAScores);
        setTeamBScores(newTeamBScores);

        // 타자 기록 매핑 (order와 이름은 plain text, 수정 가능한 값은 EditableInput으로)
        const mappedAwayBatters = awayBatters.map((item) => ({
          order: item.order,
          name: item.playerName,
          ab: item.AB,
          hit: item["1B"],
          bb: item.BB,
          doubles: item["2B"],
          triples: item["3B"],
          hr: item.HR,
        }));
        setAwayBatters(mappedAwayBatters);

        const mappedHomeBatters = homeBatters.map((item) => ({
          order: item.order,
          name: item.playerName,
          ab: item.AB,
          hit: item["1B"],
          bb: item.BB,
          doubles: item["2B"],
          triples: item["3B"],
          hr: item.HR,
        }));
        setHomeBatters(mappedHomeBatters);

        // 투수 기록 매핑 (order와 이름은 plain text, 수정 가능한 값은 EditableInput으로)
        const mappedAwayPitchers = awayPitchers.map((item, idx) => ({
          order: idx + 1,
          name: item.playerName,
          so: item.K,
        }));
        setAwayPitchers(mappedAwayPitchers);

        const mappedHomePitchers = homePitchers.map((item, idx) => ({
          order: idx + 1,
          name: item.playerName,
          so: item.K,
        }));
        setHomePitchers(mappedHomePitchers);
      })
      .catch((error) => {
        console.error("API GET 요청 에러:", error);
      });
  }, []);

  const handleSubmitClick = () => {
    setIsResultSubmitModalOpen(true);
  };

  return (
    <Container>
      {/* 스코어보드 부분 */}
      <ScoreBoardWrapper>
        <InningHeader>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>
              {/* 이닝 헤더는 일반 텍스트 */}
              {inn}
            </InningCell>
          ))}
        </InningHeader>
        <TeamRow>
          <TeamNameCell>{teamAName}</TeamNameCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell key={idx}>
              {/* 빈 문자열이면 수정 불가하도록 readOnly 처리 */}
              <EditableInputScore
                type="number"
                defaultValue={score}
                readOnly={score === ""}
              />
            </TeamScoreCell>
          ))}
        </TeamRow>
        <TeamRow>
          <TeamNameCell>{teamBName}</TeamNameCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell key={idx}>
              <EditableInputScore
                type="number"
                defaultValue={score}
                readOnly={score === ""}
              />
            </TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>

      {/* 원정팀(팀A) 기록 */}
      <TeamTitle>{teamAName} 야구부</TeamTitle>
      {/* 원정팀 타자 기록 */}
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
            </tr>
          </thead>
          <tbody>
            {awayBatters.map((player, idx) => (
              <tr key={idx}>
                <td>{player.order}</td>
                <td>{player.name}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.ab}
                    readOnly={player.ab === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.hit}
                    readOnly={player.hit === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.bb}
                    readOnly={player.bb === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.doubles}
                    readOnly={player.doubles === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.triples}
                    readOnly={player.triples === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.hr}
                    readOnly={player.hr === ""}
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
                <td>{pitcher.order}</td>
                <td>{pitcher.name}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={pitcher.so}
                    readOnly={pitcher.so === ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTableP>
      </TableWrapper>

      {/* 홈팀(팀B) 기록 */}
      <TeamTitle>{teamBName} 야구부</TeamTitle>
      {/* 홈팀 타자 기록 */}
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
            </tr>
          </thead>
          <tbody>
            {homeBatters.map((player, idx) => (
              <tr key={idx}>
                <td>{player.order}</td>
                <td>{player.name}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.ab}
                    readOnly={player.ab === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.hit}
                    readOnly={player.hit === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.bb}
                    readOnly={player.bb === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.doubles}
                    readOnly={player.doubles === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.triples}
                    readOnly={player.triples === ""}
                  />
                </td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={player.hr}
                    readOnly={player.hr === ""}
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
                <td>{pitcher.order}</td>
                <td>{pitcher.name}</td>
                <td>
                  <EditableInput
                    type="number"
                    defaultValue={pitcher.so}
                    readOnly={pitcher.so === ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTableP>
      </TableWrapper>

      {/* 하단 버튼 (수정 불가) */}
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
    </Container>
  );
}
