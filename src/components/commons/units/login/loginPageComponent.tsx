import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  FieldWrapper,
  Input,
  Label,
  LinkGroup,
  LoginButton,
  MoveToFindPw,
  MoveToSignUp,
  PasswordToggle,
  PasswordWrapper,
  Title,
  VerticalSeparator,
} from "./loginPage.style";

// 폼에서 다룰 데이터 타입 정의
interface LoginFormData {
  email: string;
  password: string;
}

// yup을 사용한 유효성 검증 스키마 정의
const schema = yup.object().shape({
  email: yup
    .string()
    .email("유효한 이메일 형식이 아닙니다.")
    .required("이메일은 필수 입력 항목입니다."),
  password: yup
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(20, "비밀번호는 최대 20자까지 입력 가능합니다.")
    .required("비밀번호는 필수 입력 항목입니다."),
});

export default function LoginPageComponent() {
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
    alert(`로그인 시도: \n이메일: ${data.email}\n비밀번호: ${data.password}`);
  };

  return (
    <Container>
      <Title>SNU BASEBALL</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 이메일 주소 입력 */}
        <FieldWrapper>
          <Label htmlFor="email">이메일 주소</Label>
          <Input
            id="email"
            type="email"
            placeholder="@snu.ac.kr"
            {...register("email")}
          />
          {errors.email && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.email.message}
            </p>
          )}
        </FieldWrapper>

        <FieldWrapper>
          {/* 비밀번호 입력 */}
          <Label htmlFor="password">비밀번호</Label>
          <PasswordWrapper>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="영문, 숫자가 포함된 8~20자 입력"
              {...register("password")}
            />
            <PasswordToggle onClick={handleTogglePassword}>
              {showPassword ? "숨김" : "표시"}
            </PasswordToggle>
          </PasswordWrapper>
          {errors.password && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.password.message}
            </p>
          )}
        </FieldWrapper>

        <LoginButton type="submit">로그인</LoginButton>
      </form>

      {/* 하단 링크: 회원가입 / 비밀번호 찾기 */}
      <LinkGroup>
        <MoveToSignUp>회원가입</MoveToSignUp>
        <VerticalSeparator />
        <MoveToFindPw>비밀번호 찾기</MoveToFindPw>
      </LinkGroup>
    </Container>
  );
}
