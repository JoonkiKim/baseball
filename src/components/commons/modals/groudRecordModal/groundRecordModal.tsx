// src/components/modals/groundRecordModal.tsx

import API from "../../../../commons/apis/api";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
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
  ResetDot,
} from "./groundRecordModal.style";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { ControlButton } from "../playerSelectionModal";
import { RoundCloseOutlined } from "../../../../commons/libraries/cancelButton";
import LeftPolygon from "../../../../commons/libraries/leftPolygon";
import RightPolygon from "../../../../commons/libraries/rightPolygon";
import { badgeConfigsForModal } from "../../units/gameRecord-v2/gameRecord.variables";
import {
  BASE_IDS,
  useRectsCache,
} from "../../units/gameRecord-v2/gameRecord-v2.container";
import PortalSwitch from "./reconstructionSwitch";
// import { DraggableBadge } from "../../../../commons/libraries/whiteBadge";
import { unstable_batchedUpdates } from "react-dom";

// 모달 컨트롤용 핸들러 타입
export type GroundRecordModalHandle = {
  open: () => void;
  close: () => void;
};

interface GroundRecordModalProps {
  onSuccess?: () => Promise<void>;
}

const GroundRecordModal = forwardRef<
  GroundRecordModalHandle,
  GroundRecordModalProps
