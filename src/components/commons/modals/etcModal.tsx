import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";

interface IModalProps {
  setIsEtcModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EtcModal(props: IModalProps) {
  // etc 종류 선택 시 실행될 함수
  const handleTypeSelect = (Type: string) => {
    // 여기서 낫아웃, 그 외 선택 시 처리 로직을 넣으시면 됩니다.
    alert(`기록: ${Type}`);
    props.setIsEtcModalOpen(false);
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>종류를 선택해주세요</ModalTitle>
        <ModalButton onClick={() => handleTypeSelect("낫아웃")}>
          낫아웃
        </ModalButton>
        <ModalButton onClick={() => handleTypeSelect("그 외")}>
          그 외
        </ModalButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
