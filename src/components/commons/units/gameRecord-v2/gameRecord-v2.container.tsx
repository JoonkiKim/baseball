import {
  useState,
  useEffect,
  useCallback,
  CSSProperties,
  useRef,
  useMemo,
  useLayoutEffect,
  memo,
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
  DragOverEvent,
  Modifier,
  MeasuringStrategy,
  DragMoveEvent,
  rectIntersection,
  DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

// import GroundPng from "/images/ground-without-home.png";

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
  ReconstructionWrapper,
  ReconstructionTitle,
  ReconstructionButtonWrapper,
  ReconstructionSwitch,
  PlayerChangeButton,
  EliteBox,
  WildCardBox,
  PlayerExWrapper,
  WildCardBoxNone,
  OnDeckWrapper,
  OutZoneWrapper,
  CustomBoundaryWrapper,
  Ground,
  HomeWrapper,
  LineWrapper,
  HomePlateOverlay,
  HomeBaseWrapper,
  SideWrapper,
  LeftSideWrapper,
  InningBoard,
  LittleScoreBoardWrapper,
  ControlButtonWhite,
  VsText,
  LeftArrow,
  RightArrow,
  Dot,
  InningNumber,
  AwayTeamName,
  HomeTeamName,
  AwayTeamWrapper,
  HomeTeamWrapper,
  AwayTeamScore,
  HomeTeamScore,
} from "./gameRecord-v2.style";
import HitModal from "../../modals/recordModal/hitModal";
import OutModal from "../../modals/recordModal/outModal";
import EtcModal from "../../modals/recordModal/etcModal";
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
import GroundRecordModal, {
  GroundRecordModalHandle,
} from "../../modals/groudRecordModal/groundRecordModal";
import { ArrowUp } from "../../../../commons/libraries/arrow";
import ArrowDown from "../../../../commons/libraries/arrowDown";
import { badgeConfigs } from "./gameRecord.variables";
import RightPolygon from "../../../../commons/libraries/rightPolygon";
import LeftPolygon from "../../../../commons/libraries/leftPolygon";

// 1) 먼저 BaseId / BASE_IDS를 선언
export const BASE_IDS = [
  "first-base",
  "second-base",
  "third-base",
  "home-base",
] as const;

export type BaseId = (typeof BASE_IDS)[number];

export const useRectsCache = (
  wrapperRef: React.RefObject<HTMLDivElement>,
  outZoneRef: React.RefObject<HTMLDivElement>,
  baseRefs: React.MutableRefObject<Record<BaseId, SVGPolygonElement | null>>,
  BASE_IDS: readonly BaseId[]
) => {
  const wrapperRectRef = useRef<DOMRect | null>(null);
  const zoneRectRef = useRef<DOMRect | null>(null);
  const baseRectsRef = useRef<Partial<Record<BaseId, DOMRect>>>({});

  const refreshRects = useCallback(() => {
    const wrapEl = wrapperRef.current;
    const zoneEl = outZoneRef.current;

    if (wrapEl) wrapperRectRef.current = wrapEl.getBoundingClientRect();
    if (zoneEl) zoneRectRef.current = zoneEl.getBoundingClientRect();

    BASE_IDS.forEach((b) => {
      const poly = baseRefs.current[b];
      if (poly) baseRectsRef.current[b] = poly.getBoundingClientRect();
    });
  }, [wrapperRef, outZoneRef, baseRefs, BASE_IDS]);

  useLayoutEffect(() => {
    // 최초 1회
    refreshRects();

    let rafId: number | null = null;
    const schedule = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        refreshRects();
      });
    };

    const ro = new ResizeObserver(() => {
      schedule();
    });

    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (outZoneRef.current) ro.observe(outZoneRef.current);
    BASE_IDS.forEach((b) => {
      const el = baseRefs.current[b];
      if (el) ro.observe(el);
    });

    const onResize = () => schedule();
    const onOrientation = () => schedule();
    const onScroll = () => schedule();

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      ro.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [refreshRects, BASE_IDS]);

  return { wrapperRectRef, zoneRectRef, baseRectsRef, refreshRects };
};

