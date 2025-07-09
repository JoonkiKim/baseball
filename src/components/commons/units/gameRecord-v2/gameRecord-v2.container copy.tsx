// // src/components/pages/GameRecordPage.jsx
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   CSSProperties,
//   useRef,
// } from "react";
// import {
//   DndContext,
//   useDraggable,
//   useDroppable,
//   DragEndEvent,
//   useSensors,
//   PointerSensor,
//   TouchSensor,
//   useSensor,
//   CollisionDetection,
// } from "@dnd-kit/core";

// import { useRouter } from "next/router";
// import API from "../../../../commons/apis/api";
// import {
//   GameRecordContainer,
//   InningHeader,
//   InningCell,
//   TeamRow,
//   TeamNameCell,
//   TeamScoreCell,
//   ControlButtonsRow,
//   ControlButtonsWrapper,
//   ControlButton,
//   RecordActionsRow,
//   RecordActionButton,
//   ScoreBoardWrapper,
//   GraphicWrapper,
//   FullImage,
//   OutCount,
//   Ellipse,
//   // OverlaySvg,
//   ResetDot,
//   Rotator,
//   DiamondSvg,
//   NameBadge,
//   NameText,
// } from "./gameRecord-v2.style";
// import HitModal from "../../modals/hitModal";
// import OutModal from "../../modals/outModal";
// import EtcModal from "../../modals/etcModal";
// import DefenseChangeModal from "../../modals/defenseChange";
// import GameOverModal from "../../modals/gameOverModal";
// import ScorePatchModal from "../../modals/scorePatchModal";
// import {
//   awayBatterNumberState,
//   homeBatterNumberState,
//   substitutionSwappedState,
// } from "../../../../commons/stores";
// import { useRecoilState } from "recoil";
// import {
//   LoadingIcon,
//   LoadingOverlay,
// } from "../../../../commons/libraries/loadingOverlay";
// import ErrorAlert from "../../../../commons/libraries/showErrorCode";
// import {
//   ModalButton,
//   ModalContainer,
//   ModalOverlay,
//   ModalTitleSmaller,
// } from "../../modals/modal.style";

// export default function GameRecordPageV2() {
//   const [error, setError] = useState(null);
//   const router = useRouter();
//   const recordId = router.query.recordId;

//   // 이닝 헤더 (1~7, R, H)
//   const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];

//   // 팀 이름
//   const [teamAName, setTeamAName] = useState("");
//   const [teamBName, setTeamBName] = useState("");

//   // 이닝별 점수 (9칸: 7이닝 + R, H)
//   const [teamAScores, setTeamAScores] = useState(Array(9).fill(""));
//   const [teamBScores, setTeamBScores] = useState(Array(9).fill(""));

//   // 이번 이닝 득점
//   const [thisInningScore, setThisInningScore] = useState(0);

//   // 현재 타자/투수
//   const [batter, setBatter] = useState({
//     battingOrder: 0,
//     playerId: 0,
//     playerName: "-",
//     isElite: false,
//     isWc: false,
//     position: "-",
//   });
//   const [pitcher, setPitcher] = useState({
//     battingOrder: 0,
//     playerId: 0,
//     playerName: "-",
//     isElite: false,
//     isWc: false,
//     position: "P",
//   });
//   const [batterPlayerId, setBatterPlayerId] = useState(0);

//   // Recoil 상태들
//   const [homeBatterNumber, setHomeBatterNumber] = useRecoilState(
//     homeBatterNumberState
//   );
//   const [awayBatterNumber, setAwayBatterNumber] = useRecoilState(
//     awayBatterNumberState
//   );
//   const [isSubstitutionSwapped, setIsSubstitutionSwapped] = useRecoilState(
//     substitutionSwappedState
//   );

//   // 로딩 상태
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   // attack 쿼리 동기화를 위한 state
//   const [attackVal, setAttackVal] = useState("");

