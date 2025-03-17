import React from "react";

import { useRouter } from "next/router";
import LayoutHeader from "./header";
import LayoutNavigation from "./navigation";

// **특정 주소에서는 헤더를 안보여주고 싶다면, 변수에 해당 주소를 담아서 그 주소랑 일치하면 헤더를 안보여주게 할 수 있음
const HIDDEN_HEADERS = [""];

interface ILayoutProps {
  children: JSX.Element;
}

export default function Layout(props: ILayoutProps): JSX.Element {
  const router = useRouter();
  // 아래의 asPath를 찍어보면 지금 주소가 어디인지 확인할 수 있다
  console.log(router.asPath);

  const isHiddenHeader = HIDDEN_HEADERS.includes(router.asPath);
  //

  return (
    <div>
      {!isHiddenHeader && <LayoutHeader />}
      <div>{props.children}</div>
      <LayoutNavigation />
    </div>
  );
}
// _app.tsx에서 <Component/>가 {props.children}으로 쏙들어오고 LayOut컴포넌트 전체를 땡겨온다(_app.tsx쪽으로)
