import React, { useState } from "react";
import {
  Container,
  ScoreBoardWrapper,
  InningHeader,
  InningCell,
  // TeamScoreRow,
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
} from "./gameResult.style";
import Link from "next/link";
import { useRouter } from "next/router";
import ResultSubmitModal from "../../modals/submitModal/resultSubmitModal";

// 홈팀 데이터
const teamAName = "관악사";
const teamBName = "건환공";

// 예시: 1~9회 + R + H
const teamAScores = ["0", "2", "4", "0", "", "", "", "6", "4"];
const teamBScores = ["0", "1", "3", "", "", "", "", "4", "6"];

/* 
  홈팀 타자 기록 (예시 데이터)
  - order: 타순
  - ab: 타수, hit: 안타, bb: 볼넷, doubles: 2루타, triples: 3루타, hr: 홈런
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
  홈팀 투수 기록 (예시 데이터)
  - order: 투구 순서, so: 삼진
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
];

/* 
  원정팀 타자 기록 (예시 데이터 - 건환공)
  홈팀과 동일한 데이터를 사용 (예시)
*/
const batterRecordsAway = [
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
  원정팀 투수 기록 (예시 데이터 - 건환공)
*/
const pitcherRecordsAway = [
  { order: 1, name: "레예스", so: 5 },
  { order: 2, name: "원태인", so: 4 },
  { order: 3, name: "최동원", so: 4 },
  { order: 4, name: "선동열", so: 3 },
  { order: 5, name: "류현진", so: 2 },
  { order: 6, name: "윤석민", so: 5 },
  { order: 7, name: "김광현", so: 6 },
  { order: 8, name: "김서현", so: 7 },
  { order: 9, name: "문동주", so: 1 },
];

export default function FinalGameRecordPage() {
  const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];
  const router = useRouter();
  const [isResultSubmitModalOpen, setIsResultSubmitModalOpen] = useState(false);

  // 제출하기 버튼 클릭 시 호출되는 함수
  // 제출하기 버튼 클릭 시 모달을 열기 위한 함수
  const handleSubmitClick = () => {
    setIsResultSubmitModalOpen(true);
  };

  return (
    <Container>
      <ScoreBoardWrapper>
        {/* 1) 이닝 헤더 */}
        <InningHeader>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>{inn}</InningCell>
          ))}
        </InningHeader>

        {/* 2) 팀 A 점수 행 */}
        <TeamRow>
          <TeamNameCell>{teamAName}</TeamNameCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamRow>

        {/* 2) 팀 B 점수 행 */}
        <TeamRow>
          <TeamNameCell>{teamBName}</TeamNameCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>
      {/* 팀명 */}
      <TeamTitle>관악사 야구부</TeamTitle>

      {/* 홈팀 타자 기록 테이블 */}
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

      {/* 홈팀 투수 기록 테이블 */}

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

      {/* 원정팀(건환공) 타자 기록 테이블 */}
      <TeamTitle>{teamBName}</TeamTitle>
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
            {batterRecordsAway.map((player, idx) => (
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

      {/* 원정팀(건환공) 투수 기록 테이블 */}
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
            {pitcherRecordsAway.map((pitcher, idx) => (
              <tr key={idx}>
                <td>{pitcher.order}</td>
                <td>{pitcher.name}</td>
                <td>{pitcher.so}</td>
              </tr>
            ))}
          </tbody>
        </RecordTableP>
      </TableWrapper>

      {/* 홈으로 & 제출하기 버튼 */}
      <ButtonContainer>
        <Link href="/" passHref>
          <a>
            <HomeButton>홈으로</HomeButton>
          </a>
        </Link>
        <ControlButton onClick={handleSubmitClick}>제출하기</ControlButton>
      </ButtonContainer>
      {/* 모달 조건부 렌더링 */}
      {isResultSubmitModalOpen && (
        <ResultSubmitModal
          setIsResultSubmitModalOpen={setIsResultSubmitModalOpen}
        />
      )}
    </Container>
  );
}
