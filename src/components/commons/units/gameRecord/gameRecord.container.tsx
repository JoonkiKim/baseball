import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  OrderBadge,
  WildCardBoxNone,
} from "./gameRecord.style";
import HitModal from "../../modals/hitModal";
import OutModal from "../../modals/outModal";
import EtcModal from "../../modals/etcModal";
import DefenseChangeModal from "../../modals/defenseChange";
import GameOverModal from "../../modals/gameOverModal";
import API from "../../../../commons/apis/api";
import {
  awayBatterNumberState,
  homeBatterNumberState,
  substitutionSwappedState,
} from "../../../../commons/stores";
import { useRecoilState } from "recoil";

export default function GameRecordPage() {
  const router = useRouter();

  // 이닝 헤더: 7회까지, R(총점), H(안타) 컬럼 포함
  const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];

  // 팀 이름 상태
  const [teamAName, setTeamAName] = useState("키움");
  const [teamBName, setTeamBName] = useState("삼성");

  // 팀 A, B 이닝별 점수 (7이닝 기준)
  const [teamAScores, setTeamAScores] = useState(new Array(7).fill(""));
  const [teamBScores, setTeamBScores] = useState(new Array(7).fill(""));

  // 이번 이닝 득점
  const [thisInningScore, setThisInningScore] = useState(0);

  // 간단한 선수 정보 초기값 (예시)
  const [batter, setBatter] = useState({
    order: 0,
    playerId: 0,
    playerName: "-",
    isElite: false,
    isWc: false,
    position: "-",
  });
  const [pitcher, setPitcher] = useState({
    order: 0,
    playerId: 0,
    playerName: "-",
    isElite: false,
    isWc: false,
    position: "P",
  });
  const [batterPlayerId, setBatterPlayerId] = useState(0);

  // batter number를 홈과 원정으로 각각 관리 (홈: 1~9, 원정: 101~109)
  const [homeBatterNumber, setHomeBatterNumber] = useRecoilState(
    homeBatterNumberState
  );
  const [awayBatterNumber, setAwayBatterNumber] = useRecoilState(
    awayBatterNumberState
  );

  const [isSubstitutionSwapped, setIsSubstitutionSwapped] = useRecoilState(
    substitutionSwappedState
  );

  // 선수교체 호출 시 기존 매핑 여부 (true: 기본, false: 변경된 요청)

  // 페이지 접속 시 이닝 점수 GET 요청
  useEffect(() => {
    async function fetchInningScores() {
      try {
        const res = await API.get("/matches/1001/inning-scores");
        console.log(res.data);
        const response =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const newTeamAScores = new Array(7).fill("");
        const newTeamBScores = new Array(7).fill("");
        if (response.scores && Array.isArray(response.scores)) {
          response.scores.forEach((scoreEntry) => {
            const inningIndex = scoreEntry.inning - 1;
            if (inningIndex >= 0 && inningIndex < 7) {
              if (scoreEntry.inning_half === "TOP") {
                newTeamAScores[inningIndex] = scoreEntry.runs;
              } else if (scoreEntry.inning_half === "BOT") {
                newTeamBScores[inningIndex] = scoreEntry.runs;
              }
            }
          });
        }
        setTeamAScores(newTeamAScores);
        setTeamBScores(newTeamBScores);
      } catch (error) {
        console.error("이닝 점수 데이터를 가져오는데 오류 발생:", error);
      }
    }
    fetchInningScores();
  }, []);

  // batter API 요청: isSubstitutionSwapped에 따라 homeBatterNumber 또는 awayBatterNumber 사용
  useEffect(() => {
    async function fetchBatter() {
      try {
        const endpoint = isSubstitutionSwapped
          ? `/matches/1001/lineup/${homeBatterNumber}`
          : `/matches/1001/lineup/${awayBatterNumber}`;
        const res = await API.get(endpoint);
        setBatter(res.data);
      } catch (error) {
        console.error("batter 데이터를 가져오는데 오류 발생:", error);
      }
    }
    fetchBatter();
  }, [isSubstitutionSwapped, homeBatterNumber, awayBatterNumber]);

  // pitcher API 요청: isSubstitutionSwapped에 따라 URL 결정
  useEffect(() => {
    async function fetchPitcher() {
      try {
        const endpoint = isSubstitutionSwapped
          ? "/matches/1001/lineup/pitcher"
          : "/matches/1001/lineup/pitcher-away";
        const res = await API.get(endpoint);
        setPitcher(res.data);
      } catch (error) {
        console.error("pitcher 데이터를 가져오는데 오류 발생:", error);
      }
    }
    fetchPitcher();
  }, [isSubstitutionSwapped]);

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

  // 하단 기록 버튼 핸들러
  const handleRecordAction = async (action) => {
    setBatterPlayerId(batter.playerId);
    switch (action) {
      case "안타":
        setIsHitModalOpen(true);
        break;
      case "아웃":
        setIsOutModalOpen(true);
        break;
      case "볼넷/사구":
        try {
          const endpoint = `/matches/1001/batters/${batter.playerId}/plate-appearance`;
          const requestBody = { result: "BB" };
          const { data } = await API.post(endpoint, requestBody);
          alert(`볼넷/사구 기록 전송 완료\n응답값: ${JSON.stringify(data)}`);
          // 현재 노출 중인 batter 번호를 증가시키는데, wrap-around 처리
          if (isSubstitutionSwapped) {
            setHomeBatterNumber((prev) => (prev < 9 ? prev + 1 : 1));
          } else {
            setAwayBatterNumber((prev) => (prev < 109 ? prev + 1 : 101));
          }
        } catch (error) {
          console.error("볼넷/사구 기록 전송 오류:", error);
          alert("볼넷/사구 기록 전송 오류");
        }
        break;
      case "etc":
        setIsEtcModalOpen(true);
        break;
      default:
        break;
    }
  };

  // 선수교체 버튼 클릭 시 substitution 페이지로 이동 (쿼리로 isHomeTeam 전달)
  const handleSubstitution = (isHomeTeamParam: boolean) => {
    router.push({
      pathname: "/matches/1001/substitution",
      query: { isHomeTeam: isHomeTeamParam },
    });
  };

  // DefenseChangeModal의 "예" 버튼을 누르면 isSubstitutionSwapped 상태 토글
  const handleDefenseChangeConfirm = () => {
    setIsSubstitutionSwapped((prev) => !prev);
  };

  return (
    <GameRecordContainer>
      <ScoreBoardWrapper>
        <InningHeader>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>{inn}</InningCell>
          ))}
        </InningHeader>

        <TeamRow>
          <TeamNameCell>{teamAName}</TeamNameCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamRow>

        <TeamRow>
          <TeamNameCell>{teamBName}</TeamNameCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell key={idx}>{score}</TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>

      <ControlButtonsRow>
        <ControlButtonsWrapper>
          <ControlButton onClick={() => setIsChangeModalOpen(true)}>
            공수교대
          </ControlButton>
          <ControlButton onClick={() => setIsGameEndModalOpen(true)}>
            경기종료
          </ControlButton>
        </ControlButtonsWrapper>
      </ControlButtonsRow>

      <InningScoreContainer>
        <InningScoreTitle>이번 이닝 득점</InningScoreTitle>
        <InningScoreControls>
          <ScoreButton onClick={handleScoreDecrement}>-</ScoreButton>
          <ScoreDisplay>{thisInningScore}</ScoreDisplay>
          <ScoreButton onClick={handleScoreIncrement}>+</ScoreButton>
        </InningScoreControls>
      </InningScoreContainer>

      <PlayersRow>
        <PlayerBox>
          <PlayerChangeButton
            onClick={() =>
              handleSubstitution(isSubstitutionSwapped ? true : false)
            }
          >
            선수교체({isSubstitutionSwapped ? "홈" : "원정"})
          </PlayerChangeButton>
          <OrderBadge>{batter.order}번</OrderBadge>
          <PlayerWrapper>
            <PlayerPosition>{batter.position}</PlayerPosition>
            <PlayerInfo>{batter.playerName}</PlayerInfo>
            <PlayerExWrapper
              count={(batter.isElite ? 1 : 0) + (batter.isWc ? 1 : 0)}
            >
              {batter.isElite && batter.isWc ? (
                <>
                  <EliteBox>선출</EliteBox>
                  <WildCardBox>WC</WildCardBox>
                </>
              ) : batter.isElite ? (
                <EliteBox>선출</EliteBox>
              ) : batter.isWc ? (
                <WildCardBox>WC</WildCardBox>
              ) : (
                <WildCardBoxNone />
              )}
            </PlayerExWrapper>
          </PlayerWrapper>
        </PlayerBox>
        <PlayerBox>
          <PlayerChangeButton
            onClick={() =>
              handleSubstitution(isSubstitutionSwapped ? false : true)
            }
          >
            선수교체({isSubstitutionSwapped ? "원정" : "홈"})
          </PlayerChangeButton>
          <PlayerWrapper>
            <PlayerPosition>P</PlayerPosition>
            <PlayerInfo>{pitcher.playerName}</PlayerInfo>
            <PlayerExWrapper
              count={(pitcher.isElite ? 1 : 0) + (pitcher.isWc ? 1 : 0)}
            >
              {pitcher.isElite && pitcher.isWc ? (
                <>
                  <EliteBox>선출</EliteBox>
                  <WildCardBox>WC</WildCardBox>
                </>
              ) : pitcher.isElite ? (
                <EliteBox>선출</EliteBox>
              ) : pitcher.isWc ? (
                <WildCardBox>WC</WildCardBox>
              ) : (
                <WildCardBoxNone />
              )}
            </PlayerExWrapper>
          </PlayerWrapper>
        </PlayerBox>
      </PlayersRow>

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

      {isHitModalOpen && (
        <HitModal
          setIsHitModalOpen={setIsHitModalOpen}
          playerId={batterPlayerId}
        />
      )}
      {isOutModalOpen && (
        <OutModal
          setIsOutModalOpen={setIsOutModalOpen}
          playerId={pitcher.playerId}
        />
      )}
      {isEtcModalOpen && (
        <EtcModal
          setIsEtcModalOpen={setIsEtcModalOpen}
          playerId={pitcher.playerId}
        />
      )}
      {isChangeModalOpen && (
        <DefenseChangeModal
          setIsChangeModalOpen={setIsChangeModalOpen}
          onConfirm={handleDefenseChangeConfirm}
        />
      )}
      {isGameEndModalOpen && (
        <GameOverModal setIsGameEndModalOpen={setIsGameEndModalOpen} />
      )}
    </GameRecordContainer>
  );
}
