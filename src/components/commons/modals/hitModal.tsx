import { useRouter } from "next/router";
import API from "../../../commons/apis/api";
import {
  ModalButton,
  ModalContainer,
  ModalOverlay,
  ModalTitle,
} from "./modal.style";
import { useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../commons/libraries/loadingOverlay";

interface IModalProps {
  setIsHitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerId: number;
}

export default function HitModal(props: IModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const mapping: { [key: string]: string } = {
    안타: "1B",
    "2루타": "2B",
    "3루타": "3B",
    홈런: "HR",
  };

  const handleTypeSelect = async (Type: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const endpoint = `/games/${router.query.recordId}/batters/${props.playerId}/plate-appearance`;
      const requestBody = { result: mapping[Type] };
      const { data } = await API.post(endpoint, requestBody);
      alert(`기록 전송 완료\n${Type}`);
    } catch (error) {
      const errorCode = error?.response?.data?.error_code;
      console.error(error, "error_code:", errorCode);
      alert("안타 기록 전송 오류");
    } finally {
      setIsSubmitting(false);
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
    </ModalOverlay>
  );
}
