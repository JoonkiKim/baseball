import { useEffect, useState } from "react";
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
  WrapperForEmail,
  EmailInput,
  EmailButton,
} from "./sigunUp.style";
import API from "../../../../commons/apis/api";
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";

import { setAccessToken } from "../../../../commons/libraries/token";
import { useRouter } from "next/router";

// 폼에서 다룰 데이터 타입 정의
interface SignUpFormData {
  email: string;
  verificationCode: number;
  password: string;
  confirmPassword: string;
  nickname?: string;
}

// yup을 사용한 유효성 검증 스키마 정의
const schema = yup.object().shape({
  email: yup
    .string()
    .email("유효한 이메일 형식이 아닙니다.")
    .required("이메일은 필수 입력 항목입니다."),
  verificationCode: yup.number(),
  password: yup
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(20, "비밀번호는 최대 20자까지 입력 가능합니다.")
    .required("비밀번호는 필수 입력 항목입니다."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
    .required("비밀번호 확인은 필수 입력 항목입니다."),
  nickname: yup
    .string()
    .notRequired() // 필수가 아님
    .test("len", "닉네임은 2자 이상 10자 이내로 입력해야 합니다.", (value) => {
      // 빈값(undefinded, null, '')이면 통과
      if (!value) return true;
      // 값이 있을 때만 2~10자 검사
      return value.length >= 2 && value.length <= 10;
    }),
});

export default function SignUpPage() {
  // react-hook-form 훅 사용, yup resolver 연결
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const [error, setError] = useState(null);
  // react-hook-form 훅 사용, yup resolver 연결
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  // ① 추가: 인증번호 발송 여부를 저장하는 state
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  // useEffect(() => {
  //   const original = window.alert;
  //   window.alert = (msg: string) => {
  //     // ErrorAlert 가 기대하는 형태로 error 객체를 만들어 넣습니다
  //     setError({ response: { data: { errorCode: msg } } });
  //   };

  //   return () => {
  //     window.alert = original;
  //   };
  // }, []);

  // ① 인증번호 발송 버튼 클릭 시 실행되는 함수
  const handleSendVerification = async () => {
    if (isSubmitting) return;
    const email = getValues("email").trim();

    // 1) 빈값 체크
    if (!email) {
      alert("이메일을 입력해주세요");

      return;
    }
    // 2) '@' 포함 여부 체크
    if (!email.includes("@")) {
      alert("유효한 이메일 형식이 아닙니다");
      return;
    }

    setIsSubmitting(true);
    try {
      // POST /auth/email/request
      await API.post("/auth/email/request", { email });
      console.log({ email });
      alert("인증번호가 발송되었습니다. \n이메일 수신함을 확인해주세요!");
      // ② 추가: 발송 성공 후 상태 업데이트
      setIsVerificationSent(true);
    } catch (error) {
      setError(error);
      const errorCode = error?.response?.data?.errorCode; // 에러코드 추출
      console.error(error, "errorCode:", errorCode);
      console.error("이메일 인증번호 발송 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (isSubmitting) return;

    // 1) 코드 값 가져와서 trim
    const rawCode = getValues("verificationCode")?.toString().trim() ?? "";
    // 2) 숫자 6자리인지 검사
    if (!/^[0-9]{6}$/.test(rawCode)) {
      alert("인증번호는 6자리 숫자여야 합니다.");
      return;
    }
    // 3) 숫자로 변환 (필요하면)
    const code = Number(rawCode);
    const email = getValues("email").trim();

    setIsSubmitting(true);
    try {
      // POST /auth/email/verify
      const res = await API.post("/auth/email/verify", { email, code });
      console.log({ email, code });
      // 응답에서 verificationToken을 꺼내 상태로 저장
      const { verificationToken: token } = res.data;
      setVerificationToken(token);
      // console.log("verificationToken:", token);
      alert("인증이 완료되었습니다!");
    } catch (error) {
      setError(error);
      const errorCode = error?.response?.data?.errorCode; // 에러코드 추출
      console.error(error, "errorCode:", errorCode);
      console.error("이메일 인증번호 발송 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(verificationToken);
  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1) 요청 페이로드 조립
      const payload = {
        email: data.email.trim(),
        password: data.password,
        verificationToken, // state 에 저장된 토큰
        nickname: data.nickname || "", // 닉네임이 없으면 빈 문자열
      };
      // 2) 회원가입 API 호출
      const res = await API.post("/auth/signup", payload);
      console.log(payload);
      console.log("signup response:", res.data);
      alert("회원가입이 완료되었습니다!");
      // ── 여기에 토큰 동기화 추가 ──
      const { accessToken } = res.data;
      setAccessToken(accessToken);
      console.log("동기화된 accessToken:", accessToken);
      router.push("/mainCalendar");
    } catch (error) {
      setError(error);
      const errorCode = error?.response?.data?.errorCode;
      console.error("회원가입 오류:", error, "errorCode:", errorCode);
      // ErrorAlert(errorCode); // 혹은 alert(errorCode)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container>
        <Title>회원가입</Title>

        {/* 회원가입 폼 */}
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* 이메일 입력 */}
          <FieldWrapper>
            <Label htmlFor="email">이메일 주소</Label>
            <WrapperForEmail $disabled={!!verificationToken}>
              <EmailInput
                id="email"
                type="email"
                placeholder="@snu.ac.kr"
                {...register("email")}
                $noBottom
                disabled={!!verificationToken}
              />
              <EmailButton
                type="button"
                onClick={handleSendVerification}
                // 토큰까지 받았다면 완전히 막아버리기
                disabled={isSubmitting || !!verificationToken}
                $completed={!!verificationToken}
              >
                {verificationToken
                  ? "인증완료"
                  : isVerificationSent
                  ? "재발송"
                  : "인증번호 발송"}
              </EmailButton>
            </WrapperForEmail>
            <ErrorMessage>
              {errors.email
                ? errors.email.message
                : verificationToken
                ? "" // 토큰이 있으면 빈 문자열
                : "학교 계정이 없을 시 선수 명단 제출 시 사용한 이메일을 입력하세요"}
            </ErrorMessage>
          </FieldWrapper>

          {/* 인증번호 입력 */}
          <FieldWrapper>
            <Label htmlFor="verificationCode">
              발송된 인증번호를 입력하세요
            </Label>
            <WrapperForEmail $disabled={!!verificationToken}>
              <Input
                id="verificationCode"
                type="text"
                placeholder="6자리 숫자"
                {...register("verificationCode", { valueAsNumber: true })}
                disabled={!isVerificationSent || !!verificationToken}
                $completed={!!verificationToken}
              />
              {isVerificationSent && (
                <EmailButton
                  type="button"
                  onClick={handleSendVerificationCode}
                  // 토큰이 생겼으면 인증완료로 바꾸고 비활성
                  disabled={isSubmitting || !!verificationToken}
                  $completed={!!verificationToken}
                >
                  {verificationToken ? "인증완료" : "인증하기"}
                </EmailButton>
              )}
            </WrapperForEmail>

            {errors.verificationCode ? (
              <ErrorMessage>{`이메일 인증번호를 입력해주세요`}</ErrorMessage>
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
                type="password"
                placeholder="영문, 숫자가 포함된 8~20자 입력"
                {...register("password")}
              />
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
          {/* 닉네임 설정 입력 (맨 밑) */}
          <FieldWrapper>
            <Label htmlFor="nickname">닉네임 설정</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="입력하지 않을 시 자동 생성됩니다"
              {...register("nickname")}
            />
            {errors.nickname ? (
              <ErrorMessage>{errors.nickname.message}</ErrorMessage>
            ) : (
              <ErrorMessage />
            )}
          </FieldWrapper>

          {/* 회원가입 버튼 */}
          <SignUpButton type="submit">회원가입</SignUpButton>
        </Form>
        <LoadingOverlay visible={isSubmitting}>
          <LoadingIcon spin fontSize={48} />
        </LoadingOverlay>
      </Container>
    </>
  );
}
