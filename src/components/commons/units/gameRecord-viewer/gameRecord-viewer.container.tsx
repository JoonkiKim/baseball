// src/components/pages/GameRecordPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useRouter } from "next/router";
import API from "../../../../commons/apis/api";
import {
  GameRecordContainer,
  InningHeader,
  InningCell,
  TeamRow,
  TeamNameCell,
  TeamScoreCell,
  ScoreBoardWrapper,
  GraphicWrapper,
  OutCount,
  Ellipse,
  DiamondSvg,
  NameBadge,
  PlayersRow,
  HomeWrapper,
  LineWrapper,
  HomeBaseWrapper,
  Ground,
  OutZoneWrapper,
  CustomBoundaryWrapper,
  SideWrapper,
  LeftSideWrapper,
  InningBoard,
  InningNumber,
  LittleScoreBoardWrapper,
  AwayTeamWrapper,
  AwayTeamName,
  AwayTeamScore,
  HomeTeamWrapper,
  HomeTeamName,
  HomeTeamScore,
} from "./gameRecord-viewer.style";

import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";
import { OnDeckWrapper } from "../gameRecord-v2/gameRecord-v2.style";

export default function GameRecordPageViewer() {
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

  // 현재 타자/투수

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

  // ① POST + alert 후에 resolve 되는 async 함수로 변경
  // → 여기에 모든 “공수교대” 로직을 몰아서 처리

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

  // 대기타석
  const isHomeAttack = router.query.attack === "home";
  const lineupExample = isHomeAttack ? homeExample : awayExample;
  const onDeckPlayers = lineupExample.batters.filter((b) =>
    [1, 2, 3].includes(b.battingOrder)
  );
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
    { id: "badge-1", label: "이정후", initialLeft: "43%", initialTop: "80%" },
    // { id: "badge-2", label: "송성문", initialLeft: "80%", initialTop: "75%" },
    // { id: "badge-3", label: "김하성", initialLeft: "80%", initialTop: "85%" },
    // { id: "badge-4", label: "박병호", initialLeft: "80%", initialTop: "95%" },
  ];
  const baseOrder: Record<BaseId, number> = {
    "first-base": 1,
    "second-base": 2,
    "third-base": 3,
    "home-base": 4,
  };

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

  console.log("blackBadgeConfigs", blackBadgeConfigs);

  const diamondSvgRef = useRef<SVGSVGElement | null>(null);
  const diamondPolyRef = useRef<SVGPolygonElement | null>(null);
  type PassedMap = Record<BaseId, boolean>;
  const [isOutside, setIsOutside] = useState(false);
  // ② useRef 에 제네릭을 명시하고, reduce에도 초기값 타입을 단언
  const passedBasesRef = useRef<Record<string, PassedMap>>(
    badgeConfigs.reduce<Record<string, PassedMap>>((acc, { id }) => {
      // 각 베이스를 false 로 초기화
      const map = {} as PassedMap;
      baseIds.forEach((base) => {
        map[base] = false;
      });
      acc[id] = map;
      return acc;
    }, {}) // {} 가 Record<string, PassedMap> 임을 TS에게 알려줌
  );

  const lastPassedRef = useRef<Record<string, BaseId | null>>(
    badgeConfigs.reduce((acc, cfg) => {
      acc[cfg.id] = null;
      return acc;
    }, {} as Record<string, BaseId | null>)
  );
  // 3) 통과한 베이스 중 최대 순서
  const maxReachedRef = useRef<Record<string, number>>(
    badgeConfigs.reduce((acc, cfg) => {
      acc[cfg.id] = 0;
      return acc;
    }, {} as Record<string, number>)
  );

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

  const badgeRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeBadges, setActiveBadges] = useState(
    badgeConfigs.map((cfg) => cfg.id)
  );

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

  // --이닝의 재구성--//

  // 그라운드 내 직선 움직임 //

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
            <TeamScoreCell key={i}>{s}</TeamScoreCell>
          ))}
        </TeamRow>

        {/* Team B */}
        <TeamRow>
          <TeamNameCell>{teamBName.slice(0, 3)}</TeamNameCell>
          {teamBScores.map((s, i) => (
            <TeamScoreCell key={i}>{s}</TeamScoreCell>
          ))}
        </TeamRow>
      </ScoreBoardWrapper>

      <GraphicWrapper
        // as="svg"
        ref={wrapperRef}
        // viewBox="0 0 110 110"
        // preserveAspectRatio="xMidYMid meet"

        // outside={isOutside}
      >
        <HomeWrapper />
        <LineWrapper />
        <HomeBaseWrapper />
        <Ground />

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
            points="55,97 61.5,103.5 55,110 48.5,103.5"
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
            <InningNumber>7</InningNumber>
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

      <PlayersRow></PlayersRow>

      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      <ErrorAlert error={error} />
    </GameRecordContainer>
  );
}
