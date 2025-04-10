import API from "../../../commons/apis/api";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";

interface IModalProps {
  setIsHitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
}

export default function HitModal(props: IModalProps) {
  // 안타 종류에 대응하는 값 매핑
  const mapping: { [key: string]: string } = {
    안타: "1B",
    "2루타": "2B",
    "3루타": "3B",
    홈런: "HR",
  };

  // 안타 종류 선택 시 실행될 비동기 함수
  const handleTypeSelect = async (Type: string) => {
    try {
      // props.playerId 값을 엔드포인트 경로에 넣습니다.
      const endpoint = `/matches/1001/batters/${props.playerId}/plate-appearance`;
      console.log("요청주소", endpoint);
      const requestBody = {
        result: mapping[Type],
      };
      // POST 요청 후 응답값을 data에 담습니다.
      const { data } = await API.post(endpoint, requestBody);
      alert(
        `기록: ${Type} (${mapping[Type]}) 전송 완료\n응답값: ${JSON.stringify(
          data
        )}`
      );
    } catch (error) {
      console.error("히트 기록 전송 오류:", error);
      alert("히트 기록 전송 오류");
    } finally {
      props.setIsHitModalOpen(false);
    }
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
