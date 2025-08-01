// PortalSwitch.tsx
import {
  useState,
  useEffect,
  useLayoutEffect,
  memo,
  RefObject,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { ReconstructionSwitch } from "./groundRecordModal.style";

interface PortalSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  anchorRef: RefObject<HTMLElement>;
}

const PORTAL_ROOT_ID = "lightweight-switch-portal-root";

function ensurePortalRoot() {
  let root = document.getElementById(PORTAL_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = PORTAL_ROOT_ID;
    Object.assign(root.style, {
      position: "fixed",
      top: "0",
      left: "0",
      pointerEvents: "none",
      zIndex: 20000,
    });
    document.body.appendChild(root);
  }
  return root;
}

const PortalSwitch = memo(function PortalSwitch({
  checked,
  onChange,
  anchorRef,
}: PortalSwitchProps) {
  const [internalChecked, setInternalChecked] = useState(checked);
  const lastReportedRef = useRef<boolean>(checked);
  const ignoreFlipRef = useRef<boolean>(false); // 잠깐 반대 방향 onChange 무시

  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // 외부 checked가 바뀌면 internal 동기화 (정상적인 흐름)
  useEffect(() => {
    if (checked !== internalChecked) {
      setInternalChecked(checked);
      lastReportedRef.current = checked;
    }
  }, [checked, internalChecked]);

  // 앵커 위치 추적
  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(anchorRef.current);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  // 포인터다운: 낙관적 토글 + 즉시 부모에 보고, 이후 반전 이벤트 잠깐 무시
  const handlePointerDown = () => {
    const next = !internalChecked;
    setInternalChecked(next);
    lastReportedRef.current = next;
    onChange(next);
    // 짧게 반대 방향 onChange 무시 (예: underlying switch가 뒤늦게 뒤집는 경우)
    ignoreFlipRef.current = true;
    setTimeout(() => {
      ignoreFlipRef.current = false;
    }, 250);
  };

  // 실제 switch가 change를 보낼 때 (keyboard 등)
  const handleSwitchChange = (val: boolean) => {
    // 이미 같은 값 보고했거나, 잠깐 반대 방향으로 들어온 이벤트라면 무시
    if (val === lastReportedRef.current) {
      return;
    }
    if (ignoreFlipRef.current && val !== lastReportedRef.current) {
      // ignoreFlipRef가 true인 동안에, 만약 underlying switch가
      // "뒤집힌" (낙관적과 반대) 값을 보내면 무시
      return;
    }
    // 정식으로 반영
    setInternalChecked(val);
    lastReportedRef.current = val;
    onChange(val);
  };

  const switchNode = (
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        willChange: "transform, opacity",
        transform: "translateZ(0)",
      }}
    >
      <div onPointerDown={handlePointerDown}>
        <ReconstructionSwitch
          checked={internalChecked}
          onChange={handleSwitchChange}
          aria-checked={internalChecked}
        />
      </div>
    </div>
  );

  const root = ensurePortalRoot();
  return createPortal(switchNode, root);
});

export default PortalSwitch;
