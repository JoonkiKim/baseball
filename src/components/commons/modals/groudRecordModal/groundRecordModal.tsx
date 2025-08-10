// src/components/modals/groundRecordModal.tsx

import API from "../../../../commons/apis/api";

import {
  Dispatch,
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
  DragStartEvent,
  Modifier,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  CancelButtonWrapper,
  CustomBoundaryWrapper,
  DiamondSvg,
  GraphicWrapper,
  Ground,
  HomeBaseWrapper,
  HomeWrapper,
  LineWrapper,
  ModalBottomRunnerTitle,
  ModalBottomRunnerWrapper,
  ModalBottomWrapper,
  ModalContainer,
  ModalOverlay,
  NameBadge,
  OutZoneWrapper,
  ReconstructionButtonWrapper,
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
  updateSnapshot?: Dispatch<any>;
}

const GroundRecordModal = forwardRef<
  GroundRecordModalHandle,
  GroundRecordModalProps
>(({ onSuccess, updateSnapshot }, ref) => {
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
  // type BaseId = (typeof baseIds)[number];

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
  // const baseCentersRef = useRef<Record<BaseId, { x: number; y: number }>>(
  //   {} as Record<BaseId, { x: number; y: number }>
  // );

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

  // 배지별로 지금까지 "순서대로" 스냅된 베이스 목록을 저장 (삭제하지 않고 유지)
  const snappedSeqRef = useRef<Record<string, BaseId[]>>(
    badgeConfigsForModal.reduce((acc, { id }) => {
      acc[id] = [];
      return acc;
    }, {} as Record<string, BaseId[]>)
  );

  const scheduleOccupancyLog = () => {
    requestAnimationFrame(() => {
      const occ = computeBaseOccupancy(badgeSnapsRef.current);
      // console.log("Base occupancy after handleDrop:", occ);
    });
  };

  const handleDrop = (e: DragEndEvent) => {
    const badgeId = e.active.id as string;

    const badgeEl = badgeRefs.current[badgeId];
    const wrapperRect = wrapperRectRef.current;
    // const zoneRect = zoneRectRef.current;
    const zoneRect = outZoneRef.current?.getBoundingClientRect();
    if (!badgeEl || !wrapperRect) return;

    const { left, top, width, height } = badgeEl.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;

    // 아웃존 바깥 드롭 시: O 처리
    if (
      zoneRect &&
      (cx < zoneRect.left ||
        cx > zoneRect.right ||
        cy < zoneRect.top ||
        cy > zoneRect.bottom)
    ) {
      if (reconstructMode) {
        setOutBadgesVirtual((prev) => {
          const next = new Set(prev);
          next.add(badgeId);
          return next;
        });
      } else {
        setOutBadgesActual((prev) => {
          const next = new Set(prev);
          next.add(badgeId);
          return next;
        });
      }
      setActiveBadges((prev) => {
        const next = prev.filter((id) => id !== badgeId);
        const whiteLeft = next.filter(
          (id) => !id.startsWith("black-badge")
        ).length;
        return whiteLeft > 0 ? next : prev;
      });
      setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));
      groundRef.current?.classList.remove("out-zone-active");
      scheduleOccupancyLog();
      return;
    }

    let dropBase: BaseId | null = null;
    let baseRect: DOMRect | undefined;

    // helper: 두 사각형의 겹친 면적 계산
    const computeOverlapArea = (
      a: { left: number; top: number; right: number; bottom: number },
      b: { left: number; top: number; right: number; bottom: number }
    ) => {
      const xOverlap = Math.max(
        0,
        Math.min(a.right, b.right) - Math.max(a.left, b.left)
      );
      const yOverlap = Math.max(
        0,
        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      );
      return xOverlap * yOverlap;
    };
    // helper: 점이 사각형 안에 있는지
    const pointInRect = (
      point: { x: number; y: number },
      rect: { left: number; top: number; right: number; bottom: number }
    ) => {
      return (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      );
    };

    const SNAP_PADDING = 8; // 주변 여유
    const MAX_CENTER_DISTANCE = 40; // 중심 거리 허용치

    const badgeRect = badgeEl.getBoundingClientRect();
    const badgeBox = {
      left: badgeRect.left,
      top: badgeRect.top,
      right: badgeRect.right,
      bottom: badgeRect.bottom,
    };
    const badgeCenter = {
      x: badgeRect.left + badgeRect.width / 2,
      y: badgeRect.top + badgeRect.height / 2,
    };

    type Candidate = {
      base: BaseId;
      baseRect: DOMRect;
      overlap: number;
      centerDist: number;
    };
    const candidates: Candidate[] = [];

    for (const b of BASE_IDS) {
      const rect = baseRectsRef.current[b];
      if (!rect) continue;

      const baseBox = {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
      const expandedBaseBox = {
        left: rect.left - SNAP_PADDING,
        top: rect.top - SNAP_PADDING,
        right: rect.right + SNAP_PADDING,
        bottom: rect.bottom + SNAP_PADDING,
      };

      const overlapArea = computeOverlapArea(badgeBox, baseBox);
      const baseCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const centerDist = Math.hypot(
        badgeCenter.x - baseCenter.x,
        badgeCenter.y - baseCenter.y
      );

      const qualifies =
        overlapArea > 0 || // 실제 겹쳐졌거나
        pointInRect(badgeCenter, expandedBaseBox) || // 중심이 확장 영역 안에 있거나
        centerDist <= MAX_CENTER_DISTANCE; // 중심 거리 기준

      if (qualifies) {
        candidates.push({
          base: b,
          baseRect: rect,
          overlap: overlapArea,
          centerDist,
        });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap;
        return a.centerDist - b.centerDist;
      });
      dropBase = candidates[0].base;
      baseRect = candidates[0].baseRect;
    }
    if (!dropBase || !baseRect) return;

    // excluded 배지는 스냅 불가
    if (isExcludedBadge(badgeId)) {
      scheduleOccupancyLog();
      return;
    }

    // 이미 점유된 베이스인지 확인
    if (isBaseOccupied(dropBase, badgeId, badgeSnaps)) {
      scheduleOccupancyLog();
      return;
    }

    // 홈베이스에 스냅된 경우: H 처리 + 정리
    if (dropBase === "home-base") {
      // 1) 홈베이스 완료 배지로 표시해서 endBase="H"로 로그에 남기게
      setHomeSnappedBadgesCurrent((prev) => {
        const next = new Set(prev);
        next.add(badgeId);
        return next;
      });

      // 2) 기존 baseToBadgeId 매핑에서 제거
      setBaseToBadgeIdCurrent((prev) => {
        const next = { ...prev };
        Object.entries(prev).forEach(([baseNum, bId]) => {
          if (bId === badgeId) {
            delete next[Number(baseNum) as any];
          }
        });
        return next;
      });

      // 3) finished 표시 (기존 로직과 연동)
      setFinishedBadgesCurrent((prev) => {
        const next = new Set(prev);
        next.add(badgeId);
        return next;
      });

      // 4) UI/스냅 정리
      if (!badgeId.startsWith("black-badge")) {
        setActiveBadges((prev) => prev.filter((id) => id !== badgeId));
      }
      setBadgeSnaps((prev) => ({ ...prev, [badgeId]: null }));

      scheduleOccupancyLog();
      return;
    }

    // 일반 베이스 스냅 (1,2,3루)
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

    // 진행 순서 기록 업데이트
    const seq = snappedSeqRef.current[badgeId];
    if (seq[seq.length - 1] !== dropBase) {
      seq.push(dropBase);
    }

    scheduleOccupancyLog();
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
  // const reconstructCheckedRef = useRef<boolean>(false);

  // 예: 어떤 이벤트 핸들러나 비주얼 피드백이 필요할 때
  // const isReconstructModeActive = () => reconstructCheckedRef.current;

  //---------------- [runner-event기록 로직]---------------------
  const [currentBatterName, setCurrentBatterName] = useState<string | null>(
    null
  );
  const EXCLUDED_RUNNER_ID = -1;
  const EXCLUDED_BASE_CODE = "0";
  const isExcludedBadge = (badgeId: string) => {
    const info = reconstructMode
      ? runnerInfoByBadgeVirtual[badgeId]
      : runnerInfoByBadgeActual[badgeId];
    return info?.runnerId === EXCLUDED_RUNNER_ID;
  };

  // runner 배지에 붙일 정보: { [badgeId]: { runnerId, name } }
  const [reconstructMode, setReconstructMode] = useState(false);
  const [runnerInfoByBadgeActual, setRunnerInfoByBadgeActual] = useState<
    Record<string, { runnerId: number; name: string }>
  >({});
  const [runnerInfoByBadgeVirtual, setRunnerInfoByBadgeVirtual] = useState<
    Record<string, { runnerId: number; name: string }>
  >({});

  const runnerInfoByBadge = reconstructMode
    ? runnerInfoByBadgeVirtual
    : runnerInfoByBadgeActual;
  const [baseToBadgeIdActual, setBaseToBadgeIdActual] = useState<
    Record<number, string>
  >({});
  const [baseToBadgeIdVirtual, setBaseToBadgeIdVirtual] = useState<
    Record<number, string>
  >({});
  const baseToBadgeId = reconstructMode
    ? baseToBadgeIdVirtual
    : baseToBadgeIdActual;

  const setRunnerInfoByBadgeCurrent = reconstructMode
    ? setRunnerInfoByBadgeVirtual
    : setRunnerInfoByBadgeActual;
  const setBaseToBadgeIdCurrent = reconstructMode
    ? setBaseToBadgeIdVirtual
    : setBaseToBadgeIdActual;

  // 베이스 아이디 목록
  useEffect(() => {
    if (!isOpen) return;

    try {
      const raw = localStorage.getItem("snapshot");
      const parsed = raw ? JSON.parse(raw) : null;
      setSnapshotData(parsed);
      // console.log("loaded snapshot from localStorage:", parsed);

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

  // 베이스 코드 변환

  type BaseId = "first-base" | "second-base" | "third-base" | "home-base";

  // 확장된 변환 함수: SnapInfo, 숫자, null 모두 처리
  const getBaseCode = (
    input: { base: BaseId } | number | null | undefined
  ): string => {
    let baseId: BaseId | null = null;

    if (input == null) {
      return "B";
    }

    if (typeof input === "number") {
      switch (input) {
        case 1:
          baseId = "first-base";
          break;
        case 2:
          baseId = "second-base";
          break;
        case 3:
          baseId = "third-base";
          break;
        case 4:
          baseId = "home-base";
          break;
        default:
          baseId = null;
      }
    } else if ("base" in input) {
      baseId = input.base;
    }

    if (!baseId) return "B";

    switch (baseId) {
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
  const [outBadgesActual, setOutBadgesActual] = useState<Set<string>>(
    new Set()
  );
  const [outBadgesVirtual, setOutBadgesVirtual] = useState<Set<string>>(
    new Set()
  );
  const outBadgesCurrent = reconstructMode ? outBadgesVirtual : outBadgesActual;

  // batter/runner 배지를 active + out 포함해서 계산: 아웃존에 있어도 순서가 유지됨
  const [homeSnappedBadgesActual, setHomeSnappedBadgesActual] = useState<
    Set<string>
  >(new Set());
  const [homeSnappedBadgesVirtual, setHomeSnappedBadgesVirtual] = useState<
    Set<string>
  >(new Set());
  const homeSnappedBadges = reconstructMode
    ? homeSnappedBadgesVirtual
    : homeSnappedBadgesActual;
  const setHomeSnappedBadgesCurrent = reconstructMode
    ? setHomeSnappedBadgesVirtual
    : setHomeSnappedBadgesActual;
  const allWhiteBadges = useMemo(
    () =>
      badgeConfigsForModal.filter(
        (cfg) =>
          !cfg.id.startsWith("black-badge") &&
          (activeBadges.includes(cfg.id) ||
            outBadgesCurrent.has(cfg.id) ||
            homeSnappedBadges.has(cfg.id))
      ),
    [activeBadges, outBadgesCurrent, homeSnappedBadges]
  );
  const batterWhiteBadgeId = useMemo(
    () => allWhiteBadges[0]?.id ?? null,
    [allWhiteBadges]
  );

  // 주자 위치 시키는 로직
  const getRunnersOnBase = useCallback(() => {
    if (!snapshotData) return [];

    const actual =
      snapshotData?.snapshot?.inningStats?.actual?.runnersOnBase ??
      snapshotData?.inningStats?.actual?.runnersOnBase ??
      [];
    const virtual =
      snapshotData?.snapshot?.inningStats?.virtual?.runnersOnBase ??
      snapshotData?.inningStats?.virtual?.runnersOnBase ??
      [];

    return reconstructMode ? virtual : actual;
  }, [snapshotData, reconstructMode]);

  // 타자 주자 로그 찍는

  // 아래 위치: "// 타자 주자 로그 찍는 useEffect" 주석 바로 아래에 넣어주면 됨
  // 홈베이스에 스냅된(완료된) 배지를 따로 관리: outBadges와 유사하게 endBase="H"로 로그에 남기기 위함

  const [finishedBadgesActual, setFinishedBadgesActual] = useState<Set<string>>(
    new Set()
  );
  const [finishedBadgesVirtual, setFinishedBadgesVirtual] = useState<
    Set<string>
  >(new Set());

  const finishedBadges = reconstructMode
    ? finishedBadgesVirtual
    : finishedBadgesActual;
  const setFinishedBadgesCurrent = reconstructMode
    ? setFinishedBadgesVirtual
    : setFinishedBadgesActual;

  // 실제 / 재구성 기준으로 배지 매핑 및 스냅 초기화

  const syncRunnersOnBase = useCallback(() => {
    // 1. 원본 runners 가져오기 (actual / virtual 구분은 getRunnersOnBase가 처리)
    const rawRunners = getRunnersOnBase();
    if (rawRunners.length === 0) return;

    // 2. 홈에 완료된 배지들에 대응하는 runnerId들을 수집 → 제외 대상
    const homeSnappedSet = reconstructMode
      ? homeSnappedBadgesVirtual
      : homeSnappedBadgesActual;
    const runnerInfoMap = reconstructMode
      ? runnerInfoByBadgeVirtual
      : runnerInfoByBadgeActual;

    const finishedRunnerIds = Array.from(homeSnappedSet)
      .map((badgeId) => runnerInfoMap[badgeId]?.runnerId)
      .filter((id): id is number => id != null && id !== EXCLUDED_RUNNER_ID);

    // 3. 홈 완료된 주자들을 제거한 실제 sync 대상 runners
    const runners = (rawRunners as any[]).filter(
      (r) => !finishedRunnerIds.includes(r.id)
    );
    if (runners.length === 0) return;

    const baseMap: Record<number, BaseId> = {
      1: "first-base",
      2: "second-base",
      3: "third-base",
    };

    // 4. 타자/주자 후보 (finishedBadges는 mode-aware)
    const whiteBadgeCandidates = badgeConfigsForModal
      .filter(
        (cfg) =>
          !cfg.id.startsWith("black-badge") &&
          activeBadges.includes(cfg.id) &&
          !finishedBadges.has(cfg.id)
      )
      .map((cfg) => cfg.id);
    const availableRunnerBadges = whiteBadgeCandidates.filter(
      (id) => id !== batterWhiteBadgeId
    );

    // 5. baseToBadgeId 갱신
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
      setBaseToBadgeIdCurrent(newMap);
    }

    // 6. 스냅 초기화 및 runnerInfo 설정
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

        initialSnapsRef.current[badgeId] = snap;
        setBadgeSnaps((prev) => ({ ...prev, [badgeId]: snap }));
        setRunnerInfoByBadgeCurrent((prev) => ({
          ...prev,
          [badgeId]: { runnerId: runner.id, name: runner.name },
        }));
      };
      tryInit();
    });

    // 7. 할당 상황 로그용 객체 구성
    const baseAssignment: Record<
      BaseId,
      { runnerId: number; name: string; badgeId: string } | null
    > = {
      "first-base": null,
      "second-base": null,
      "third-base": null,
      "home-base": null,
    };

    runners.forEach((runner: any) => {
      const baseId = baseMap[runner.base];
      if (!baseId) return;
      const badgeId = newMap[runner.base];
      if (!badgeId) return;
      baseAssignment[baseId] = {
        runnerId: runner.id,
        name: runner.name,
        badgeId,
      };
    });

    // 8. 매핑되지 않은 후보 배지들은 excluded 처리
    const mappedBadges = new Set(Object.values(newMap));
    whiteBadgeCandidates
      .filter((id) => id !== batterWhiteBadgeId)
      .forEach((badgeId) => {
        if (!mappedBadges.has(badgeId)) {
          setRunnerInfoByBadgeCurrent((prev) => {
            const existing = prev[badgeId];
            if (existing && existing.runnerId === EXCLUDED_RUNNER_ID)
              return prev;
            return {
              ...prev,
              [badgeId]: { runnerId: EXCLUDED_RUNNER_ID, name: "할당 제외" },
            };
          });
        }
      });

    // console.log(
    //   `runner assignment (${reconstructMode ? "virtual" : "actual"}):`,
    //   baseAssignment
    // );
  }, [
    getRunnersOnBase,
    activeBadges,
    batterWhiteBadgeId,
    baseToBadgeId,
    refreshRects,
    reconstructMode,
    homeSnappedBadgesActual,
    homeSnappedBadgesVirtual,
    runnerInfoByBadgeActual,
    runnerInfoByBadgeVirtual,
    finishedBadges,
    badgeConfigsForModal,
  ]);

  const loadSnapshot = useCallback(() => {
    try {
      const raw = localStorage.getItem("snapshot");
      const parsed = raw ? JSON.parse(raw) : null;
      setSnapshotData(parsed);

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
      setSnapshotData(null);
      setCurrentBatterName(null);
      setCurrentBatterId(null);
    }
  }, []);

  // 리셋버튼 함수

  // reconstructMode가 바뀐 직후, 상태 반영이 끝난 다음 프레임에서 occupancy 계산
  useEffect(() => {
    // 두 번의 requestAnimationFrame을 써서 setState → 커밋 → 렌더 → 다음 paint 이후에 정확히 측정
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const occ = computeBaseOccupancy(badgeSnapsRef.current);
        // console.log(
        //   `Base occupancy after reconstructMode=${reconstructMode}:`,
        //   occ
        // );
      });
    });
  }, [reconstructMode]);

  const badgeSnapsRef = useRef<typeof badgeSnaps>(badgeSnaps);
  useEffect(() => {
    badgeSnapsRef.current = badgeSnaps;
  }, [badgeSnaps]);

  const [applyResetSnapshot, setApplyResetSnapshot] = useState(false);
  // 5;

  // const resetWhiteBadges = useCallback(() => {
  //   unstable_batchedUpdates(() => {
  //     loadSnapshot();

  //     setBadgeSnaps(
  //       badgeConfigsForModal.reduce((acc, c) => {
  //         acc[c.id] = null;
  //         return acc;
  //       }, {} as Record<string, SnapInfo | null>)
  //     );
  //     setActiveBadges(badgeConfigsForModal.map((c) => c.id));
  //     setOutBadgesActual(new Set());
  //     setOutBadgesVirtual(new Set());
  //     setRunnerInfoByBadgeActual({});
  //     setRunnerInfoByBadgeVirtual({});
  //     setBaseToBadgeIdActual({});
  //     setBaseToBadgeIdVirtual({});

  //     // ← 여기를 추가: 홈/완료 상태 초기화
  //     setFinishedBadgesActual(new Set());
  //     setFinishedBadgesVirtual(new Set());
  //     setHomeSnappedBadgesActual(new Set());
  //     setHomeSnappedBadgesVirtual(new Set());

  //     setApplyResetSnapshot(true);
  //   });
  // }, [isOpen, badgeConfigsForModal, loadSnapshot]);
  // const resetWhiteBadges = useCallback(() => {
  //   unstable_batchedUpdates(() => {
  //     loadSnapshot();

  //     // ref들도 즉시 초기화 (이전 스냅/순서 잔재 제거)
  //     initialSnapsRef.current = badgeConfigsForModal.reduce((acc, c) => {
  //       acc[c.id] = null;
  //       return acc;
  //     }, {} as Record<string, SnapInfo | null>);
  //     snappedSeqRef.current = badgeConfigsForModal.reduce((acc, c) => {
  //       acc[c.id] = [];
  //       return acc;
  //     }, {} as Record<string, BaseId[]>);

  //     setBadgeSnaps(
  //       badgeConfigsForModal.reduce((acc, c) => {
  //         acc[c.id] = null;
  //         return acc;
  //       }, {} as Record<string, SnapInfo | null>)
  //     );
  //     setActiveBadges(badgeConfigsForModal.map((c) => c.id));
  //     setOutBadgesActual(new Set());
  //     setOutBadgesVirtual(new Set());
  //     setRunnerInfoByBadgeActual({});
  //     setRunnerInfoByBadgeVirtual({});
  //     setBaseToBadgeIdActual({});
  //     setBaseToBadgeIdVirtual({});

  //     setFinishedBadgesActual(new Set());
  //     setFinishedBadgesVirtual(new Set());
  //     setHomeSnappedBadgesActual(new Set());
  //     setHomeSnappedBadgesVirtual(new Set());

  //     setApplyResetSnapshot(true);
  //   });
  // }, [isOpen, badgeConfigsForModal, loadSnapshot]);

  const resetWhiteBadges = useCallback(() => {
    unstable_batchedUpdates(() => {
      loadSnapshot();

      // refs 초기화 (이전 스냅/순서 제거)
      initialSnapsRef.current = badgeConfigsForModal.reduce((acc, c) => {
        acc[c.id] = null;
        return acc;
      }, {} as Record<string, SnapInfo | null>);
      snappedSeqRef.current = badgeConfigsForModal.reduce((acc, c) => {
        acc[c.id] = [];
        return acc;
      }, {} as Record<string, BaseId[]>);

      // 상태 초기화
      setBadgeSnaps(
        badgeConfigsForModal.reduce((acc, c) => {
          acc[c.id] = null;
          return acc;
        }, {} as Record<string, SnapInfo | null>)
      );
      setActiveBadges(badgeConfigsForModal.map((c) => c.id));
      setOutBadgesActual(new Set());
      setOutBadgesVirtual(new Set());
      setRunnerInfoByBadgeActual({});
      setRunnerInfoByBadgeVirtual({});
      setBaseToBadgeIdActual({});
      setBaseToBadgeIdVirtual({});
      setFinishedBadgesActual(new Set());
      setFinishedBadgesVirtual(new Set());
      setHomeSnappedBadgesActual(new Set());
      setHomeSnappedBadgesVirtual(new Set());
    });

    // 초기 로딩과 동일하게 snapshot 기반 sync 한 번만 수행
    requestAnimationFrame(() => {
      syncRunnersOnBase();

      // sync 결과가 반영된 badgeSnaps를 기준으로 initialSnaps / snappedSeq도 갱신
      initialSnapsRef.current = { ...badgeSnapsRef.current };
      badgeConfigsForModal.forEach(({ id }) => {
        const snap = badgeSnapsRef.current[id];
        snappedSeqRef.current[id] = snap ? [snap.base] : [];
      });
    });
  }, [loadSnapshot, badgeConfigsForModal, syncRunnersOnBase]);

  // useEffect(() => {
  //   if (!applyResetSnapshot) return;
  //   if (!snapshotData) return; // snapshotData가 아직 들어오기 전이면 대기

  //   // 1) snapshot 기반으로 스냅/매핑 재구성 (excluded 건너뛰기)
  //   syncRunnersOnBaseForMode("actual", { skipExcluded: true });
  //   syncRunnersOnBaseForMode("virtual", { skipExcluded: true });

  //   // 2) snappedSeqRef 재설정 (현재 badgeSnaps 기준)
  //   badgeConfigsForModal.forEach(({ id }) => {
  //     const snap = badgeSnapsRef.current[id] ?? initialSnapsRef.current[id];
  //     snappedSeqRef.current[id] = snap ? [snap.base] : [];
  //   });

  //   // 3) excluded 포함한 일반 sync
  //   syncRunnersOnBaseForMode("actual");
  //   syncRunnersOnBaseForMode("virtual");

  //   // 4) 다음 리셋 대비 초기 스냅 저장
  //   initialSnapsRef.current = { ...badgeSnapsRef.current };

  //   // 5) 상태가 모두 반영된 뒤에 occupancy 측정 (두 프레임 확보)
  //   requestAnimationFrame(() => {
  //     requestAnimationFrame(() => {
  //       const occ = computeBaseOccupancy(badgeSnapsRef.current);
  //       console.log(
  //         "Base occupancy after resetWhiteBadges (from snapshot):",
  //         occ
  //       );
  //     });
  //   });

  //   // 플래그 초기화
  //   setApplyResetSnapshot(false);
  // }, [
  //   applyResetSnapshot,
  //   snapshotData,
  //   syncRunnersOnBaseForMode,
  //   badgeConfigsForModal,
  // ]);

  // 모드 전환 시 기존 주자/스냅 상태 초기화 (actual <-> virtual 섞이는 문제 방지)

  const handleReconstructToggle = useCallback(
    (checked: boolean) => {
      if (containerRef.current) {
        containerRef.current.classList.toggle("reconstruct-mode", checked);
      }
      setReconstructMode(checked);
      setActiveBadges(badgeConfigsForModal.map((c) => c.id));
      setOutBadges(new Set());
      if (!batterWhiteBadgeId) return;

      // 타자 배지를 무조건 B (초기 위치)로 리셋
      setBadgeSnaps((prev) => {
        const next = { ...prev };
        next[batterWhiteBadgeId] = null;
        return next;
      });

      // 순서 기록에서도 타자 초기화
      snappedSeqRef.current[batterWhiteBadgeId] = [];

      // initial 스냅에도 반영해서 이후 리셋/비교 로직에서 B로 인식되게
      initialSnapsRef.current[batterWhiteBadgeId] = null;
      // badgeSnaps 업데이트가 비동기라 다음 프레임에 occupancy 계산
      requestAnimationFrame(() => {
        const occ = computeBaseOccupancy(badgeSnapsRef.current);
        // console.log("Base occupancy after reconstruct toggle:", occ);
      });
    },

    [batterWhiteBadgeId, badgeConfigsForModal]
  );

  useEffect(() => {
    if (!isOpen) return;
    syncRunnersOnBase();
  }, [isOpen, snapshotData, reconstructMode]);

  //요청값 만들기
  // 이전 actual / virtual 직전 직렬화 문자열을 보관하는 ref들 (컴포넌트 최상단에 선언되어 있어야 함)
  const prevActualLogRef = useRef<string | null>(null);
  const prevVirtualLogRef = useRef<string | null>(null);

  // 공통으로 사용하는 runner 상태 배열 생성 헬퍼

  const buildArrayForMode = (
    runnerMap: Record<string, { runnerId: number; name: string }>,
    outBadgesForMode: Set<string>,
    homeSnappedForMode: Set<string>
  ): Array<{
    runnerId: number | null;
    startBase: string;
    endBase: string;
  }> => {
    const entries: Array<{
      runnerId: number | null;
      startBase: string;
      endBase: string;
    }> = [];
    const whiteBadgeIds = allWhiteBadges.map((cfg) => cfg.id);

    whiteBadgeIds.forEach((badgeId) => {
      let startBase: string;
      let endBase: string;

      // runnerId 결정: 타자 / 매핑된 주자 / 없으면 excluded
      let runnerId: number | null = null;
      if (badgeId === batterWhiteBadgeId) {
        runnerId =
          currentBatterId != null ? currentBatterId : EXCLUDED_RUNNER_ID;
      } else if (runnerMap[badgeId]) {
        runnerId = runnerMap[badgeId].runnerId;
      } else {
        runnerId = EXCLUDED_RUNNER_ID;
      }

      const isExcluded = runnerId === EXCLUDED_RUNNER_ID;

      if (isExcluded) {
        startBase = EXCLUDED_BASE_CODE; // "0"
        endBase = EXCLUDED_BASE_CODE; // "0"
      } else {
        startBase = getBaseCode(initialSnapsRef.current[badgeId] ?? null);

        if (outBadgesForMode.has(badgeId)) {
          endBase = "O";
        } else if (homeSnappedForMode.has(badgeId)) {
          endBase = "H";
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
      }

      // 특별히 이동 없는 (B→B) 비타자 항목은 생략
      if (
        badgeId !== batterWhiteBadgeId &&
        startBase === "B" &&
        endBase === "B"
      )
        return;

      entries.push({
        runnerId,
        startBase,
        endBase,
      });
    });

    // ==== 병합: 실제 runnerId (>=0)만 병합, excluded/-1과 null은 그대로 둠 ====
    const priority: Record<string, number> = {
      H: 6,
      O: 5,
      "3": 4,
      "2": 3,
      "1": 2,
      B: 1,
      "0": 0,
    };

    const realByRunner = new Map<
      number,
      { runnerId: number | null; startBase: string; endBase: string }
    >();
    const specialEntries: typeof entries = [];

    entries.forEach((entry) => {
      if (entry.runnerId == null || entry.runnerId === EXCLUDED_RUNNER_ID) {
        specialEntries.push(entry);
        return;
      }
      const rid = entry.runnerId;
      const existing = realByRunner.get(rid);
      if (!existing) {
        realByRunner.set(rid, entry);
        return;
      }
      const existingScore = priority[existing.endBase] ?? 0;
      const newScore = priority[entry.endBase] ?? 0;
      if (newScore > existingScore) {
        realByRunner.set(rid, entry);
      }
    });

    return [...Array.from(realByRunner.values()), ...specialEntries];
  };

  type RunnerLogEntry = {
    runnerId: number | null;
    startBase: string;
    endBase: string;
  };

  type CombinedRequest = {
    phase: "AFTER";
    actual: RunnerLogEntry[];
    virtual?: RunnerLogEntry[];
  };

  const [actualRequest, setActualRequest] = useState<RunnerLogEntry[]>([]);
  const [virtualRequest, setVirtualRequest] = useState<RunnerLogEntry[]>([]);
  const [combinedRequest, setCombinedRequest] =
    useState<CombinedRequest | null>(null);

  // reconstructMode 켤 때 이전 actual을 보존하기 위한 ref
  const actualBeforeReconstructRef = useRef<RunnerLogEntry[] | null>(null);

  useEffect(() => {
    if (reconstructMode) {
      if (actualBeforeReconstructRef.current === null) {
        actualBeforeReconstructRef.current = actualRequest;
      }
    } else {
      actualBeforeReconstructRef.current = null;
    }
  }, [reconstructMode, actualRequest]);

  // actual 전용 로그 (reconstructMode=false일 때)
  useEffect(() => {
    if (!isOpen) return;
    if (!batterWhiteBadgeId) return;
    if (reconstructMode) return; // reconstruct 모드면 skip

    const actualArray = buildArrayForMode(
      runnerInfoByBadgeActual,
      outBadgesActual,
      homeSnappedBadgesActual
    );
    const filteredActualArray = actualArray.filter(
      (entry) =>
        entry.runnerId !== null && entry.runnerId !== EXCLUDED_RUNNER_ID
    );
    const serializedActual = JSON.stringify(filteredActualArray);

    if (
      filteredActualArray.length > 0 &&
      prevActualLogRef.current !== serializedActual
    ) {
      setActualRequest(filteredActualArray); // 추가된 저장
      prevActualLogRef.current = serializedActual;
      // console.log("filteredActualArray", filteredActualArray);
      // actual만 있는 경우 combinedRequest 구성
      const single: CombinedRequest = {
        phase: "AFTER",
        actual: filteredActualArray,
      };
      setCombinedRequest(single);
      // console.log("actual only", JSON.stringify(single, null, 2));
    }
  }, [
    badgeSnaps,
    activeBadges,
    currentBatterId,
    runnerInfoByBadgeActual,
    batterWhiteBadgeId,
    isOpen,
    outBadgesActual,
    allWhiteBadges,
    // reconstructMode,
  ]);

  // virtual 전용 로그 (reconstructMode=true일 때)
  useEffect(() => {
    if (!isOpen) return;
    if (!batterWhiteBadgeId) return;
    if (!reconstructMode) return;

    const virtualArray = buildArrayForMode(
      runnerInfoByBadgeVirtual,
      outBadgesVirtual,
      homeSnappedBadgesVirtual
    );
    const filteredVirtualArray = virtualArray.filter(
      (entry) =>
        entry.runnerId !== null && entry.runnerId !== EXCLUDED_RUNNER_ID
    );
    const serializedVirtual = JSON.stringify(filteredVirtualArray);

    if (
      filteredVirtualArray.length > 0 &&
      prevVirtualLogRef.current !== serializedVirtual
    ) {
      setVirtualRequest(filteredVirtualArray); // 추가된 저장
      prevVirtualLogRef.current = serializedVirtual;
    }
  }, [
    badgeSnaps,
    activeBadges,
    currentBatterId,
    runnerInfoByBadgeVirtual,
    batterWhiteBadgeId,
    isOpen,
    outBadgesVirtual,
    allWhiteBadges,
    reconstructMode,
  ]);

  // actual (재구성 모드 켜기 직전 스냅) + virtual 합쳐서 최종 객체 생성
  useEffect(() => {
    if (!reconstructMode) return;
    if (virtualRequest.length === 0) return;

    const actualToUse = actualBeforeReconstructRef.current ?? actualRequest;

    const combined: CombinedRequest = {
      phase: "AFTER",
      actual: actualToUse,
      virtual: virtualRequest,
    };
    setCombinedRequest(combined);
    // console.log("최종입니다", JSON.stringify(combined, null, 2));
  }, [virtualRequest, reconstructMode, actualRequest]);

  // console.log("combinedRequest", combinedRequest);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    []
  );

  /**
   * 현재 badgeSnaps 기준으로 각 베이스가 점유되어 있는지 여부를 계산
   */
  function computeBaseOccupancy(
    badgeSnaps: Record<string, { base: BaseId } | null>
  ): Record<BaseId, boolean> {
    const BASE_IDS: readonly BaseId[] = [
      "first-base",
      "second-base",
      "third-base",
      "home-base",
    ];
    return BASE_IDS.reduce((acc, base) => {
      acc[base] = Object.values(badgeSnaps).some((snap) => snap?.base === base);
      return acc;
    }, {} as Record<BaseId, boolean>);
  }
  // 최종 제출하기 함수
  // 서버로 runner-events 전송 (요청값은 무조건 combinedRequest)
  // const playId = localStorage.getItem("playId");
  // const sendRunnerEvents = useCallback(async () => {
  //   if (!combinedRequest) {
  //     console.warn("combinedRequest이 없어서 전송을 스킵합니다."); // 없으면 스킵
  //     return;
  //   }
  //   console.log(
  //     "Sending runner events:",
  //     JSON.stringify(combinedRequest, null, 2)
  //   );

  //   if (!playId) {
  //     const msg =
  //       "localStorage에 playId가 없어 runner-events 요청을 보낼 수 없습니다.";
  //     console.error(msg);
  //     throw new Error(msg);
  //   }
  //   const url = `/plays/${encodeURIComponent(playId)}/runner-events`;
  //   console.log(
  //     "Sending runner events to",
  //     url,
  //     JSON.stringify(combinedRequest, null, 2)
  //   );
  //   try {
  //     const res = await API.post(url, combinedRequest);
  //     return res;
  //   } catch (e) {
  //     console.error("runner-events 전송 실패:", e);
  //     alert("전송 실패");
  //     throw e;
  //   }
  // }, [combinedRequest]);

  // 확인 버튼 핸들러

  const saveAndReloadSnapshot = useCallback(
    (next: any) => {
      localStorage.setItem("snapshot", JSON.stringify(next));
      loadSnapshot(); // 항상 setSnapshotData까지 따라오도록
      updateSnapshot?.(next); // 부모도 쓰고 있으면 그대로 알림
    },
    [loadSnapshot, updateSnapshot]
  );
  const clearAllSnapsAndExitReconstructMode = useCallback(() => {
    unstable_batchedUpdates(() => {
      setReconstructMode(false);
      setBadgeSnaps(
        badgeConfigsForModal.reduce((acc, c) => {
          acc[c.id] = null; // SnapInfo|null 이어야 하므로 null로 초기화
          return acc;
        }, {} as Record<string, SnapInfo | null>)
      );
      setActiveBadges(badgeConfigsForModal.map((c) => c.id));
      setOutBadgesActual(new Set());
      setOutBadgesVirtual(new Set());
      setRunnerInfoByBadgeActual({});
      setRunnerInfoByBadgeVirtual({});
      setBaseToBadgeIdActual({});
      setBaseToBadgeIdVirtual({});
      setFinishedBadgesActual(new Set());
      setFinishedBadgesVirtual(new Set());
      setHomeSnappedBadgesActual(new Set());
      setHomeSnappedBadgesVirtual(new Set());
    });
  }, [badgeConfigsForModal]);

  const sendRunnerEvents = useCallback(async () => {
    if (!combinedRequest) {
      console.warn("combinedRequest이 없어서 전송을 스킵합니다.");
      return;
    }

    // snapshot에서 playId만 꺼냄 (절대 다른 키로 대체하지 않음)
    const rawSnapshot = localStorage.getItem("snapshot");
    if (!rawSnapshot) {
      const msg =
        "localStorage에 snapshot이 없어 runner-events 요청을 보낼 수 없습니다.";
      console.error(msg);
      throw new Error(msg);
    }

    let errorFlag = false;
    let playIdValue: unknown = null;
    try {
      const parsed = JSON.parse(rawSnapshot);
      errorFlag = !!parsed?.snapshot?.inningStats?.errorFlag;
      playIdValue = parsed.snapshot?.playId ?? null;
    } catch (e) {
      console.warn("snapshot JSON 파싱 실패:", e);
    }

    // ⛔️ 여기서 preflight: PATCH 전에 차단
    // if (errorFlag) {
    //   const hasBB = (arr?: RunnerLogEntry[]) =>
    //     (arr ?? []).some((e) => e.startBase === "B" && e.endBase === "B");

    //   const virtualExists =
    //     Array.isArray(combinedRequest.virtual) &&
    //     combinedRequest.virtual.length > 0;

    //   if (
    //     !virtualExists ||
    //     hasBB(combinedRequest.actual) ||
    //     hasBB(combinedRequest.virtual)
    //   ) {
    //     alert("이닝의 재구성을 해주세요");
    //     const err: any = new Error("PRE_FLIGHT_BLOCK");
    //     err.code = "PRE_FLIGHT_BLOCK"; // 식별용 코드
    //     throw err; // 🚫 여기서 흐름 중단 (PATCH/POST 안 나감)
    //   }
    // }
    // ⛔️ 여기서 preflight: PATCH 전에 차단
    if (errorFlag) {
      const hasBB = (arr?: RunnerLogEntry[]) =>
        (arr ?? []).some((e) => e.startBase === "B" && e.endBase === "B");

      const virtualExists =
        Array.isArray(combinedRequest.virtual) &&
        combinedRequest.virtual.length > 0;

      const hasBBActual = hasBB(combinedRequest.actual);
      const hasBBVirtual = hasBB(combinedRequest.virtual);

      // 1) 가상 이동 자체가 비어있는 경우
      if (!virtualExists) {
        alert("이닝의 재구성을 해주세요");
        const err: any = new Error("PRE_FLIGHT_NO_VIRTUAL");
        err.code = "PRE_FLIGHT_BLOCK";
        err.reason = "NO_VIRTUAL";
        throw err; // 🚫 여기서 중단
      }

      // 2) B→B 항목이 포함된 경우 (actual/virtual 각각 다른 문구)
      if (hasBBActual || hasBBVirtual) {
        const target = hasBBActual ? "실제 기록(actual)" : "재구성(virtual)";
        alert(`타자를 먼저 이동해주세요`);
        const err: any = new Error("PRE_FLIGHT_HAS_BB");
        err.code = "PRE_FLIGHT_BLOCK";
        err.reason = hasBBActual ? "HAS_BB_ACTUAL" : "HAS_BB_VIRTUAL";
        throw err; // 🚫 여기서 중단
      }
    }
    // ⛔️ preflight 끝 — 이 아래로 내려오면 유효하므로 PATCH/POST 진행

    if (playIdValue == null) {
      const msg =
        "localStorage의 snapshot에서 snapshot.playId를 찾을 수 없어 runner-events 요청을 보낼 수 없습니다.";
      console.error(msg);
      throw new Error(msg);
    }

    const encodedPlayId = encodeURIComponent(String(playIdValue));

    // plateAppearanceResult 가져오기
    const rawPlateAppearance = localStorage.getItem("plateAppearanceResult");
    let plateAppearanceResult: any = null;
    if (rawPlateAppearance != null) {
      try {
        plateAppearanceResult = JSON.parse(rawPlateAppearance);
      } catch {
        plateAppearanceResult = rawPlateAppearance;
      }
    } else {
      console.warn(
        "localStorage에 plateAppearanceResult가 없습니다. PATCH body를 빈 객체로 보냅니다."
      );
    }

    // 1. PATCH /plays/{playId}/result 먼저
    const patchUrl = `/plays/${encodedPlayId}/result`;
    let patchRes;
    try {
      console.log("PATCH /result 요청:", patchUrl, plateAppearanceResult);
      patchRes = await API.patch(patchUrl, plateAppearanceResult ?? {});
      console.log("PATCH /result 응답:", {
        status: (patchRes as any)?.status,
        data:
          typeof (patchRes as any)?.data !== "undefined"
            ? (patchRes as any).data
            : patchRes,
      });
    } catch (err) {
      console.error("PATCH /result 실패:", err);
      alert("결과 업데이트 실패");
      throw err;
    }

    // 2. POST runner-events
    const postUrl = `/plays/${encodedPlayId}/runner-events`;
    let postRes;
    try {
      // 전송 직전에만 startBase === endBase인 entry 제거
      const sanitizeCombinedRequest = (
        req: CombinedRequest
      ): CombinedRequest => {
        const filter = (entries: RunnerLogEntry[] = []) =>
          entries.filter((entry) => entry.startBase !== entry.endBase);

        const actual = filter(req.actual);
        const virtual =
          req.virtual && req.virtual.length > 0
            ? filter(req.virtual)
            : undefined;

        return {
          phase: req.phase,
          actual,
          ...(virtual ? { virtual } : {}),
        };
      };

      const finalRequest = sanitizeCombinedRequest(combinedRequest);
      console.log(
        "runner-events POST 요청:",
        postUrl,
        JSON.stringify(finalRequest, null, 2)
      );
      postRes = await API.post(postUrl, finalRequest);

      console.log("runner-events POST 응답:", {
        status: (postRes as any)?.status,
        data:
          typeof (postRes as any)?.data !== "undefined"
            ? (postRes as any).data
            : postRes,
      });

      // localStorage.setItem(`snapshot`, JSON.stringify(postRes.data));
      // updateSnapshot(postRes.data);
      saveAndReloadSnapshot(postRes.data);
    } catch (err) {
      console.error("runner-events 전송 실패:", err);
      alert("runner-events 전송 실패");
      throw err;
    }

    return { patchRes, postRes };
  }, [combinedRequest]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await sendRunnerEvents();
      clearAllSnapsAndExitReconstructMode();
      await onSuccess?.();
      resetWhiteBadges();
      handleClose();
    } catch (e) {
      // ✋ preflight 차단 에러는 그냥 삼켜서 모달 유지
      if (e?.code !== "PRE_FLIGHT_BLOCK") {
        setError(e as Error); // 진짜 오류만 ErrorAlert로 노출
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [sendRunnerEvents, onSuccess, handleClose]);

  /**
   * 특정 배지를 제외하고, 주어진 베이스에 다른 배지가 이미 스냅되어 있는지 검사
   */
  function isBaseOccupied(
    targetBase: BaseId,
    badgeId: string,
    badgeSnaps: Record<string, { base: BaseId } | null>
  ): boolean {
    return Object.entries(badgeSnaps).some(
      ([otherId, snap]) => otherId !== badgeId && snap?.base === targetBase
    );
  }

  const occupancy = useMemo(
    () => computeBaseOccupancy(badgeSnaps),
    [badgeSnaps]
  );

  // useEffect(() => {
  //   console.log("Base occupancy:", occupancy);
  // }, [occupancy]);
  useEffect(() => {
    const occupiedEntries = Object.entries(badgeSnaps)
      .filter(([, snap]) => snap != null)
      .map(([id, snap]) => `${id} → ${snap!.base}`);
    // console.log("badgeSnaps contents:", occupiedEntries);
    // console.log("computed occupancy from badgeSnaps:", occupancy);
  }, [badgeSnaps, occupancy]);

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
                  // active한 것만
                  if (!activeBadges.includes(cfg.id)) return false;

                  // 타자 배지: currentBatterId가 있어야 보여줌
                  if (cfg.id === batterWhiteBadgeId) {
                    return currentBatterId != null;
                  }

                  // 주자 배지: runnerInfoByBadge에 있고 runnerId가 null이 아니어야 보여줌
                  const info = runnerInfoByBadge[cfg.id];
                  if (!info) return false;

                  // 타자 배지 처리
                  if (cfg.id === batterWhiteBadgeId) {
                    return currentBatterId != null;
                  }

                  // 할당 제외면 렌더링 안 함
                  if (info.runnerId === EXCLUDED_RUNNER_ID) return false;

                  // 진짜 주자만 보여줌
                  return info.runnerId != null;
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
          <ControlButton onClick={handleSubmit}>확인</ControlButton>
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
