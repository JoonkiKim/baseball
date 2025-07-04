import styled from "@emotion/styled";
import Link from "next/link";

// ─── 헤더 영역 (배경 + 날짜 영역 포함) ─────────────────────────────
export const Background = styled.div`
  width: 100%;
  background-color: #0f0f70;
  position: fixed;

  top: 0;
  left: 0;
  z-index: 1000;
  height: 120px; /* 고정 높이 */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); /* drop shadow 효과 */
`;

export const PageHeader = styled.div`
  /* margin-top: 20px; */
  text-align: center;
  /* background-color: red; */
  /* 
  padding-top: 30px; */

  /* 480px 이하 */
  @media only screen and (max-width: 480px) {
    /* padding-top: 30px; */
  }
  /* 481px ~ 768px */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    /* padding-top: 35px; */
  }
  /* 769px ~ 1024px */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    /* padding-top: 40px; */
  }
  /* 1025px 이상 */
  @media only screen and (min-width: 1025px) {
    /* padding-top: 45px; */
  }
`;

export const PageTitle = styled.h1`
  font-weight: 600;
  color: #ffffff;
  font-size: 35px;
  font-family: "KBO-Dia-Gothic_bold";

  /* 480px 이하 */
  @media only screen and (max-width: 480px) {
    font-size: 24px;
  }
  /* 481px ~ 768px */
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    font-size: 28px;
  }
  /* 769px ~ 1024px */
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    font-size: 32px;
  }
  /* 1025px 이상 */
  @media only screen and (min-width: 1025px) {
    font-size: 36px;
  }
`;

export default function LayoutHeaderPre() {
  return (
    <Background>
      <PageHeader>
        <Link href="/" passHref>
          <PageTitle as="a">2025 총장배 야구대회</PageTitle>
        </Link>
      </PageHeader>
    </Background>
  );
}
