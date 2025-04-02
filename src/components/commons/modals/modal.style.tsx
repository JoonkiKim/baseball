import styled from "@emotion/styled";

// 모달 관련 스타일
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 어두운 반투명 배경 */
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  width: 80%;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 30px;
  margin-top: 20px;
  font-size: 24px;

  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
`;

export const ModalTitleSmall = styled.h2`
  margin-bottom: 30px;
  margin-top: 20px;
  font-size: 18px;

  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
`;

export const ModalButton = styled.button`
  display: block;
  width: 80%;
  height: 48px;
  margin-bottom: 30px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.75);
  border: none;
  color: #fff;
  font-size: 14px;
  border-radius: 100px;
  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
  cursor: pointer;
`;

export const ModalCancleButton = styled.button`
  display: block;
  width: 80%;
  margin-bottom: 10px;
  padding: 12px;
  background-color: #f5f5f5;
  border: none;
  color: #000000;
  font-size: 14px;
  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
  border-radius: 100px;
  cursor: pointer;

  &:hover {
    background-color: #bdbdbd;
  }
`;
