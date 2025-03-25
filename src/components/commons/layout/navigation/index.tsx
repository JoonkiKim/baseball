import styled from "@emotion/styled";
import Link from "next/link";

// ─── 하단 네비게이션 ─────────────────────────────
export const BottomNavWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 0; /* 고정 시에는 margin-top 대신 위치를 직접 지정 */
  z-index: 1000; /* 다른 요소 위에 표시되도록 설정 */

  /* 추가 스타일이 필요하면 각 구간에 맞게 작성 가능 */
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
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-top: 1px solid #000;
  border-right: 1px solid #000;
  &:last-child {
    border-right: none;
  }

  /* 기본값 (Medium: 481px ~ 768px) */
  height: 10vh;
  width: 33.33%;
`;

export const NavIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export const NavItem = styled.div`
  /* background-color: red; */
  margin-top: 10px;

  font-weight: 500;
  color: #000;
  text-align: center;
  font-size: 16px; /* 기본값 (Medium) */

  /* Small: 480px 이하 */
  @media only screen and (max-width: 480px) {
    font-size: 14px;
  }
  /* Medium: 481px ~ 768px */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 15px;
  }
  /* Large: 769px ~ 1024px */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    font-size: 16px;
  }
  /* Extra Large: 1025px 이상 */
  @media only screen and (min-width: 1025px) {
    font-size: 16px;
  }
`;

export default function LayoutNavigation() {
  return (
    <>
      <BottomNavWrapper>
        <Link href="/" passHref>
          <BottomNav as="a">
            <NavIcon src="/images/calendar-linear.png"></NavIcon>
            <NavItem>경기일정</NavItem>
          </BottomNav>
        </Link>
        <Link href="/ranking" passHref>
          <BottomNav as="a">
            <NavIcon src="/images/trophy.png"></NavIcon>
            <NavItem>팀순위</NavItem>
          </BottomNav>
        </Link>
        <Link href="/playerStats" passHref>
          <BottomNav as="a">
            <NavIcon src="/images/stat.png"></NavIcon>
            <NavItem>선수기록</NavItem>
          </BottomNav>
        </Link>
        <Link href="/refreeRegistration" passHref>
          <BottomNav as="a">
            <NavIcon src="/images/ref.png"></NavIcon>
            <NavItem>심판등록</NavItem>
          </BottomNav>
        </Link>
      </BottomNavWrapper>
    </>
  );
}
