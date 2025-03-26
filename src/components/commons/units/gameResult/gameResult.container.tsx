import React from "react";
import {
  Container,
  ScoreBoardWrapper,
  InningHeader,
  InningCell,
  TeamScoreRow,
  TeamScoreCell,
  TeamTitle,
  TableWrapper,
  TableTitle,
  RecordTable,
} from "./gameResult.style";

export default function FinalGameRecordPage() {
  /* 
    1) 이닝 헤더
    - 1~9, R, H 총 11개
    - 맨 왼쪽 열은 비워둠(혹은 "Team" 등) => 총 12열
  */
  const inningHeaders = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "R", "H"];

  /* 
    2) 팀 이름과 점수
    - 첫 칸(팀명) + 11개 점수 = 총 12열
  */
  const teamAName = "관악";
  const teamBName = "건환";

  // 예시: 1~9회 + R + H
  const teamAScores = ["0", "2", "2", "0", "", "", "", "", "", "4", "4"];
  const teamBScores = ["0", "1", "3", "", "", "", "", "", "", "5", "6"];

  /* 
    3) 타자 기록 (예시 데이터)
    - order: 타순
    - name: 이름
    - ab: 타수
    - hit: 안타
    - bb: 볼넷
  */
  const batterRecords = [
    { order: 1, name: "김지한", ab: 2, hit: 1, bb: 2 },
    { order: 2, name: "이재현", ab: 2, hit: 1, bb: 1 },
    { order: 3, name: "황수호", ab: 2, hit: 1, bb: 0 },
    { order: 4, name: "김민석", ab: 3, hit: 2, bb: 0 },
    { order: 5, name: "김민석", ab: 1, hit: 0, bb: 2 },
    { order: 6, name: "김민석", ab: 1, hit: 0, bb: 1 },
  ];

  /*
    4) 투수 기록 (예시 데이터)
    - name: 투수 이름
    - so: 삼진
  */
  const pitcherRecords = [{ name: "발라조빅", so: 5 }];

  return (
    <Container>
      {/* 상단 점수판 */}
      <ScoreBoardWrapper>
        {/* 이닝 헤더 (첫 칸 비움) */}
        <InningHeader>
          <InningCell></InningCell>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>{inn}</InningCell>
          ))}
        </InningHeader>

        {/* 팀 A 점수 행 (첫 칸: 팀명) */}
        <TeamScoreRow>
          <TeamScoreCell>{teamAName}</TeamScoreCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamScoreRow>

        {/* 팀 B 점수 행 */}
        <TeamScoreRow>
          <TeamScoreCell>{teamBName}</TeamScoreCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamScoreRow>
      </ScoreBoardWrapper>

      {/* 팀 이름 (예: "관악사 야구부") */}
      <TeamTitle>관악사 야구부</TeamTitle>

      {/* 타자 기록 테이블 */}
      <TableWrapper>
        <TableTitle>타자기록</TableTitle>
        <RecordTable>
          <thead>
            <tr>
              <th>#</th>
              <th>이름</th>
              <th>타수</th>
              <th>안타</th>
              <th>볼넷</th>
            </tr>
          </thead>
          <tbody>
            {batterRecords.map((player, idx) => (
              <tr key={idx}>
                <td>{player.order}</td>
                <td>{player.name}</td>
                <td>{player.ab}</td>
                <td>{player.hit}</td>
                <td>{player.bb}</td>
              </tr>
            ))}
          </tbody>
        </RecordTable>
      </TableWrapper>

      {/* 투수 기록 테이블 */}
      <TableWrapper>
        <TableTitle>투수기록</TableTitle>
        <RecordTable>
          <thead>
            <tr>
              <th>이름</th>
              <th>삼진</th>
            </tr>
          </thead>
          <tbody>
            {pitcherRecords.map((pitcher, idx) => (
              <tr key={idx}>
                <td>{pitcher.name}</td>
                <td>{pitcher.so}</td>
              </tr>
            ))}
          </tbody>
        </RecordTable>
      </TableWrapper>
    </Container>
  );
}
