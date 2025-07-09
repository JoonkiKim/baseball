// src/components/pages/GameRecordPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  CSSProperties,
  useRef,
} from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  useSensors,
  PointerSensor,
  TouchSensor,
  useSensor,
  CollisionDetection,
} from "@dnd-kit/core";

import { useRouter } from "next/router";
import API from "../../../../commons/apis/api";
import {
  GameRecordContainer,
  InningHeader,
  InningCell,
  TeamRow,
  TeamNameCell,
  TeamScoreCell,
  ControlButtonsRow,
  ControlButtonsWrapper,
  ControlButton,
  RecordActionsRow,
  RecordActionButton,
  ScoreBoardWrapper,
  GraphicWrapper,
  FullImage,
  OutCount,
  Ellipse,
  // OverlaySvg,
  ResetDot,
  Rotator,
  DiamondSvg,
  NameBadge,
  NameText,
  PlayersRow,
  PlayerBox,
  OrderBadge,
  PlayerWrapper,
  PlayerPosition,
  PlayerInfo,
} from "./gameRecord-v2.style";
import HitModal from "../../modals/hitModal";
import OutModal from "../../modals/outModal";
import EtcModal from "../../modals/etcModal";
import DefenseChangeModal from "../../modals/defenseChange";
import GameOverModal from "../../modals/gameOverModal";
import ScorePatchModal from "../../modals/scorePatchModal";
import {
  awayBatterNumberState,
  homeBatterNumberState,
  substitutionSwappedState,
} from "../../../../commons/stores";
import { useRecoilState } from "recoil";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitleSmaller,
} from "../../modals/modal.style";

