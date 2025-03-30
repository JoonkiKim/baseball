import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Title,
  Form,
  FieldWrapper,
  Label,
  Input,
  PasswordWrapper,
  PasswordToggle,
  ToggleImage,
  SignUpButton,
  ErrorMessage,
} from "./sigunUp.style";

// 폼에서 다룰 데이터 타입 정의
interface SignUpFormData {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
}

// yup을 사용한 유효성 검증 스키마 정의
const schema = yup.object().shape({
  email: yup
    .string()
    .email("유효한 이메일 형식이 아닙니다.")
    .required("이메일은 필수 입력 항목입니다."),
  verificationCode: yup
    .string()
    .matches(/^\d{6}$/, "인증번호는 6자리 숫자여야 합니다.")
    .required("인증번호는 필수 입력 항목입니다."),
  password: yup
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(20, "비밀번호는 최대 20자까지 입력 가능합니다.")
    .required("비밀번호는 필수 입력 항목입니다."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
    .required("비밀번호 확인은 필수 입력 항목입니다."),
});

export default function SignUpPage() {
  // react-hook-form 훅 사용, yup resolver 연결
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 비밀번호 표시/숨기기 상태 (패스워드 1개만 토글할 경우)
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 표시/숨기기 토글
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<SignUpFormData> = (data) => {
    // 실제 회원가입 로직 대신 콘솔 로그 또는 alert로 예시
    alert(`
      회원가입 시도:
      이메일: ${data.email}
      인증번호: ${data.verificationCode}
      비밀번호: ${data.password}
      비밀번호 확인: ${data.confirmPassword}
    `);
  };

  return (
    <Container>
      <Title>회원가입</Title>

      {/* 회원가입 폼 */}
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* 이메일 입력 */}
        <FieldWrapper>
          <Label htmlFor="email">이메일 주소</Label>
          <Input
            id="email"
            type="email"
            placeholder="@snu.ac.kr"
            {...register("email")}
          />
          {errors.email ? (
            <ErrorMessage>{errors.email.message}</ErrorMessage>
          ) : (
            <ErrorMessage />
          )}
        </FieldWrapper>

        {/* 인증번호 입력 */}
        <FieldWrapper>
          <Label htmlFor="verificationCode">발송된 인증번호를 입력하세요</Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="6자리 숫자"
            {...register("verificationCode")}
          />
          {errors.verificationCode ? (
            <ErrorMessage>{errors.verificationCode.message}</ErrorMessage>
          ) : (
            <ErrorMessage />
          )}
        </FieldWrapper>

        {/* 비밀번호 입력 */}
        <FieldWrapper>
          <Label htmlFor="password">비밀번호</Label>
          <PasswordWrapper>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="영문, 숫자가 포함된 8~20자 입력"
              {...register("password")}
            />
            <PasswordToggle onClick={handleTogglePassword}>
              {showPassword ? (
                <ToggleImage src="/images/view.png" alt="숨김" />
              ) : (
                <ToggleImage src="/images/hide.png" alt="표시" />
              )}
            </PasswordToggle>
          </PasswordWrapper>
          {errors.password ? (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          ) : (
            <ErrorMessage />
          )}
        </FieldWrapper>

        {/* 비밀번호 확인 입력 */}
        <FieldWrapper>
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호 확인"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
          ) : (
            <ErrorMessage />
          )}
        </FieldWrapper>

        {/* 회원가입 버튼 */}
        <SignUpButton type="submit">회원가입</SignUpButton>
      </Form>
    </Container>
  );
}
