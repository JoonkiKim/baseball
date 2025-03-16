import Head from "next/head";
import PWAInstallButton from "../src/components/PWAInstallButton";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <div>
        {" "}
        <h1>Welcome to Next.js PWA!</h1>
        <p>PWA를 설치해서 앱처럼 사용해보세요!</p>
        <PWAInstallButton />
      </div>
    </>
  );
}
