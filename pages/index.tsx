import Head from "next/head";
import EndPage from "../src/components/commons/units/endPage/endPage.container";

export default function Home() {
  console.log("대회종료!! 후 버전관리테스트 한번 더");
  return (
    <>
      <div>
        {/* <MainCalendarPage /> */}

        <EndPage />
      </div>
    </>
  );
}