>(({ onSuccess }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const router = useRouter();
  const [error, setError] = useState(null);
  // batterid
  const [currentBatterId, setCurrentBatterId] = useState<number | null>(null);
  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 확인 버튼 핸들러
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSuccess?.();
      handleClose();
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, handleClose]);

  // 모달이 닫혀있으면 렌더링 스킵
  // if (!isOpen) return null;

  // 스냅샷 불러와서 배지에 보여주기

  const [activeBadges, setActiveBadges] = useState(
    badgeConfigsForModal.map((cfg) => cfg.id)
  );

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

  // 최상단에 선언
  const diamondSvgRef = useRef<SVGSVGElement | null>(null);
  const diamondPolyRef = useRef<SVGPolygonElement | null>(null);

  // const [isOutside, setIsOutside] = useState(false);

  const outZoneRef = useRef<HTMLDivElement>(null);
  const { wrapperRectRef, zoneRectRef, baseRectsRef, refreshRects } =
    useRectsCache(wrapperRef, outZoneRef, baseRefs, BASE_IDS);
  const sensors = useSensors(useSensor(PointerSensor));
  const badgeRefs = useRef<Record<string, HTMLElement | null>>({});

  console.log("▶ Modal render");
  // 배지별 스냅 정보 관리
  type SnapInfo = { base: BaseId; pos: { xPct: number; yPct: number } };
  // 1) 초기 스냅 상태를 미리 저장해 두고…
  const initialBadgeSnaps = badgeConfigsForModal.reduce((acc, cfg) => {
    acc[cfg.id] = null;
    return acc;
  }, {} as Record<string, SnapInfo | null>);

  // 2) useState 초기값에 사용
  const [badgeSnaps, setBadgeSnaps] =
    useState<Record<string, SnapInfo | null>>(initialBadgeSnaps);

  // ── 베이스 중심 좌표 캐싱용 ref (이미 적용하셨다면 생략) ──
  const baseCentersRef = useRef<Record<BaseId, { x: number; y: number }>>(
    {} as Record<BaseId, { x: number; y: number }>
  );

  // 커스텀 경계설정
  const customBoundsRef = useRef<HTMLDivElement>(null);

  // 성능 최적화
  const restrictToCustomBoundsFn = useCallback<Modifier>((args) => {
    const { transform, draggingNodeRect } = args;
    if (!draggingNodeRect) return transform;
    const boundsEl = customBoundsRef.current;
    if (!boundsEl) return transform;

    const { width: nodeW, height: nodeH } = draggingNodeRect;
    const bounds = boundsEl.getBoundingClientRect();

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
  }, []);

  const dynamicBoundary = useMemo<Modifier>(() => {
    return (args) => {
      if (!args.active) return args.transform;
      return restrictToCustomBoundsFn(args);
    };
  }, [restrictToCustomBoundsFn]);

  const modifiers = useMemo(() => [dynamicBoundary], [dynamicBoundary]);

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
    // console.log("badge1 render");
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

  const [isHomeBaseActive, setIsHomeBaseActive] = useState(false);
  // 베이스별 중심 좌표를 담을 ref
  // const baseRectsRef = useRef<Partial<Record<BaseId, DOMRect>>>({});
  // const wrapperRectRef = useRef<DOMRect | null>(null);
  // const zoneRectRef = useRef<DOMRect | null>(null);

  // const RUN_SEQUENCE: BaseId[] = [
  //   "first-base",
  //   "second-base",
  //   "third-base",
  //   "home-base",
  // ];

  // 배지별로 지금까지 "순서대로" 스냅된 베이스 목록을 저장 (삭제하지 않고 유지)
  const snappedSeqRef = useRef<Record<string, BaseId[]>>(
    badgeConfigsForModal.reduce((acc, { id }) => {
      acc[id] = [];
      return acc;
    }, {} as Record<string, BaseId[]>)
  );

  // 다음에 가야 할(스냅해야 할) 베이스

  const handleDrop = (e: DragEndEvent) => {
    const badgeId = e.active.id as string;

    // // 검정 배지: 기존 자리 스왑 로직
    // if (badgeId.startsWith("black-badge")) {
    //   handleBlackDragEnd(e);
    //   return;
    // }

    const badgeEl = badgeRefs.current[badgeId];
    const wrapperRect = wrapperRectRef.current;
    const zoneRect = zoneRectRef.current;
    if (!badgeEl || !wrapperRect) return;

    const { left, top, width, height } = badgeEl.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;

    // 아웃존 바깥 드롭 시 제거(단, 흰 배지가 최소 1개는 남아야 함)
    if (
      zoneRect &&
      (cx < zoneRect.left ||
        cx > zoneRect.right ||
        cy < zoneRect.top ||
        cy > zoneRect.bottom)
    ) {
      // 아웃존에 들어간 배지를 기록해둠
      setOutBadges((prev) => {
        const next = new Set(prev);
        next.add(badgeId);
        return next;
      });
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

      // Ground 배경 리셋
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

    const finished =
      dropBase === "home-base" &&
      ["third-base"].every((b) => seq.includes(b as BaseId));

    if (finished) {
      setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
      setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));
      // 기록은 유지 (snappedSeqRef.current[badgeId]는 지우지 않음)
    }
  };

  const onAnyDragEnd = (e: DragEndEvent) => {
    // 좌표는 ResizeObserver가 최신화 해주므로 보통 추가 호출 불필요
    // 필요하면 여기서 refreshRects();
    groundRef.current?.classList.remove("out-zone-active");
    handleDrop(e);
    // 깔끔하게 리셋
    prevOutsideRef.current = false;
    // setIsOutside(false);
  };
  // 모달 오픈 시 한 번만 초기 스냅 저장
  useEffect(() => {
    if (!isOpen) return;

    // activeBadges 순서대로 모든 뱃지의 현재 badgeSnaps 상태를 initialSnapsRef에 저장
    const caps: Record<string, SnapInfo | null> = {};
    badgeConfigsForModal.forEach(({ id }) => {
      caps[id] = badgeSnaps[id] ?? null;
    });
    initialSnapsRef.current = caps;
  }, [isOpen]);

  const resetWhiteBadges = useCallback(() => {
    // initialSnapsRef.current 에 담긴, 모달 오픈 직후 스냅 상태로 복원
    unstable_batchedUpdates(() => {
      setBadgeSnaps({ ...initialSnapsRef.current });
      setActiveBadges(badgeConfigsForModal.map((c) => c.id));
      setOutBadges(new Set());
    });

    // 순서 기록도 초기 스냅 기준으로 재설정
    badgeConfigsForModal.forEach(({ id }) => {
      const snap = initialSnapsRef.current[id];
      snappedSeqRef.current[id] = snap ? [snap.base] : [];
    });

    // 참조 리셋
    badgeRefs.current = {};
  }, [badgeConfigsForModal]);

  const originCenters = useRef<Record<string, { x: number; y: number }>>({});
  // ① Ground용 ref 선언
  const groundRef = useRef<HTMLDivElement | null>(null);

  // const [isOutside, setIsOutside] = useState(false);
  const prevOutsideRef = useRef(false);
  // const rafIdRef = useRef<number | null>(null);

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

  // 이닝의 재구성 성능 올리기
  // ① 컨테이너와 흰 배지를 감쌀 ref
  // const reconstructModeRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const whiteBadgesRef = useRef<HTMLDivElement>(null);

  const switchRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;
    const onPointerDown = () => {
      el.classList.add("ant-switch-checked");
    };
    const onPointerUp = () => {
      // 실제 상태 반영은 onChange, 여기선 그냥 시각 안정화용
    };
    el.addEventListener("pointerdown", onPointerDown);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const switchAnchorRef = useRef<HTMLDivElement>(null);
  const reconstructCheckedRef = useRef<boolean>(false);

  // const handleReconstructToggle = useCallback(
  //   (checked: boolean) => {
  //     // 1) ref에 최신 토글 상태 저장 (리렌더 없음)
  //     reconstructCheckedRef.current = checked;

  //     // 2) 즉시 시각 반영: 클래스 토글
  //     if (containerRef.current) {
  //       containerRef.current.classList.toggle("reconstruct-mode", checked);
  //     }

  //     // 3) checked가 true일 때만 배지 초기화 등 무거운 작업 (다음 프레임에 배치)
  //     if (checked) {
  //       requestAnimationFrame(() => {
  //         unstable_batchedUpdates(() => {
  //           // 스냅/액티브 배지 초기화
  //           const freshSnaps: Record<string, SnapInfo | null> = {};
  //           badgeConfigsForModal.forEach((c) => (freshSnaps[c.id] = null));
  //           setBadgeSnaps(freshSnaps);
  //           setActiveBadges(badgeConfigsForModal.map((c) => c.id));

  //           // 순서 기록 초기화
  //           badgeConfigsForModal.forEach(({ id }) => {
  //             snappedSeqRef.current[id] = [];
  //           });
  //         });
  //         // 필요하면 rect 재계산
  //         refreshRects();
  //       });
  //     }
  //   },
  //   [refreshRects]
  // );

  // 예: 어떤 이벤트 핸들러나 비주얼 피드백이 필요할 때
  // const isReconstructModeActive = () => reconstructCheckedRef.current;

  // [runner-event기록 로직]
  const [currentBatterName, setCurrentBatterName] = useState<string | null>(
    null
  );

  // white badge들 중 첫 번째가 batter, 두 번째가 runner로 쓴다고 가정
  const whiteBadges = useMemo(
    () =>
      badgeConfigsForModal.filter(
        (cfg) =>
          !cfg.id.startsWith("black-badge") && activeBadges.includes(cfg.id)
      ),
    [activeBadges]
  );

  // runner 배지에 붙일 정보: { [badgeId]: { runnerId, name } }

  const [runnerInfoByBadge, setRunnerInfoByBadge] = useState<
    Record<string, { runnerId: number; name: string }>
  >({});
  // 드래그 앤 드롭 관련
  // 베이스 아이디 목록
  useEffect(() => {
    if (!isOpen) return;

    try {
      const raw = localStorage.getItem("snapshot");
      const parsed = raw ? JSON.parse(raw) : null;
      setSnapshotData(parsed);
      console.log("loaded snapshot from localStorage:", parsed);

      const batterName =
        parsed?.snapshot?.currentAtBat?.batter?.name ??
        parsed?.currentAtBat?.batter?.name ??
        null;
      const batterId =
        parsed?.snapshot?.currentAtBat?.batter?.id ??
        parsed?.currentAtBat?.batter?.id ??
        null;
      setCurrentBatterName(batterName);
      setCurrentBatterId(batterId);
    } catch (e) {
      console.warn("snapshot 파싱 에러:", e);
      setCurrentBatterName(null);
      setCurrentBatterId(null);
      setSnapshotData(null);
    }
  }, [isOpen]);
  // 초기 타자 및 주자의 위치
  const [snapshotData, setSnapshotData] = useState<any>(null);
  const initialSnapsRef = useRef<Record<string, SnapInfo | null>>({});
  const [baseToBadgeId, setBaseToBadgeId] = useState<Record<number, string>>(
    {}
  );

  // 베이스 코드 변환
  const getBaseCode = (snap: SnapInfo | null): string => {
    if (!snap) return "B";
    switch (snap.base) {
      case "first-base":
        return "1";
      case "second-base":
        return "2";
      case "third-base":
        return "3";
      case "home-base":
        return "H";
      default:
        return "B";
    }
  };
  // 아웃존에 들어갔는지 인식
  // 아웃존에 있는 배지들을 추적
  const [outBadges, setOutBadges] = useState<Set<string>>(new Set());

  // batter/runner 배지를 active + out 포함해서 계산: 아웃존에 있어도 순서가 유지됨
  const allWhiteBadges = useMemo(
    () =>
      badgeConfigsForModal.filter(
        (cfg) =>
          !cfg.id.startsWith("black-badge") &&
          (activeBadges.includes(cfg.id) || outBadges.has(cfg.id))
      ),
    [activeBadges, outBadges]
  );
  const batterWhiteBadgeId = useMemo(
    () => allWhiteBadges[0]?.id ?? null,
    [allWhiteBadges]
  );
  const runnerWhiteBadgeIds = useMemo(
    () => allWhiteBadges.slice(1).map((cfg) => cfg.id),
    [allWhiteBadges]
  );

  // 임시)  타자” 찾고 로그 찍는 useEffect
  // const prevActualRef = useRef<string | null>(null);

  // 로그 찍는 useEffect: whiteBadgeIds는 allWhiteBadges 기준으로
  useEffect(() => {
    if (!isOpen) return;
    if (!batterWhiteBadgeId) return;

    const actualArray: Array<{
      runnerId: number | null;
      startBase: string;
      endBase: string;
    }> = [];

    // allWhiteBadges 기준으로, active + out 모두 포함된 흰 배지들
    const whiteBadgeIds = allWhiteBadges.map((cfg) => cfg.id);

    whiteBadgeIds.forEach((badgeId) => {
      const startBase = getBaseCode(initialSnapsRef.current[badgeId] ?? null);

      // endBase 결정
      let endBase: string;
      if (outBadges.has(badgeId)) {
        endBase = "O";
      } else {
        let effectiveCurrentSnap: SnapInfo | null = badgeSnaps[badgeId];
        const seq = snappedSeqRef.current[badgeId] || [];
        if (!effectiveCurrentSnap && seq.length > 0) {
          const lastBase = seq[seq.length - 1];
          if (lastBase === "home-base") {
            effectiveCurrentSnap = {
              base: "home-base",
              pos: { xPct: 0, yPct: 0 },
            };
          }
        }
        endBase = getBaseCode(effectiveCurrentSnap);
      }

      // 이동 없는 경우 건너뜀 (타자가 아닌 경우만)
      if (
        badgeId !== batterWhiteBadgeId &&
        startBase === "B" &&
        endBase === "B"
      )
        return;

      let runnerId: number | null = null;
      if (badgeId === batterWhiteBadgeId) {
        runnerId = currentBatterId;
      } else if (runnerInfoByBadge[badgeId]) {
        runnerId = runnerInfoByBadge[badgeId].runnerId;
      }

      actualArray.push({
        runnerId,
        startBase,
        endBase,
      });
    });

    const output = {
      phase: "AFTER",
      actual: actualArray,
    };

    if (actualArray.length > 0) {
      console.log(JSON.stringify(output, null, 2));
    }
  }, [
    badgeSnaps,
    activeBadges,
    currentBatterId,
    runnerInfoByBadge,
    batterWhiteBadgeId,
    isOpen,
    outBadges,
    allWhiteBadges,
  ]);

  // 주자 위치 시키는 로직
  // 이닝의 재구성으로 분기
  const [reconstructMode, setReconstructMode] = useState(false);
  // useEffect(() => {
  //   if (!isOpen) return;
  //   if (!snapshotData) return;

  //   const actualRunners =
  //     snapshotData?.snapshot?.inningStats?.actual?.runnersOnBase ??
  //     snapshotData?.inningStats?.actual?.runnersOnBase ??
  //     [];
  //   if (actualRunners.length === 0) return;

  //   const baseMap: Record<number, BaseId> = {
  //     1: "first-base",
  //     2: "second-base",
  //     3: "third-base",
  //   };

  //   // 사용할 수 있는 흰 배지 목록 (타자 배지 제외)
  //   const whiteBadgeCandidates = badgeConfigsForModal
  //     .filter(
  //       (cfg) =>
  //         !cfg.id.startsWith("black-badge") && activeBadges.includes(cfg.id)
  //     )
  //     .map((cfg) => cfg.id);
  //   const availableRunnerBadges = whiteBadgeCandidates.filter(
  //     (id) => id !== batterWhiteBadgeId
  //   );

  //   // base 별로 배지 할당 (기존 매핑을 유지하면서 부족한 부분만 채움)
  //   const newMap: Record<number, string> = { ...baseToBadgeId };
  //   const usedBadges = new Set(Object.values(newMap));

  //   actualRunners.forEach((runner: any) => {
  //     if (!newMap[runner.base]) {
  //       const candidate = availableRunnerBadges.find((b) => !usedBadges.has(b));
  //       if (candidate) {
  //         newMap[runner.base] = candidate;
  //         usedBadges.add(candidate);
  //       }
  //     }
  //   });

  //   // 상태 업데이트 (변경 있을 때만)
  //   if (JSON.stringify(newMap) !== JSON.stringify(baseToBadgeId)) {
  //     setBaseToBadgeId(newMap);
  //   }

  //   // 각 주자에 대해 해당 베이스 위치로 스냅 초기화 & runnerInfoByBadge 설정
  //   actualRunners.forEach((runner: any) => {
  //     const baseId = baseMap[runner.base];
  //     if (!baseId) return;
  //     const badgeId = newMap[runner.base];
  //     if (!badgeId) return;

  //     const tryInit = () => {
  //       const wrapperEl = wrapperRef.current;
  //       const baseRect = baseRectsRef.current[baseId];
  //       if (!wrapperEl || !baseRect) {
  //         requestAnimationFrame(tryInit);
  //         return;
  //       }

  //       const wrapperRect = wrapperEl.getBoundingClientRect();
  //       const x = baseRect.left + baseRect.width / 2 - wrapperRect.left;
  //       const y = baseRect.top + baseRect.height / 2 - wrapperRect.top;

  //       const snap: SnapInfo = {
  //         base: baseId,
  //         pos: {
  //           xPct: (x / wrapperRect.width) * 100,
  //           yPct: (y / wrapperRect.height) * 100,
  //         },
  //       };

  //       if (!initialSnapsRef.current[badgeId]) {
  //         initialSnapsRef.current[badgeId] = snap;
  //         setBadgeSnaps((prev) => ({ ...prev, [badgeId]: snap }));
  //         setRunnerInfoByBadge((prev) => ({
  //           ...prev,
  //           [badgeId]: { runnerId: runner.id, name: runner.name },
  //         }));
  //       }
  //     };

  //     tryInit();
  //   });
  // }, [
  //   isOpen,
  //   snapshotData,
  //   activeBadges,
  //   batterWhiteBadgeId,
  //   baseToBadgeId,
  //   refreshRects,
  // ]);

  // 주자 배열 선택 헬퍼 (virtual할지 actual할지)
  const getRunnersOnBase = useCallback(() => {
    if (!snapshotData) return [];
    if (reconstructMode) {
      return snapshotData?.snapshot?.inningStats?.virtual?.runnersOnBase ?? [];
    }
    return snapshotData?.snapshot?.inningStats?.actual?.runnersOnBase ?? [];
  }, [snapshotData, reconstructMode]);

  // 실제 / 재구성 기준으로 배지 매핑 및 스냅 초기화
  const syncRunnersOnBase = useCallback(() => {
    const runners = getRunnersOnBase();
    if (runners.length === 0) return;

    const baseMap: Record<number, BaseId> = {
      1: "first-base",
      2: "second-base",
      3: "third-base",
    };

    // 타자/주자 후보
    const whiteBadgeCandidates = badgeConfigsForModal
      .filter(
        (cfg) =>
          !cfg.id.startsWith("black-badge") && activeBadges.includes(cfg.id)
      )
      .map((cfg) => cfg.id);
    const availableRunnerBadges = whiteBadgeCandidates.filter(
      (id) => id !== batterWhiteBadgeId
    );

    // baseToBadgeId 갱신
    const newMap: Record<number, string> = { ...baseToBadgeId };
    const usedBadges = new Set(Object.values(newMap));

    runners.forEach((runner: any) => {
      if (!newMap[runner.base]) {
        const candidate = availableRunnerBadges.find((b) => !usedBadges.has(b));
        if (candidate) {
          newMap[runner.base] = candidate;
          usedBadges.add(candidate);
        }
      }
    });

    if (JSON.stringify(newMap) !== JSON.stringify(baseToBadgeId)) {
      setBaseToBadgeId(newMap);
    }

    runners.forEach((runner: any) => {
      const baseId = baseMap[runner.base];
      if (!baseId) return;
      const badgeId = newMap[runner.base];
      if (!badgeId) return;

      const tryInit = () => {
        const wrapperEl = wrapperRef.current;
        const baseRect = baseRectsRef.current[baseId];
        if (!wrapperEl || !baseRect) {
          requestAnimationFrame(tryInit);
          return;
        }

        const wrapperRect = wrapperEl.getBoundingClientRect();
        const x = baseRect.left + baseRect.width / 2 - wrapperRect.left;
        const y = baseRect.top + baseRect.height / 2 - wrapperRect.top;

        const snap: SnapInfo = {
          base: baseId,
          pos: {
            xPct: (x / wrapperRect.width) * 100,
            yPct: (y / wrapperRect.height) * 100,
          },
        };

        if (!initialSnapsRef.current[badgeId]) {
          initialSnapsRef.current[badgeId] = snap;
          setBadgeSnaps((prev) => ({ ...prev, [badgeId]: snap }));
          setRunnerInfoByBadge((prev) => ({
            ...prev,
            [badgeId]: { runnerId: runner.id, name: runner.name },
          }));
        }
      };

      tryInit();
    });
  }, [
    getRunnersOnBase,
    activeBadges,
    batterWhiteBadgeId,
    baseToBadgeId,
    refreshRects,
  ]);

  // // 주자위치 함수 호출하는 useEffect
  // useEffect(() => {
  //   syncRunnersOnBase();
  // }, [syncRunnersOnBase]);

  // 이닝의 재구성 버튼
  // const handleReconstructToggle = useCallback(
  //   (checked: boolean) => {
  //     // 1) ref에 최신 토글 상태 저장 (렌더 트리거 없음)
  //     // reconstructCheckedRef.current = checked;
  //   // 1) 상태 업데이트
  //   setReconstructMode(checked);
  //     // 2) 즉시 시각 반영: 클래스 토글
  //     if (containerRef.current) {
  //       containerRef.current.classList.toggle("reconstruct-mode", checked);
  //     }

  //     // 3) 다음 프레임에 무거운 작업 및 주자 동기화
  //     requestAnimationFrame(() => {
  //       unstable_batchedUpdates(() => {
  //         if (checked) {
  //           // 재구성 모드 켜질 때만 스냅/액티브/순서 초기화
  //           const freshSnaps: Record<string, SnapInfo | null> = {};
  //           badgeConfigsForModal.forEach((c) => (freshSnaps[c.id] = null));
  //           setBadgeSnaps(freshSnaps);
  //           setActiveBadges(badgeConfigsForModal.map((c) => c.id));
  //           badgeConfigsForModal.forEach(({ id }) => {
  //             snappedSeqRef.current[id] = [];
  //           });
  //         }
  //         // 재구성 모드 on/off 관계없이 현재 모드(reconstructCheckedRef.current)에 맞춰
  //         // actual / virtual 기반으로 주자 동기화 수행
  //         syncRunnersOnBase();
  //       });
  //       refreshRects();
  //     });
  //   },
  //   [refreshRects, syncRunnersOnBase]
  // );
  const handleReconstructToggle = useCallback(
    (checked: boolean) => {
      console.log("toggle request:", checked);
      // 1) 상태 업데이트
      setReconstructMode(checked);

      // 2) 시각 클래스 토글
      if (containerRef.current) {
        containerRef.current.classList.toggle("reconstruct-mode", checked);
      }

      // 3) 필요한 동기화 (다음 프레임에 배치)
      requestAnimationFrame(() => {
        unstable_batchedUpdates(() => {
          // 재구성 모드 시작이면 기존 스냅 초기화 등 초기화가 필요하면 여기
          if (checked) {
            // 예: 스냅/액티브 초기화 (필요한 경우)
            const freshSnaps: Record<string, SnapInfo | null> = {};
            badgeConfigsForModal.forEach((c) => (freshSnaps[c.id] = null));
            setBadgeSnaps(freshSnaps);
            setActiveBadges(badgeConfigsForModal.map((c) => c.id));
            badgeConfigsForModal.forEach(({ id }) => {
              snappedSeqRef.current[id] = [];
            });
          }
        });
        // 현재 모드 기준으로 주자 동기화
        syncRunnersOnBase();
        refreshRects();
      });
    },
    [syncRunnersOnBase, refreshRects]
  );

  // snapshotData / reconstructMode 바뀔 때 자동 동기화 (옵션)
  useEffect(() => {
    if (!isOpen) return;
    syncRunnersOnBase();
  }, [isOpen, snapshotData, reconstructMode, syncRunnersOnBase]);

  // -------------------

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    []
  );

  // useEffect(() => {
  //   // badgeSnaps: Record<badgeId, { base: BaseId; pos: { x, y } } | null>
  //   const occupancy: Record<BaseId, boolean> = BASE_IDS.reduce((acc, base) => {
  //     // badgeSnaps 중에 baseId === base 인 항목이 하나라도 있으면 true
  //     acc[base] = Object.values(badgeSnaps).some((snap) => snap?.base === base);
  //     return acc;
  //   }, {} as Record<BaseId, boolean>);

  //   console.log("Base occupancy:", occupancy);
  //   // 예: { "first-base": true, "second-base": false, ... }
  // }, [badgeSnaps]);
  useEffect(() => {
    if (isOpen) {
      refreshRects();
    }
  }, [isOpen, refreshRects]);

  // ── 2) 훅 아래에서만 렌더링 분기
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay>
      <ModalContainer onClick={(e) => e.stopPropagation()} ref={containerRef}>
        <DndContext
          id="game-record-dnd" // ← 여기에 고정된 string ID를 넣어줍니다
          sensors={sensors}
          modifiers={modifiers}
          onDragStart={handleDragStart}
          // onDragMove={handleDragMove}
          onDragEnd={onAnyDragEnd}
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
                <div
                  ref={switchAnchorRef}
                  style={{
                    width: "11vw",
                    height: "3vh",
                    position: "relative",
                    // (기본 자리 표시용; 실제 스위치는 포털로 올라감)
                  }}
                />

                <PortalSwitch
                  anchorRef={switchAnchorRef}
                  checked={reconstructMode}
                  onChange={handleReconstructToggle}
                />
                {/* </div> */}
              </ReconstructionButtonWrapper>
            </ReconstructionWrapper>
            <ModalBottomRunnerWrapper>
              <LeftPolygon />
              <ModalBottomRunnerTitle>주자</ModalBottomRunnerTitle>
              <RightPolygon />
            </ModalBottomRunnerWrapper>
          </ModalBottomWrapper>
          <GraphicWrapper
            // as="svg"
            ref={wrapperRef}
            // viewBox="0 0 110 110"
            // preserveAspectRatio="xMidYMid meet"

            // outside={isOutside}
          >
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
                style={{ border: "1px solid black", backgroundColor: "green" }}
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

            <ResetDot
              style={{ left: "63vw", top: "2vh" }}
              onClick={resetWhiteBadges}
            />

            {/* NameBadge */}
            {/* 4) 드롭 후 스냅 or 드래그 상태에 따라 렌더 */}
            {/* ③ activeBadges에 든 것만 렌더 */}

            <div ref={whiteBadgesRef}>
              {badgeConfigsForModal
                .filter((cfg) => {
                  // active한 것만 고려
                  if (!activeBadges.includes(cfg.id)) return false;

                  // 타자 배지: currentBatterId가 있어야 보여줌
                  if (cfg.id === batterWhiteBadgeId) {
                    return currentBatterId != null;
                  }

                  // 주자 배지: runnerInfoByBadge에 매핑된 것이 있어야 보여줌
                  return !!runnerInfoByBadge[cfg.id];
                })
                .map((cfg) => {
                  let overriddenLabel = cfg.label;

                  if (cfg.id === batterWhiteBadgeId && currentBatterName) {
                    overriddenLabel = currentBatterName;
                  } else if (runnerInfoByBadge[cfg.id]) {
                    overriddenLabel = runnerInfoByBadge[cfg.id].name;
                  }

                  return (
                    <DraggableBadge
                      key={cfg.id}
                      id={cfg.id}
                      label={overriddenLabel}
                      initialLeft={cfg.initialLeft}
                      initialTop={cfg.initialTop}
                      snapInfo={badgeSnaps[cfg.id]}
                    />
                  );
                })}
            </div>
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
});

export default GroundRecordModal;