//   // 예시 데이터 객체
//   const exampleScores = {
//     scoreboard: [
//       { inning: 1, inningHalf: "TOP", runs: 1 },
//       { inning: 1, inningHalf: "BOTTOM", runs: 1 },
//       { inning: 2, inningHalf: "TOP", runs: 2 },
//       { inning: 2, inningHalf: "BOTTOM", runs: 1 },
//       // … 3~7 이닝까지 필요하면 추가
//     ],
//     teamSummary: {
//       away: { runs: 3, hits: 5 },
//       home: { runs: 1, hits: 4 },
//     },
//   };

//   // ── 1) 이닝 점수 GET ──
//   const fetchInningScores = useCallback(async () => {
//     if (!recordId) return;
//     try {
//       // 실제 호출은 잠시 주석 처리
//       // const res = await API.get(`/games/${recordId}/scores`);
//       // const response = res.data;

//       const response = exampleScores;
//       // console.log("스코어보드 응답도착");
//       const newA = Array(9).fill("");
//       const newB = Array(9).fill("");

//       if (Array.isArray(response.scoreboard)) {
//         response.scoreboard.forEach((entry) => {
//           const idx = entry.inning - 1;
//           if (idx >= 0 && idx < 7) {
//             if (entry.inningHalf === "TOP") newA[idx] = entry.runs;
//             else newB[idx] = entry.runs;
//           }
//         });
//       }

//       // R, H 컬럼
//       newA[7] = response.teamSummary.away.runs;
//       newA[8] = response.teamSummary.away.hits;
//       newB[7] = response.teamSummary.home.runs;
//       newB[8] = response.teamSummary.home.hits;

//       setTeamAScores(newA);
//       setTeamBScores(newB);

//       // attackVal 계산
//       let newAttack = "away";
//       if (Array.isArray(response.scoreboard) && response.scoreboard.length) {
//         const last = response.scoreboard[response.scoreboard.length - 1];
//         newAttack = last.inningHalf === "TOP" ? "home" : "away";
//       }
//       setAttackVal(newAttack);
//       return newAttack;
//     } catch (err) {
//       console.error("이닝 점수 로드 실패:", err);
//       setError(err);
//     }
//   }, [router.query.recordId, attackVal]);

//   // ── 마운트 및 의존성 변경 시 호출 ──
//   useEffect(() => {
//     // 팀 이름 로컬스토리지에서
//     const matchStr = localStorage.getItem("selectedMatch");
//     if (matchStr) {
//       try {
//         const { awayTeam, homeTeam } = JSON.parse(matchStr);
//         setTeamAName(awayTeam.name);
//         setTeamBName(homeTeam.name);
//       } catch {
//         console.error("selectedMatch 파싱 실패");
//       }
//     }
//     fetchInningScores();
//   }, [fetchInningScores]);

//   // ── 4) attack 쿼리 실제 동기화 ──
//   useEffect(() => {
//     if (!recordId) return;
//     if (router.query.attack !== attackVal) {
//       router.replace({
//         pathname: router.pathname,
//         query: { ...router.query, attack: attackVal },
//       });
//     }
//   }, [recordId, attackVal, router.query.attack, router]);

//   // ── 기록 액션 ──
//   const handleRecordAction = async (action: string) => {
//     if (isSubmitting) return;

//     switch (action) {
//       case "안타":
//         setIsHitModalOpen(true);
//         break;

//       case "볼넷/사구":
//         setIsSubmitting(true);
//         try {
//           // 1) POST 요청
//           await API.post(
//             `/games/${recordId}/plate-appearance`,
//             {
//               result: "BB",
//             }
//             // { withCredentials: true }
//           );

//           // 3) GET 요청들만 다시 실행
//           const newAttack = await fetchInningScores();

