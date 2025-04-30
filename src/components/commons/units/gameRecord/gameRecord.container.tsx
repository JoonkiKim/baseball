// GameRecordPage.jsx

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
  PlayerInfo,
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
import ScorePatchModal from "../../modals/scorePatchModal";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";

interface ISelectedCell {
  score: string;
  team: "A" | "B";
  index: number; // 해당 셀의 인덱스 (0 기반)
}

export default function GameRecordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이닝 헤더: 7회까지, R(총점), H(안타) 컬럼 포함
  const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];

  // 팀 이름 상태
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  // 팀 A, B 이닝별 점수 (7이닝 기준) + R, H 포함 시 9칸
  const [teamAScores, setTeamAScores] = useState(new Array(7).fill(""));
  const [teamBScores, setTeamBScores] = useState(new Array(7).fill(""));
  // 페이지 로드 시 로컬스토리지에서 팀 이름 읽어오기
  useEffect(() => {
    const matchStr = localStorage.getItem("selectedMatch");
    if (!matchStr) return;
    try {
      const { awayTeam, homeTeam } = JSON.parse(matchStr);
      setTeamAName(awayTeam.name);
      setTeamBName(homeTeam.name);
    } catch (error) {
      const errorCode = error?.response?.data?.error_code; // 에러코드 추출
      console.error(error, "error_code:", errorCode);
      console.error("selectedMatch 파싱 실패");
    }
  }, []);

  // 이번 이닝 득점
  const [thisInningScore, setThisInningScore] = useState(0);

  // 선수 정보
  const [batter, setBatter] = useState({
    battingOrder: 0,
    playerId: 0,
    playerName: "-",
    isElite: false,
    isWc: false,
    position: "-",
  });
  const [pitcher, setPitcher] = useState({
    battingOrder: 0,
    playerId: 0,
    playerName: "-",
    isElite: false,
    isWc: false,
    position: "P",
  });
  const [batterPlayerId, setBatterPlayerId] = useState(0);

  const [homeBatterNumber, setHomeBatterNumber] = useRecoilState(
    homeBatterNumberState
  );
  const [awayBatterNumber, setAwayBatterNumber] = useRecoilState(
    awayBatterNumberState
  );
  const [isSubstitutionSwapped, setIsSubstitutionSwapped] = useRecoilState(
    substitutionSwappedState
  );

  // 페이지 접속 시 이닝 점수 GET 요청
  const [attackSet, setAttackSet] = useState(false);

  useEffect(() => {
    async function fetchInningScores() {
      try {
        console.log(router.query.recordId);
        console.log(router.query);
        const res = await API.get(`/games/${router.query.recordId}/scores`);
        console.log(res.data.scoreboard);
        // const response =
        //   typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const response = res.data;

        // 1~7회 점수 채우기
        const newTeamAScores = new Array(9).fill("");
        const newTeamBScores = new Array(9).fill("");

        if (response.scoreboard && Array.isArray(response.scoreboard)) {
          response.scoreboard.forEach((scoreEntry) => {
            const inningIndex = scoreEntry.inning - 1;
            if (inningIndex >= 0 && inningIndex < 7) {
              if (scoreEntry.inningHalf === "TOP") {
                newTeamAScores[inningIndex] = scoreEntry.runs;
              } else if (scoreEntry.inningHalf === "BOT") {
                newTeamBScores[inningIndex] = scoreEntry.runs;
              }
            }
          });
        }

        // R, H 컬럼 채우기
        newTeamAScores[7] = response.teamSummary.home.runs;
        newTeamAScores[8] = response.teamSummary.away.hits;

        newTeamBScores[7] = response.teamSummary.away.runs;
        newTeamBScores[8] = response.teamSummary.home.hits;

        setTeamAScores(newTeamAScores);
        setTeamBScores(newTeamBScores);

        // attack 쿼리 매번 재설정
        let attackValue = "away";
        if (
          response.scoreboard &&
          Array.isArray(response.scoreboard) &&
          response.scoreboard.length > 0
        ) {
          const lastScore = response.scoreboard[response.scoreboard.length - 1];
          attackValue = lastScore.inningHalf === "TOP" ? "home" : "away";
        }
        router.replace({
          pathname: router.pathname,
          query: { ...router.query, attack: attackValue },
        });
        console.log(attackValue);
      } catch (error) {
        const errorCode = error?.response?.data?.error_code; // 에러코드 추출
        console.error(error, "error_code:", errorCode);
        console.error("이닝 점수 데이터를 가져오는데 오류 발생:", error);
      }
    }
    fetchInningScores();
  }, [router.query.recordId]);

  // batter API 요청
  useEffect(() => {
    async function fetchBatter() {
      // if (!router.query.recordId || !router.query.attack) return;
      try {
        const teamType = router.query.attack === "home" ? "home" : "away";
        const res = await API.get(
          `/games/${router.query.recordId}/current-batter?teamType=${teamType}`
        );
        setBatter(res.data);
      } catch (error) {
        const errorCode = error?.response?.data?.error_code; // 에러코드 추출
        console.error(error, "error_code:", errorCode);
        console.error("batter 데이터를 가져오는데 오류 발생:", error);
      }
    }
    fetchBatter();
  }, [router.query.recordId, router.query.attack, router.asPath]);

  // pitcher API 요청
  useEffect(() => {
    async function fetchPitcher() {
      // if (!router.query.recordId || !router.query.attack) return;
      try {
        const teamType = router.query.attack === "home" ? "away" : "home";
        const res = await API.get(
          `/games/${router.query.recordId}/current-pitcher?teamType=${teamType}`
        );
        setPitcher(res.data);
      } catch (error) {
        const errorCode = error?.response?.data?.error_code; // 에러코드 추출
        console.error(error, "error_code:", errorCode);
        console.error("pitcher 데이터를 가져오는데 오류 발생:", error);
      }
    }
    fetchPitcher();
  }, [router.query.recordId, router.query.attack]);

  // 득점 +/-
  const handleScoreIncrement = () => setThisInningScore((prev) => prev + 1);
  const handleScoreDecrement = () =>
    setThisInningScore((prev) => (prev > 0 ? prev - 1 : 0));

  // 모달들
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isEtcModalOpen, setIsEtcModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);

  // 스코어 패치 모달
  const [isScorePatchModalOpen, setIsScorePatchModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<ISelectedCell | null>(null);

  // 기록 버튼 핸들러
  const handleRecordAction = async (action: string) => {
    setBatterPlayerId(batter.playerId);
    switch (action) {
      case "안타":
        setIsHitModalOpen(true);
        break;
      case "아웃":
        setIsOutModalOpen(true);
        break;
      case "볼넷/사구":
        if (isSubmitting) return; // 이미 요청 중이면 무시
        setIsSubmitting(true);
        try {
          const endpoint = `/games/${router.query.recordId}/plate-appearance`;
          const requestBody = { result: "BB" };
          const { data } = await API.post(endpoint, requestBody);
          // alert(`볼넷/사구 기록 전송 완료\n응답값: ${JSON.stringify(data)}`)
          alert(`기록 전송 완료\n` + `볼넷/사구`);
        } catch (error) {
          const errorCode = error?.response?.data?.error_code; // 에러코드 추출
          console.error(error, "error_code:", errorCode);
          console.error("볼넷/사구 기록 전송 오류:", error);
          alert("볼넷/사구 기록 전송 오류");
        } finally {
          router.reload();
          setIsSubmitting(false);
        }
        break;
      case "etc":
        setIsEtcModalOpen(true);
        break;
      default:
        break;
    }
  };

  // 선수 교체
  const handleSubstitution = (attackTeam: boolean) => {
    const isHomeTeam =
      router.query.attack === "home" ? attackTeam : !attackTeam;
    router.push({
      pathname: `/matches/${router.query.recordId}/substitution`,
      query: { isHomeTeam },
    });
  };

  // 공수교대 확인
  const handleDefenseChangeConfirm = async () => {
    if (isSubmitting) return; // 이미 요청 중이면 무시
    setIsSubmitting(true);
    try {
      const gameId = router.query.recordId;
      const endpoint = `/games/${gameId}/scores`;
      const requestBody = { runs: thisInningScore };
      console.log(requestBody);
      await API.post(endpoint, requestBody);
      console.log("이닝 득점 전송완료", requestBody);
      alert("공수교대 완료");
      router.reload();
      setThisInningScore(0);
    } catch (error) {
      const errorCode = error?.response?.data?.error_code; // 에러코드 추출
      console.error(error, "error_code:", errorCode);
      console.error("이닝 득점 전송 오류:", error);
    } finally {
      setIsSubmitting(false);
      setIsSubstitutionSwapped((prev) => !prev);
    }
  };

  // ★★★ 스코어 셀 클릭 핸들러 ★★★
  // 7, 8번 인덱스(R, H)는 클릭 불가 + score가 빈("") 경우도 클릭 불가
  const handleScoreCellClick = (
    score: string | number,
    team: "A" | "B",
    idx: number
  ) => {
    // 빈 문자열이거나, 7 or 8 인덱스면 모달 열지 않음
    if (score === "" || score == null || idx === 7 || idx === 8) {
      return;
    }
    // 그 외에는 모달 열기
    setSelectedCell({ score: String(score), team, index: idx });
    setIsScorePatchModalOpen(true);
  };
  const ModalWrapper = ({ children, onClose }) => (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // 필요에 따라 모달 크기나 패딩을 조절하세요
          backgroundColor: "#fff",
          borderRadius: "8px",
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <GameRecordContainer>
      <ScoreBoardWrapper>
        <InningHeader>
          {inningHeaders.map((inn, idx) => (
            <InningCell key={idx}>{inn}</InningCell>
          ))}
        </InningHeader>

        {/* Team A (원정) */}
        <TeamRow>
          <TeamNameCell>{teamAName}</TeamNameCell>
          {teamAScores.map((score, idx) => (
            <TeamScoreCell
              key={idx}
              onClick={() => handleScoreCellClick(score as string, "A", idx)}
            >
              {score}
            </TeamScoreCell>
          ))}
        </TeamRow>

        {/* Team B (홈) */}
        <TeamRow>
          <TeamNameCell>{teamBName}</TeamNameCell>
          {teamBScores.map((score, idx) => (
            <TeamScoreCell
              key={idx}
              onClick={() => handleScoreCellClick(score as string, "B", idx)}
            >
              {score}
            </TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>

      <ControlButtonsRow>
        <ControlButtonsWrapper>
          <ControlButton
            onClick={() => setIsChangeModalOpen(true)}
            disabled={isSubmitting}
          >
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
          <PlayerChangeButton onClick={() => handleSubstitution(true)}>
            선수교체
            {/* ({router.query.attack === "home" ? "홈" : "원정"}) */}
          </PlayerChangeButton>
          <OrderBadge>{batter.battingOrder}번</OrderBadge>
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
          <PlayerChangeButton onClick={() => handleSubstitution(false)}>
            선수교체
            {/* ({router.query.attack === "home" ? "원정" : "홈"}) */}
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
        <RecordActionButton
          onClick={() => handleRecordAction("볼넷/사구")}
          disabled={isSubmitting}
        >
          볼넷/사구
        </RecordActionButton>
        <RecordActionButton onClick={() => handleRecordAction("아웃")}>
          아웃
        </RecordActionButton>
        <RecordActionButton onClick={() => handleRecordAction("etc")}>
          etc
        </RecordActionButton>
      </RecordActionsRow>

      {/* 모달들 */}
      {isHitModalOpen && (
        <ModalWrapper onClose={() => setIsHitModalOpen(false)}>
          <HitModal
            setIsHitModalOpen={setIsHitModalOpen}
            playerId={batterPlayerId}
          />
        </ModalWrapper>
      )}
      {isOutModalOpen && (
        <ModalWrapper onClose={() => setIsOutModalOpen(false)}>
          <OutModal
            setIsOutModalOpen={setIsOutModalOpen}
            playerId={batterPlayerId}
          />
        </ModalWrapper>
      )}
      {isEtcModalOpen && (
        <ModalWrapper onClose={() => setIsEtcModalOpen(false)}>
          <EtcModal
            setIsEtcModalOpen={setIsEtcModalOpen}
            playerId={batterPlayerId}
          />
        </ModalWrapper>
      )}
      {isChangeModalOpen && (
        <ModalWrapper onClose={() => setIsChangeModalOpen(false)}>
          <DefenseChangeModal
            setIsChangeModalOpen={setIsChangeModalOpen}
            onConfirm={handleDefenseChangeConfirm}
          />
        </ModalWrapper>
      )}
      {isGameEndModalOpen && (
        <ModalWrapper onClose={() => setIsGameEndModalOpen(false)}>
          <GameOverModal
            inningScore={thisInningScore}
            setIsGameEndModalOpen={setIsGameEndModalOpen}
          />
        </ModalWrapper>
      )}
      {isScorePatchModalOpen && selectedCell && (
        <ModalWrapper onClose={() => setIsScorePatchModalOpen(false)}>
          <ScorePatchModal
            setIsModalOpen={setIsScorePatchModalOpen}
            cellValue={selectedCell.score}
            team={selectedCell.team}
            cellIndex={selectedCell.index}
          />
        </ModalWrapper>
      )}
      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
    </GameRecordContainer>
  );
}
