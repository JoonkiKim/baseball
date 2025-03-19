import styled from "@emotion/styled";
import { useRouter } from "next/router";

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

export const ModalCancleButton = styled.button`
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 12px;
  background-color: #f5f5f5;
  border: none;
  color: #000000;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #bdbdbd;
  }
`;

interface IModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RecordStartModal(props: IModalProps) {
  const router = useRouter();
  const handleTypeSelect = (type: string) => {
    if (type === "예") {
      props.setIsModalOpen(false);
      router.push("/records");
    } else {
      props.setIsModalOpen(false);
    }
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>경기 기록을 시작하시겠습니까?</ModalTitle>
        <ModalButton onClick={() => handleTypeSelect("예")}>예</ModalButton>
        <ModalCancleButton onClick={() => handleTypeSelect("아니오")}>
          아니오
        </ModalCancleButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