//           // 2) Alert 표시 (확인 클릭 후 다음 로직 실행)
//           // alert("볼넷/사구 기록 전송 완료");
//         } catch (e) {
//           console.error("볼넷/사구 오류:", e);
//           setError(e);
//           // alert("볼넷/사구 오류");
//         } finally {
//           setIsSubmitting(false);
//         }
//         break;

//       case "아웃":
//         setIsOutModalOpen(true);
//         break;

//       case "etc":
//         setIsEtcModalOpen(true);
//         break;

//       default:
//         break;
//     }
//   };

//   // ── 교체/공수교대/경기종료 ──
//   const handleSubstitution = (isHome) => {
//     router.push({
//       pathname: `/matches/${recordId}/substitution`,
//       query: { isHomeTeam: isHome },
//     });
//   };
//   // ① POST + alert 후에 resolve 되는 async 함수로 변경
//   // → 여기에 모든 “공수교대” 로직을 몰아서 처리
//   const handleDefenseChange = useCallback(async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     try {
//       // 1) POST
//       // await API.post(`/games/${recordId}/scores`, { runs: thisInningScore }),
//       // { withCredentials: true };
//       // 2) 사용자 알림 (확인 클릭 후 다음 단계)
//       console.log({ runs: thisInningScore });

//       // 3) 로컬 state 리셋
//       setIsSubstitutionSwapped((prev) => !prev);
//       setThisInningScore(0);
//       // 4) GET 리패치
//       // alert("공수교대 완료");
//       const newAttack = await fetchInningScores();
//     } catch (error) {
//       console.error("교대 오류:", error);
//       setError(error);
//       // alert("교대 오류");
//     } finally {
//       setIsSubmitting(false);
//       setIsChangeModalOpen(false);
//     }
//   }, [
//     recordId,
//     thisInningScore,
//     isSubmitting,
//     fetchInningScores,

//     setIsSubstitutionSwapped,
//   ]);

//   const [activeId, setActiveId] = useState<string | null>(null);
//   // ── 모달 상태 ──
//   const [isHitModalOpen, setIsHitModalOpen] = useState(false);
//   const [isOutModalOpen, setIsOutModalOpen] = useState(false);
//   const [isEtcModalOpen, setIsEtcModalOpen] = useState(false);
//   const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
//   const [isGameEndModalOpen, setIsGameEndModalOpen] = useState(false);
//   const [isScorePatchModalOpen, setIsScorePatchModalOpen] = useState(false);
//   const [selectedCell, setSelectedCell] = useState(null);

//   const handleScoreCellClick = (score, team, idx) => {
//     if (score === "" || idx >= 7) return;
//     setSelectedCell({ score: String(score), team, index: idx });
//     setIsScorePatchModalOpen(true);
//   };
//   // 에러 상태
//   const [validationError, setValidationError] = useState<string | null>(null);

//   useEffect(() => {
//     const originalAlert = window.alert;
//     window.alert = (msg: string) => {
//       setValidationError(msg);
//     };
//     return () => {
//       window.alert = originalAlert;
//     };
//   }, []);

//   const isHomeAttack = router.query.attack === "home";
//   console.log("isHomeAttack", isHomeAttack);

//   // -------------------- 드래그앤드롭 ------------------------//
//   // 1) Badge 설정 타입과 배열을 추가
//   interface BadgeConfig {
//     id: string;
//     label: string;
//     initialLeft: string; // CSS 문자열(e.g. '55%', '100px')
//     initialTop: string;
//   }

//   const badgeConfigs: BadgeConfig[] = [
//     { id: "badge-1", label: "박병호", initialLeft: "55%", initialTop: "85%" },
//     { id: "badge-2", label: "이주형", initialLeft: "10%", initialTop: "10%" },
//     { id: "badge-3", label: "송성문", initialLeft: "80%", initialTop: "10%" },
//     { id: "badge-4", label: "OOO", initialLeft: "50%", initialTop: "50%" },
//   ];

