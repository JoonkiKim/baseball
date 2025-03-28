import React from "react";

import { useRouter } from "next/router";
import LayoutHeader from "./header";
import LayoutNavigation from "./navigation";

// 여기서만 보여주게 하자
const SHOW_NAV = [
  "/playerStats",
  "/ranking",
  "/",
  "/playerStats/playerStatsBatterDetail",
  "/playerStats/playerStatsPitcherDetail",
];

interface ILayoutProps {
  children: JSX.Element;
}

export default function Layout(props: ILayoutProps): JSX.Element {
  const router = useRouter();

  console.log(router.asPath);

  const isShowNav = SHOW_NAV.includes(router.asPath);
  //

  return (
    <div>
      <LayoutHeader />
      <div style={{ backgroundColor: "white" }}>{props.children}</div>
      {isShowNav && <LayoutNavigation />}
    </div>
  );
}
// _app.tsx에서 <Component/>가 {props.children}으로 쏙들어오고 LayOut컴포넌트 전체를 땡겨온다(_app.tsx쪽으로)