export default function GameRecordPageV2() {
  const [error, setError] = useState(null);
  const router = useRouter();
  const recordId = router.query.recordId;

  // 이닝 헤더 (1~7, R, H)
  const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];

  // 팀 이름
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  // 이닝별 점수 (9칸: 7이닝 + R, H)
  const [teamAScores, setTeamAScores] = useState(Array(9).fill(""));
  const [teamBScores, setTeamBScores] = useState(Array(9).fill(""));

  // 이번 이닝 득점
  const [thisInningScore, setThisInningScore] = useState(0);

  // 현재 타자/투수
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

  // Recoil 상태들
  const [homeBatterNumber, setHomeBatterNumber] = useRecoilState(
    homeBatterNumberState
  );
  const [awayBatterNumber, setAwayBatterNumber] = useRecoilState(
    awayBatterNumberState
  );
  const [isSubstitutionSwapped, setIsSubstitutionSwapped] = useRecoilState(
    substitutionSwappedState
  );

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  // attack 쿼리 동기화를 위한 state
  const [attackVal, setAttackVal] = useState("");

  // 예시 데이터 객체
  const exampleScores = {
    scoreboard: [
      { inning: 1, inningHalf: "TOP", runs: 1 },
      { inning: 1, inningHalf: "BOTTOM", runs: 1 },
      { inning: 2, inningHalf: "TOP", runs: 2 },
      { inning: 2, inningHalf: "BOTTOM", runs: 1 },
      // … 3~7 이닝까지 필요하면 추가
    ],
    teamSummary: {
      away: { runs: 3, hits: 5 },
      home: { runs: 1, hits: 4 },
    },
  };

  // ── 1) 이닝 점수 GET ──
  const fetchInningScores = useCallback(async () => {
    if (!recordId) return;
    try {
      // 실제 호출은 잠시 주석 처리
      // const res = await API.get(`/games/${recordId}/scores`);
      // const response = res.data;

      const response = exampleScores;
      // console.log("스코어보드 응답도착");
      const newA = Array(9).fill("");
      const newB = Array(9).fill("");

      if (Array.isArray(response.scoreboard)) {
        response.scoreboard.forEach((entry) => {
          const idx = entry.inning - 1;
          if (idx >= 0 && idx < 7) {
            if (entry.inningHalf === "TOP") newA[idx] = entry.runs;
            else newB[idx] = entry.runs;
          }
        });
      }

      // R, H 컬럼
      newA[7] = response.teamSummary.away.runs;
      newA[8] = response.teamSummary.away.hits;
      newB[7] = response.teamSummary.home.runs;
      newB[8] = response.teamSummary.home.hits;

      setTeamAScores(newA);
      setTeamBScores(newB);

      // attackVal 계산
      let newAttack = "away";
      if (Array.isArray(response.scoreboard) && response.scoreboard.length) {
        const last = response.scoreboard[response.scoreboard.length - 1];
        newAttack = last.inningHalf === "TOP" ? "home" : "away";
      }
      setAttackVal(newAttack);
      return newAttack;
    } catch (err) {
      console.error("이닝 점수 로드 실패:", err);
      setError(err);
    }
  }, [router.query.recordId, attackVal]);

  // ── 마운트 및 의존성 변경 시 호출 ──
  useEffect(() => {
    // 팀 이름 로컬스토리지에서
    const matchStr = localStorage.getItem("selectedMatch");
    if (matchStr) {
      try {
        const { awayTeam, homeTeam } = JSON.parse(matchStr);
        setTeamAName(awayTeam.name);
        setTeamBName(homeTeam.name);
      } catch {
        console.error("selectedMatch 파싱 실패");
      }
    }
    fetchInningScores();
  }, [fetchInningScores]);

  // ── 4) attack 쿼리 실제 동기화 ──
  useEffect(() => {
    if (!recordId) return;
    if (router.query.attack !== attackVal) {
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, attack: attackVal },
      });
    }
  }, [recordId, attackVal, router.query.attack, router]);

  // ── 기록 액션 ──
  const handleRecordAction = async (action: string) => {
    if (isSubmitting) return;

    switch (action) {
      case "안타":
        setIsHitModalOpen(true);
        break;

      case "볼넷/사구":
        setIsSubmitting(true);
        try {
          // 1) POST 요청
          await API.post(
            `/games/${recordId}/plate-appearance`,
            {
              result: "BB",
            }
            // { withCredentials: true }
          );

          // 3) GET 요청들만 다시 실행
          const newAttack = await fetchInningScores();

          // 2) Alert 표시 (확인 클릭 후 다음 로직 실행)
          // alert("볼넷/사구 기록 전송 완료");
        } catch (e) {
          console.error("볼넷/사구 오류:", e);
          setError(e);
          // alert("볼넷/사구 오류");
        } finally {
          setIsSubmitting(false);
        }
        break;

      case "아웃":
        setIsOutModalOpen(true);
        break;

      case "etc":
        setIsEtcModalOpen(true);
        break;

      default:
        break;
    }
  };

  // ── 교체/공수교대/경기종료 ──
  const handleSubstitution = (isHome) => {
    router.push({
      pathname: `/matches/${recordId}/substitution`,
      query: { isHomeTeam: isHome },
    });
  };
  // ① POST + alert 후에 resolve 되는 async 함수로 변경
  // → 여기에 모든 “공수교대” 로직을 몰아서 처리
  const handleDefenseChange = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1) POST
      // await API.post(`/games/${recordId}/scores`, { runs: thisInningScore }),
      // { withCredentials: true };
      // 2) 사용자 알림 (확인 클릭 후 다음 단계)
      console.log({ runs: thisInningScore });

      // 3) 로컬 state 리셋
      setIsSubstitutionSwapped((prev) => !prev);
      setThisInningScore(0);
      // 4) GET 리패치
      // alert("공수교대 완료");
      const newAttack = await fetchInningScores();
    } catch (error) {
      console.error("교대 오류:", error);
      setError(error);
      // alert("교대 오류");
    } finally {
      setIsSubmitting(false);
      setIsChangeModalOpen(false);
    }
  }, [
    recordId,
    thisInningScore,
    isSubmitting,
    fetchInningScores,

    setIsSubstitutionSwapped,
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  // ── 모달 상태 ──
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isEtcModalOpen, setIsEtcModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);
  const [isScorePatchModalOpen, setIsScorePatchModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleScoreCellClick = (score, team, idx) => {
    if (score === "" || idx >= 7) return;
    setSelectedCell({ score: String(score), team, index: idx });
    setIsScorePatchModalOpen(true);
  };
  // 에러 상태
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      setValidationError(msg);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const isHomeAttack = router.query.attack === "home";
  console.log("isHomeAttack", isHomeAttack);

  // -------------------- 드래그앤드롭 ------------------------//
  // 드래그 앤 드롭 관련
  // 베이스 아이디 목록
  const baseIds = [
    "first-base",
    "second-base",
    "third-base",
    "home-base",
  ] as const;
  type BaseId = (typeof baseIds)[number];

  // 베이스 <polygon> ref 저장
  const baseRefs = useRef<Record<BaseId, SVGPolygonElement | null>>({
    "first-base": null,
    "second-base": null,
    "third-base": null,
    "home-base": null,
  });
  const droppableSetters = baseIds.reduce((acc, id) => {
    acc[id] = useDroppable({ id }).setNodeRef;
    return acc;
  }, {} as Record<BaseId, (el: HTMLElement | null) => void>);

  // wrapper ref (배지·베이스 좌표 계산용)
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 배지 설정
  interface BadgeConfig {
    id: string;
    label: string;
    initialLeft: string; // e.g. '55%'
    initialTop: string; // e.g. '85%'
  }
  const badgeConfigs: BadgeConfig[] = [
    { id: "badge-1", label: "전소면", initialLeft: "55%", initialTop: "85%" },
    { id: "badge-2", label: "송성문", initialLeft: "80%", initialTop: "75%" },
    { id: "badge-3", label: "이정후", initialLeft: "80%", initialTop: "85%" },
    { id: "badge-4", label: "박병호", initialLeft: "80%", initialTop: "95%" },
  ];

  // 배지별 스냅 정보 관리
  type SnapInfo = { base: BaseId; pos: { x: number; y: number } };
  // 1) 초기 스냅 상태를 미리 저장해 두고…
  const initialBadgeSnaps = badgeConfigs.reduce((acc, cfg) => {
    acc[cfg.id] = null;
    return acc;
  }, {} as Record<string, SnapInfo | null>);

  // 2) useState 초기값에 사용
  const [badgeSnaps, setBadgeSnaps] =
    useState<Record<string, SnapInfo | null>>(initialBadgeSnaps);

  console.log("badgeSnaps", badgeSnaps);

  // 2) badgeSnaps 상태가 바뀔 때마다 각 베이스가 채워졌는지 체크하는 useEffect
  useEffect(() => {
    // badgeSnaps: Record<badgeId, { base: BaseId; pos: { x, y } } | null>
    const occupancy: Record<BaseId, boolean> = baseIds.reduce((acc, base) => {
      // badgeSnaps 중에 baseId === base 인 항목이 하나라도 있으면 true
      acc[base] = Object.values(badgeSnaps).some((snap) => snap?.base === base);
      return acc;
    }, {} as Record<BaseId, boolean>);

    console.log("Base occupancy:", occupancy);
    // 예: { "first-base": true, "second-base": false, ... }
  }, [badgeSnaps]);
  // 센서 정의
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  // 드래그 종료 시 스냅 처리
  function handleDragEnd(event: DragEndEvent) {
    console.log("🔔 handleDragEnd fired for:", event.active.id);
    const badgeId = event.active.id as string;

    const wrapEl = wrapperRef.current;
    if (!wrapEl) return;

    // 마지막으로 스냅된 베이스
    const prevSnap = badgeSnaps[badgeId];
    const prevBase = prevSnap?.base ?? null;
    const prevPos = prevSnap?.pos ?? null;

    let landedOn: BaseId | null = null;
    let landedPos: { x: number; y: number } | null = null;
    console.log(`🔔 [${badgeId}] handleDragEnd 시작`);

    // 각 베이스 폴리곤 중앙을 검사
    for (const baseId of baseIds) {
      const poly = baseRefs.current[baseId];
      if (!poly) continue;

      const polyBB = poly.getBoundingClientRect();
      const cx = polyBB.left + polyBB.width / 2;
      const cy = polyBB.top + polyBB.height / 2;

      // 배지를 드래그 중인 엘리먼트의 bounding box
      const draggableEl = badgeRefs.current[badgeId];
      // (혹은 ref 콜백으로 따로 저장해 두어도 무방)
      if (!draggableEl) continue; // querySelector 대체
      const badgeBB = draggableEl.getBoundingClientRect();
      console.log("badgeRefs.current", badgeRefs.current[badgeId]);
      // (c) 조건 검사
      const isInside =
        cx >= badgeBB.left &&
        cx <= badgeBB.left + badgeBB.width &&
        cy >= badgeBB.top &&
        cy <= badgeBB.top + badgeBB.height;

      console.log(
        `  [${baseId}] center=(${cx.toFixed(1)},${cy.toFixed(1)})`,
        `badgeBox=[${badgeBB.left.toFixed(1)},${badgeBB.top.toFixed(1)}…]`,
        `inside=${isInside}`
      );

      if (isInside) {
        const wrapBB = wrapEl.getBoundingClientRect();
        landedOn = baseId;
        landedPos = { x: cx - wrapBB.left, y: cy - wrapBB.top };
        console.log(
          `  → candidate! landedOn=${landedOn}`,
          `landedPos=`,
          landedPos
        );
        break;
      }
    }

    console.log(
      `🔔 [${badgeId}] final landedOn=${landedOn}`,
      `landedPos=`,
      landedPos
    );
    // 허용된 이동 순서
    const nextMap: Record<BaseId, BaseId> = {
      "first-base": "second-base",
      "second-base": "third-base",
      "third-base": "home-base",
      "home-base": "home-base",
    };
    const allowed = prevBase === null ? "first-base" : nextMap[prevBase];

    // 다른 배지가 이미 차지했는지 검사
    const isOccupied = Object.entries(badgeSnaps).some(
      ([otherId, snap]) => otherId !== badgeId && snap?.base === landedOn
    );

    setBadgeSnaps((prev) => {
      const next = { ...prev };
      if (landedOn === allowed && landedPos && !isOccupied) {
        // 성공 스냅
        next[badgeId] = { base: landedOn, pos: landedPos };
      } else {
        // 리버트 또는 초기화
        next[badgeId] = prevPos ? { base: prevBase!, pos: prevPos } : null;
      }
      return next;
    });
  }
  const badgeRefs = useRef<Record<string, HTMLElement | null>>({});
  // DraggableBadge 컴포넌트
  function DraggableBadge({
    id,
    label,
    initialLeft,
    initialTop,
    snapInfo,
  }: {
    id: string;
    label: string;
    initialLeft: string;
    initialTop: string;
    snapInfo: SnapInfo | null;
  }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id,
    });
    if (snapInfo) {
      console.log(`🔔 [${id}] snapInfo:`, snapInfo);
    }
    const combinedRef = (el: HTMLElement | null) => {
      setNodeRef(el);
      badgeRefs.current[id] = el;
    };

    // CSS position & transform 결정
    if (snapInfo) {
      const { pos } = snapInfo;
      console.log("pos", pos);
      const offsetX = transform?.x ?? 0;
      const offsetY = transform?.y ?? 0;
      return (
        <NameBadge
          ref={combinedRef}
          style={{
            position: "absolute",
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: transform
              ? `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`
              : "translate(-50%, -50%)",
          }}
          {...attributes}
          {...listeners}
        >
          {label}
        </NameBadge>
      );
    }

    const offsetX = transform?.x ?? 0;
    const offsetY = transform?.y ?? 0;
    return (
      <NameBadge
        ref={combinedRef}
        style={{
          position: "absolute",
          left: initialLeft,
          top: initialTop,
          transform: transform
            ? `translate3d(${offsetX}px, ${offsetY}px, 0)`
            : undefined,
        }}
        {...attributes}
        {...listeners}
      >
        {label}
      </NameBadge>
    );
  }
  return (
    <GameRecordContainer>
      <ScoreBoardWrapper>
        <InningHeader>
          {inningHeaders.map((inn, i) => (
            <InningCell key={i}>{inn}</InningCell>
          ))}
        </InningHeader>

        {/* Team A */}
        <TeamRow>
          <TeamNameCell>{teamAName.slice(0, 3)}</TeamNameCell>
          {teamAScores.map((s, i) => (
            <TeamScoreCell
              key={i}
              onClick={() => handleScoreCellClick(s, "A", i)}
            >
              {s}
            </TeamScoreCell>
          ))}
        </TeamRow>

        {/* Team B */}
        <TeamRow>
          <TeamNameCell>{teamBName.slice(0, 3)}</TeamNameCell>
          {teamBScores.map((s, i) => (
            <TeamScoreCell
              key={i}
              onClick={() => handleScoreCellClick(s, "B", i)}
            >
              {s}
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
            이닝의 재구성
          </ControlButton>
          <ControlButton onClick={() => setIsGameEndModalOpen(true)}>
            경기종료
          </ControlButton>
        </ControlButtonsWrapper>
      </ControlButtonsRow>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        // collisionDetection={centerInsideBadge}
      >
        <GraphicWrapper ref={wrapperRef}>
          <OutCount>
            <Ellipse active />
            <Ellipse />
            <Ellipse />
          </OutCount>
          <DiamondSvg viewBox="0 0 110 110">
            <polygon points="55,0 110,55 55,110 0,55" />
            {/* 1루 */}
            <polygon
              className="inner"
              id="1st"
              ref={(el) => {
                droppableSetters["first-base"](el as any);
                baseRefs.current["first-base"] = el;
              }}
              points="103.5,48.5 110,55 103.5,61.5 97,55"
            />
            {/* 2루 */}
            <polygon
              className="inner"
              id="2nd"
              ref={(el) => {
                droppableSetters["second-base"](el as any);
                baseRefs.current["second-base"] = el;
              }}
              points="55,0 61.5,6.5 55,13 48.5,6.5"
            />
            {/* 3루 */}
            <polygon
              className="inner"
              id="3rd"
              ref={(el) => {
                droppableSetters["third-base"](el as any);
                baseRefs.current["third-base"] = el;
              }}
              points="6.5,48.5 13,55 6.5,61.5 0,55"
            />{" "}
            {/* 홈 */}
            <polygon
              className="inner"
              id="Home"
              ref={(el) => {
                droppableSetters["home-base"](el as any);
                baseRefs.current["home-base"] = el;
              }}
              points="55,97 61.5,103.5 55,110 48.5,103.5"
            />
          </DiamondSvg>

          {/* NameBadge */}
          {/* 4) 드롭 후 스냅 or 드래그 상태에 따라 렌더 */}
          {badgeConfigs.map((cfg) => (
            <DraggableBadge
              key={cfg.id}
              id={cfg.id}
              label={cfg.label}
              initialLeft={cfg.initialLeft}
              initialTop={cfg.initialTop}
              snapInfo={badgeSnaps[cfg.id]}
            />
          ))}
          <ResetDot
            style={{ left: "76vw", top: "2vh" }}
            onClick={() => {
              setBadgeSnaps(initialBadgeSnaps);
            }}
          />
        </GraphicWrapper>
      </DndContext>
      <PlayersRow>
        <PlayerBox>
          <OrderBadge>{batter.battingOrder}번</OrderBadge>
          <PlayerWrapper>
            <PlayerPosition>{batter.position}</PlayerPosition>
            <PlayerInfo>{batter.playerName}</PlayerInfo>
          </PlayerWrapper>
        </PlayerBox>
        <PlayerBox>
          <PlayerWrapper>
            <PlayerPosition>P</PlayerPosition>
            <PlayerInfo>{pitcher.playerName}</PlayerInfo>
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
          사사구
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
          onSuccess={async () => {
            const newAttack = await fetchInningScores();
          }}
        />
      )}
      {isOutModalOpen && (
        <OutModal
          setIsOutModalOpen={setIsOutModalOpen}
          playerId={batterPlayerId}
          onSuccess={async () => {
            const newAttack = await fetchInningScores();
          }}
        />
      )}
      {isEtcModalOpen && (
        <EtcModal
          setIsEtcModalOpen={setIsEtcModalOpen}
          playerId={batterPlayerId}
          onSuccess={async () => {
            const newAttack = await fetchInningScores();
          }}
        />
      )}
      {isChangeModalOpen && (
        <DefenseChangeModal
          setIsChangeModalOpen={setIsChangeModalOpen}
          onSuccess={handleDefenseChange}
        />
      )}

      {isGameEndModalOpen && (
        <GameOverModal
          inningScore={thisInningScore}
          setIsGameEndModalOpen={setIsGameEndModalOpen}
        />
      )}

      {isScorePatchModalOpen && selectedCell && (
        <ScorePatchModal
          setIsModalOpen={setIsScorePatchModalOpen}
          cellValue={selectedCell.score}
          team={selectedCell.team}
          cellIndex={selectedCell.index}
          onSuccess={async () => {
            // setIsSubmitting(true);
            try {
              const newAttack = await fetchInningScores();
            } finally {
              // setIsSubmitting(false);
            }
          }}
        />
      )}
      {!isSubmitting && validationError && (
        <ModalOverlay>
          <ModalContainer>
            <ModalTitleSmaller>{validationError}</ModalTitleSmaller>

            <ModalButton onClick={() => setValidationError(null)}>
              확인
            </ModalButton>
          </ModalContainer>
        </ModalOverlay>
      )}
      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      <ErrorAlert error={error} />
    </GameRecordContainer>
  );
}
