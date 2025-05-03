// src/components/modals/hitModal.tsx
import { useRouter } from "next/router";
import API from "../../../commons/apis/api";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";
import { useState } from "react";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../commons/libraries/showErrorCode";

interface IModalProps {
  setIsHitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
  onSuccess?: () => Promise<void>;
}

const mapping: Record<string, string> = {
  안타: "1B",
  "2루타": "2B",
  "3루타": "3B",
  홈런: "HR",
};

export default function HitModal(props: IModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleTypeSelect = async (Type: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const endpoint = `/games/${router.query.recordId}/plate-appearance`;
      const res = await API.post(
        endpoint,
        { result: mapping[Type] }
        // ,
        // { withCredentials: true }
      );
      console.log({ result: mapping[Type] });
      // POST 성공 시 부모 onSuccess 콜백 실행

      if (props.onSuccess) await props.onSuccess();
      // props.setIsHitModalOpen(false);
      alert(`기록 전송 완료\n${Type}`);
      console.log(res.data);
    } catch (error) {
      console.error("안타 기록 전송 오류:", error);
      // alert("안타 기록 전송 오류");
      setError(error);
    } finally {
      // ① 로딩 해제
      setIsSubmitting(false);
      // ② 모달 닫기
      props.setIsHitModalOpen(false);
    }
  };

  return (
    <ModalOverlay onClick={() => props.setIsHitModalOpen(false)}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
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
      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      <ErrorAlert error={error} />
    </ModalOverlay>
  );
}
