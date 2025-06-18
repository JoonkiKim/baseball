import React from "react";

import { useRouter } from "next/router";
import LayoutHeader from "./header";
import LayoutNavigation from "./navigation";
import LayoutHeaderNone from "./headerNone";

// 여기서만 보여주게 하자
const SHOW_NAV = [
  "/playerStats",
  "/ranking",
  // "/",
  "/mainCalendar",
  "/playerStats/playerStatsBatterDetail",
  "/playerStats/playerStatsPitcherDetail",
  "/refreeRegistration",
];

const HIDE_HEADER = ["/"];

interface ILayoutProps {
  children: JSX.Element;
}

export default function Layout(props: ILayoutProps): JSX.Element {
  const router = useRouter();

  console.log(router.asPath);

  const isShowNav = SHOW_NAV.includes(router.asPath);
  const isHideHead = HIDE_HEADER.includes(router.asPath);

  return (
    <>
      {!isHideHead && <LayoutHeader />}
      <div style={{ backgroundColor: "white" }}>{props.children}</div>
      {isShowNav && <LayoutNavigation />}
    </>
  );
}
// _app.tsx에서 <Component/>가 {props.children}으로 쏙들어오고 LayOut컴포넌트 전체를 땡겨온다(_app.tsx쪽으로)
