import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  ErrorMessage,
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
  ToggleImage,
  VerticalSeparator,
} from "./loginPage.style";
import Link from "next/link";
import API from "../../../../commons/apis/api";
import { setAccessToken } from "../../../../commons/libraries/token";
import { useRouter } from "next/router";

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
  const router = useRouter();
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

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      console.log(data);
      // 1) 로그인 요청
      const response = await API.post(
        "/auth/login", // 실제 로그인 엔드포인트로 변경
        {
          email: data.email,
          password: data.password,
        }
      );

      // 2) 응답에서 accessToken 꺼내기
      const { accessToken } = response.data;
      console.log(accessToken);

      // 3) 메모리·Recoil에 동기화
      setAccessToken(accessToken);

      // 4) 로그인 성공 후 리다이렉트 등 처리
      router.push("/mainCalendar");
    } catch (error: any) {
      // 에러 핸들링
      alert(
        error.response?.data?.message ||
          "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
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
          {errors.email ? (
            <ErrorMessage>{errors.email.message}</ErrorMessage>
          ) : (
            <ErrorMessage></ErrorMessage>
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
            <ErrorMessage></ErrorMessage>
          )}
        </FieldWrapper>

        <LoginButton type="submit">로그인</LoginButton>
      </form>

      {/* 하단 링크: 회원가입 / 비밀번호 찾기 */}
      <LinkGroup>
        <Link href="/signUp" passHref>
          <MoveToSignUp>회원가입</MoveToSignUp>
        </Link>
        <VerticalSeparator />
        <Link href="/login/findPassword" passHref>
          <MoveToFindPw>비밀번호 재설정</MoveToFindPw>
        </Link>
      </LinkGroup>
    </Container>
  );
}
