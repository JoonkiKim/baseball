import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      {/* <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        <link rel="preload" as="image" href="/images/ground-without-home.png" />
        <link rel="preload" as="image" href="/images/home.png" />
        <link rel="preload" as="image" href="/images/line.png" />
        <link
          rel="preload"
          as="image"
          href="/images/home-base-white-1.png"
          crossOrigin="anonymous"
        />
        <link rel="preload" as="image" href="/images/diamond.png" />
        <link rel="preload" as="image" href="/images/reset.png" />
      </Head> */}
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        <link
          rel="prefetch"
          as="image"
          href="/images/ground-without-home.png"
        />
        <link rel="prefetch" as="image" href="/images/home.png" />
        <link rel="prefetch" as="image" href="/images/line.png" />
        <link
          rel="prefetch"
          as="image"
          href="/images/home-base-white-1.png"
          crossOrigin="anonymous"
        />
        <link rel="prefetch" as="image" href="/images/diamond.png" />
        <link rel="prefetch" as="image" href="/images/reset.png" />

        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
