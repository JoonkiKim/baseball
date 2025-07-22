import { Global, css } from "@emotion/react";
import styled from "@emotion/styled";
import Link from "next/link";
import { useEffect } from "react";
import { getAccessToken } from "../../../../commons/libraries/token";
import { useRouter } from "next/router";

// Global 스타일로 @font-face 정의 및 적용 클래스 생성
const navGlobalStyles = css`
  @font-face {
    font-family: "KBO Dia Gothic Light";
    src: url("/fonts/KBO-Dia-Gothic_light.woff") format("woff");
    font-weight: 300;
    font-style: normal;
  }
  .kbo-font {
    font-family: "KBO Dia Gothic Light", sans-serif !important;
  }
`;

// ─── 하단 네비게이션 ─────────────────────────────
export const BottomNavWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 0;
  z-index: 1000;

  @media only screen and (max-width: 480px) {
    /* Small: 480px 이하 */
  }
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    /* Medium: 481px ~ 768px */
  }
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    /* Large: 769px ~ 1024px */
  }
  @media only screen and (min-width: 1025px) {
    /* Extra Large: 1025px 이상 */
  }
`;

export const BottomNav = styled.div`
  background: #f2f2f7;
  display: flex;
  color: #000;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: 10vh;
  width: 33%;
  border: none;
`;

export const NavIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export const NavItem = styled.div`
  margin-top: 10px;
  font-weight: 300;
  color: #000;
  text-align: center;
  font-size: 16px;

  @media only screen and (max-width: 480px) {
    font-size: 14px;
  }
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 15px;
  }
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    font-size: 16px;
  }
  @media only screen and (min-width: 1025px) {
    font-size: 16px;
  }
`;

export default function LayoutNavigation() {
  const router = useRouter();
  useEffect(() => {
    const token = getAccessToken();
    console.log("현재 inMemoryAccessToken:", token);
  }, []);
  // 설정 버튼 클릭 핸들러
  const handleSettingsClick = () => {
    const token = getAccessToken();
    console.log("token", token);
    if (token) {
      router.push("/mypage");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <Global styles={navGlobalStyles} />
      {/* 최상위 요소에 kbo-font 클래스를 적용하여 이 컴포넌트 내 폰트를 지정 */}
      <div className="kbo-font">
        <BottomNavWrapper>
          <Link href="/mainCalendar" passHref>
            <BottomNav as="a">
              <NavIcon src="/images/calendar-new.png" />
              <NavItem>경기일정</NavItem>
            </BottomNav>
          </Link>
          <Link href="/ranking" passHref>
            <BottomNav as="a">
              <NavIcon src="/images/trophy.png" />
              <NavItem>팀순위</NavItem>
            </BottomNav>
          </Link>
          <Link href="/playerStats" passHref>
            <BottomNav as="a">
              <NavIcon src="/images/stat.png" />
              <NavItem>선수기록</NavItem>
            </BottomNav>
          </Link>
          <Link href="/login" passHref>
            <BottomNav as="button" onClick={handleSettingsClick}>
              <NavIcon src="/images/profile.png" />
              <NavItem>설정</NavItem>
            </BottomNav>
          </Link>
        </BottomNavWrapper>
      </div>
    </>
  );
}
