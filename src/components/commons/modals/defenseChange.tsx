import {
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
  ModalTitleSmall,
} from "./modal.style";

interface IModalProps {
  setIsChangeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DefenseChangeModal(props: IModalProps) {
  // 공수교대 종류 선택 시 실행될 함수
  const handleTypeSelect = (type: string) => {
    if (type === "예") {
      // 공수교대 로직
      alert("공수교대!");
      props.setIsChangeModalOpen(false);
    } else {
      props.setIsChangeModalOpen(false);
    }
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitleSmall>공수를 교대하시겠습니까?</ModalTitleSmall>
        <ModalButton onClick={() => handleTypeSelect("예")}>예</ModalButton>
        <ModalCancleButton onClick={() => handleTypeSelect("아니오")}>
          아니오
        </ModalCancleButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