//   // 베이스 아이디 목록
//   const baseIds = [
//     "first-base",
//     "second-base",
//     "third-base",
//     "home-base",
//   ] as const;
//   type BaseId = (typeof baseIds)[number];
//   // 각 베이스에 대응할 ref와 dnd-kit setNodeRef 훅을 모아두기
//   const baseRefs = useRef<Record<BaseId, SVGPolygonElement | null>>({
//     "first-base": null,
//     "second-base": null,
//     "third-base": null,
//     "home-base": null,
//   });
//   const droppableSetters = baseIds.reduce((acc, id) => {
//     acc[id] = useDroppable({ id }).setNodeRef;
//     return acc;
//   }, {} as Record<BaseId, (el: HTMLElement | null) => void>);

//   // 드롭 상태
//   // 2) 드롭된 badge 위치 상태
//   // 어느 베이스에 드롭됐는지 and 그 좌표
//   const [droppedBase, setDroppedBase] = useState<BaseId | null>(null);
//   const [dropPos, setDropPos] = useState<{ x: number; y: number } | null>(null);
//   // 마지막으로 성공 스냅된 베이스 ID
//   const [lastBase, setLastBase] = useState<BaseId | null>(null);
//   // 마지막으로 성공 스냅된 좌표
//   const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

//   const [droppedToFirst, setDroppedToFirst] = useState(false);
//   // 1루 droppable ref
//   // 1) 그대로 HTMLElement 기반으로 droppable 생성
//   const polygonRef = useRef<SVGPolygonElement>(null);
//   const { setNodeRef: setDroppableNodeRef } = useDroppable({
//     id: "first-base",
//   });

//   // 2) SVGPolygonElement 를 받아서 HTMLElement 로 강제 캐스팅하는 콜백을 하나 더 만듭니다.
//   const setFirstBaseRef = (el: SVGPolygonElement | null) => {
//     setDroppableNodeRef(el as unknown as HTMLElement);
//     polygonRef.current = el;
//   };

//   // 3) 드래그 종료 시 처리

//   // ① 사용할 센서 정의
//   const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

//   // 드롭 로직
//   // 배지 (collisionRect)에 폴리곤 중앙이 들어왔는지 판정하는 함수 추가
//   function rectContainsPoint(
//     rect: { left: number; top: number; width: number; height: number },
//     x: number,
//     y: number
//   ) {
//     return (
//       x >= rect.left &&
//       x <= rect.left + rect.width &&
//       y >= rect.top &&
//       y <= rect.top + rect.height
//     );
//   }

//   // 4) 커스텀 collisionDetection 정의 (_collisionDetection={…}로 교체)
//   const centerInsideBadge: CollisionDetection = ({ collisionRect }) => {
//     if (!collisionRect || !polygonRef.current) {
//       return [];
//     }

//     const polyBBox = polygonRef.current.getBoundingClientRect();
//     const centerX = polyBBox.left + polyBBox.width / 2;
//     const centerY = polyBBox.top + polyBBox.height / 2;

//     return rectContainsPoint(collisionRect, centerX, centerY)
//       ? [{ id: "first-base" }]
//       : [];
//   };

//   // ────────────────────────
//   // 1) badge에도 ref 걸기
//   const badgeRef = useRef<HTMLElement>(null);

//   // 3) wrapper 크기 측정
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
//   useEffect(() => {
//     const rect = wrapperRef.current?.getBoundingClientRect();
//     if (rect) setWrapperSize({ width: rect.width, height: rect.height });
//   }, []);

//   // function DraggableBadge() {
//   //   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//   //     id: "badge",
//   //   });
//   //   const combinedRef = (el: HTMLElement | null) => {
//   //     setNodeRef(el);
//   //     badgeRef.current = el;
//   //   };

