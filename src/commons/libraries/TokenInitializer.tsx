import { useEffect } from "react";
import { useRouter } from "next/router";
import API from "../apis/api";
import { useSetRecoilState } from "recoil";
import { accessTokenState } from "../stores";
import {
  registerAccessTokenSetter,
  setAccessToken,
  clearAccessToken,
} from "../libraries/token";

export default function TokenInitializer() {
  const setToken = useSetRecoilState(accessTokenState);
  const router = useRouter();

  // ① RecoilRoot 안에서만 registerAccessTokenSetter를 호출
  // useEffect(() => {
  //   registerAccessTokenSetter(setToken);
  //   return () => {
  //     // 언마운트 시 클리어(선택)
  //     clearAccessToken();
  //   };
  // }, [setToken]);

  // ② 앱 초기 로드 시 refresh 토큰 요청
  // useEffect(() => {
  //   API.post("/auth/refresh")
  //     .then((res) => {
  //       setAccessToken(res.data.accessToken);
  //     })
  //     .catch(() => {
  //       // 리프레시 실패하면 로그인 페이지로
  //       router.push("/login");
  //     });
  // }, []);

  return null;
}
