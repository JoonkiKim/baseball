// src/components/modals/groundRecordModal.tsx
import { useRouter } from "next/router";
import API from "../../../../commons/apis/api";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  CancelButton,
  CancelButtonWrapper,
  CustomBoundaryWrapper,
  DiamondSvg,
  Ellipse,
  GraphicWrapper,
  Ground,
  HomeBaseWrapper,
  HomeWrapper,
  LineWrapper,
  ModalBottomRedoUndoWrapper,
  ModalBottomRunnerTitle,
  ModalBottomRunnerWrapper,
  ModalBottomWrapper,
  ModalContainer,
  ModalOverlay,
  NameBadge,
  OutCount,
  OutZoneWrapper,
  ReconstructionButtonWrapper,
  ReconstructionSwitch,
  ReconstructionTitle,
  ReconstructionWrapper,
  RedoIcon,
  ResetDot,
  UndoIcon,
} from "./groundRecordModal.style";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { ControlButton } from "../playerSelectionModal";
import {
  CaretLeftFilled,
  CaretLeftOutlined,
  CaretRightFilled,
  CaretRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Divider } from "antd";
import { RoundCloseOutlined } from "../../../../commons/libraries/cancelButton";
import LeftPolygon from "../../../../commons/libraries/leftPolygon";
import RightPolygon from "../../../../commons/libraries/rightPolygon";

interface IModalProps {
  setIsGroundRecordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playId?: number;
  onSuccess?: () => Promise<void>;
}

