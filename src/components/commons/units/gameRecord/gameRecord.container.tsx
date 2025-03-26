import React, { useState } from "react";
import {
  GameRecordContainer,
  InningHeader,
  InningCell,
  TeamRow,
  TeamNameCell,
  TeamScoreCell,
  ControlButtonsRow,
  ControlButton,
  InningScoreContainer,
  InningScoreTitle,
  InningScoreControls,
  ScoreButton,
  ScoreDisplay,
  PlayersRow,
  PlayerBox,
  PlayerInfo,
  PlayerChangeButton,
  RecordActionsRow,
  RecordActionButton,
  ScoreBoardWrapper,
  ControlButtonsWrapper,
  PlayerPosition,
  PlayerWrapper,
  EliteBox,
  WildCardBox,
  PlayerExWrapper,
} from "./gameRecord.style";
import HitModal from "../../modals/hitModal";
import OutModal from "../../modals/outModal";
import EtcModal from "../../modals/etcModal";
import DefenseChangeModal from "../../modals/defenseChange";
import GameOverModal from "../../modals/gameOverModal";
import { count } from "console";

export default function GameRecordPage() {
  const inningHeaders = [
    "",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "R",
    "H",
  ];

  // 팀 이름을 별도 state로 관리
  const [teamAName, setTeamAName] = useState("관악사");
  const [teamBName, setTeamBName] = useState("건환공");

  // 팀 A, B 이닝별 점수 (총 11개: 9이닝 + R + H)
  const [teamAScores, setTeamAScores] = useState([
    "0",
    "2",
    "4",
    "",
    "",
    "",
    "",
    "",
    "",
    "6",
    "8",
  ]);
  const [teamBScores, setTeamBScores] = useState([
    "0",
    "3",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "3",
    "5",
  ]);

  // 이번 이닝 득점 (예시)
  const [thisInningScore, setThisInningScore] = useState(0);

  // 간단한 선수 정보 (예시)
  const [batter, setBatter] = useState({
    order: 7,
    name: "김영웅",
    isElite: true,
    isWildCard: true,
    position: "3B",
  });
  const [pitcher, setPitcher] = useState({
    order: 7,
    name: "양현종",
    isElite: false,
    isWildCard: true,
    position: "P",
  });

  // 득점 증가/감소 함수
  const handleScoreIncrement = () => setThisInningScore((prev) => prev + 1);
  const handleScoreDecrement = () =>
    setThisInningScore((prev) => (prev > 0 ? prev - 1 : 0));

  // 모달 상태
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isEtcModalOpen, setIsEtcModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);

  // 공수교대 / 경기종료 버튼 핸들러
  const handleDefenseChange = () => setIsChangeModalOpen(true);
  const handleGameEnd = () => setIsGameEndModalOpen(true);

  // 하단 기록 버튼 핸들러
  const handleRecordAction = (action: string) => {
    switch (action) {
      case "안타":
        setIsHitModalOpen(true);
        break;
      case "아웃":
        setIsOutModalOpen(true);
        break;
      case "볼넷/사구":
        alert("볼넷/사구");
        break;
      case "etc":
        setIsEtcModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <GameRecordContainer>
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

      {/* 3) 공수교대 / 경기종료 버튼 */}
      <ControlButtonsRow>
        <ControlButtonsWrapper>
          <ControlButton onClick={handleDefenseChange}>공수교대</ControlButton>
          <ControlButton onClick={handleGameEnd}>경기종료</ControlButton>
        </ControlButtonsWrapper>
      </ControlButtonsRow>

      {/* 4) 이번 이닝 득점 */}
      <InningScoreContainer>
        <InningScoreTitle>이번 이닝 득점</InningScoreTitle>
        <InningScoreControls>
          <ScoreButton onClick={handleScoreDecrement}>-</ScoreButton>
          <ScoreDisplay>{thisInningScore}</ScoreDisplay>
          <ScoreButton onClick={handleScoreIncrement}>+</ScoreButton>
        </InningScoreControls>
      </InningScoreContainer>

      {/* 5) 현재 타자 / 투수 정보 */}
      <PlayersRow>
        <PlayerBox>
          <PlayerChangeButton onClick={() => alert("타자 교체")}>
            선수교체
          </PlayerChangeButton>
          <PlayerWrapper>
            <PlayerPosition>{batter.position}</PlayerPosition>
            <PlayerInfo>{batter.name}</PlayerInfo>
            <PlayerExWrapper
              count={(batter.isElite ? 1 : 0) + (batter.isWildCard ? 1 : 0)}
            >
              {batter.isElite && <EliteBox>선출</EliteBox>}
              {batter.isWildCard && <WildCardBox>WC</WildCardBox>}
            </PlayerExWrapper>
          </PlayerWrapper>
        </PlayerBox>
        <PlayerBox>
          <PlayerChangeButton onClick={() => alert("투수 교체")}>
            선수교체
          </PlayerChangeButton>
          <PlayerWrapper>
            <PlayerPosition>{pitcher.position}</PlayerPosition>
            <PlayerInfo>{pitcher.name}</PlayerInfo>
            <PlayerExWrapper
              count={(pitcher.isElite ? 1 : 0) + (pitcher.isWildCard ? 1 : 0)}
            >
              {pitcher.isElite && <EliteBox>선출</EliteBox>}
              {pitcher.isWildCard && <WildCardBox>WC</WildCardBox>}
            </PlayerExWrapper>
          </PlayerWrapper>
        </PlayerBox>
      </PlayersRow>
      {/* 6) 하단 기록 입력 버튼들 */}
      <RecordActionsRow>
        <RecordActionButton onClick={() => handleRecordAction("안타")}>
          안타
        </RecordActionButton>
        <RecordActionButton onClick={() => handleRecordAction("볼넷/사구")}>
          볼넷/사구
        </RecordActionButton>
        <RecordActionButton onClick={() => handleRecordAction("아웃")}>
          아웃
        </RecordActionButton>
        <RecordActionButton onClick={() => handleRecordAction("etc")}>
          etc
        </RecordActionButton>
      </RecordActionsRow>

      {/* 모달 렌더링 */}
      {isHitModalOpen && <HitModal setIsHitModalOpen={setIsHitModalOpen} />}
      {isOutModalOpen && <OutModal setIsOutModalOpen={setIsOutModalOpen} />}
      {isEtcModalOpen && <EtcModal setIsEtcModalOpen={setIsEtcModalOpen} />}
      {isChangeModalOpen && (
        <DefenseChangeModal setIsChangeModalOpen={setIsChangeModalOpen} />
      )}
      {isGameEndModalOpen && (
        <GameOverModal setIsGameEndModalOpen={setIsGameEndModalOpen} />
      )}
    </GameRecordContainer>
  );
}
