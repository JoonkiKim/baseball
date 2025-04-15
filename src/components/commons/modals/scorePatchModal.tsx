// ScorePatchModal.tsx

import { useRouter } from "next/router";
import { useState } from "react";

import {
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitleSmall,
} from "./modal.style";
import ScorePatchInputModal from "./scorePatchInputModal";

interface IModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cellValue: string; // 스코어보드 셀로부터 받은 점수
  team: "A" | "B"; // 스코어보드 팀 구분
  cellIndex: number; // 이닝 인덱스 (0-based)
  mode?: "score" | "batter" | "pitcher"; // 모달을 연 원인
  alertMessage?: string; // 타자/투수 클릭 시 띄울 메시지
}

export default function ScorePatchModal({
  setIsModalOpen,
  cellValue,
  team,
  cellIndex,
  mode,
  alertMessage,
}: IModalProps) {
  const router = useRouter();

  // ScoreInputModal 표시 여부
  const [showScoreInputModal, setShowScoreInputModal] = useState(false);

  // 스코어보드 점수 수정에 필요한 상태
  const [suffix, setSuffix] = useState("");
  const [order, setOrder] = useState(0);

  const handleTypeSelect = (type: string) => {
    if (type === "예") {
      // 1) 만약 "타자/투수" 클릭으로 열린 모달일 경우(alertMessage 존재)
      if (mode === "batter" || mode === "pitcher") {
        // 기존에 handleBatterClick / handlePitcherClick 에서 띄우던 alert
        if (alertMessage) {
          alert(alertMessage);
        }
        // 모달 닫고 종료
        setIsModalOpen(false);
        return;
      }

      // 2) 스코어보드 "점수" 클릭으로 열린 경우(mode === "score")
      const selectedSuffix = team === "A" ? "TOP" : "BOT";
      const selectedOrder = cellIndex + 1;

      console.log(
        `선택된 점수: ${cellValue}점, 이닝: ${selectedSuffix}, 순서: ${selectedOrder}회`
      );

      setSuffix(selectedSuffix);
      setOrder(selectedOrder);

      // 다음 모달(ScorePatchInputModal) 오픈
      setShowScoreInputModal(true);
    } else {
      // "아니오" 클릭 시
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <ModalOverlay>
        <ModalContainer>
          <ModalTitleSmall>점수를 수정하시겠습니까?</ModalTitleSmall>
          <ModalButton onClick={() => handleTypeSelect("예")}>예</ModalButton>
          <ModalCancleButton onClick={() => handleTypeSelect("아니오")}>
            아니오
          </ModalCancleButton>
        </ModalContainer>
      </ModalOverlay>

      {showScoreInputModal && (
        <ScorePatchInputModal
          setIsModalOpen={setIsModalOpen}
          suffix={suffix}
          order={order}
          cellValue={cellValue}
        />
      )}
    </>
  );
}
