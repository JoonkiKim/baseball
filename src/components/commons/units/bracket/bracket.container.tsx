// components/Bracket.jsx
import React, { useEffect } from "react";
import styled from "@emotion/styled";
import API from "../../../../commons/apis/api";

// ─── 컨테이너 ───────────────────────────────────────
export const BracketContainer = styled.div`
  /* position: relative; */
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  margin-top: 120px;
  /* margin-bottom: 200px; */

  /* background-color: aqua; */
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const BrackGroundContainer = styled.div`
  /* margin-top: 8vh; */
  /* position: absolute; */
  width: 90%;
  height: 77%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background-color: rgba(0, 0, 0, 0.05); */
  /* background-color: red; */
  border-radius: 15px;
  /* margin-bottom: 200px; */
  /* padding-bottom: 100px; */
`;
export const LargeTitle = styled.h1`
  text-align: center;
  font-family: "KBO-Dia-Gothic_bold";
  font-size: 23px;
  align-self: center;
  margin-bottom: 3.5vh;
  width: 340px;
  margin-top: 3.5vh;

  /* background-color: red; */
  /* height: 30px; */
`;

export const QFTeamName = styled.div`
  width: 100%;
  height: 100%;
  /* background-color: red; */
`;

// // ─── 마커 크기 한 번에 설정 ───────────────────────────
// const MARKER_WIDTH = 1rem;
// const MARKER_HEIGHT = 6;

// ─── foreignObject 크기 (SVG user units) ───────────────────
const FO_WIDTH = 63;
const FO_HEIGHT = 40;
const HALF_FO_W = FO_WIDTH / 2;
const HALF_FO_H = FO_HEIGHT / 2;

// ─── 마커 박스 CSS 크기 (rem 단위) ────────────────────────
// const CSS_MARKER_W = "10rem";
// const CSS_MARKER_H = "5rem";

const TeamNameBox = styled.div`
  width: 100%;
  height: 50%;
  /* background-color: #f5f5f5; */

  background-color: transparent;
  display: flex;
  font-size: 0.65rem;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* text-align: left; */
  color: black;
  border: 1px solid black;
  border-radius: 25px;
`;
const ScroeBox = styled.div`
  width: 100%;
  height: 50%;
  /* background-color: #f5f5f5; */
  background-color: transparent;
  /* border: 1px solid black; */
  padding-bottom: 5px;
  display: flex;
  color: black;
  font-size: 0.7rem;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* text-align: center; */
`;

const ScroeBoxF = styled.div`
  width: 100%;
  height: 50%;
  /* background-color: #f5f5f5; */
  background-color: transparent;
  /* border: 1px solid black; */
  padding-right: 5px;
  display: flex;
  color: black;
  font-size: 0.7rem;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* text-align: center; */
`;

const ScroeBoxNonePadding = styled.div`
  width: 100%;
  height: 50%;
  /* background-color: #f5f5f5; */
  background-color: transparent;
  /* border: 1px solid black; */
  padding-top: 5px;
  display: flex;
  color: black;
  font-size: 0.7rem;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* text-align: center; */
`;

// ─── 결승 중앙 정사각형용 ───────────────────────────
const CENTER_WIDTH = 170; // 한 변(픽셀) - 필요하면 조절하세요

const CENTER_HEIGHT = 70; // 한 변(픽셀) - 필요하면 조절하세요

const CenterSquare = styled.div`
  width: 100%;
  height: 100%;
  background-color: transparent;
  /* border: 3px solid black; */
  /* stroke: ; */