//   //   // 드롭된 베이스가 있으면 스냅
//   //   if (droppedBase && dropPos) {
//   //     const offsetX = transform?.x ?? 0;
//   //     const offsetY = transform?.y ?? 0;
//   //     return (
//   //       <NameBadge
//   //         ref={combinedRef}
//   //         style={{
//   //           position: "absolute",
//   //           left: `${dropPos.x}px`,
//   //           top: `${dropPos.y}px`,
//   //           transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
//   //         }}
//   //         {...attributes}
//   //         {...listeners}
//   //       >
//   //         이주형
//   //       </NameBadge>
//   //     );
//   //   }

//   //   // 아직 드롭 전
//   //   const style = transform
//   //     ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
//   //     : {};

//   //   return (
//   //     <NameBadge ref={combinedRef} style={style} {...attributes} {...listeners}>
//   //       이주형
//   //     </NameBadge>
//   //   );
//   // }
//   interface DraggableBadgeProps {
//     id: string;
//     label: string;
//     initialLeft: string;
//     initialTop: string;
//     droppedBase: BaseId | null;
//     dropPos: { x: number; y: number } | null;
//   }

//   function DraggableBadge({
//     id,
//     label,
//     initialLeft,
//     initialTop,
//     droppedBase,
//     dropPos,
//   }: DraggableBadgeProps) {
//     const { attributes, listeners, setNodeRef, transform } = useDraggable({
//       id,
//     });

//     // 스냅된 상태라면 dropPos로 고정 배치
//     if (droppedBase === id && dropPos) {
//       return (
//         <NameBadge
//           ref={setNodeRef}
//           style={{
//             position: "absolute",
//             left: `${dropPos.x}px`,
//             top: `${dropPos.y}px`,
//             transform: "translate(-50%, -50%)",
//           }}
//           {...attributes}
//           {...listeners}
//         >
//           {label}
//         </NameBadge>
//       );
//     }

//     // 드래그 중이거나 초기 위치
//     const style: CSSProperties = {
//       position: "absolute",
//       left: initialLeft,
//       top: initialTop,
//       transform: transform
//         ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
//         : undefined,
//     };

//     return (
//       <NameBadge ref={setNodeRef} style={style} {...attributes} {...listeners}>
//         {label}
//       </NameBadge>
//     );
//   }

//   function handleDragEnd(event: DragEndEvent) {
//     if (!badgeRef.current || !wrapperRef.current) return;

//     // (1) 지금 마지막에 머물러 있던 베이스와 좌표
//     const prevBase = lastBase;
//     const prevPos = lastPos;

//     // (2) 새로 드롭된 베이스 후보
//     let landedOn: BaseId | null = null;
//     let landedPos: { x: number; y: number } | null = null;

//     for (const id of baseIds) {
//       const poly = baseRefs.current[id];
//       if (!poly) continue;

//       const polyBB = poly.getBoundingClientRect();
//       const cx = polyBB.left + polyBB.width / 2;
//       const cy = polyBB.top + polyBB.height / 2;
//       const badgeBB = badgeRef.current.getBoundingClientRect();

//       if (
//         cx >= badgeBB.left &&
//         cx <= badgeBB.left + badgeBB.width &&
//         cy >= badgeBB.top &&
//         cy <= badgeBB.top + badgeBB.height
//       ) {
//         const wrapBB = wrapperRef.current.getBoundingClientRect();
//         landedOn = id;
//         landedPos = { x: cx - wrapBB.left, y: cy - wrapBB.top };
//         break;
//       }
//     }

//     // (3) “건너뛰기 금지” 룰: prevBase → allowedNext
//     // ① nextMap 은 BaseId → BaseId 매핑만
//     const nextMap: Record<BaseId, BaseId> = {
//       "first-base": "second-base",
//       "second-base": "third-base",
//       "third-base": "home-base",
//       "home-base": "home-base",
//     };

//     // ② handleDragEnd 안에서
//     const allowed: BaseId =
//       prevBase === null
//         ? "first-base" // 시작(null)이면 1루만 허용
//         : nextMap[prevBase]; // 그 외엔 nextMap[prevBase]