export default function GroundRecordModal(props: IModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [error, setError] = useState(null);

  const [outs, setOuts] = useState<boolean[]>([false, false, false]);

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
    { id: "badge-1", label: "이정후", initialLeft: "41.5%", initialTop: "80%" },
    { id: "badge-2", label: "송성문", initialLeft: "80%", initialTop: "75%" },
    { id: "badge-3", label: "김하성", initialLeft: "80%", initialTop: "85%" },
    { id: "badge-4", label: "박병호", initialLeft: "80%", initialTop: "95%" },
  ];
  const baseOrder: Record<BaseId, number> = {
    "first-base": 1,
    "second-base": 2,
    "third-base": 3,
    "home-base": 4,
  };
  // 최상단에 선언
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

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const badgeRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeBadges, setActiveBadges] = useState(
    badgeConfigs.map((cfg) => cfg.id)
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

  // 2) badgeSnaps 상태가 바뀔 때마다 각 베이스가 채워졌는지 체크하는 useEffect
  useEffect(() => {
    // badgeSnaps: Record<badgeId, { base: BaseId; pos: { x, y } } | null>
    const occupancy: Record<BaseId, boolean> = baseIds.reduce((acc, base) => {
      // badgeSnaps 중에 baseId === base 인 항목이 하나라도 있으면 true
      acc[base] = Object.values(badgeSnaps).some((snap) => snap?.base === base);
      return acc;
    }, {} as Record<BaseId, boolean>);

    // console.log("Base occupancy:", occupancy);
    // 예: { "first-base": true, "second-base": false, ... }
  }, [badgeSnaps]);

  // 이전 outside 값을 저장할 ref
  const prevOutsideRef = useRef<boolean>(false);
  // ── 베이스 중심 좌표 캐싱용 ref (이미 적용하셨다면 생략) ──
  const baseCentersRef = useRef<Record<BaseId, { x: number; y: number }>>(
    {} as Record<BaseId, { x: number; y: number }>
  );
  // ── 마운트 시·리사이즈 시에만 베이스 중심 계산 ──
  useEffect(() => {
    const updateCenters = () => {
      baseIds.forEach((baseId) => {
        const poly = baseRefs.current[baseId];
        if (!poly) return;
        const rect = poly.getBoundingClientRect();
        baseCentersRef.current[baseId] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }; // ← 변경: 여기서 한 번만 계산해서 저장
      });
    };
    updateCenters(); // ← 변경
    window.addEventListener("resize", updateCenters); // ← 변경
    return () => {
      window.removeEventListener("resize", updateCenters); // ← 변경
    };
  }, []);
  // 2) 실제 구현부 (합집합 타입 + 플래그)
  // function handleDragEvent(
  //   event: DragOverEvent | DragEndEvent,
  //   isEnd: boolean
  // ) {
  //   // ── 드래그 중 다이아몬드 밖으로 나갔는지 검사 ──
  //   const badgeId = event.active.id as string;
  //   const badgeEl = badgeRefs.current[event.active.id as string];
  //   const draggableEl = badgeRefs.current[badgeId];

  //   /** ── OutZone 실시간 검사: 드래그 중 and 드래그 종료 시 배경색 토글 ── **/
  //   if (draggableEl && outZoneRef.current) {
  //     const badgeBB = draggableEl.getBoundingClientRect();
  //     const cx = badgeBB.left + badgeBB.width / 2;
  //     const cy = badgeBB.top + badgeBB.height / 2;
  //     const zoneBB = outZoneRef.current.getBoundingClientRect();
  //     const outside =
  //       cx < zoneBB.left ||
  //       cx > zoneBB.right ||
  //       cy < zoneBB.top ||
  //       cy > zoneBB.bottom;
  //     setIsOutside(outside);
  //   }
  //   /** ── OutZone 검사: 드래그 종료 시 영역 밖이면 배지 & 기록 삭제 ── **/
  //   if (draggableEl && outZoneRef.current && isEnd) {
  //     const badgeBB = draggableEl.getBoundingClientRect();
  //     const cx = badgeBB.left + badgeBB.width / 2;
  //     const cy = badgeBB.top + badgeBB.height / 2;
  //     const zoneBB = outZoneRef.current.getBoundingClientRect();

  //     if (
  //       cx < zoneBB.left ||
  //       cx > zoneBB.right ||
  //       cy < zoneBB.top ||
  //       cy > zoneBB.bottom
  //     ) {
  //       // 화면에서 배지 제거
  //       setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
  //       // 스냅 정보 초기화
  //       setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));
  //       // 베이스 통과 기록 초기화
  //       baseIds.forEach((base) => {
  //         passedBasesRef.current[badgeId][base] = false;
  //       });
  //       lastPassedRef.current[badgeId] = null;
  //       maxReachedRef.current[badgeId] = 0;
  //       // 배경색 초기화
  //       setIsOutside(false);
  //       return;
  //     }
  //   }

  //   // ── 드래그 놓으면 항상 복귀 ──
  //   if (isEnd) {
  //     setIsOutside(false);
  //   }

  //   const wrapEl = wrapperRef.current;
  //   if (!wrapEl) return;

  //   // --- 1) onDragOver: 새 베이스 통과만 기록 (뒤로는 못 가도록) ---
  //   if (!isEnd) {
  //     const draggableEl = badgeRefs.current[badgeId];
  //     if (!draggableEl) return;
  //     const badgeBB = draggableEl.getBoundingClientRect();

  //     for (const baseId of baseIds) {
  //       const order = baseOrder[baseId];

  //       const idx = baseIds.indexOf(baseId);
  //       if (idx > 0) {
  //         const prevBase = baseIds[idx - 1];
  //         if (!passedBasesRef.current[badgeId][prevBase]) {
  //           continue;
  //         }
  //       }

  //       const poly = baseRefs.current[baseId];
  //       // if (!poly) continue;
  //       // const polyBB = poly.getBoundingClientRect();
  //       // const cx = polyBB.left + polyBB.width / 2;
  //       // const cy = polyBB.top + polyBB.height / 2;
  //       const center = baseCentersRef.current[baseId];
  //       if (!center) continue;
  //       const { x: cx, y: cy } = center;
  //       if (
  //         cx >= badgeBB.left &&
  //         cx <= badgeBB.right &&
  //         cy >= badgeBB.top &&
  //         cy <= badgeBB.bottom
  //       ) {
  //         // ── 여기서 무조건 하이라이트 ──
  //         poly.classList.add("highlight");
  //         setTimeout(() => poly.classList.remove("highlight"), 1000);

  //         // ★ 홈베이스일 때 백그라운드 변경
  //         if (baseId === "home-base") {
  //           setIsHomeBaseActive(true);
  //           setTimeout(() => setIsHomeBaseActive(false), 1000);
  //         }

  //         // ── 통과 기록은 아직 지나가지 않은 경우에만 ──
  //         if (order > maxReachedRef.current[badgeId]) {
  //           passedBasesRef.current[badgeId][baseId] = true;
  //           lastPassedRef.current[badgeId] = baseId;
  //           maxReachedRef.current[badgeId] = order;
  //         }
  //         break;
  //       }
  //     }
  //     return;
  //   }

  //   // --- 2) onDragEnd: 드롭 위치 우선, 없으면 lastPassedRef 기준 스냅 ---
  //   console.log("🔔 handleDragEnd for:", badgeId);

  //   // 2-1) 드롭된 베이스 판별
  //   let dropBase: BaseId | null = null;
  //   let dropPos: { x: number; y: number } | null = null;

  //   if (draggableEl) {
  //     const badgeBB = draggableEl.getBoundingClientRect();
  //     for (const baseId of baseIds) {
  //       const poly = baseRefs.current[baseId];
  //       if (!poly) continue;
  //       const center = baseCentersRef.current[baseId];
  //       if (!center) continue;
  //       const { x: cx, y: cy } = center;
  //       if (
  //         cx >= badgeBB.left &&
  //         cx <= badgeBB.right &&
  //         cy >= badgeBB.top &&
  //         cy <= badgeBB.bottom
  //       ) {
  //         dropBase = baseId;
  //         const wrapBB = wrapEl.getBoundingClientRect();
  //         dropPos = {
  //           x: cx - wrapBB.left,
  //           y: cy - wrapBB.top,
  //         };
  //         break;
  //       }
  //     }
  //   }
  //   // const badgeEl = badgeRefs.current[badgeId];
  //   if (!badgeEl) return;
  //   const badgeBB = badgeEl.getBoundingClientRect();
  //   // 화면(screen) 상의 중심 좌표
  //   const cx = badgeBB.left + badgeBB.width / 2;
  //   const cy = badgeBB.top + badgeBB.height / 2;
  //   const svg = diamondSvgRef.current!;
  //   const pt = svg.createSVGPoint();
  //   pt.x = cx;
  //   pt.y = cy;
  //   // getScreenCTM() 역행렬로 변환
  //   // const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  //   // 외곽 다이아몬드 폴리곤 참조
  //   // const poly = diamondPolyRef.current!;
  //   // const isInsideDiamond = poly.isPointInFill(svgP);
  //   // if (!isInsideDiamond) {
  //   //   // 다이아몬드 폴리곤 밖에 드롭된 경우에만 사라지게
  //   //   setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
  //   //   return;
  //   // }
  //   // 2-2) 스냅할 베이스 결정: 드롭된 베이스가 있으면 우선, 없으면 lastPassedRef
  //   let snapBase = dropBase ?? lastPassedRef.current[badgeId];
  //   let snapPos: { x: number; y: number } | null = dropPos;

  //   if (snapBase === "home-base") {
  //     // 홈베이스에 들어왔을 때, 1·2·3루를 모두 통과했는지 확인
  //     const passed = passedBasesRef.current[badgeId];
  //     const requiredBases: BaseId[] = [
  //       "first-base",
  //       "second-base",
  //       "third-base",
  //     ];
  //     const passedAll = requiredBases.every((base) => passed[base]);
  //     if (passedAll) {
  //       setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
  //     }
  //     return;
  //   }

  //   if (!dropBase && snapBase) {
  //     // 지난 베이스 위치 계산
  //     const poly = baseRefs.current[snapBase]!;
  //     const wrapBB = wrapEl.getBoundingClientRect();
  //     const polyBB = poly.getBoundingClientRect();
  //     snapPos = {
  //       x: polyBB.left + polyBB.width / 2 - wrapBB.left,
  //       y: polyBB.top + polyBB.height / 2 - wrapBB.top,
  //     };
  //   }

  //   // 2-3) 이미 차지됐는지 검사
  //   const isOccupied = Object.entries(badgeSnaps).some(
  //     ([otherId, snap]) => otherId !== badgeId && snap?.base === snapBase
  //   );

  //   // 2-4) 상태 업데이트
  //   setBadgeSnaps((prev) => {
  //     const next = { ...prev };
  //     if (snapBase && snapPos && !isOccupied) {
  //       // ① 직전 베이스가 있다면 반드시 통과했어야 함
  //       const idx = baseIds.indexOf(snapBase);
  //       if (idx > 0) {
  //         const prevBase = baseIds[idx - 1];
  //         if (!passedBasesRef.current[badgeId][prevBase]) {
  //           // 아직 직전 베이스를 통과하지 않았다면 스냅 무시
  //           return next;
  //         }
  //       }
  //       // // 새 스냅 허용
  //       next[badgeId] = { base: snapBase, pos: snapPos };
  //       // 스냅된 순서도 기록
  //       maxReachedRef.current[badgeId] = baseOrder[snapBase];
  //     } else {
  //       next[badgeId] = prev[badgeId];
  //     }
  //     return next;
  //   });

  //   // 2-5) 다음 드래그를 위해 통과 기록만 리셋
  //   lastPassedRef.current[badgeId] = null;
  // }
  function handleDragEvent(
    event: DragOverEvent | DragEndEvent,
    isEnd: boolean
  ) {
    // ── 드래그 중 다이아몬드 밖으로 나갔는지 검사 ──
    const badgeId = event.active.id as string;
    const badgeEl = badgeRefs.current[event.active.id as string];
    const draggableEl = badgeRefs.current[badgeId];

    /** ── OutZone 실시간 검사: 드래그 중 and 드래그 종료 시 배경색 토글 ── **/
    if (draggableEl && outZoneRef.current) {
      const badgeBB = draggableEl.getBoundingClientRect();
      const cx = badgeBB.left + badgeBB.width / 2;
      const cy = badgeBB.top + badgeBB.height / 2;
      const zoneBB = outZoneRef.current.getBoundingClientRect();
      const outside =
        cx < zoneBB.left ||
        cx > zoneBB.right ||
        cy < zoneBB.top ||
        cy > zoneBB.bottom;
      if (outside !== prevOutsideRef.current) {
        prevOutsideRef.current = outside;
        setIsOutside(outside);
      }
    }
    /** ── OutZone 검사: 드래그 종료 시 영역 밖이면 배지 & 기록 삭제 ── **/
    if (draggableEl && outZoneRef.current && isEnd) {
      const badgeBB = draggableEl.getBoundingClientRect();
      const cx = badgeBB.left + badgeBB.width / 2;
      const cy = badgeBB.top + badgeBB.height / 2;
      const zoneBB = outZoneRef.current.getBoundingClientRect();

      if (
        cx < zoneBB.left ||
        cx > zoneBB.right ||
        cy < zoneBB.top ||
        cy > zoneBB.bottom
      ) {
        // 화면에서 배지 제거
        setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
        // 스냅 정보 초기화
        setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));
        // 베이스 통과 기록 초기화
        baseIds.forEach((base) => {
          passedBasesRef.current[badgeId][base] = false;
        });
        lastPassedRef.current[badgeId] = null;
        maxReachedRef.current[badgeId] = 0;
        // 배경색 초기화
        setIsOutside(false);
        return;
      }
    }

    // ── 드래그 종료 시, 이전에 outside였다면 복귀 ──
    if (isEnd && prevOutsideRef.current) {
      prevOutsideRef.current = false;
      setIsOutside(false);
    }

    const wrapEl = wrapperRef.current;
    if (!wrapEl) return;

    // --- 1) onDragOver: 새 베이스 통과만 기록 (뒤로는 못 가도록) ---
    if (!isEnd) {
      const draggableEl = badgeRefs.current[badgeId];
      if (!draggableEl) return;
      const badgeBB = draggableEl.getBoundingClientRect();

      for (const baseId of baseIds) {
        const order = baseOrder[baseId];

        const idx = baseIds.indexOf(baseId);
        if (idx > 0) {
          const prevBase = baseIds[idx - 1];
          if (!passedBasesRef.current[badgeId][prevBase]) {
            continue;
          }
        }

        const poly = baseRefs.current[baseId];
        // if (!poly) continue;
        // const polyBB = poly.getBoundingClientRect();
        // const cx = polyBB.left + polyBB.width / 2;
        // const cy = polyBB.top + polyBB.height / 2;
        const center = baseCentersRef.current[baseId];
        if (!center) continue;
        const { x: cx, y: cy } = center;
        if (
          cx >= badgeBB.left &&
          cx <= badgeBB.right &&
          cy >= badgeBB.top &&
          cy <= badgeBB.bottom
        ) {
          // ── 여기서 무조건 하이라이트 ──
          poly.classList.add("highlight");
          setTimeout(() => poly.classList.remove("highlight"), 1000);

          // ★ 홈베이스일 때 백그라운드 변경
          if (baseId === "home-base") {
            setIsHomeBaseActive(true);
            setTimeout(() => setIsHomeBaseActive(false), 1000);
          }

          // ── 통과 기록은 아직 지나가지 않은 경우에만 ──
          if (order > maxReachedRef.current[badgeId]) {
            passedBasesRef.current[badgeId][baseId] = true;
            lastPassedRef.current[badgeId] = baseId;
            maxReachedRef.current[badgeId] = order;
          }
          break;
        }
      }
      return;
    }

    // --- 2) onDragEnd: 드롭 위치 우선, 없으면 lastPassedRef 기준 스냅 ---
    // console.log("🔔 handleDragEnd for:", badgeId);

    // 2-1) 드롭된 베이스 판별
    let dropBase: BaseId | null = null;
    let dropPos: { x: number; y: number } | null = null;

    if (draggableEl) {
      const badgeBB = draggableEl.getBoundingClientRect();
      for (const baseId of baseIds) {
        const poly = baseRefs.current[baseId];
        if (!poly) continue;
        const center = baseCentersRef.current[baseId];
        if (!center) continue;
        const { x: cx, y: cy } = center;
        if (
          cx >= badgeBB.left &&
          cx <= badgeBB.right &&
          cy >= badgeBB.top &&
          cy <= badgeBB.bottom
        ) {
          dropBase = baseId;
          const wrapBB = wrapEl.getBoundingClientRect();
          dropPos = {
            x: cx - wrapBB.left,
            y: cy - wrapBB.top,
          };
          break;
        }
      }
    }
    // const badgeEl = badgeRefs.current[badgeId];
    if (!badgeEl) return;
    const badgeBB = badgeEl.getBoundingClientRect();
    // 화면(screen) 상의 중심 좌표
    const cx = badgeBB.left + badgeBB.width / 2;
    const cy = badgeBB.top + badgeBB.height / 2;
    const svg = diamondSvgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    // getScreenCTM() 역행렬로 변환
    // const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    // 외곽 다이아몬드 폴리곤 참조
    // const poly = diamondPolyRef.current!;
    // const isInsideDiamond = poly.isPointInFill(svgP);
    // if (!isInsideDiamond) {
    //   // 다이아몬드 폴리곤 밖에 드롭된 경우에만 사라지게
    //   setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
    //   return;
    // }
    // 2-2) 스냅할 베이스 결정: 드롭된 베이스가 있으면 우선, 없으면 lastPassedRef
    let snapBase = dropBase ?? lastPassedRef.current[badgeId];
    let snapPos: { x: number; y: number } | null = dropPos;

    if (snapBase === "home-base") {
      // 홈베이스에 들어왔을 때, 1·2·3루를 모두 통과했는지 확인
      const passed = passedBasesRef.current[badgeId];
      const requiredBases: BaseId[] = [
        "first-base",
        "second-base",
        "third-base",
      ];
      const passedAll = requiredBases.every((base) => passed[base]);
      if (passedAll) {
        setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
      }
      return;
    }

    if (!dropBase && snapBase) {
      // 지난 베이스 위치 계산
      const poly = baseRefs.current[snapBase]!;
      const wrapBB = wrapEl.getBoundingClientRect();
      const polyBB = poly.getBoundingClientRect();
      snapPos = {
        x: polyBB.left + polyBB.width / 2 - wrapBB.left,
        y: polyBB.top + polyBB.height / 2 - wrapBB.top,
      };
    }

    // 2-3) 이미 차지됐는지 검사
    const isOccupied = Object.entries(badgeSnaps).some(
      ([otherId, snap]) => otherId !== badgeId && snap?.base === snapBase
    );

    // 2-4) 상태 업데이트
    setBadgeSnaps((prev) => {
      const next = { ...prev };
      if (snapBase && snapPos && !isOccupied) {
        // ① 직전 베이스가 있다면 반드시 통과했어야 함
        const idx = baseIds.indexOf(snapBase);
        if (idx > 0) {
          const prevBase = baseIds[idx - 1];
          if (!passedBasesRef.current[badgeId][prevBase]) {
            // 아직 직전 베이스를 통과하지 않았다면 스냅 무시
            return next;
          }
        }
        // // 새 스냅 허용
        next[badgeId] = { base: snapBase, pos: snapPos };
        // 스냅된 순서도 기록
        maxReachedRef.current[badgeId] = baseOrder[snapBase];
      } else {
        next[badgeId] = prev[badgeId];
      }
      return next;
    });

    // 2-5) 다음 드래그를 위해 통과 기록만 리셋
    lastPassedRef.current[badgeId] = null;
  }

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
      // console.log(`🔔 [${id}] snapInfo:`, snapInfo);
    }
    const combinedRef = (el: HTMLElement | null) => {
      setNodeRef(el);
      badgeRefs.current[id] = el;
    };

    // CSS position & transform 결정
    if (snapInfo) {
      const { pos } = snapInfo;
      // console.log("pos", pos);
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

  const [isReconstructMode, setIsReconstructMode] = useState(false);
  const resetAllBadges = useCallback(() => {
    // 스냅 위치와 보이기 상태 초기화
    setBadgeSnaps(initialBadgeSnaps);
    setActiveBadges(badgeConfigs.map((cfg) => cfg.id));
    // 통과 기록 초기화
    badgeConfigs.forEach(({ id }) => {
      baseIds.forEach((base) => {
        passedBasesRef.current[id][base] = false;
      });
      lastPassedRef.current[id] = null;
      maxReachedRef.current[id] = 0;
    });
  }, [badgeConfigs, baseIds, initialBadgeSnaps]);

  // redo undo
  const handleRedo = () => {
    // TODO: Redo 로직
  };
  const handleUndo = () => {
    // TODO: Undo 로직
  };

  const handleClose = () => {
    // 모달 닫기
    props.setIsGroundRecordModalOpen(false);
  };

  // 확인하기 눌렀을 때 실행될 함수
  const handleSubmit = () => {
    // // 모달 닫기
    // props.setIsGroundRecordModalOpen(false);
  };

  // 커스텀경계
  const outZoneRef = useRef<HTMLDivElement>(null);

  // 커스텀 경계설정
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
    if (
      id.startsWith("black-badge") || // ▶ 검정 배지
      Boolean(badgeSnaps[id]) // ▶ 흰 배지(스냅됐을 때)
    ) {
      return restrictToCustomBounds(args);
    } else {
      return restrictToParentElement(args);
    }
  };

  // 성능 최적화
  const rafId = useRef<number | null>(null);
  // onDragMove 핸들러 재정의
  const onDragMoveThrottled = (e: DragOverEvent) => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => handleDragEvent(e, false));
  };

  const [isHomeBaseActive, setIsHomeBaseActive] = useState(false);
  // 베이스별 중심 좌표를 담을 ref

  return (
    <ModalOverlay>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        reconstructMode={isReconstructMode}
      >
        <DndContext
          id="game-record-dnd" // ← 여기에 고정된 string ID를 넣어줍니다
          sensors={sensors}
          modifiers={[dynamicBoundary]}
          measuring={{
            droppable: {
              // or AlwaysExceptInitialPlacement
              strategy: MeasuringStrategy.Always,
            },
          }}
          onDragMove={onDragMoveThrottled} // 드래그 중
          onDragEnd={(e) => handleDragEvent(e, true)} // 드래그 끝
        >
          <CancelButtonWrapper>
            {" "}
            <button
              onClick={handleClose}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RoundCloseOutlined
                width="3vh"
                height="3vh"
                style={{ fontSize: 24 }}
              />
            </button>
          </CancelButtonWrapper>

          <ModalBottomWrapper>
            <ReconstructionWrapper>
              <ReconstructionTitle>이닝의 재구성</ReconstructionTitle>
              <ReconstructionButtonWrapper>
                <ReconstructionSwitch
                  checked={isReconstructMode}
                  onChange={(checked) => {
                    // OFF로 전환될 때만 초기화
                    if (!checked) {
                      resetAllBadges();
                    }
                    setIsReconstructMode(checked);
                  }}
                />
              </ReconstructionButtonWrapper>
            </ReconstructionWrapper>

            <ModalBottomRunnerWrapper>
              <LeftPolygon />
              <ModalBottomRunnerTitle>주자</ModalBottomRunnerTitle>
              <RightPolygon />
            </ModalBottomRunnerWrapper>
          </ModalBottomWrapper>
          <GraphicWrapper
            ref={wrapperRef}
            outside={isOutside}
            style={{ position: "relative" }}
          >
            <HomeWrapper />
            <LineWrapper />
            <HomeBaseWrapper active={isHomeBaseActive} />
            <Ground outside={isOutside} />
            <OutZoneWrapper ref={outZoneRef}></OutZoneWrapper>
            <CustomBoundaryWrapper
              ref={customBoundsRef}
            ></CustomBoundaryWrapper>
            {/* <OutCount>
              {outs.map((isActive, idx) => (
                <Ellipse key={idx} active={isActive} />
              ))}
            </OutCount> */}

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
                // ref={(el) => {
                //   diamondPolyRef.current = el;
                //   // groundRef.current = el;
                // }}
              />
              {/* 디버그용: 계산된 screenPoints로 다시 그린 폴리곤 */}
              {/* {overlayPoints && (
                      <polygon points={overlayPoints} stroke="red" strokeWidth={0.5} />
                    )} */}
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
            <ResetDot
              style={{ left: "63vw", top: "2vh" }}
              onClick={() => {
                // 1) 스냅 위치와 보이기 상태 초기화
                setBadgeSnaps(initialBadgeSnaps);
                setActiveBadges(badgeConfigs.map((cfg) => cfg.id));

                // 2) 통과한 베이스 기록 초기화
                badgeConfigs.forEach(({ id }) => {
                  // passedBasesRef 초기화
                  baseIds.forEach((base) => {
                    passedBasesRef.current[id][base] = false;
                  });
                  // 마지막 통과 베이스, 최대 순서 초기화
                  lastPassedRef.current[id] = null;
                  maxReachedRef.current[id] = 0;
                });
              }}
            />
          </GraphicWrapper>
          <ControlButton onClick={handleSubmit}>확인하기</ControlButton>
        </DndContext>
      </ModalContainer>
      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      <ErrorAlert error={error} />
    </ModalOverlay>
  );
}
