import API from "../../../commons/apis/api";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";

interface IModalProps {
  setIsOutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
}

export default function OutModal(props: IModalProps) {
  // 아웃 종류 선택 시 실행될 비동기 함수
  const handleTypeSelect = async (Type: string) => {
    if (Type === "삼진") {
      try {
        const endpoint = `/matches/1001/pitchers/${props.playerId}/strikeout`;
        console.log(endpoint);
        const requestBody = {
          gameId: 1001,
          playerId: 110,
        };
        const { data } = await API.post(endpoint, requestBody);
        alert(`기록: 삼진\n응답값: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error("삼진 기록 전송 오류:", error);
        alert("삼진 기록 전송 오류");
      } finally {
        props.setIsOutModalOpen(false);
      }
    } else {
      // 그 외 아웃일 경우 기존 방식대로 처리
      alert(`기록: ${Type}`);
      props.setIsOutModalOpen(false);
    }
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
