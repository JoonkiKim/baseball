import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  ErrorMessage,
  FieldWrapper,
  Input,
  Label,
  LoginButton,
  SubLabel,
  Title,
} from "./findPw.style";

// 폼에서 다룰 데이터 타입 정의
interface LoginFormData {
  email: string;
}

// yup을 사용한 유효성 검증 스키마 정의
const schema = yup.object().shape({
  email: yup
    .string()
    .email("유효한 이메일 형식이 아닙니다.")
    .required("이메일을 입력하세요"),
});

export default function FindPwPageComponent() {
  // react-hook-form 훅 사용, yup resolver 연결
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 비밀번호 표시/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 표시/숨기기 토글
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // 폼 제출 핸들러
  const onSubmit = (data: LoginFormData) => {
    alert(`비밀번호 재설정: \n이메일: ${data.email}\n`);
  };

  return (
    <Container>
      <Title>비밀번호 재설정</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 이메일 주소 입력 */}
        <FieldWrapper>
          <Label htmlFor="email">이메일을 입력하세요(@snu.ac.kr)</Label>
          <SubLabel>입력된 이메일로 비밀번호 재설정 링크가 전송됩니다</SubLabel>
          <Input
            id="email"
            type="email"
            placeholder="@snu.ac.kr"
            {...register("email")}
          />
          {errors.email ? (
            <ErrorMessage>{errors.email.message}</ErrorMessage>
          ) : (
            <ErrorMessage></ErrorMessage>
          )}
        </FieldWrapper>

        <LoginButton type="submit">링크 전송하기</LoginButton>
      </form>
    </Container>
  );
}
