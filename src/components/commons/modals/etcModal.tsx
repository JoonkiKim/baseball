import API from "../../../commons/apis/api";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";

interface IModalProps {
  setIsEtcModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
}

export default function EtcModal(props: IModalProps) {
  // etc 종류 선택 시 실행될 비동기 함수
  const handleTypeSelect = async (Type: string) => {
    if (Type === "낫아웃") {
      try {
        // 지정된 엔드포인트로 POST 요청 전송
        const endpoint = `/matches/1001/pitchers/${props.playerId}/strikeout`;
        console.log(endpoint);
        const requestBody = {
          gameId: 1001,
          playerId: 110,
        };
        const { data } = await API.post(endpoint, requestBody);
        alert(`기록: ${Type}\n응답값: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error("낫아웃 기록 전송 오류:", error);
        alert("낫아웃 기록 전송 오류");
      } finally {
        props.setIsEtcModalOpen(false);
      }
    } else {
      // 그 외 선택일 경우 기존 방식대로 처리
      alert(`기록: ${Type}`);
      props.setIsEtcModalOpen(false);
    }
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
