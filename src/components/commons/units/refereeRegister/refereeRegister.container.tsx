import React from "react";
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
  SignUpButton,
  ErrorMessage,
} from "./refereeRegister.style";

// 폼에서 다룰 데이터 타입 정의 (숫자 타입으로 변경)
interface RefereeFormData {
  email: string;
  verificationCode: number;
  adminCode: number;
}

// yup을 사용한 유효성 검증 스키마 정의
const schema = yup.object().shape({
  email: yup
    .string()
    .email("유효한 이메일 형식이 아닙니다.")
    .test("domain", "이메일은 '@snu.ac.kr'을 포함해야 합니다.", (value) =>
      value ? value.includes("@snu.ac.kr") : false
    )
    .required("이메일은 필수 입력 항목입니다."),
  verificationCode: yup
    .number()
    .typeError("인증번호는 6자리 숫자여야 합니다.")
    .min(100000, "인증번호는 6자리 숫자여야 합니다.")
    .max(999999, "인증번호는 6자리 숫자여야 합니다.")
    .required("인증번호는 필수 입력 항목입니다."),
  adminCode: yup
    .number()
    .typeError("인증코드는 6자리 숫자여야 합니다.")
    .min(100000, "인증코드는 6자리 숫자여야 합니다.")
    .max(999999, "인증코드는 6자리 숫자여야 합니다.")
    .required("인증코드는 필수 입력 항목입니다."),
});

export default function RefereeRegisterPage() {
  // react-hook-form 훅 사용, yup resolver 연결
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<RefereeFormData> = (data) => {
    // 실제 등록 로직 대신 콘솔 로그 또는 alert로 예시
    alert(`
      심판 등록 시도:
      이메일: ${data.email}
      발송된 인증번호: ${data.verificationCode}
      운영진 인증코드: ${data.adminCode}
    `);
  };

  return (
    <Container>
      <Title>심판 등록</Title>

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

        {/* 발송된 인증번호 입력 */}
        <FieldWrapper>
          <Label htmlFor="verificationCode">발송된 인증번호를 입력하세요</Label>
          <Input
            id="verificationCode"
            type="number"
            placeholder="6자리 숫자"
            {...register("verificationCode")}
          />
          {errors.verificationCode ? (
            <ErrorMessage>{errors.verificationCode.message}</ErrorMessage>
          ) : (
            <ErrorMessage />
          )}
        </FieldWrapper>

        {/* 운영진에게 전달받은 인증코드 입력 */}
        <FieldWrapper>
          <Label htmlFor="adminCode">
            운영진에게 전달받은 인증코드를 입력하세요
          </Label>
          <Input
            id="adminCode"
            type="number"
            placeholder="6자리 숫자"
            {...register("adminCode")}
          />
          {errors.adminCode ? (
            <ErrorMessage>{errors.adminCode.message}</ErrorMessage>
          ) : (
            <ErrorMessage />
          )}
        </FieldWrapper>

        {/* 등록 버튼 */}
        <SignUpButton type="submit">심판 등록하기</SignUpButton>
      </Form>
    </Container>
  );
}