//     // (4) 진짜 스냅 허용인지 판정
//     if (landedOn === allowed && landedPos) {
//       // → 허용된 이동: 화면에 스냅 & “마지막”으로 기억
//       setDroppedBase(landedOn);
//       setDropPos(landedPos);
//       setLastBase(landedOn);
//       setLastPos(landedPos);
//     } else {
//       // → 그 외: 무조건 prevBase(=lastBase)로 복귀
//       if (prevBase && prevPos) {
//         setDroppedBase(prevBase);
//         setDropPos(prevPos);
//       } else {
//         // 최초 상태(아직 1루도 못 간 상태)면 초기 위치(null)
//         setDroppedBase(null);
//         setDropPos(null);
//       }
//     }
//   }

//   useEffect(() => {
//     if (droppedToFirst && dropPos) {
//       console.log("🔔 스냅된 배지 최종 위치:", dropPos);
//     }
//   }, [droppedToFirst, dropPos]);

//   return (
//     <GameRecordContainer>
//       <ScoreBoardWrapper>
//         <InningHeader>
//           {inningHeaders.map((inn, i) => (
//             <InningCell key={i}>{inn}</InningCell>
//           ))}
//         </InningHeader>

//         {/* Team A */}
//         <TeamRow>
//           <TeamNameCell>{teamAName.slice(0, 3)}</TeamNameCell>
//           {teamAScores.map((s, i) => (
//             <TeamScoreCell
//               key={i}
//               onClick={() => handleScoreCellClick(s, "A", i)}
//             >
//               {s}
//             </TeamScoreCell>
//           ))}
//         </TeamRow>

//         {/* Team B */}
//         <TeamRow>
//           <TeamNameCell>{teamBName.slice(0, 3)}</TeamNameCell>
//           {teamBScores.map((s, i) => (
//             <TeamScoreCell
//               key={i}
//               onClick={() => handleScoreCellClick(s, "B", i)}
//             >
//               {s}
//             </TeamScoreCell>
//           ))}
//         </TeamRow>
//       </ScoreBoardWrapper>

//       <ControlButtonsRow>
//         <ControlButtonsWrapper>
//           <ControlButton
//             onClick={() => setIsChangeModalOpen(true)}
//             disabled={isSubmitting}
//           >
//             공수교대
//           </ControlButton>
//           <ControlButton onClick={() => setIsGameEndModalOpen(true)}>
//             경기종료
//           </ControlButton>
//         </ControlButtonsWrapper>
//       </ControlButtonsRow>

//       <DndContext
//         sensors={sensors}
//         onDragEnd={handleDragEnd}
//         collisionDetection={centerInsideBadge}
//       >
//         <GraphicWrapper ref={wrapperRef}>
//           <OutCount>
//             <Ellipse active />
//             <Ellipse />
//             <Ellipse />
//           </OutCount>
//           <DiamondSvg viewBox="0 0 110 110">
//             <polygon points="55,0 110,55 55,110 0,55" />
//             {/* 1루 */}
//             <polygon
//               className="inner"
//               ref={(el) => {
//                 droppableSetters["first-base"](el as any);
//                 baseRefs.current["first-base"] = el;
//               }}
//               points="103.5,48.5 110,55 103.5,61.5 97,55"
//             />
//             {/* 2루 */}
//             <polygon
//               className="inner"
//               ref={(el) => {
//                 droppableSetters["second-base"](el as any);
//                 baseRefs.current["second-base"] = el;
//               }}
//               points="55,0 61.5,6.5 55,13 48.5,6.5"
//             />
//             {/* 3루 */}
//             <polygon
//               className="inner"
//               ref={(el) => {
//                 droppableSetters["third-base"](el as any);
//                 baseRefs.current["third-base"] = el;
//               }}
//               points="6.5,48.5 13,55 6.5,61.5 0,55"
//             />{" "}
//             {/* 홈 */}
//             <polygon
//               className="inner"
//               ref={(el) => {
//                 droppableSetters["home-base"](el as any);
//                 baseRefs.current["home-base"] = el;
//               }}
//               points="55,97 61.5,103.5 55,110 48.5,103.5"
//             />
//           </DiamondSvg>

