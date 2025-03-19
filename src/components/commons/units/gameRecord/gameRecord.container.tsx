import React, { useState } from "react";
import {
  GameRecordContainer,
  InningHeader,
  InningCell,
  TeamScoreRow,
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
} from "./gameRecord.style";
import HitModal from "../../modals/hitModal";
import OutModal from "../../modals/outModal";
import EtcModal from "../../modals/etcModal";
import DefenseChangeModal from "../../modals/defenseChange";
import GameOverModal from "../../modals/gameOverModal";

export default function GameRecordPage() {
  // 상단 이닝 헤더 (첫 번째 열: "Team", 이후 1~9, R, H)
  const inningHeaders = [
    "Team",
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
  const [teamAName, setTeamAName] = useState("관악");
  const [teamBName, setTeamBName] = useState("건환");

  // 팀 A 이닝별 점수 (9이닝 + R + H = 총 11개)
  const [teamAScores, setTeamAScores] = useState([
    "0", // 1회
    "2", // 2회
    "4", // 3회
    "", // 4회
    "", // 5회
    "", // 6회
    "", // 7회
    "", // 8회
    "", // 9회
    "6", // R
    "8", // H
  ]);

  // 팀 B 이닝별 점수
  const [teamBScores, setTeamBScores] = useState([
    "0", // 1회
    "3", // 2회
    "", // 3회
    "", // 4회
    "", // 5회
    "", // 6회
    "", // 7회
    "", // 8회
    "", // 9회
    "3", // R
    "5", // H
  ]);

  // 이번 이닝 득점 (예시)
  const [thisInningScore, setThisInningScore] = useState(0);

  // 간단한 선수 정보 (예시)
  const [batter, setBatter] = useState({
    name: "7번 김영웅(선출)",
    position: "3B",
  });
  const [pitcher, setPitcher] = useState({
    name: "양현종(WC)",
    position: "P",
  });

  // 득점 증가 / 감소
  const handleScoreIncrement = () => {
    setThisInningScore((prev) => prev + 1);
  };
  const handleScoreDecrement = () => {
    setThisInningScore((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // 모달 상태
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isEtcModalOpen, setIsEtcModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);

  // 공수교대 / 경기종료 버튼
  const handleDefenseChange = () => {
    setIsChangeModalOpen(true);
  };

  const handleGameEnd = () => {
    setIsGameEndModalOpen(true);
  };

  // 하단 기록 버튼 클릭
  const handleRecordAction = (action: string) => {
    if (action === "안타") {
      // 안타 버튼을 누르면 모달 오픈
      setIsHitModalOpen(true);
    } else if (action === "아웃") {
      // 아웃 버튼을 누르면 모달 오픈
      setIsOutModalOpen(true);
    } else if (action === "etc") {
      // etc 버튼을 누르면 모달 오픈
      setIsEtcModalOpen(true);
    } else if (action === "볼넷/사구") {
      // 볼넷사구구 버튼을 누르면 모달 오픈
      alert(`기록: ${action}`);
    } else {
      alert("다시 선택해주세요");
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

        {/* 2) 팀 A 점수 (첫 번째 셀: 팀명, 이후 1~9, R, H) */}
        <TeamScoreRow>
          {[teamAName, ...teamAScores].map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamScoreRow>

        {/* 2) 팀 B 점수 */}
        <TeamScoreRow>
          {[teamBName, ...teamBScores].map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamScoreRow>
      </ScoreBoardWrapper>

      {/* 3) 공수교대 / 경기종료 버튼 */}
      <ControlButtonsRow>
        <ControlButton onClick={handleDefenseChange}>공수교대</ControlButton>
        <ControlButton onClick={handleGameEnd}>경기종료</ControlButton>
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
          <PlayerInfo>
            {batter.name} <br /> {batter.position}
          </PlayerInfo>
          <PlayerChangeButton onClick={() => alert("타자 교체")}>
            선수교체
          </PlayerChangeButton>
        </PlayerBox>
        <PlayerBox>
          <PlayerInfo>
            {pitcher.name} <br /> {pitcher.position}
          </PlayerInfo>
          <PlayerChangeButton onClick={() => alert("투수 교체")}>
            선수교체
          </PlayerChangeButton>
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
      {/* 모달 */}
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
