import { useRouter } from "next/router";
import {
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
  ModalTitleSmall,
} from "./modal.style";

interface IModalProps {
  setIsGameEndModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GameOverModal(props: IModalProps) {
  // 공수교대 종류 선택 시 실행될 함수
  const router = useRouter();

  const handleTypeSelect = (type: string) => {
    if (type === "예") {
      alert("경기종료!");
      props.setIsGameEndModalOpen(false);
      router.push("/result");
    } else {
      props.setIsGameEndModalOpen(false);
    }
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitleSmall>경기를 종료하시겠습니까?</ModalTitleSmall>
        <ModalButton onClick={() => handleTypeSelect("예")}>예</ModalButton>
        <ModalCancleButton onClick={() => handleTypeSelect("아니오")}>
          아니오
        </ModalCancleButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
