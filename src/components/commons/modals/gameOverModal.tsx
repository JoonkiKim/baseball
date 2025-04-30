import { useRouter } from "next/router";
import {
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
  ModalTitleSmall,
} from "./modal.style";
import API from "../../../commons/apis/api";
import { useModalBack } from "../../../commons/hooks/useModalBack";

interface IModalProps {
  setIsGameEndModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inningScore: number;
}

export default function GameOverModal(props: IModalProps) {
  // useModalBack(() => props.setIsGameEndModalOpen(false));
  // 공수교대 종류 선택 시 실행될 함수
  const router = useRouter();

  const handleTypeSelect = async (type: string) => {
    if (type === "예") {
      const requestBody = { runs: props.inningScore };
      console.log("경기종료 요청 바디:", requestBody);
      const response = await API.post(
        `/games/${router.query.recordId}/results`,
        requestBody
      );
      console.log(
        `/games/${router.query.recordId}/results`,
        "응답 상태:",
        response.status
      );
      props.setIsGameEndModalOpen(false);
      router.push(`/matches/${router.query.recordId}/result`);
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
