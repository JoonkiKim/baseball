// PortalSwitch.tsx
import { useLayoutEffect, memo, RefObject, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ReconstructionSwitch } from "./groundRecordModal.style";

interface PortalSwitchProps {
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
  onChange,
  anchorRef,
}: PortalSwitchProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const ignoreNextRef = useRef(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // 앵커 위치 트래킹
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

  // 낙관적 UI: pointerDown에서 즉시 반영하고 다음 underlying change는 무시
  const handlePointerDown = () => {
    setInternalChecked((prev) => {
      const next = !prev;
      ignoreNextRef.current = true; // 다음 onChange 이벤트(underlying) 무시
      onChange(next);
      return next;
    });
  };

  // 실제 switch가 change 콜백을 보낼 때
  const handleSwitchChange = (val: boolean) => {
    if (ignoreNextRef.current) {
      // 바로 이전에 pointerDown에서 반영했으므로 이 change는 redundant
      ignoreNextRef.current = false;
      return;
    }
    setInternalChecked(val);
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

  return createPortal(switchNode, ensurePortalRoot());
});

export default PortalSwitch;