`;
// ─── 끝점 표시용 컴포넌트 ───────────────────────────
// ─── EndMarker 중앙 검정 직사각형 크기 ──────────────────────────
const RECT_WIDTH = 30;
const RECT_HEIGHT = 30;

/* 1) EndMarker – 이름이 없으면 바로 null 반환 */
function EndMarker({
  x,
  y,
  label,
  score,
  isWinner = false,
}: {
  x: number | string;
  y: number | string;
  label?: React.ReactNode;
  score?: React.ReactNode;
  isWinner?: boolean;
}) {
  if (label === "" || label === null || label === undefined) return null;

  const xNum = typeof x === "string" ? parseFloat(x) : x;
  const yNum = typeof y === "string" ? parseFloat(y) : y;

  return (
    <foreignObject
      x={xNum - HALF_FO_W}
      y={yNum - HALF_FO_H}
      width={FO_WIDTH}
      height={FO_HEIGHT}
    >
      <TeamNameBox>
        <div>{label}</div>
      </TeamNameBox>
      <ScroeBox>
        <div style={{ color: isWinner ? "red" : "black" }}>{score}</div>
      </ScroeBox>
    </foreignObject>
  );
}

/* EndMarkerTP도 동일하게 첫 줄만 추가 */
function EndMarkerTP({
  x,
  y,
  label,
  score,
  isWinner = false,
}: {
  x: number | string;
  y: number | string;
  label?: React.ReactNode;
  score?: React.ReactNode;
  isWinner?: boolean;
}) {
  if (label === "" || label === null || label === undefined) return null;

  const xNum = typeof x === "string" ? parseFloat(x) : x;
  const yNum = typeof y === "string" ? parseFloat(y) : y;

  return (
    <foreignObject
      x={xNum - HALF_FO_W}
      y={yNum - HALF_FO_H}
      width={FO_WIDTH}
      height={FO_HEIGHT}
    >
      <ScroeBoxNonePadding>
        <div style={{ color: isWinner ? "red" : "black" }}>{score}</div>
      </ScroeBoxNonePadding>
      <TeamNameBox>
        <div>{label}</div>
      </TeamNameBox>
    </foreignObject>
  );
}

const RowWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

function EndMarkerF({
  x,
  y,
  label,
  score,
  isWinner = false,
}: {
  x: number | string;
  y: number | string;
  label?: React.ReactNode;
  score?: React.ReactNode;
  isWinner?: boolean;
}) {
  if (label === "" || label === null || label === undefined) return null;

  const xNum = typeof x === "string" ? parseFloat(x) : x;
  const yNum = typeof y === "string" ? parseFloat(y) : y;

  return (
    <foreignObject
      x={xNum - HALF_FO_W}
      y={yNum - HALF_FO_H}
      width={FO_WIDTH}
      height={FO_HEIGHT}
    >
      <RowWrapper>
        <TeamNameBox>
          <div>{label}</div>
        </TeamNameBox>
        <ScroeBox>
          <div style={{ color: isWinner ? "red" : "black" }}>{score}</div>
        </ScroeBox>
      </RowWrapper>
    </foreignObject>
  );
}

/* EndMarkerTP도 동일하게 첫 줄만 추가 */
function EndMarkerTPF({
  x,
  y,
  label,
  score,
  isWinner = false,
}: {
  x: number | string;
  y: number | string;
  label?: React.ReactNode;
  score?: React.ReactNode;
  isWinner?: boolean;
}) {
  if (label === "" || label === null || label === undefined) return null;

  const xNum = typeof x === "string" ? parseFloat(x) : x;
  const yNum = typeof y === "string" ? parseFloat(y) : y;

  return (
    <foreignObject
      x={xNum - HALF_FO_W}
      y={yNum - HALF_FO_H}
      width={FO_WIDTH}
      height={FO_HEIGHT}
    >
      <RowWrapper>
        <ScroeBoxNonePadding>
          <div style={{ color: isWinner ? "red" : "black" }}>{score}</div>
        </ScroeBoxNonePadding>
        <TeamNameBox>
          <div>{label}</div>
        </TeamNameBox>
      </RowWrapper>
    </foreignObject>
  );
}

export default function Bracket() {
  const [games, setGames] = React.useState<any[]>([]);
  const lineColor = "black";

  useEffect(() => {
    API.get("/games/bracket-schedule")
      .then((res) => setGames(res.data.games))
      .catch(console.error);
  }, []);
  console.log(games);

  const findGame = (pos: string) =>
    games.find((g) => g.bracketPosition === pos) || {
      homeTeam: {},
      awayTeam: {},
    };

  // 컴포넌트 상단 어딘가에 헬퍼 함수를 하나 추가
  // 하나 있으면 그거 보여주는 함수
  // function makeMatchLabels(pos: string) {
  //   const g = findGame(pos);
  //   const away = g.awayTeam;
  //   const home = g.homeTeam;

  //   // 이름 유무를 개별 체크
  //   const awayName = away.name ?? "";
  //   const homeName = home.name ?? "";

  //   return {
  //     // 이름
  //     labelAway: awayName,
  //     labelHome: homeName,
  //     // 점수: 이름이 있을 때만 보여주고, score가 null이면 "-"로
  //     scoreAway:
  //       awayName !== "" ? (away.score != null ? String(away.score) : "-") : "",
  //     scoreHome:
  //       homeName !== "" ? (home.score != null ? String(home.score) : "-") : "",
  //   };
  // }

  // 하나라도 null이면 둘다 없애도록
  /* 2) makeMatchLabels – 이름이 둘 다 없으면 빈 문자열 반환(변경 없음) */
  function makeMatchLabels(pos: string) {
    const g = findGame(pos);
    const away = g.awayTeam;
    const home = g.homeTeam;
    const hasBothNames =
      away.name != null &&
      away.name !== "" &&
      home.name != null &&
      home.name !== "";

    return {
      labelAway: hasBothNames ? away.name! : "",
      labelHome: hasBothNames ? home.name! : "",
      scoreAway: hasBothNames
        ? away.score != null
          ? String(away.score)
          : "-"
        : "",
      scoreHome: hasBothNames
        ? home.score != null
          ? String(home.score)
          : "-"
        : "",
    };
  }
  // labels 정의부를 완전히 교체
  const {
    labelAway: topLeft1,
    scoreAway: topLeft1Score,
    labelHome: topLeft2,
    scoreHome: topLeft2Score,
  } = makeMatchLabels("QF_1");

  const {
    labelAway: topRight1,
    scoreAway: topRight1Score,
    labelHome: topRight2,
    scoreHome: topRight2Score,
  } = makeMatchLabels("QF_2");

  const {
    labelAway: midTopLeft,
    scoreAway: midTopLeftScore,
    labelHome: midTopRight,
    scoreHome: midTopRightScore,
  } = makeMatchLabels("SF_1");

  const {
    labelAway: midBotLeft,
    scoreAway: midBotLeftScore,
    labelHome: midBotRight,
    scoreHome: midBotRightScore,
  } = makeMatchLabels("SF_2");

  const {
    labelAway: botLeft1,
    scoreAway: botLeft1Score,
    labelHome: botLeft2,
    scoreHome: botLeft2Score,
  } = makeMatchLabels("QF_3");

  const {
    labelAway: botRight1,
    scoreAway: botRight1Score,
    labelHome: botRight2,
    scoreHome: botRight2Score,
  } = makeMatchLabels("QF_4");

  const {
    labelAway: finalLeft,
    scoreAway: finalLeftScore,
    labelHome: finalRight,
    scoreHome: finalRightScore,
  } = makeMatchLabels("F");

  const {
    labelAway: ThirdTop,
    scoreAway: ThirdTopScore,
    labelHome: ThirdBot,
    scoreHome: ThirdBotScore,
  } = makeMatchLabels("THIRD_PLACE");

  const labels = {
    topLeft1,
    topLeft1Score,
    topLeft2,
    topLeft2Score,

    topRight1,
    topRight1Score,
    topRight2,
    topRight2Score,

    midTopLeft,
    midTopLeftScore,
    midTopRight,
    midTopRightScore,

    midBotLeft,
    midBotLeftScore,
    midBotRight,
    midBotRightScore,

    botLeft1,
    botLeft1Score,
    botLeft2,
    botLeft2Score,

    botRight1,
    botRight1Score,
    botRight2,
    botRight2Score,

    finalLeft,
    finalLeftScore,
    finalRight,
    finalRightScore,

    ThirdTop,
    ThirdTopScore,
    ThirdBot,
    ThirdBotScore,
  };

  // const labels = {
  //   topLeft1: findGame("QF_1").awayTeam.name ?? "-",
  //   topLeft1Score: findGame("QF_1").awayTeam.score ?? "-",
  //   topLeft2: findGame("QF_1").homeTeam.name ?? "-",
  //   topLeft2Score: findGame("QF_1").homeTeam.score ?? "-",

  //   topRight1: findGame("QF_2").awayTeam.name ?? "-",
  //   topRight1Score: findGame("QF_2").awayTeam.score ?? "-",
  //   topRight2: findGame("QF_2").homeTeam.name ?? "-",
  //   topRight2Score: findGame("QF_2").homeTeam.score ?? "-",

  //   midTopLeft: findGame("SF_1").awayTeam.name ?? "-",
  //   midTopLeftScore: findGame("SF_1").awayTeam.score ?? "-",
  //   midTopRight: findGame("SF_1").homeTeam.name ?? "-",
  //   midTopRightScore: findGame("SF_1").homeTeam.score ?? "-",

  //   midBotLeft: findGame("SF_2").awayTeam.name ?? "-",
  //   midBotLeftScore: findGame("SF_2").awayTeam.score ?? "-",
  //   midBotRight: findGame("SF_2").homeTeam.name ?? "-",
  //   midBotRightScore: findGame("SF_2").homeTeam.score ?? "-",

  //   botLeft1: findGame("QF_3").awayTeam.name ?? "-",
  //   botLeft1Score: findGame("QF_3").awayTeam.score ?? "-",
  //   botLeft2: findGame("QF_3").homeTeam.name ?? "-",
  //   botLeft2Score: findGame("QF_3").homeTeam.score ?? "-",

  //   botRight1: findGame("QF_4").awayTeam.name ?? "-",
  //   botRight1Score: findGame("QF_4").awayTeam.score ?? "-",
  //   botRight2: findGame("QF_4").homeTeam.name ?? "-",
  //   botRight2Score: findGame("QF_4").homeTeam.score ?? "-",

  //   finalLeft: findGame("F").awayTeam.name ?? "-",
  //   finalLeftScore: findGame("F").awayTeam.score ?? "-",
  //   finalRight: findGame("F").homeTeam.name ?? "-",
  //   finalRightScore: findGame("F").homeTeam.score ?? "-",

  //   ThirdTop: findGame("THIRD_PLACE").awayTeam.name ?? "-",
  //   ThirdTopScore: findGame("THIRD_PLACE").awayTeam.score ?? "-",
  //   ThirdBot: findGame("THIRD_PLACE").homeTeam.name ?? "-",
  //   ThirdBotScore: findGame("THIRD_PLACE").homeTeam.score ?? "-",
  // };

  // 브래킷 포지션별 마커 중심 좌표
  const markerPositions: Record<
    string,
    { away: [number, number]; home: [number, number] }
  > = {
    QF_1: { away: [0, 0], home: [77, 0] },
    QF_2: { away: [156, 0], home: [234, 0] },
    SF_1: { away: [36, 99], home: [196, 99] },
    SF_2: { away: [36, 297], home: [195, 297] },
    QF_3: { away: [1, 396], home: [75, 396] },
    QF_4: { away: [158, 396], home: [232, 396] },
    // F: { away: [156.5, 198], home: [76.5, 198] },
    F: { away: [116.5, 213], home: [116.5, 184] }, // ← home 좌표만 수정
    THIRD_PLACE: { away: [240, 160], home: [240, 230] },
  };
  const pairedLines: Record<string, string> = {
    "1": "20",
    "3": "21",
    "4": "22",
    "6": "23",
    "7": "24",
    "9": "25",
    "10": "30",
    "12": "31",
    "13": "26",
    "15": "27",
    "16": "28",
    "18": "29",
  };

  // // 승리한 마커 좌표 문자열 리스트
  // const winnerCoords = games.reduce<string[]>((acc, g) => {
  //   const pos = markerPositions[g.bracketPosition];
  //   if (!pos || g.winnerTeamId == null) return acc;
  //   if (g.winnerTeamId === g.awayTeam.id)
  //     acc.push(${pos.away[0]},${pos.away[1]});
  //   if (g.winnerTeamId === g.homeTeam.id)
  //     acc.push(${pos.home[0]},${pos.home[1]});
  //   return acc;
  // }, []);

  // 1) 기존 winnerCoords: "234,0" 같은 문자열 리스트
  // 1) 승리 마커 좌표 리스트
  const winnerCoords = games.reduce<string[]>((acc, g) => {
    const pos = markerPositions[g.bracketPosition];
    if (!pos || g.winnerTeamId == null) return acc;
    if (g.winnerTeamId === g.awayTeam.id)
      acc.push(`${pos.away[0]},${pos.away[1]}`);
    if (g.winnerTeamId === g.homeTeam.id)
      acc.push(`${pos.home[0]},${pos.home[1]}`);
    return acc;
  }, []);

  // ────────────────────────────────────────────────────────
  // ↓ 이 부분을 바로 아래에 추가하세요!
  // 2) 로컬 start 좌표 + transform 정보 모음
  const rawLineDefs: Record<string, { start: [number, number] }> = {
    // 세로줄
    "1": { start: [234, 0] },
    "3": { start: [156, 0] },
    "4": { start: [196, 99] },
    "6": { start: [36, 99] }, // matrix(0 -1 1 0 38 155) 적용 결과
    "7": { start: [77, 0] },
    "9": { start: [0, 0] },
    "10": { start: [195, 297] }, // matrix(0 -1 -1 0 195 297) 적용 결과
    "12": { start: [36, 297] }, // matrix(0 1 1 0 38 241)
    "13": { start: [232, 396] }, // matrix(0 -1 -1 0 232 396)
    "15": { start: [158, 396] }, // matrix(0 1 1 0 158 340)
    "16": { start: [75, 396] }, // matrix(0 -1 -1 0 75 396)
    "18": { start: [1, 396] }, // matrix(0 1 1 0 1 340)

    // 가로줄
    "20": { start: [234, 57] },
    "21": { start: [156, 57] },
    "22": { start: [196, 156] },
    "23": { start: [116, 156] },
    "24": { start: [77, 57] },
    "25": { start: [38, 57] },
    "26": { start: [233, 341] }, // matrix(-1 0 0 1 233 341) 적용 결과 on [-1,-2]
    "27": { start: [195, 339] }, // same matrix on [38,-2]
    "28": { start: [76, 341] }, // matrix(-1 0 0 1 76 341) on [-1,-2]
    "29": { start: [38, 339] }, // same matrix on [38,-2]
    "30": { start: [195, 242] }, // matrix(-1 0 0 1 195 242) on [-2,-2]
    "31": { start: [116.5, 240] }, // same matrix on [78.5,-2]
  };

  // 4) 실제 전역 좌표와 비교해서 redLineIds 결정
  // 매트릭스 파싱 로직 제거하고, 미리 계산된 절대 start 좌표만 사용
  const redLineIds = new Set<string>();
  Object.entries(rawLineDefs).forEach(([id, { start }]) => {
    const key = `${start[0]},${start[1]}`;
    if (winnerCoords.includes(key)) {
      redLineIds.add(id);
      const paired = pairedLines[id];
      if (paired) redLineIds.add(paired);
    }
  });
  // ────────────────────────────────────────────────────────
  const THIRD_LABEL_W = 80; // 원하는 폭(px)
  const THIRD_LABEL_H = 18; // 원하는 높이(px)
  const THIRD_AWAY_X = 240; // markerPositions["THIRD_PLACE"].away[0]
  const THIRD_AWAY_Y = 160; // markerPositions["THIRD_PLACE"].away[1]
  return (
    <BracketContainer>
      <LargeTitle>2025 총장배 토너먼트 대진표</LargeTitle>
      <BrackGroundContainer>
        <svg
          viewBox="0 0 233 396"
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="crispEdges"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            backgroundColor: "white",
            borderRadius: "15px",
            // boxShadow: "12px 12px 2px 1px rgba(0, 0, 0, 0.2)",
          }}
        >
          <g transform="translate(116.5,198) scale(0.80) translate(-116.5,-198)">
            <line
              id="1"
              x1="234"
              y1="26"
              x2="234"
              y2="56"
              stroke={redLineIds.has("1") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="3"
              x1="156"
              y1="56"
              x2="156"
              y2="26"
              stroke={redLineIds.has("3") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="4"
              x1="196"
              y1="125"
              x2="196"
              y2="155"
              stroke={redLineIds.has("4") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="6"
              x1="0"
              y1="-2"
              x2="30"
              y2="-2"
              transform="matrix(0 -1 1 0 38 155)"
              stroke={redLineIds.has("6") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="7"
              x1="77"
              y1="26"
              x2="77"
              y2="56"
              stroke={redLineIds.has("7") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="9"
              x1="-1"
              y1="56"
              x2="-1"
              y2="26"
              stroke={redLineIds.has("9") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="10"
              x1="26"
              y1="0"
              x2="56"
              y2="0"
              transform="matrix(0 -1 -1 0 195 297)"
              stroke={redLineIds.has("10") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="12"
              x1="0"
              y1="-2"
              x2="30"
              y2="-2"
              transform="matrix(0 1 1 0 38 241)"
              stroke={redLineIds.has("12") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="13"
              x1="26"
              y1="-2"
              x2="56"
              y2="-2"
              transform="matrix(0 -1 -1 0 232 396)"
              stroke={redLineIds.has("13") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="15"
              x1="0"
              y1="-2"
              x2="30"
              y2="-2"
              transform="matrix(0 1 1 0 158 340)"
              stroke={redLineIds.has("15") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="16"
              x1="26"
              y1="-2"
              x2="56"
              y2="-2"
              transform="matrix(0 -1 -1 0 75 396)"
              stroke={redLineIds.has("16") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="18"
              x1="0"
              y1="-2"
              x2="30"
              y2="-2"
              transform="matrix(0 1 1 0 1 340)"
              stroke={redLineIds.has("18") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />

            {/* 가로줄 */}
            <line
              id="20"
              x1="234"
              y1="57"
              x2="195"
              y2="57"
              stroke={redLineIds.has("20") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="21"
              x1="195"
              y1="57"
              x2="156"
              y2="57"
              stroke={redLineIds.has("21") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="22"
              x1="196"
              y1="156"
              x2="116"
              y2="156"
              stroke={redLineIds.has("22") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="23"
              x1="116"
              y1="156"
              x2="36"
              y2="156"
              stroke={redLineIds.has("23") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="24"
              x1="77"
              y1="57"
              x2="38"
              y2="57"
              stroke={redLineIds.has("24") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="25"
              x1="36"
              y1="57"
              x2="-1"
              y2="57"
              stroke={redLineIds.has("25") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="26"
              x1="-1"
              y1="-2"
              x2="36"
              y2="-2"
              transform="matrix(-1 0 0 1 233 341)"
              stroke={redLineIds.has("26") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="27"
              x1="38"
              y1="-2"
              x2="77"
              y2="-2"
              transform="matrix(-1 0 0 1 233 341)"
              stroke={redLineIds.has("27") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="28"
              x1="-1"
              y1="-2"
              x2="38"
              y2="-2"
              transform="matrix(-1 0 0 1 76 341)"
              stroke={redLineIds.has("28") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="29"
              x1="40"
              y1="-2"
              x2="77"
              y2="-2"
              transform="matrix(-1 0 0 1 76 341)"
              stroke={redLineIds.has("29") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="30"
              x1="0"
              y1="-2"
              x2="78.5"
              y2="-2"
              transform="matrix(-1 0 0 1 195 242)"
              stroke={redLineIds.has("30") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <line
              id="31"
              x1="78.5"
              y1="-2"
              x2="159"
              y2="-2"
              transform="matrix(-1 0 0 1 195 242)"
              stroke={redLineIds.has("31") ? "red" : lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />

            {/* 상좌 */}
            <line
              id="32"
              x1="36"
              y1="57"
              x2="36"
              y2="78"
              // transform="matrix(0 -1 -1 0 195 297)"
              stroke={
                redLineIds.has("7") || redLineIds.has("9") ? "red" : lineColor
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            {/* 상우 */}
            <line
              id="33"
              x1="196"
              y1="78"
              x2="196"
              y2="57"
              // transform="matrix(0 -1 -1 0 195 297)"
              stroke={
                redLineIds.has("1") || redLineIds.has("3") ? "red" : lineColor
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />

            {/* 하좌 */}
            <line
              id="34"
              x1="36"
              y1="318"
              x2="36"
              y2="339"
              // transform="matrix(0 -1 -1 0 195 297)"
              stroke={
                redLineIds.has("16") || redLineIds.has("18") ? "red" : lineColor
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />

            {/* 하우 */}
            <line
              id="35"
              x1="195"
              y1="318"
              x2="195"
              y2="339"
              // transform="matrix(0 -1 -1 0 195 297)"
              stroke={
                redLineIds.has("13") || redLineIds.has("15") ? "red" : lineColor
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />

            {/* 중상 */}
            <line
              id="36"
              x1="116.5"
              y1="163"
              x2="116.5"
              y2="156"
              // transform="matrix(0 -1 -1 0 195 297)"
              stroke={
                redLineIds.has("4") || redLineIds.has("6") ? "red" : lineColor
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            {/* 중하 */}
            <line
              id="37"
              x1="116.5"
              y1="233"
              x2="116.5"
              y2="240"
              // transform="matrix(0 -1 -1 0 195 297)"
              stroke={
                redLineIds.has("10") || redLineIds.has("12") ? "red" : lineColor
              }
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
            <g style={{ isolation: "isolate", zIndex: 10 }}>
              <foreignObject
                x={116.5 - CENTER_WIDTH / 2}
                y={198 - CENTER_HEIGHT / 2}
                width={CENTER_WIDTH}
                height={CENTER_HEIGHT}
              >
                <CenterSquare />
              </foreignObject>
            </g>
            {/* EndMarker 쌍의 중앙에 검정 직사각형 */}
            {Object.entries(markerPositions).map(([pos, { away, home }]) => {
              const cx = (away[0] + home[0]) / 2 - RECT_WIDTH / 2;
              const cy = (away[1] + home[1]) / 2 - RECT_HEIGHT / 2;
              return (
                <foreignObject
                  key={pos}
                  x={cx}
                  y={cy}
                  width={RECT_WIDTH}
                  height={RECT_HEIGHT}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: "0.6rem",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",

                      // backgroundColor: "#bdbdbd",
                    }}
                  >
                    vs
                  </div>
                </foreignObject>
              );
            })}

            {/* 상 좌 1 */}
            {(() => {
              const g = findGame("QF_1");
              return (
                <EndMarker
                  x="0"
                  y="0"
                  label={labels.topLeft1}
                  score={labels.topLeft1Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {/* 상 좌 2 */}
            {(() => {
              const g = findGame("QF_1");
              return (
                <EndMarker
                  x="77"
                  y="0"
                  label={labels.topLeft2}
                  score={labels.topLeft2Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
            {/* 상 우 1 */}
            {(() => {
              const g = findGame("QF_2");
              return (
                <EndMarker
                  x="156"
                  y="0"
                  label={labels.topRight1}
                  score={labels.topRight1Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {/* 상 우 2 */}
            {(() => {
              const g = findGame("QF_2");
              return (
                <EndMarker
                  x="234"
                  y="0"
                  label={labels.topRight2}
                  score={labels.topRight2Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
            {/* 상 중 좌 */}
            {(() => {
              const g = findGame("SF_1");
              return (
                <EndMarker
                  x="36"
                  y="99"
                  label={labels.midTopLeft}
                  score={labels.midTopLeftScore}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {/* 상 중 우 */}
            {(() => {
              const g = findGame("SF_1");
              return (
                <EndMarker
                  x="196"
                  y="99"
                  label={labels.midTopRight}
                  score={labels.midTopRightScore}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
            {/* 하 중 좌 */}
            {(() => {
              const g = findGame("SF_2");
              return (
                <EndMarkerTP
                  x="36"
                  y="297"
                  label={labels.midBotLeft}
                  score={labels.midBotLeftScore}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {/* 하 중 우 */}
            {(() => {
              const g = findGame("SF_2");
              return (
                <EndMarkerTP
                  x="195"
                  y="297"
                  label={labels.midBotRight}
                  score={labels.midBotRightScore}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
            {/* 하 좌 1 */}
            {(() => {
              const g = findGame("QF_3");
              return (
                <EndMarkerTP
                  x="1"
                  y="396"
                  label={labels.botLeft1}
                  score={labels.botLeft1Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {/* 하 좌 2 */}
            {(() => {
              const g = findGame("QF_3");
              return (
                <EndMarkerTP
                  x="77"
                  y="396"
                  label={labels.botLeft2}
                  score={labels.botLeft2Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
            {/* 하 우 1 */}
            {(() => {
              const g = findGame("QF_4");
              return (
                <EndMarkerTP
                  x="158"
                  y="396"
                  label={labels.botRight1}
                  score={labels.botRight1Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {/* 하 우 2 */}
            {(() => {
              const g = findGame("QF_4");
              return (
                <EndMarkerTP
                  x="234"
                  y="396"
                  label={labels.botRight2}
                  score={labels.botRight2Score}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
            {/* 결승전 – HOME(위쪽) */}
            {(() => {
              const g = findGame("F");
              return (
                <React.Fragment>
                  {/* EndMarker 본체 — 점수는 숨김 */}
                  <EndMarker
                    x={116.5}
                    y={184}
                    label={labels.finalLeft}
                    score={
                      <span style={{ visibility: "hidden" }}>
                        {labels.finalLeftScore}
                      </span>
                    }
                    isWinner={
                      g.winnerTeamId !== null &&
                      g.winnerTeamId === g.homeTeam.id
                    }
                  />

                  {/* EndMarker 오른쪽에 보이는 점수 박스 */}
                  <foreignObject
                    x={116.5 + HALF_FO_W + 2}
                    y={184 - HALF_FO_H}
                    width={35}
                    height={FO_HEIGHT}
                  >
                    <ScroeBoxF>
                      <div>{labels.finalLeftScore}</div>
                    </ScroeBoxF>
                  </foreignObject>
                </React.Fragment>
              );
            })()}

            {/* 결승전 – AWAY(아래쪽) */}
            {(() => {
              const g = findGame("F");
              return (
                <React.Fragment>
                  {/* EndMarker 본체 — 점수는 숨김 */}
                  <EndMarkerTP
                    x={116.5}
                    y={213}
                    label={labels.finalRight}
                    score={
                      <span style={{ visibility: "hidden" }}>
                        {labels.finalRightScore}
                      </span>
                    }
                    isWinner={
                      g.winnerTeamId !== null &&
                      g.winnerTeamId === g.awayTeam.id
                    }
                  />

                  {/* EndMarker 오른쪽에 보이는 점수 박스 */}
                  <foreignObject
                    x={116.5 + HALF_FO_W + 2}
                    y={213}
                    width={35}
                    height={FO_HEIGHT}
                  >
                    <ScroeBoxF>
                      <div>{labels.finalRightScore}</div>
                    </ScroeBoxF>
                  </foreignObject>
                </React.Fragment>
              );
            })()}
            <foreignObject
              x={THIRD_AWAY_X - THIRD_LABEL_W / 2}
              y={THIRD_AWAY_Y - HALF_FO_H - THIRD_LABEL_H - 2} // EndMarker 위에 2px 간격
              width={THIRD_LABEL_W}
              height={THIRD_LABEL_H}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  // fontWeight: 500,
                  fontWeight: "bold",
                }}
              >
                3,4위전
              </div>
            </foreignObject>

            {/* 3,4위전 */}
            {(() => {
              const g = findGame("THIRD_PLACE");
              return (
                <EndMarker
                  x={240}
                  y={160}
                  label={labels.ThirdTop}
                  score={labels.ThirdTopScore}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.awayTeam.id
                  }
                />
              );
            })()}
            {(() => {
              const g = findGame("THIRD_PLACE");
              return (
                <EndMarkerTP
                  x={240}
                  y={230}
                  label={labels.ThirdBot}
                  score={labels.ThirdBotScore}
                  isWinner={
                    g.winnerTeamId !== null && g.winnerTeamId === g.homeTeam.id
                  }
                />
              );
            })()}
          </g>
        </svg>
      </BrackGroundContainer>
    </BracketContainer>
  );
}
