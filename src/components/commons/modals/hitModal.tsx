import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";

interface IModalProps {
  setIsHitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HitModal(props: IModalProps) {
  // 안타 종류 선택 시 실행될 함수
  const handleTypeSelect = (Type: string) => {
    // 여기서 안타, 2루타, 3루타, 홈런 선택 시 처리 로직을 넣으시면 됩니다.
    alert(`기록: ${Type}`);
    props.setIsHitModalOpen(false);
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>종류를 선택해주세요</ModalTitle>
        <ModalButton onClick={() => handleTypeSelect("안타")}>안타</ModalButton>
        <ModalButton onClick={() => handleTypeSelect("2루타")}>
          2루타
        </ModalButton>
        <ModalButton onClick={() => handleTypeSelect("3루타")}>
          3루타
        </ModalButton>
        <ModalButton onClick={() => handleTypeSelect("홈런")}>홈런</ModalButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
