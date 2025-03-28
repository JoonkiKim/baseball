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
  width: 300px;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 50px;
  margin-top: 30px;
  font-size: 30px;

  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
`;

export const ModalTitleSmall = styled.h2`
  margin-bottom: 50px;
  margin-top: 30px;
  font-size: 24px;

  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
`;

export const ModalButton = styled.button`
  display: block;
  width: 100%;
  height: 48px;
  margin-bottom: 30px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.75);
  border: none;
  color: #fff;
  font-size: 16px;
  border-radius: 100px;
  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
  cursor: pointer;
`;

export const ModalCancleButton = styled.button`
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 12px;
  background-color: #f5f5f5;
  border: none;
  color: #000000;
  font-size: 16px;
  font-family: "KBO-Dia-Gothic_medium";
  font-weight: 300;
  border-radius: 100px;
  cursor: pointer;

  &:hover {
    background-color: #bdbdbd;
  }
`;
