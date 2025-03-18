import React, { useState } from "react";
import {
  Container,
  Title,
  Description,
  Label,
  Input,
  SubmitButton,
} from "./refereeRegister.style";

export default function RefereeRegisterPageComponent() {
  // 인증코드 입력 상태
  const [authCode, setAuthCode] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthCode(e.target.value);
  };

  const handleSubmit = () => {
    // 실제 등록 로직은 프로젝트 요구사항에 맞게 구현
    if (authCode.trim() === "") {
      alert("인증코드를 입력해주세요.");
      return;
    }
    alert(`심판 등록: ${authCode}`);
  };

  return (
    <Container>
      <Title>심판 등록</Title>
      <Description>운영진에게 전달받은 인증코드를 입력하세요</Description>

      <Label htmlFor="authCode">인증코드</Label>
      <Input
        id="authCode"
        type="text"
        value={authCode}
        onChange={handleChange}
      />

      <SubmitButton onClick={handleSubmit}>심판 등록하기</SubmitButton>
    </Container>
  );
}
