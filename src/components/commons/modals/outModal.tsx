import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";

interface IModalProps {
  setIsOutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OutModal(props: IModalProps) {
  // 아웃 종류 선택 시 실행될 함수
  const handleTypeSelect = (Type: string) => {
    // 여기서 삼진, 그 외 아웃 선택 시 처리 로직을 넣으시면 됩니다.
    alert(`기록: ${Type}`);
    props.setIsOutModalOpen(false);
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>종류를 선택해주세요</ModalTitle>
        <ModalButton onClick={() => handleTypeSelect("삼진")}>삼진</ModalButton>
        <ModalButton onClick={() => handleTypeSelect("그 외 아웃")}>
          그 외 아웃
        </ModalButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
