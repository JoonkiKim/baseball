// src/components/modals/etcModal.tsx
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
  setIsEtcModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
  onSuccess?: () => Promise<void>;
}

const mapping: Record<string, string> = {
  낫아웃: "SO_DROP",
  야수선택: "FC",
  희생플라이: "SF",
  "희생번트/타격방해": "ETC",
};
// const [error, setError] = useState(null);

export default function EtcModal(props: IModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleTypeSelect = async (Type: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const endpoint = `/games/${router.query.recordId}/plate-appearance`;
      const requestBody = { result: mapping[Type] };
      const { data } = await API.post(endpoint, requestBody);

      console.log(endpoint, requestBody, data);
      alert(`기록 전송 완료\n${Type}`);
      // 부모가 넘겨준 onSuccess 콜백 실행
      if (props.onSuccess) {
        await props.onSuccess();
      }

      // 모달 닫기
      // props.setIsEtcModalOpen(false);
    } catch (error) {
      console.error("etc 기록 전송 오류:", error);
      // setError(error);
      // alert("etc 기록 전송 오류");
    } finally {
      // ① 로딩 해제
      setIsSubmitting(false);
      // ② 모달 닫기
      props.setIsEtcModalOpen(false);
    }
  };

  return (
    <ModalOverlay onClick={() => props.setIsEtcModalOpen(false)}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalTitle>종류를 선택해주세요</ModalTitle>

        <ModalButton
          onClick={() => handleTypeSelect("낫아웃")}
          disabled={isSubmitting}
        >
          낫아웃
        </ModalButton>
        <ModalButton
          onClick={() => handleTypeSelect("야수선택")}
          disabled={isSubmitting}
        >
          야수선택
        </ModalButton>
        <ModalButton
          onClick={() => handleTypeSelect("희생플라이")}
          disabled={isSubmitting}
        >
          희생플라이
        </ModalButton>
        <ModalButton
          onClick={() => handleTypeSelect("희생번트/타격방해")}
          disabled={isSubmitting}
        >
          희생번트/타격방해
        </ModalButton>
      </ModalContainer>

      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      {/* <ErrorAlert error={error} /> */}
    </ModalOverlay>
  );
}
