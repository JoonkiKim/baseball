import { useRouter } from "next/router";
import API from "../../../commons/apis/api";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";
import { useState } from "react";

interface IModalProps {
  setIsEtcModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
}

export default function EtcModal(props: IModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // etc매핑
  const mapping: { [key: string]: string } = {
    낫아웃: "K_DROP",
    야수선택: "FC",
    희생플라이: "SF",
    "희생번트/타격방해": "ETC",
  };

  // etc 종류 선택 시 실행될 비동기 함수
  const handleTypeSelect = async (Type: string) => {
    if (isSubmitting) return; // 이미 요청 중이면 무시
    setIsSubmitting(true);

    try {
      const endpoint = `/matches/${router.query.recordId}/batters/${props.playerId}/plate-appearance`;
      const requestBody = { result: mapping[Type] };
      const { data } = await API.post(endpoint, requestBody);
      alert(`${mapping[Type]} 기록 전송 완료\n응답값: ${JSON.stringify(data)}`);
      console.log(endpoint, requestBody);
    } catch (error) {
      console.error("etc 기록 전송 오류:", error);
      alert("etc 기록 전송 오류");
    } finally {
      setIsSubmitting(false);
      props.setIsEtcModalOpen(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>종류를 선택해주세요</ModalTitle>
        <ModalButton
          disabled={isSubmitting}
          onClick={() => handleTypeSelect("낫아웃")}
        >
          낫아웃
        </ModalButton>
        <ModalButton
          disabled={isSubmitting}
          onClick={() => handleTypeSelect("야수선택")}
        >
          야수선택
        </ModalButton>
        <ModalButton
          disabled={isSubmitting}
          onClick={() => handleTypeSelect("희생플라이")}
        >
          희생플라이
        </ModalButton>
        <ModalButton
          disabled={isSubmitting}
          onClick={() => handleTypeSelect("희생번트/타격방해")}
        >
          희생번트/타격방해
        </ModalButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
