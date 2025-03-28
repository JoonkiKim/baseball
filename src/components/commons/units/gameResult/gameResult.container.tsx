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
  ControlButton,
  HomeButton,
  ButtonContainer,
  RecordTableP,
} from "./gameResult.style";

// 2) 팀 이름과 점수
// - 첫 칸(팀명) + 11개 점수 = 총 12열
// */
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
  {
    order: 1,
    name: "김지찬",
    ab: 2,
    hit: 1,
    bb: 2,
    doubles: 0,
    triples: 0,
    hr: 0,
  },
  {
    order: 2,
    name: "이재현",
    ab: 2,
    hit: 1,
    bb: 1,
    doubles: 1,
    triples: 0,
    hr: 1,
  },
  {
    order: "↑",
    name: "양도근",
    ab: 2,
    hit: 1,
    bb: 1,
    doubles: 0,
    triples: 0,
    hr: 0,
  },
  {
    order: 3,
    name: "구자욱",
    ab: 2,
    hit: 1,
    bb: 0,
    doubles: 0,
    triples: 1,
    hr: 0,
  },
  {
    order: 4,
    name: "강민호",
    ab: 3,
    hit: 2,
    bb: 0,
    doubles: 1,
    triples: 0,
    hr: 0,
  },
  {
    order: 5,
    name: "김민석",
    ab: 1,
    hit: 0,
    bb: 2,
    doubles: 0,
    triples: 0,
    hr: 0,
  },
  {
    order: 6,
    name: "김민석",
    ab: 1,
    hit: 0,
    bb: 1,
    doubles: 0,
    triples: 0,
    hr: 1,
  },
  {
    order: 7,
    name: "김민석",
    ab: 1,
    hit: 0,
    bb: 1,
    doubles: 1,
    triples: 0,
    hr: 0,
  },
  {
    order: 8,
    name: "김민석",
    ab: 1,
    hit: 0,
    bb: 1,
    doubles: 0,
    triples: 1,
    hr: 0,
  },
  {
    order: 9,
    name: "김민석",
    ab: 1,
    hit: 0,
    bb: 1,
    doubles: 0,
    triples: 0,
    hr: 0,
  },
];

/*
4) 투수 기록 (예시 데이터)
- name: 투수 이름
- so: 삼진
*/
const pitcherRecords = [
  { order: 1, name: "발라조빅", so: 5 },
  { order: 2, name: "정현우", so: 5 },
  { order: 3, name: "배찬승", so: 5 },
  { order: 4, name: "정우주", so: 5 },
  { order: 5, name: "윤동현", so: 5 },
  { order: 6, name: "김준기", so: 5 },
  { order: 7, name: "로젠버그", so: 5 },
  { order: 8, name: "후라도", so: 5 },
  { order: 9, name: "레예스", so: 5 },
  { order: 10, name: "원태인", so: 5 },
  { order: 11, name: "최동원", so: 5 },
  { order: 12, name: "선동열", so: 5 },
  { order: 13, name: "류현진", so: 5 },
  { order: 14, name: "윤석민", so: 5 },
  { order: 15, name: "김광현", so: 5 },
  { order: 16, name: "김서현", so: 5 },
  { order: 17, name: "문동주", so: 5 },
];

export default function FinalGameRecordPage() {
  /* 
    1) 이닝 헤더
    - 1~9, R, H 총 11개
    - 맨 왼쪽 열은 비워둠(혹은 "Team" 등) => 총 12열
  */
  const inningHeaders = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "R", "H"];

  return (
    <Container>
      <ScoreBoardWrapper>
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
              <th></th>
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
            {batterRecords.map((player, idx) => (
              <tr key={idx}>
                <td>{player.order}</td>
                <td>{player.name}</td>
                <td>{player.ab}</td>
                <td>{player.hit}</td>
                <td>{player.bb}</td>
                <td>{player.doubles}</td>
                <td>{player.triples}</td>
                <td>{player.hr}</td>
              </tr>
            ))}
          </tbody>
        </RecordTable>
      </TableWrapper>

      {/* 투수 기록 테이블 */}
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
            {pitcherRecords.map((pitcher, idx) => (
              <tr key={idx}>
                <td>{pitcher.order}</td>
                <td>{pitcher.name}</td>
                <td>{pitcher.so}</td>
              </tr>
            ))}
          </tbody>
        </RecordTableP>
      </TableWrapper>
      <ButtonContainer>
        <HomeButton>홈으로</HomeButton>
        <ControlButton>제출하기</ControlButton>
      </ButtonContainer>
    </Container>
  );
}