//           {/* NameBadge */}
//           {/* 4) 드롭 후 스냅 or 드래그 상태에 따라 렌더 */}

//           {badgeConfigs.map((cfg) => (
//             <DraggableBadge
//               key={cfg.id}
//               id={cfg.id}
//               label={cfg.label}
//               initialLeft={cfg.initialLeft}
//               initialTop={cfg.initialTop}
//               droppedBase={droppedBase}
//               dropPos={dropPos}
//             />
//           ))}

//           <ResetDot style={{ left: "76vw", top: "2vh" }} />
//         </GraphicWrapper>
//       </DndContext>

//       <RecordActionsRow>
//         <RecordActionButton onClick={() => handleRecordAction("안타")}>
//           안타
//         </RecordActionButton>
//         <RecordActionButton
//           onClick={() => handleRecordAction("볼넷/사구")}
//           disabled={isSubmitting}
//         >
//           사사구
//         </RecordActionButton>
//         <RecordActionButton onClick={() => handleRecordAction("아웃")}>
//           아웃
//         </RecordActionButton>
//         <RecordActionButton onClick={() => handleRecordAction("etc")}>
//           etc
//         </RecordActionButton>
//       </RecordActionsRow>

//       {isHitModalOpen && (
//         <HitModal
//           setIsHitModalOpen={setIsHitModalOpen}
//           playerId={batterPlayerId}
//           onSuccess={async () => {
//             const newAttack = await fetchInningScores();
//           }}
//         />
//       )}
//       {isOutModalOpen && (
//         <OutModal
//           setIsOutModalOpen={setIsOutModalOpen}
//           playerId={batterPlayerId}
//           onSuccess={async () => {
//             const newAttack = await fetchInningScores();
//           }}
//         />
//       )}
//       {isEtcModalOpen && (
//         <EtcModal
//           setIsEtcModalOpen={setIsEtcModalOpen}
//           playerId={batterPlayerId}
//           onSuccess={async () => {
//             const newAttack = await fetchInningScores();
//           }}
//         />
//       )}
//       {isChangeModalOpen && (
//         <DefenseChangeModal
//           setIsChangeModalOpen={setIsChangeModalOpen}
//           onSuccess={handleDefenseChange}
//         />
//       )}

//       {isGameEndModalOpen && (
//         <GameOverModal
//           inningScore={thisInningScore}
//           setIsGameEndModalOpen={setIsGameEndModalOpen}
//         />
//       )}

//       {isScorePatchModalOpen && selectedCell && (
//         <ScorePatchModal
//           setIsModalOpen={setIsScorePatchModalOpen}
//           cellValue={selectedCell.score}
//           team={selectedCell.team}
//           cellIndex={selectedCell.index}
//           onSuccess={async () => {
//             // setIsSubmitting(true);
//             try {
//               const newAttack = await fetchInningScores();
//             } finally {
//               // setIsSubmitting(false);
//             }
//           }}
//         />
//       )}
//       {!isSubmitting && validationError && (
//         <ModalOverlay>
//           <ModalContainer>
//             <ModalTitleSmaller>{validationError}</ModalTitleSmaller>

//             <ModalButton onClick={() => setValidationError(null)}>
//               확인
//             </ModalButton>
//           </ModalContainer>
//         </ModalOverlay>
//       )}
//       <LoadingOverlay visible={isSubmitting}>
//         <LoadingIcon spin fontSize={48} />
//       </LoadingOverlay>
//       <ErrorAlert error={error} />
//     </GameRecordContainer>
//   );
// }
