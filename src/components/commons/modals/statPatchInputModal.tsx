import { useState } from "react";
import { useRouter } from "next/router";
import {
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitleSmall,
} from "./modal.style";
import API from "../../../commons/apis/api";

interface IScoreEditModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  suffix: string;
  order: number;
  cellValue: string;
}

export default function StatPatchInputModal({
  setIsModalOpen,
  suffix,
  order,
  cellValue,
}: IScoreEditModalProps) {
  const router = useRouter();
  const [score, setScore] = useState<string>("");

  const handleSubmit = async () => {
    // 점수가 비어있는 경우 요청을 보내지 않고 경고창을 띄우고 종료
    if (!score) {
      alert("점수가 입력되지 않았습니다.");
      return;
    }

    console.log(`(초말: ${suffix}, order: ${order}, cellValue: ${cellValue})`);
    console.log(`제출된 점수: ${score}`);

    // 요청 바디
    const requestBody = {
      inning: order, // 이닝
      inningHalf: suffix, // 초/말 구분
      runs: Number(score), // 수정할 점수
    };

    try {
      // PATCH 요청
      const response = await API.patch(
        `/games/${router.query.recordId}/scores/${order}/${suffix}`,
        requestBody
      );

      console.log(requestBody);
      console.log("점수 수정 응답:", response.data);
      alert("점수가 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error(error);
      alert("점수 수정 중 오류가 발생했습니다.");
    }

    // 모달 닫기
    setIsModalOpen(false);
  };

  const handleClose = () => {
    // 닫기 버튼 클릭 시 모달 닫기
    setIsModalOpen(false);
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitleSmall>점수를 입력해주세요</ModalTitleSmall>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={cellValue}
          style={{
            width: "100%",
            padding: "8px",
            margin: "16px 0",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
        <ModalButton onClick={handleSubmit}>수정된 점수 제출하기</ModalButton>
        <ModalCancleButton onClick={handleClose}>닫기</ModalCancleButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
