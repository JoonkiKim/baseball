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

  // 베이스 아이디 목록
  const baseIds = [
    "first-base",
    "second-base",
    "third-base",
    "home-base",
  ] as const;
  type BaseId = (typeof baseIds)[number];
  // 각 베이스에 대응할 ref와 dnd-kit setNodeRef 훅을 모아두기
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

  // 드롭 상태
  // 2) 드롭된 badge 위치 상태
  // 어느 베이스에 드롭됐는지 and 그 좌표
  const [droppedBase, setDroppedBase] = useState<BaseId | null>(null);
  const [dropPos, setDropPos] = useState<{ x: number; y: number } | null>(null);
  const [droppedToFirst, setDroppedToFirst] = useState(false);
  // 1루 droppable ref
  // 1) 그대로 HTMLElement 기반으로 droppable 생성
  const polygonRef = useRef<SVGPolygonElement>(null);
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: "first-base",
  });

  // 2) SVGPolygonElement 를 받아서 HTMLElement 로 강제 캐스팅하는 콜백을 하나 더 만듭니다.
  const setFirstBaseRef = (el: SVGPolygonElement | null) => {
    setDroppableNodeRef(el as unknown as HTMLElement);
    polygonRef.current = el;
  };

  // 3) 드래그 종료 시 처리

  // ① 사용할 센서 정의
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  // 드롭 로직
  // 배지 (collisionRect)에 폴리곤 중앙이 들어왔는지 판정하는 함수 추가
  function rectContainsPoint(
    rect: { left: number; top: number; width: number; height: number },
    x: number,
    y: number
  ) {
    return (
      x >= rect.left &&
      x <= rect.left + rect.width &&
      y >= rect.top &&
      y <= rect.top + rect.height
    );
  }

  // 4) 커스텀 collisionDetection 정의 (_collisionDetection={…}로 교체)
  const centerInsideBadge: CollisionDetection = ({ collisionRect }) => {
    if (!collisionRect || !polygonRef.current) {
      return [];
    }

    const polyBBox = polygonRef.current.getBoundingClientRect();
    const centerX = polyBBox.left + polyBBox.width / 2;
    const centerY = polyBBox.top + polyBBox.height / 2;

    return rectContainsPoint(collisionRect, centerX, centerY)
      ? [{ id: "first-base" }]
      : [];
  };

  // ────────────────────────
  // 1) badge에도 ref 걸기
  const badgeRef = useRef<HTMLElement>(null);

  // function DraggableBadge() {
  //   const { attributes, listeners, setNodeRef, transform } = useDraggable({
  //     id: "badge",
  //   });

  //   // setNodeRef 와 badgeRef 를 동시에 연결하기 위한 callback
  //   const combinedRef = (el: HTMLElement | null) => {
  //     setNodeRef(el);
  //     badgeRef.current = el;
  //   };

  //   console.log("droppedToFirst", droppedToFirst);
  //   // 드롭된 상태라면 1루 중앙으로 고정
  //   if (droppedToFirst && dropPos) {
  //     // transform이 있으면 drag 중이니, drag 오프셋을 center 스냅 좌표에 더하고
  //     const translateX = transform ? transform.x : 0;
  //     const translateY = transform ? transform.y : 0;

  //     return (
  //       <NameBadge
  //         ref={combinedRef}
  //         style={{
  //           position: "absolute",
  //           left: `${dropPos.x}px`,
  //           top: `${dropPos.y}px`,
  //           transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
  //         }}
  //         {...attributes} // 여전히 a11y 속성 붙이고
  //         {...listeners}
  //       >
  //         이주형
  //       </NameBadge>
  //     );
  //   }

  //   // 드롭 전: 드래그 가능한 배지
  //   const style = transform
  //     ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
  //     : {};

  //   return (
  //     <NameBadge
  //       ref={combinedRef} // ← 여기!
  //       style={style}
  //       {...attributes}
  //       {...listeners}
  //     >
  //       이주형
  //     </NameBadge>
  //   );
  // }

  // function handleDragEnd(event: DragEndEvent) {
  //   // badge와 폴리곤, 그리고 GraphicWrapper 참조가 모두 있어야 진행
  //   if (!badgeRef.current || !polygonRef.current || !wrapperRef.current) return;

  //   // 1) 뷰포트 기준 1루 폴리곤의 바운딩 박스 가져오기
  //   const polyBBox = polygonRef.current.getBoundingClientRect();
  //   // 2) 폴리곤 사각형의 중앙 좌표 계산 (뷰포트 기준)
  //   const centerX = polyBBox.left + polyBBox.width / 2;
  //   const centerY = polyBBox.top + polyBBox.height / 2;

  //   // 3) 뷰포트 기준 GraphicWrapper의 바운딩 박스 가져오기
  //   const wrapBBox = wrapperRef.current.getBoundingClientRect();
  //   // 4) 뷰포트 좌표를 wrapper 내부 좌표로 변환
  //   const localX = centerX - wrapBBox.left;
  //   const localY = centerY - wrapBBox.top;

  //   // 5) badge의 현재 위치(rect) 가져와서 판정
  //   const badgeBBox = badgeRef.current.getBoundingClientRect();
  //   const inside =
  //     centerX >= badgeBBox.left &&
  //     centerX <= badgeBBox.left + badgeBBox.width &&
  //     centerY >= badgeBBox.top &&
  //     centerY <= badgeBBox.top + badgeBBox.height;

  //   console.log("폴리곤 중앙이 배지 안에 있나?", inside);
  //   console.log("뷰포트 기준 중앙:", { x: centerX, y: centerY });
  //   console.log("wrapper 내부 기준 중앙:", { x: localX, y: localY });

  //   if (inside) {
  //     // 드롭 성공 시, wrapper-local 좌표를 상태에 저장
  //     setDropPos({ x: localX, y: localY });
  //     setDroppedToFirst(true);
  //   }
  // }

  function DraggableBadge() {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: "badge",
    });
    const combinedRef = (el: HTMLElement | null) => {
      setNodeRef(el);
      badgeRef.current = el;
    };

    // 드롭된 베이스가 있으면 스냅
    if (droppedBase && dropPos) {
      const offsetX = transform?.x ?? 0;
      const offsetY = transform?.y ?? 0;
      return (
        <NameBadge
          ref={combinedRef}
          style={{
            position: "absolute",
            left: `${dropPos.x}px`,
            top: `${dropPos.y}px`,
            transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          }}
          {...attributes}
          {...listeners}
        >
          이주형
        </NameBadge>
      );
    }

    // 아직 드롭 전
    const style = transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : {};

    return (
      <NameBadge ref={combinedRef} style={style} {...attributes} {...listeners}>
        이주형
      </NameBadge>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!badgeRef.current || !wrapperRef.current) return;

    // 뷰포트 기준 badge 영역
    const badgeBBox = badgeRef.current.getBoundingClientRect();

    // 각 베이스 중앙을 순회하며 판정
    for (const id of baseIds) {
      const poly = baseRefs.current[id];
      if (!poly) continue;

      const polyBBox = poly.getBoundingClientRect();
      const centerX = polyBBox.left + polyBBox.width / 2;
      const centerY = polyBBox.top + polyBBox.height / 2;

      // 중앙점이 배지 영역 안에 들어오면 해당 베이스로 드롭 인정
      if (
        centerX >= badgeBBox.left &&
        centerX <= badgeBBox.left + badgeBBox.width &&
        centerY >= badgeBBox.top &&
        centerY <= badgeBBox.top + badgeBBox.height
      ) {
        // wrapper-local 좌표 변환
        const wrapBBox = wrapperRef.current.getBoundingClientRect();
        const localX = centerX - wrapBBox.left;
        const localY = centerY - wrapBBox.top;

        setDroppedBase(id);
        setDropPos({ x: localX, y: localY });
        return;
      }
    }

    // 어느 베이스에도 안 들어오면 초기화
    setDroppedBase(null);
    setDropPos(null);
  }

  useEffect(() => {
    if (droppedToFirst && dropPos) {
      console.log("🔔 스냅된 배지 최종 위치:", dropPos);
    }
  }, [droppedToFirst, dropPos]);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
            공수교대
          </ControlButton>
          <ControlButton onClick={() => setIsGameEndModalOpen(true)}>
            경기종료
          </ControlButton>
        </ControlButtonsWrapper>
      </ControlButtonsRow>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={centerInsideBadge}
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
              ref={(el) => {
                droppableSetters["first-base"](el as any);
                baseRefs.current["first-base"] = el;
              }}
              points="103.5,48.5 110,55 103.5,61.5 97,55"
            />
            {/* 2루 */}
            <polygon
              className="inner"
              ref={(el) => {
                droppableSetters["second-base"](el as any);
                baseRefs.current["second-base"] = el;
              }}
              points="55,0 61.5,6.5 55,13 48.5,6.5"
            />
            {/* 3루 */}
            <polygon
              className="inner"
              ref={(el) => {
                droppableSetters["third-base"](el as any);
                baseRefs.current["third-base"] = el;
              }}
              points="6.5,48.5 13,55 6.5,61.5 0,55"
            />{" "}
            {/* 홈 */}
            <polygon
              className="inner"
              ref={(el) => {
                droppableSetters["home-base"](el as any);
                baseRefs.current["home-base"] = el;
              }}
              points="55,97 61.5,103.5 55,110 48.5,103.5"
            />
          </DiamondSvg>

          {/* NameBadge */}
          {/* 4) 드롭 후 스냅 or 드래그 상태에 따라 렌더 */}

          <DraggableBadge />
          <ResetDot style={{ left: "76vw", top: "2vh" }} />
        </GraphicWrapper>
      </DndContext>

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