export default function GameRecordPageV2() {
  const [error, setError] = useState(null);
  const router = useRouter();
  const recordId = router.query.recordId;
  const [outs, setOuts] = useState<boolean[]>([false, false, false]);

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

  // 대기타석 표시용 라인업
  const awayExample = {
    batters: [
      {
        battingOrder: 1,
        playerId: 121,
        playerName: "박민재",
        position: "CF",
        isWC: false,
      },
      {
        battingOrder: 2,
        playerId: 122,
        playerName: "박용준",
        position: "LF",
        isWC: false,
      },
      {
        battingOrder: 3,
        playerId: 123,
        playerName: "박지호",
        position: "RF",
        isWC: true,
      },
      {
        battingOrder: 4,
        playerId: 124,
        playerName: "박준혁",
        position: "SS",
        isWC: true,
      },
      {
        battingOrder: 5,
        playerId: 125,
        playerName: "김지찬",
        position: "1B",
        isWC: false,
      },
      {
        battingOrder: 6,
        playerId: 126,
        playerName: "이재현",
        position: "2B",
        isWC: false,
      },
      {
        battingOrder: 7,
        playerId: 127,
        playerName: "디아즈",
        position: "3B",
        isWC: false,
      },
      {
        battingOrder: 8,
        playerId: 128,
        playerName: "구자욱",
        position: "C",
        isWC: false,
      },
      {
        battingOrder: 9,
        playerId: 129,
        playerName: "김헌곤",
        position: "DH",
        isWC: true,
      },
    ],
    pitcher: {
      playerId: 134,
      playerName: "원태인",
      isWC: false,
    },
  };

  const homeExample = {
    batters: [
      {
        battingOrder: 1,
        playerId: 101,
        playerName: "강하윤",
        position: "CF",
        isWC: false,
      },
      {
        battingOrder: 2,
        playerId: 102,
        playerName: "김준기",
        position: "LF",
        isWC: false,
      },
      {
        battingOrder: 3,
        playerId: 103,
        playerName: "윤동현",
        position: "RF",
        isWC: false,
      },
      {
        battingOrder: 4,
        playerId: 104,
        playerName: "박진우",
        position: "SS",
        isWC: true,
      },
      {
        battingOrder: 5,
        playerId: 105,
        playerName: "박성민",
        position: "1B",
        isWC: true,
      },
      {
        battingOrder: 6,
        playerId: 106,
        playerName: "박민수",
        position: "2B",
        isWC: true,
      },
      {
        battingOrder: 7,
        playerId: 107,
        playerName: "박영수",
        position: "3B",
        isWC: false,
      },
      {
        battingOrder: 8,
        playerId: 108,
        playerName: "박지훈",
        position: "C",
        isWC: false,
      },
      {
        battingOrder: 9,
        playerId: 121,
        playerName: "정현우",
        position: "P",
        isWC: false,
      },
    ],
    pitcher: {
      playerId: 121,
      playerName: "정현우",
      isWC: false,
    },
  };

  const isHomeAttack = router.query.attack === "home";
  const lineupExample = isHomeAttack ? homeExample : awayExample;
  // ── 0) 예시로 batter/pitcher 세팅 ──
  // useEffect(() => {
  //   if (!lineupExample) return;

  //   // 첫 번째 타자 예시
  //   const firstBatter = lineupExample.batters[0]!;
  //   setBatter({
  //     battingOrder: firstBatter.battingOrder,
  //     playerId: firstBatter.playerId,
  //     playerName: firstBatter.playerName,
  //     isElite: !firstBatter.isWC,
  //     isWc: firstBatter.isWC,
  //     position: firstBatter.position,
  //   });

  //   // 투수 예시
  //   const exP = lineupExample.pitcher;
  //   setPitcher({
  //     battingOrder: 0, // 투수니까 굳이 order 필요 없으면 0
  //     playerId: exP.playerId,
  //     playerName: exP.playerName,
  //     isElite: !exP.isWC,
  //     isWc: exP.isWC,
  //     position: "P",
  //   });
  // }, []);

  const [batterPlayerId, setBatterPlayerId] = useState(0);

  // Recoil 상태들

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
      { inning: 1, inningHalf: "BOT", runs: 1 },
      { inning: 2, inningHalf: "TOP", runs: 2 },
      { inning: 2, inningHalf: "BOT", runs: 1 },
      { inning: 3, inningHalf: "TOP", runs: 2 },
      // … 3~7 이닝까지 필요하면 추가
    ],
    teamSummary: {
      away: { runs: 3, hits: 5 },
      home: { runs: 1, hits: 4 },
    },
  };

  // 대기타석

  const onDeckPlayers = lineupExample.batters.filter((b) =>
    [1, 2, 3].includes(b.battingOrder)
  );

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
      // console.error("이닝 점수 로드 실패:", err);
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
        // console.error("selectedMatch 파싱 실패");
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

          // [배포 시 다시 켜기]
          // await API.post(
          //   `/games/${recordId}/plate-appearance`,
          //   {
          //     result: "BB",
          //   }

          // );

          // 스코어 재조회
          await fetchInningScores();

          // 모달 열기 (기존 setIsGroundRecordModalOpen 대신)
          groundModalRef.current?.open();
        } catch (e) {
          // console.error("볼넷/사구 오류:", e);
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

  // ── 모달 상태 ──
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isEtcModalOpen, setIsEtcModalOpen] = useState(false);

  const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

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

  // console.log("isHomeAttack", isHomeAttack);

  // -------------------- 드래그앤드롭 ------------------------//
  // 드래그 앤 드롭 관련
  // 베이스 아이디 목록

  // 베이스 <polygon> ref 저장

  const { setNodeRef: set1st } = useDroppable({ id: "first-base" });
  const { setNodeRef: set2nd } = useDroppable({ id: "second-base" });
  const { setNodeRef: set3rd } = useDroppable({ id: "third-base" });
  const { setNodeRef: setHome } = useDroppable({ id: "home-base" });

  // map
  const droppableSetters = {
    "first-base": set1st,
    "second-base": set2nd,
    "third-base": set3rd,
    "home-base": setHome,
  };

  // wrapper ref (배지·베이스 좌표 계산용)

  interface BlackBadgeConfig {
    id: string;
    label: string;
    initialLeft: string;
    initialTop: string;
    sportPosition: string; // 스포츠 포지션 (string)
  }
  // ▶️ 1) config 를 state 로

  const [blackBadgeConfigs, setBlackBadgeConfigs] = useState<
    BlackBadgeConfig[]
  >([
    {
      id: "black-badge-1",
      label: "원태인",
      initialLeft: "50%",
      initialTop: "55%",
      sportPosition: "P",
    },
    {
      id: "black-badge-2",
      label: "강민호",
      initialLeft: "50%",
      initialTop: "93%",
      sportPosition: "C",
    },
    {
      id: "black-badge-3",
      label: "박병호",
      initialLeft: "80%",
      initialTop: "50%",
      sportPosition: "1B",
    },
    {
      id: "black-badge-4",
      label: "류지혁",
      initialLeft: "70%",
      initialTop: "40%",
      sportPosition: "2B",
    },
    {
      id: "black-badge-5",
      label: "김영웅",
      initialLeft: "20%",
      initialTop: "50%",
      sportPosition: "3B",
    },
    {
      id: "black-badge-6",
      label: "이재현",
      initialLeft: "30%",
      initialTop: "40%",
      sportPosition: "SS",
    },
    {
      id: "black-badge-7",
      label: "구자욱",
      initialLeft: "20%",
      initialTop: "25%",
      sportPosition: "LF",
    },
    {
      id: "black-badge-8",
      label: "김지찬",
      initialLeft: "50%",
      initialTop: "15%",
      sportPosition: "CF",
    },
    {
      id: "black-badge-9",
      label: "김성윤",
      initialLeft: "80%",
      initialTop: "25%",
      sportPosition: "RF",
    },
  ]);

  // 수비 교체 로직
  // 검정 배지 위치 누적량 관리
  // 컴포넌트 최상단에

  const blackBadgeRefs = useRef<Record<string, HTMLElement | null>>({});
  const initialAnchors = useRef<Record<string, { x: number; y: number }>>({});
  const initialBlackPositions = blackBadgeConfigs.reduce(
    (acc, { id }) => ({ ...acc, [id]: { x: 0, y: 0 } }),
    {} as Record<string, { x: number; y: number }>
  );

  const [blackPositions, setBlackPositions] = useState(initialBlackPositions);

  // ── 2️⃣ 마운트 직후 wrapper 크기 얻어서 초기 anchor 계산 ──
  useLayoutEffect(() => {
    const wrapEl = wrapperRef.current;
    if (!wrapEl) return;
    const { left, top, width, height } = wrapEl.getBoundingClientRect();
    blackBadgeConfigs.forEach(({ id, initialLeft, initialTop }) => {
      const pctX = parseFloat(initialLeft) / 100;
      const pctY = parseFloat(initialTop) / 100;
      initialAnchors.current[id] = {
        x: left + width * pctX,
        y: top + height * pctY,
      };
    });
    // initialize blackPositions to zero-offsets
    setBlackPositions(
      blackBadgeConfigs.reduce((acc, { id }) => {
        acc[id] = { x: 0, y: 0 };
        return acc;
      }, {} as Record<string, { x: number; y: number }>)
    );
  }, [blackBadgeConfigs]);

  function BlackDraggableBadge({
    cfg,
    pos,
  }: {
    cfg: BlackBadgeConfig;
    pos: { x: number; y: number };
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: cfg.id,
      });

    // dnd-kit nodeRef + our ref 동시 설정
    const combinedRef = (el: HTMLElement | null) => {
      setNodeRef(el);
      blackBadgeRefs.current[cfg.id] = el;
    };
    // 누적 + 현재 드래그 중인 오프셋
    const dx = pos.x + (transform?.x ?? 0);
    const dy = pos.y + (transform?.y ?? 0);

    return (
      <NameBadge
        ref={combinedRef}
        {...attributes}
        {...listeners}
        style={{
          position: "absolute",
          left: cfg.initialLeft,
          top: cfg.initialTop,

          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
          background: "#000000",
          color: "#fff",
          border: "0.3px solid #ffffff",
          cursor: "grab",
        }}
      >
        {cfg.label}
        {/* ({cfg.sportPosition}) */}
      </NameBadge>
    );
  }
  // ▶️ 3) handleBlackDragEnd: swap 로직 수정
  // ▶️ 3) swap 포함 drag end 핸들러
  function handleBlackDragEnd(event: DragEndEvent) {
    const id = event.active.id as string;
    const prevOff = blackPositions[id];
    const dx = event.delta?.x ?? 0;
    const dy = event.delta?.y ?? 0;
    const newOff = { x: prevOff.x + dx, y: prevOff.y + dy };
    const el = blackBadgeRefs.current[id];
    if (el) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      for (const otherId of Object.keys(blackBadgeRefs.current)) {
        if (otherId === id) continue;
        const otherRect =
          blackBadgeRefs.current[otherId]!.getBoundingClientRect();
        if (
          cx >= otherRect.left &&
          cx <= otherRect.right &&
          cy >= otherRect.top &&
          cy <= otherRect.bottom
        ) {
          // swap both configs and their sportPosition
          setBlackBadgeConfigs((prev) => {
            const a = prev.findIndex((c) => c.id === id);
            const b = prev.findIndex((c) => c.id === otherId);
            const copy = [...prev];
            [copy[a].initialLeft, copy[b].initialLeft] = [
              copy[b].initialLeft,
              copy[a].initialLeft,
            ];
            [copy[a].initialTop, copy[b].initialTop] = [
              copy[b].initialTop,
              copy[a].initialTop,
            ];
            [copy[a].sportPosition, copy[b].sportPosition] = [
              copy[b].sportPosition,
              copy[a].sportPosition,
            ];
            return copy;
          });
          // reset offsets to zero so new anchors apply
          setBlackPositions((prev) => ({
            ...prev,
            [id]: { x: 0, y: 0 },
            [otherId]: { x: 0, y: 0 },
          }));
          return;
        }
      }
    }
    // ── swap 없을 때: offset을 (0,0)으로 초기화하여 초기 위치로 복귀
    setBlackPositions((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0 },
    }));
  }

  // console.log("blackBadgeConfigs", blackBadgeConfigs);

  const diamondSvgRef = useRef<SVGSVGElement | null>(null);
  const diamondPolyRef = useRef<SVGPolygonElement | null>(null);

  // const [isOutside, setIsOutside] = useState(false);

  // 배지별 스냅 정보 관리
  type SnapInfo = { base: BaseId; pos: { xPct: number; yPct: number } };
  // 1) 초기 스냅 상태를 미리 저장해 두고…
  const initialBadgeSnaps = badgeConfigs.reduce((acc, cfg) => {
    acc[cfg.id] = null;
    return acc;
  }, {} as Record<string, SnapInfo | null>);

  // 2) useState 초기값에 사용
  const [badgeSnaps, setBadgeSnaps] =
    useState<Record<string, SnapInfo | null>>(initialBadgeSnaps);

  // console.log("badgeSnaps", badgeSnaps);

  // 2) badgeSnaps 상태가 바뀔 때마다 각 베이스가 채워졌는지 체크하는 useEffect
  useEffect(() => {
    // badgeSnaps: Record<badgeId, { base: BaseId; pos: { x, y } } | null>
    const occupancy: Record<BaseId, boolean> = BASE_IDS.reduce((acc, base) => {
      // badgeSnaps 중에 baseId === base 인 항목이 하나라도 있으면 true
      acc[base] = Object.values(badgeSnaps).some((snap) => snap?.base === base);
      return acc;
    }, {} as Record<BaseId, boolean>);

    console.log("Base occupancy:", occupancy);
    // 예: { "first-base": true, "second-base": false, ... }
  }, [badgeSnaps]);
  // 센서 정의
  const sensors = useSensors(useSensor(PointerSensor));

  const badgeRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeBadges, setActiveBadges] = useState(
    badgeConfigs.map((cfg) => cfg.id)
  );

  // 드래그 종료 시 스냅 처리

  // -------------------- 성능 최적화용 refs --------------------

  const DraggableBadge = ({
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
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id,
    });

    const combinedRef = (el: HTMLElement | null) => {
      setNodeRef(el);
      badgeRefs.current[id] = el;
    };

    const isWhite = !id.startsWith("black-badge");
    const dragging = !!transform;

    // 1) 스냅 좌표
    const left = snapInfo && isWhite ? `${snapInfo.pos.xPct}%` : initialLeft;
    const top = snapInfo && isWhite ? `${snapInfo.pos.yPct}%` : initialTop;

    // 2) transform: 드래그 중일 때만 델타 적용
    const styleTransform = dragging
      ? `translate(-50%, -50%) translate3d(${transform!.x}px, ${
          transform!.y
        }px, 0)`
      : `translate(-50%, -50%)`;

    return (
      <NameBadge
        id={id}
        ref={combinedRef}
        style={{
          position: "absolute",
          left,
          top,
          transform: styleTransform,
        }}
        {...attributes}
        {...listeners}
      >
        {label}
      </NameBadge>
    );
  };

  const onAnyDragEnd = (e: DragEndEvent) => {
    handleDrop(e);
    // 드래그가 끝날 때 (항상) Ground 강조 해제
    groundRef.current?.classList.remove("out-zone-active");
    // 깔끔하게 리셋
    prevOutsideRef.current = false;
    // setIsOutside(false);
  };
  // --이닝의 재구성--//

  const [isReconstructMode, setIsReconstructMode] = useState(false);
  // ── 흰색 배지(주자) 관련 모든 기록/ref 초기화 ──
  const resetWhiteBadges = useCallback(() => {
    // 1) badgeSnaps(= 점유/스냅 정보) 초기화
    const freshSnaps: Record<string, SnapInfo | null> = {};
    badgeConfigs.forEach((c) => (freshSnaps[c.id] = null));
    setBadgeSnaps(freshSnaps);

    // 2) 화면에 모든 흰 배지 다시 보이게
    setActiveBadges(badgeConfigs.map((c) => c.id));

    // 3) 베이스 이동(순서) 기록 초기화
    badgeConfigs.forEach(({ id }) => {
      snappedSeqRef.current[id] = [];
    });

    // 4) (선택) 흰 배지 DOM ref 정리
    badgeRefs.current = {};

    // 5) (선택) 기타 UI 상태 리셋이 필요하면 여기서
    // setIsOutside(false);
  }, [badgeConfigs]);

  // 주자 모달 창
  const [isGroundRecordModalOpen, setIsGroundRecordModalOpen] = useState(false);

  // 아웃존 설정
  // 1) ref 선언
  const originCenters = useRef<Record<string, { x: number; y: number }>>({});
  // ① Ground용 ref 선언
  const groundRef = useRef<HTMLDivElement | null>(null);

  // const [isOutside, setIsOutside] = useState(false);
  const prevOutsideRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const el = badgeRefs.current[id];
    if (!el) return;

    // 여기서만 한 번만 읽어 온다!
    const rect = el.getBoundingClientRect();
    originCenters.current[id] = {
      x: rect.left + rect.width / 2, // 요소의 화면상 중앙 X
      y: rect.top + rect.height / 2, // 요소의 화면상 중앙 Y
    };
  }

  // const handleDragMove = (e: DragMoveEvent) => {
  //   const id = String(e.active.id);
  //   if (id.startsWith("black-badge")) {
  //     // 검정 배지는 바깥 감지/하이라이트 로직 스킵
  //     return;
  //   }

  //   if (rafIdRef.current != null) return; // 이미 예약됨(스로틀)
  //   rafIdRef.current = requestAnimationFrame(() => {
  //     rafIdRef.current = null;

  //     const zoneRect = zoneRectRef.current;
  //     if (!zoneRect) return;

  //     const translated = e.active?.rect?.current?.translated;
  //     let cx: number | null = null;
  //     let cy: number | null = null;

  //     if (translated) {
  //       cx = translated.left + translated.width / 2;
  //       cy = translated.top + translated.height / 2;
  //     } else {
  //       // fallback: DOM 읽기(가능하면 피하기)
  //       const el = badgeRefs.current[e.active.id as string];
  //       if (el) {
  //         const r = el.getBoundingClientRect();
  //         cx = r.left + r.width / 2;
  //         cy = r.top + r.height / 2;
  //       }
  //     }

  //     if (cx == null || cy == null) return;

  //     const outsideNow =
  //       cx < zoneRect.left ||
  //       cx > zoneRect.right ||
  //       cy < zoneRect.top ||
  //       cy > zoneRect.bottom;

  //     if (outsideNow !== prevOutsideRef.current) {
  //       prevOutsideRef.current = outsideNow;
  //       setIsOutside(outsideNow); // 변화 있을 때만 setState
  //     }
  //   });
  // };

  // 커스텀 경계설정

  function handleDragMove(event: DragMoveEvent) {
    const id = String(event.active.id);
    // 검정 배지는 스킵
    if (id.startsWith("black-badge")) return;

    // 아직 origin이 없으면 스킵
    const origin = originCenters.current[id];
    if (!origin) return;

    // RAF로 한 프레임에 한 번만 실행
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;

      // DnD‑Kit이 주는 delta.x/y + origin
      const dx = event.delta?.x ?? 0;
      const dy = event.delta?.y ?? 0;
      const cx = origin.x + dx;
      const cy = origin.y + dy;

      // out-zone 판정: zoneRectRef.current는 이미 외부에서 갱신된 DOMRect이므로
      const zone = zoneRectRef.current;
      if (!zone) return;

      const outsideNow =
        cx < zone.left || cx > zone.right || cy < zone.top || cy > zone.bottom;

      // 변화가 있을 때만 클래스 토글 or 스타일 변경
      if (outsideNow !== prevOutsideRef.current) {
        prevOutsideRef.current = outsideNow;
        // React 상태 대신 DOM 클래스로 토글하면 더 가볍습니다
        const badgeEl = badgeRefs.current[id]!;
        badgeEl.classList.toggle("out-zone", outsideNow);
      }

      // ★ Ground 배경 토글(추가)
      groundRef.current?.classList.toggle("out-zone-active", outsideNow);
    });
  }

  const customBoundsRef = useRef<HTMLDivElement>(null);

  const restrictToCustomBounds: Modifier = (args) => {
    const { transform, draggingNodeRect } = args;

    // ① 드래그 중이 아닐 때는 원본 transform 반환
    if (!draggingNodeRect) {
      return transform;
    }

    // ② 경계 요소(ref) 유효성 검사
    const boundsEl = customBoundsRef.current;
    if (!boundsEl) {
      return transform;
    }

    // 이제 안전하게 ClientRect 사용 가능
    const { width: nodeW, height: nodeH } = draggingNodeRect;
    const bounds = boundsEl.getBoundingClientRect();

    // (이하 클램핑 로직 동일)
    const newLeft = draggingNodeRect.left + transform.x;
    const newTop = draggingNodeRect.top + transform.y;

    const minX = bounds.left;
    const maxX = bounds.right - nodeW;
    const minY = bounds.top;
    const maxY = bounds.bottom - nodeH;

    const clampedX = Math.min(Math.max(newLeft, minX), maxX);
    const clampedY = Math.min(Math.max(newTop, minY), maxY);

    return {
      ...transform,
      x: transform.x + (clampedX - newLeft),
      y: transform.y + (clampedY - newTop),
    };
  };
  const dynamicBoundary: Modifier = (args) => {
    const { active, transform } = args;
    // active가 없으면 아무 제한도 걸지 않고 원본 transform 그대로 반환
    if (!active) {
      return transform;
    }

    const id = active.id.toString();
    // 배지가 베이스에 올라간(snap된) 상태면 custom, 아니면 부모 요소 제한
    // 검정 배지는 항상 custom, 흰 배지는 스냅된 경우 custom, 아닌 경우 부모 요소 제한
    // if (
    //   id.startsWith("black-badge") || // ▶ 검정 배지
    //   Boolean(badgeSnaps[id]) // ▶ 흰 배지(스냅됐을 때)
    // ) {
    //   return restrictToCustomBounds(args);
    // } else {
    //   return restrictToParentElement(args);
    // }
    const isBlack = id.startsWith("black-badge");
    return isBlack
      ? restrictToCustomBounds(args)
      : restrictToCustomBounds(args);
  };

  // 홈베이스 색칠

  const [isHomeBaseActive, setIsHomeBaseActive] = useState(false);

  const RUN_SEQUENCE: BaseId[] = [
    "first-base",
    "second-base",
    "third-base",
    "home-base",
  ];

  // 배지별로 지금까지 "순서대로" 스냅된 베이스 목록을 저장 (삭제하지 않고 유지)
  const snappedSeqRef = useRef<Record<string, BaseId[]>>(
    badgeConfigs.reduce((acc, { id }) => {
      acc[id] = [];
      return acc;
    }, {} as Record<string, BaseId[]>)
  );

  // 다음에 가야 할(스냅해야 할) 베이스
  const nextRequiredBase = (badgeId: string): BaseId => {
    const seq = snappedSeqRef.current[badgeId];
    return RUN_SEQUENCE[Math.min(seq.length, RUN_SEQUENCE.length - 1)];
  };

  // ─────────────────────────────────────────────
  // 1) 좌표 자동 캐싱 훅 (ResizeObserver + window 이벤트) //
  // 한번만 하면 되니까 성능에 좋다
  // ─────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null);
  const outZoneRef = useRef<HTMLDivElement>(null);
  const baseRefs = useRef<Record<BaseId, SVGPolygonElement | null>>({
    "first-base": null,
    "second-base": null,
    "third-base": null,
    "home-base": null,
  });

  // ✅ 여기서 훅 호출
  const { wrapperRectRef, zoneRectRef, baseRectsRef, refreshRects } =
    useRectsCache(wrapperRef, outZoneRef, baseRefs, BASE_IDS);

  // ─────────────────────────────────────────────
  // 2) 드롭 순간만 검사/스냅
  // ─────────────────────────────────────────────
  const handleDrop = (e: DragEndEvent) => {
    const badgeId = e.active.id as string;

    // 검정 배지: 기존 자리 스왑 로직
    if (badgeId.startsWith("black-badge")) {
      handleBlackDragEnd(e);
      return;
    }

    const badgeEl = badgeRefs.current[badgeId];
    const wrapperRect = wrapperRectRef.current;
    const zoneRect = zoneRectRef.current;
    if (!badgeEl || !wrapperRect) return;

    const { left, top, width, height } = badgeEl.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;

    // 1) 필드(outZone) 밖 드롭 → 제거(기록은 유지)
    if (
      zoneRect &&
      (cx < zoneRect.left ||
        cx > zoneRect.right ||
        cy < zoneRect.top ||
        cy > zoneRect.bottom)
    ) {
      // setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
      setActiveBadges((prev) => {
        // 새로 걸러낸 배열
        const next = prev.filter((id) => id !== badgeId);
        // 남은 흰 배지 개수 계산
        const whiteLeft = next.filter(
          (id) => !id.startsWith("black-badge")
        ).length;
        // 흰 배지가 하나라도 남으면 next, 아니면 prev 유지
        return whiteLeft > 0 ? next : prev;
      });
      setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));

      // ★ Ground의 'out-zone-active' 클래스 제거
      groundRef.current?.classList.remove("out-zone-active");
      return;
    }

    // 2) 어느 베이스 위인지 판정
    let dropBase: BaseId | null = null;
    let baseRect: DOMRect | undefined;
    for (const b of BASE_IDS) {
      const rect = baseRectsRef.current[b];
      if (!rect) continue;
      if (
        cx >= rect.left &&
        cx <= rect.right &&
        cy >= rect.top &&
        cy <= rect.bottom
      ) {
        dropBase = b;
        baseRect = rect;
        break;
      }
    }
    if (!dropBase || !baseRect) return;

    // 3) 순서 강제
    // const required = nextRequiredBase(badgeId);
    // if (dropBase !== required) {
    //   return; // 순서 아니면 스냅 불가
    // }

    // 4) 점유 체크(1베이스 1주자)
    const occupied = Object.entries(badgeSnaps).some(
      ([otherId, snap]) => otherId !== badgeId && snap?.base === dropBase
    );
    if (occupied) {
      return;
    }

    // 5) 스냅(흰 배지: % 좌표)
    const x = baseRect.left + baseRect.width / 2 - wrapperRect.left;
    const y = baseRect.top + baseRect.height / 2 - wrapperRect.top;

    setBadgeSnaps((prev) => ({
      ...prev,
      [badgeId]: {
        base: dropBase,
        pos: {
          xPct: (x / wrapperRect.width) * 100,
          yPct: (y / wrapperRect.height) * 100,
        },
      },
    }));

    // 6) 진행 기록 업데이트 (유지)
    const seq = snappedSeqRef.current[badgeId];
    if (seq[seq.length - 1] !== dropBase) {
      seq.push(dropBase);
    }

    // 7) 홈에 스냅 & 3루 찍혀 있으면 완주
    // 3루에서 홈으로 들어오면 배지 없어짐
    // const finished =
    //   dropBase === "home-base" &&
    //   ["first-base", "second-base", "third-base"].every((b) =>
    //     seq.includes(b as BaseId)
    //   );
    const finished =
      dropBase === "home-base" &&
      ["third-base"].every((b) => seq.includes(b as BaseId));

    if (finished) {
      setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
      setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));
      // 기록은 유지 (snappedSeqRef.current[badgeId]는 지우지 않음)
    }
  };

  // 모달 성능 최적화 (렌더링 최소화)
  const groundModalRef = useRef<GroundRecordModalHandle>(null);
  // onSuccess 콜백 예시
  const afterRecord = async () => {
    const newAttack = await fetchInningScores();
    // …추가 fetch…
  };
  // 콘솔에 다시 찍히지 않는다면 부모 컴포넌트는 리렌더링되지 않은 것!
  console.log("▶ GameRecordPageV2 render");

  return (
    <GameRecordContainer reconstructMode={isReconstructMode}>
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
              // onClick={() => handleScoreCellClick(s, "A", i)}
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
              // onClick={() => handleScoreCellClick(s, "B", i)}
            >
              {s}
            </TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>

      <ControlButtonsRow>
        <ControlButtonsWrapper>
          <ReconstructionWrapper>
            <ReconstructionTitle>이닝의 재구성</ReconstructionTitle>
            <ReconstructionButtonWrapper>
              <ReconstructionSwitch
                checked={isReconstructMode}
                onChange={(checked) => {
                  // OFF로 전환될 때만 초기화
                  if (!checked) {
                    resetWhiteBadges();
                  }
                  setIsReconstructMode(checked);
                }}
              />
            </ReconstructionButtonWrapper>
          </ReconstructionWrapper>
          <ControlButtonWhite>임시저장</ControlButtonWhite>
          <ControlButton onClick={() => setIsGameEndModalOpen(true)}>
            경기종료
          </ControlButton>
        </ControlButtonsWrapper>
      </ControlButtonsRow>

      <DndContext
        id="game-record-dnd" // ← 여기에 고정된 string ID를 넣어줍니다
        sensors={sensors}
        // collisionDetection={rectIntersection}
        modifiers={[dynamicBoundary]}
        measuring={{
          droppable: {
            // or AlwaysExceptInitialPlacement
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={onAnyDragEnd}
      >
        <GraphicWrapper ref={wrapperRef}>
          <HomeWrapper />
          <LineWrapper />
          <HomeBaseWrapper active={isHomeBaseActive} />
          <Ground ref={groundRef} />

          <OutZoneWrapper ref={outZoneRef}></OutZoneWrapper>
          <CustomBoundaryWrapper
            ref={(el) => {
              customBoundsRef.current = el; // ★ 이 한 줄 추가
            }}
          ></CustomBoundaryWrapper>
          <DiamondSvg
            viewBox="0 0 110 110"
            ref={(el) => {
              diamondSvgRef.current = el;
              // svgRef.current = el;
            }}
          >
            <polygon
              id="ground"
              points="55,0 110,55 55,110 0,55"
              // style={{ border: "1px solid black" }}
              ref={(el) => {
                diamondPolyRef.current = el;
                // groundRef.current = el;
              }}
            />
            {/* 디버그용: 계산된 screenPoints로 다시 그린 폴리곤 */}
            {/* {overlayPoints && (
              <polygon points={overlayPoints} stroke="red" strokeWidth={0.5} />
            )} */}
            {/* 1루 */}
            <polygon
              className="inner"
              id="1st"
              // transform="translate(-5, 10)"
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
              points="55,100 61.5,103.5 55,130 48.5,103.5"
            />
          </DiamondSvg>
          <SideWrapper>
            <OutCount>
              {outs.map((isActive, idx) => (
                <Ellipse key={idx} active={isActive} />
              ))}
            </OutCount>
            <OnDeckWrapper>
              {onDeckPlayers.length > 0 ? (
                onDeckPlayers.map((p) => (
                  <div key={p.playerId}>
                    {p.battingOrder} {p.playerName}
                  </div>
                ))
              ) : (
                <div>대기타석입니다</div>
              )}
            </OnDeckWrapper>
          </SideWrapper>
          <LeftSideWrapper>
            <InningBoard>
              <ArrowUp color={!isHomeAttack ? "red" : "#B8B8B8"} />
              <InningNumber>7</InningNumber>
              <ArrowDown color={isHomeAttack ? "red" : "#B8B8B8"} />
            </InningBoard>
            <LittleScoreBoardWrapper>
              <AwayTeamWrapper>
                <AwayTeamName> {teamAName.slice(0, 3)}</AwayTeamName>
                <AwayTeamScore>
                  {teamAScores.length >= 2
                    ? teamAScores[teamAScores.length - 2]
                    : ""}
                </AwayTeamScore>
              </AwayTeamWrapper>
              <HomeTeamWrapper>
                <HomeTeamName>{teamBName.slice(0, 3)}</HomeTeamName>
                <HomeTeamScore>
                  {teamBScores.length >= 2
                    ? teamBScores[teamBScores.length - 2]
                    : ""}
                </HomeTeamScore>
              </HomeTeamWrapper>
            </LittleScoreBoardWrapper>
          </LeftSideWrapper>
          <ResetDot
            style={{ left: "75vw", top: "2vh" }}
            onClick={resetWhiteBadges}
          />
          {blackBadgeConfigs.map((cfg) => (
            <BlackDraggableBadge
              key={cfg.id}
              cfg={cfg}
              pos={blackPositions[cfg.id]}
            />
          ))}
          {/* NameBadge */}
          {/* 4) 드롭 후 스냅 or 드래그 상태에 따라 렌더 */}
          {/* ③ activeBadges에 든 것만 렌더 */}
          {badgeConfigs
            .filter((cfg) => activeBadges.includes(cfg.id))
            .map((cfg) => (
              <DraggableBadge
                key={cfg.id}
                id={cfg.id}
                label={cfg.label}
                initialLeft={cfg.initialLeft}
                initialTop={cfg.initialTop}
                snapInfo={badgeSnaps[cfg.id]}
              />
            ))}
        </GraphicWrapper>
      </DndContext>
      <PlayersRow>
        <LeftPolygon />
        <PlayerBox>
          <PlayerWrapper>
            <PlayerPosition>
              투수
              <Dot />
              {isHomeAttack ? "AWAY" : "HOME"}
            </PlayerPosition>
            <PlayerInfo>{pitcher.playerName}</PlayerInfo>
            <PlayerChangeButton
              onClick={() => handleSubstitution(!isHomeAttack)}
            >
              선수교체
            </PlayerChangeButton>
          </PlayerWrapper>
        </PlayerBox>
        <VsText>VS</VsText>
        <PlayerBox>
          <PlayerWrapper>
            <PlayerPosition>
              {batter.battingOrder}번타자
              <Dot />
              {isHomeAttack ? "HOME" : "AWAY"}
            </PlayerPosition>
            <PlayerInfo>{batter.playerName}</PlayerInfo>
            <PlayerChangeButton
              onClick={() => handleSubstitution(isHomeAttack)}
            >
              선수교체
            </PlayerChangeButton>
          </PlayerWrapper>
        </PlayerBox>
        <RightPolygon />
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
          onSuccess={afterRecord}
          // 🔑 여기만 바꿔줍니다
          onTypeSelect={() => groundModalRef.current?.open()}
        />
      )}
      {isOutModalOpen && (
        <OutModal
          setIsOutModalOpen={setIsOutModalOpen}
          playerId={batterPlayerId}
          onSuccess={afterRecord}
          // 🔑 여기만 바꿔줍니다
          onTypeSelect={() => groundModalRef.current?.open()}
        />
      )}
      {isEtcModalOpen && (
        <EtcModal
          setIsEtcModalOpen={setIsEtcModalOpen}
          playerId={batterPlayerId}
          onSuccess={afterRecord}
          // 🔑 여기만 바꿔줍니다
          onTypeSelect={() => groundModalRef.current?.open()}
        />
      )}

      {isGameEndModalOpen && (
        <GameOverModal
          inningScore={thisInningScore}
          setIsGameEndModalOpen={setIsGameEndModalOpen}
        />
      )}

      {/* ⚠️ 꼭 마지막에 항상 렌더, 내부에서만 isOpen 제어 */}
      <GroundRecordModal ref={groundModalRef} onSuccess={afterRecord} />

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
