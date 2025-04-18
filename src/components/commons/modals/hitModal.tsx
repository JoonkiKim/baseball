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
  setIsHitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
}

export default function HitModal(props: IModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 안타 종류에 대응하는 값 매핑
  const mapping: { [key: string]: string } = {
    안타: "1B",
    "2루타": "2B",
    "3루타": "3B",
    홈런: "HR",
  };

  // 안타 종류 선택 시 실행될 비동기 함수
  const handleTypeSelect = async (Type: string) => {
    if (isSubmitting) return; // 이미 요청 중이면 무시
    setIsSubmitting(true);

    try {
      const endpoint = `/matches/${router.query.recordId}/batters/${props.playerId}/plate-appearance`;
      const requestBody = { result: mapping[Type] };
      const { data } = await API.post(endpoint, requestBody);
      alert(`안타 기록 전송 완료\n응답값: ${JSON.stringify(data)}`);
      console.log(endpoint, requestBody);
    } catch (error) {
      console.error("히트 기록 전송 오류:", error);
      alert("히트 기록 전송 오류");
    } finally {
      setIsSubmitting(false);
      props.setIsHitModalOpen(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>종류를 선택해주세요</ModalTitle>
        <ModalButton
          onClick={() => handleTypeSelect("안타")}
          disabled={isSubmitting}
        >
          안타
        </ModalButton>
        <ModalButton
          onClick={() => handleTypeSelect("2루타")}
          disabled={isSubmitting}
        >
          2루타
        </ModalButton>
        <ModalButton
          onClick={() => handleTypeSelect("3루타")}
          disabled={isSubmitting}
        >
          3루타
        </ModalButton>
        <ModalButton
          onClick={() => handleTypeSelect("홈런")}
          disabled={isSubmitting}
        >
          홈런
        </ModalButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
