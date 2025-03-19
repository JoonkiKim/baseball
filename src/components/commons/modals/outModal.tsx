import styled from "@emotion/styled";

// 모달 관련 스타일
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 어두운 반투명 배경 */
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  width: 300px;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 18px;
`;

export const ModalButton = styled.button`
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 12px;
  background-color: #5cb85c;
  border: none;
  color: #fff;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #4cae4c;
  }
`;

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
