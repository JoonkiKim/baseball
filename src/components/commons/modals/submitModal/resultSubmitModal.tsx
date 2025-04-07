import { useState } from "react";
import Link from "next/link";
import {
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitleSmall,
} from "../modal.style";

interface IModalProps {
  setIsResultSubmitModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ResultSubmitModal(props: IModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <ModalOverlay>
        <ModalContainer>
          <ModalTitleSmall>제출이 완료되었습니다!</ModalTitleSmall>
          <Link href="/" passHref>
            <ModalButton as="a">홈으로</ModalButton>
          </Link>
        </ModalContainer>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitleSmall>경기기록을 제출하시겠습니까?</ModalTitleSmall>
        <ModalButton onClick={() => setIsSubmitted(true)}>예</ModalButton>
        <ModalCancleButton
          onClick={() => props.setIsResultSubmitModalOpen(false)}
        >
          아니오
        </ModalCancleButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
