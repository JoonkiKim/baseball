import styled from "@emotion/styled";

// 미디어 쿼리 예시
const small = "@media only screen and (max-width: 480px)";
const medium =
  "@media only screen and (min-width: 481px) and (max-width: 768px)";
const large =
  "@media only screen and (min-width: 769px) and (max-width: 1024px)";
const xlarge = "@media only screen and (min-width: 1025px)";

export const Container = styled.div`
  width: 90%;
  max-width: 480px; /* 예시로 480px 제한 */
  margin: 0 auto;
  margin-top: 200px; /* 요구사항: 140px */
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Inter-Regular", sans-serif;
`;

export const Title = styled.h1`
  font-size: 20px;
  margin-bottom: 16px;
  text-align: center;

  ${small} {
    font-size: 18px;
  }
  ${medium} {
    font-size: 19px;
  }
  ${large}, ${xlarge} {
    font-size: 20px;
  }
`;

export const Description = styled.p`
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
  margin-top: 24px;

  ${small} {
    font-size: 13px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
`;

export const Label = styled.label`
  align-self: flex-start;
  margin-left: 10px;
  font-size: 14px;
  margin-bottom: 8px;
  margin-top: 30px;

  ${small} {
    font-size: 13px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
`;

export const Input = styled.input`
  width: 95%;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 8px 4px;
  font-size: 14px;
  margin-bottom: 20px;
  font-family: "Inter-Regular", sans-serif;

  &:focus {
    outline: none;
    border-bottom: 1px solid #000;
  }

  ${small} {
    font-size: 13px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
`;

export const SubmitButton = styled.button`
  margin-top: 100px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  font-family: "Inter-Regular", sans-serif;

  &:hover {
    background-color: #f7f7f7;
  }

  ${small} {
    font-size: 13px;
    padding: 10px 20px;
  }
  ${medium} {
    font-size: 14px;
  }
  ${large}, ${xlarge} {
    font-size: 15px;
  }
`;
