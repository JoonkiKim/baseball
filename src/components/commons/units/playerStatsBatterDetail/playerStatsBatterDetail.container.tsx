import React, { useState, useEffect } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  TableTitle,
  ArrowIcon,
} from "./playerStatsBatterDetail.style";
import { useRecoilState } from "recoil";
import { hitterStatsState } from "../../../../commons/stores";
import { HitterStat } from "../../../../commons/stores";
import { ArrowIconNone } from "../playerStats/playerStats.style";

export default function StatsPageBatterDetail() {
  const getArrow = (currentKey: string, columnKey: string) =>
    currentKey === columnKey ? "▼" : "▲";
  const hitterStats = [
    {
      playerName: "홍길동",
      teamName: "관악사",
      teamGameCount: 5,
      PA: 20,
      AB: 8,
      H: 12,
      "2B": 1,
      "3B": 2,
      HR: 3,
      BB: 3,
      AVG: "0.312",
      OBP: "0.400",
      SLG: "0.600",
      OPS: "1.000",
    },
    {
      playerName: "김민수",
      teamName: "포톤스",
      teamGameCount: 4,
      PA: 20,
      AB: 13,
      H: 12,
      "2B": 3,
      "3B": 1,
      HR: 2,
      BB: 2,
      AVG: "0.312",
      OBP: "0.370",
      SLG: "0.520",
      OPS: "0.890",
    },
    {
      playerName: "이영희",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 20,
      AB: 11,
      H: 12,
      "2B": 1,
      "3B": 1,
      HR: 1,
      BB: 4,
      AVG: "0.312",
      OBP: "0.450",
      SLG: "0.630",
      OPS: "1.080",
    },
    {
      playerName: "박준호",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 19,
      AB: 7,
      H: 5,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.263",
      OBP: "0.310",
      SLG: "0.380",
      OPS: "0.690",
    },
    {
      playerName: "최지훈",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 18,
      H: 5,
      "2B": 2,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.250",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "정수현",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 18,
      AB: 16,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 3,
      AVG: "0.278",
      OBP: "0.350",
      SLG: "0.450",
      OPS: "0.800",
    },
    {
      playerName: "조민준",
      teamName: "키움",
      teamGameCount: 4,
      PA: 22,
      AB: 13,
      H: 15,
      "2B": 2,
      "3B": 1,
      HR: 3,
      BB: 1,
      AVG: "0.341",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "한예림",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 21,
      AB: 19,
      H: 13,
      "2B": 3,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.310",
      OBP: "0.370",
      SLG: "0.480",
      OPS: "0.850",
    },
    {
      playerName: "윤지우",
      teamName: "관악사",
      teamGameCount: 4,
      PA: 19,
      AB: 9,
      H: 11,
      "2B": 1,
      "3B": 1,
      HR: 2,
      BB: 0,
      AVG: "0.289",
      OBP: "0.300",
      SLG: "0.470",
      OPS: "0.770",
    },
    {
      playerName: "오민석",
      teamName: "포톤스",
      teamGameCount: 5,
      PA: 20,
      AB: 15,
      H: 14,
      "2B": 2,
      "3B": 2,
      HR: 1,
      BB: 4,
      AVG: "0.350",
      OBP: "0.420",
      SLG: "0.640",
      OPS: "1.060",
    },
    {
      playerName: "임서연",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 18,
      AB: 6,
      H: 9,
      "2B": 3,
      "3B": 1,
      HR: 1,
      BB: 2,
      AVG: "0.250",
      OBP: "0.320",
      SLG: "0.410",
      OPS: "0.730",
    },
    {
      playerName: "신동혁",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 23,
      AB: 20,
      H: 16,
      "2B": 2,
      "3B": 3,
      HR: 3,
      BB: 3,
      AVG: "0.348",
      OBP: "0.400",
      SLG: "0.580",
      OPS: "0.980",
    },
    {
      playerName: "강예진",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 12,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.300",
      OBP: "0.340",
      SLG: "0.450",
      OPS: "0.790",
    },
    {
      playerName: "장승민",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 21,
      AB: 17,
      H: 12,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 2,
      AVG: "0.286",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "백하늘",
      teamName: "키움",
      teamGameCount: 4,
      PA: 19,
      AB: 8,
      H: 8,
      "2B": 2,
      "3B": 1,
      HR: 2,
      BB: 3,
      AVG: "0.211",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "문지훈",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 20,
      AB: 18,
      H: 11,
      "2B": 1,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.275",
      OBP: "0.350",
      SLG: "0.480",
      OPS: "0.830",
    },
    {
      playerName: "홍길동",
      teamName: "관악사",
      teamGameCount: 5,
      PA: 20,
      AB: 8,
      H: 12,
      "2B": 1,
      "3B": 2,
      HR: 3,
      BB: 3,
      AVG: "0.312",
      OBP: "0.400",
      SLG: "0.600",
      OPS: "1.000",
    },
    {
      playerName: "김민수",
      teamName: "포톤스",
      teamGameCount: 4,
      PA: 20,
      AB: 13,
      H: 12,
      "2B": 3,
      "3B": 1,
      HR: 2,
      BB: 2,
      AVG: "0.312",
      OBP: "0.370",
      SLG: "0.520",
      OPS: "0.890",
    },
    {
      playerName: "이영희",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 20,
      AB: 11,
      H: 12,
      "2B": 1,
      "3B": 1,
      HR: 1,
      BB: 4,
      AVG: "0.312",
      OBP: "0.450",
      SLG: "0.630",
      OPS: "1.080",
    },
    {
      playerName: "박준호",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 19,
      AB: 7,
      H: 5,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.263",
      OBP: "0.310",
      SLG: "0.380",
      OPS: "0.690",
    },
    {
      playerName: "최지훈",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 18,
      H: 5,
      "2B": 2,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.250",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "정수현",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 18,
      AB: 16,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 3,
      AVG: "0.278",
      OBP: "0.350",
      SLG: "0.450",
      OPS: "0.800",
    },
    {
      playerName: "조민준",
      teamName: "키움",
      teamGameCount: 4,
      PA: 22,
      AB: 13,
      H: 15,
      "2B": 2,
      "3B": 1,
      HR: 3,
      BB: 1,
      AVG: "0.341",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "한예림",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 21,
      AB: 19,
      H: 13,
      "2B": 3,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.310",
      OBP: "0.370",
      SLG: "0.480",
      OPS: "0.850",
    },
    {
      playerName: "윤지우",
      teamName: "관악사",
      teamGameCount: 4,
      PA: 19,
      AB: 9,
      H: 11,
      "2B": 1,
      "3B": 1,
      HR: 2,
      BB: 0,
      AVG: "0.289",
      OBP: "0.300",
      SLG: "0.470",
      OPS: "0.770",
    },
    {
      playerName: "오민석",
      teamName: "포톤스",
      teamGameCount: 5,
      PA: 20,
      AB: 15,
      H: 14,
      "2B": 2,
      "3B": 2,
      HR: 1,
      BB: 4,
      AVG: "0.350",
      OBP: "0.420",
      SLG: "0.640",
      OPS: "1.060",
    },
    {
      playerName: "임서연",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 18,
      AB: 6,
      H: 9,
      "2B": 3,
      "3B": 1,
      HR: 1,
      BB: 2,
      AVG: "0.250",
      OBP: "0.320",
      SLG: "0.410",
      OPS: "0.730",
    },
    {
      playerName: "신동혁",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 23,
      AB: 20,
      H: 16,
      "2B": 2,
      "3B": 3,
      HR: 3,
      BB: 3,
      AVG: "0.348",
      OBP: "0.400",
      SLG: "0.580",
      OPS: "0.980",
    },
    {
      playerName: "강예진",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 12,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.300",
      OBP: "0.340",
      SLG: "0.450",
      OPS: "0.790",
    },
    {
      playerName: "장승민",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 21,
      AB: 17,
      H: 12,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 2,
      AVG: "0.286",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "백하늘",
      teamName: "키움",
      teamGameCount: 4,
      PA: 19,
      AB: 8,
      H: 8,
      "2B": 2,
      "3B": 1,
      HR: 2,
      BB: 3,
      AVG: "0.211",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "문지훈",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 20,
      AB: 18,
      H: 11,
      "2B": 1,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.275",
      OBP: "0.350",
      SLG: "0.480",
      OPS: "0.830",
    },
    {
      playerName: "홍길동",
      teamName: "관악사",
      teamGameCount: 5,
      PA: 20,
      AB: 8,
      H: 12,
      "2B": 1,
      "3B": 2,
      HR: 3,
      BB: 3,
      AVG: "0.312",
      OBP: "0.400",
      SLG: "0.600",
      OPS: "1.000",
    },
    {
      playerName: "김민수",
      teamName: "포톤스",
      teamGameCount: 4,
      PA: 20,
      AB: 13,
      H: 12,
      "2B": 3,
      "3B": 1,
      HR: 2,
      BB: 2,
      AVG: "0.312",
      OBP: "0.370",
      SLG: "0.520",
      OPS: "0.890",
    },
    {
      playerName: "이영희",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 20,
      AB: 11,
      H: 12,
      "2B": 1,
      "3B": 1,
      HR: 1,
      BB: 4,
      AVG: "0.312",
      OBP: "0.450",
      SLG: "0.630",
      OPS: "1.080",
    },
    {
      playerName: "박준호",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 19,
      AB: 7,
      H: 5,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.263",
      OBP: "0.310",
      SLG: "0.380",
      OPS: "0.690",
    },
    {
      playerName: "최지훈",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 18,
      H: 5,
      "2B": 2,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.250",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "정수현",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 18,
      AB: 16,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 3,
      AVG: "0.278",
      OBP: "0.350",
      SLG: "0.450",
      OPS: "0.800",
    },
    {
      playerName: "조민준",
      teamName: "키움",
      teamGameCount: 4,
      PA: 22,
      AB: 13,
      H: 15,
      "2B": 2,
      "3B": 1,
      HR: 3,
      BB: 1,
      AVG: "0.341",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "한예림",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 21,
      AB: 19,
      H: 13,
      "2B": 3,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.310",
      OBP: "0.370",
      SLG: "0.480",
      OPS: "0.850",
    },
    {
      playerName: "윤지우",
      teamName: "관악사",
      teamGameCount: 4,
      PA: 19,
      AB: 9,
      H: 11,
      "2B": 1,
      "3B": 1,
      HR: 2,
      BB: 0,
      AVG: "0.289",
      OBP: "0.300",
      SLG: "0.470",
      OPS: "0.770",
    },
    {
      playerName: "오민석",
      teamName: "포톤스",
      teamGameCount: 5,
      PA: 20,
      AB: 15,
      H: 14,
      "2B": 2,
      "3B": 2,
      HR: 1,
      BB: 4,
      AVG: "0.350",
      OBP: "0.420",
      SLG: "0.640",
      OPS: "1.060",
    },
    {
      playerName: "임서연",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 18,
      AB: 6,
      H: 9,
      "2B": 3,
      "3B": 1,
      HR: 1,
      BB: 2,
      AVG: "0.250",
      OBP: "0.320",
      SLG: "0.410",
      OPS: "0.730",
    },
    {
      playerName: "신동혁",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 23,
      AB: 20,
      H: 16,
      "2B": 2,
      "3B": 3,
      HR: 3,
      BB: 3,
      AVG: "0.348",
      OBP: "0.400",
      SLG: "0.580",
      OPS: "0.980",
    },
    {
      playerName: "강예진",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 12,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.300",
      OBP: "0.340",
      SLG: "0.450",
      OPS: "0.790",
    },
    {
      playerName: "장승민",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 21,
      AB: 17,
      H: 12,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 2,
      AVG: "0.286",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "백하늘",
      teamName: "키움",
      teamGameCount: 4,
      PA: 19,
      AB: 8,
      H: 8,
      "2B": 2,
      "3B": 1,
      HR: 2,
      BB: 3,
      AVG: "0.211",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "문지훈",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 20,
      AB: 18,
      H: 11,
      "2B": 1,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.275",
      OBP: "0.350",
      SLG: "0.480",
      OPS: "0.830",
    },
    {
      playerName: "홍길동",
      teamName: "관악사",
      teamGameCount: 5,
      PA: 20,
      AB: 8,
      H: 12,
      "2B": 1,
      "3B": 2,
      HR: 3,
      BB: 3,
      AVG: "0.312",
      OBP: "0.400",
      SLG: "0.600",
      OPS: "1.000",
    },
    {
      playerName: "김민수",
      teamName: "포톤스",
      teamGameCount: 4,
      PA: 20,
      AB: 13,
      H: 12,
      "2B": 3,
      "3B": 1,
      HR: 2,
      BB: 2,
      AVG: "0.312",
      OBP: "0.370",
      SLG: "0.520",
      OPS: "0.890",
    },
    {
      playerName: "이영희",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 20,
      AB: 11,
      H: 12,
      "2B": 1,
      "3B": 1,
      HR: 1,
      BB: 4,
      AVG: "0.312",
      OBP: "0.450",
      SLG: "0.630",
      OPS: "1.080",
    },
    {
      playerName: "박준호",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 19,
      AB: 7,
      H: 5,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.263",
      OBP: "0.310",
      SLG: "0.380",
      OPS: "0.690",
    },
    {
      playerName: "최지훈",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 18,
      H: 5,
      "2B": 2,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.250",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "정수현",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 18,
      AB: 16,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 3,
      AVG: "0.278",
      OBP: "0.350",
      SLG: "0.450",
      OPS: "0.800",
    },
    {
      playerName: "조민준",
      teamName: "키움",
      teamGameCount: 4,
      PA: 22,
      AB: 13,
      H: 15,
      "2B": 2,
      "3B": 1,
      HR: 3,
      BB: 1,
      AVG: "0.341",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "한예림",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 21,
      AB: 19,
      H: 13,
      "2B": 3,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.310",
      OBP: "0.370",
      SLG: "0.480",
      OPS: "0.850",
    },
    {
      playerName: "윤지우",
      teamName: "관악사",
      teamGameCount: 4,
      PA: 19,
      AB: 9,
      H: 11,
      "2B": 1,
      "3B": 1,
      HR: 2,
      BB: 0,
      AVG: "0.289",
      OBP: "0.300",
      SLG: "0.470",
      OPS: "0.770",
    },
    {
      playerName: "오민석",
      teamName: "포톤스",
      teamGameCount: 5,
      PA: 20,
      AB: 15,
      H: 14,
      "2B": 2,
      "3B": 2,
      HR: 1,
      BB: 4,
      AVG: "0.350",
      OBP: "0.420",
      SLG: "0.640",
      OPS: "1.060",
    },
    {
      playerName: "임서연",
      teamName: "자연대",
      teamGameCount: 4,
      PA: 18,
      AB: 6,
      H: 9,
      "2B": 3,
      "3B": 1,
      HR: 1,
      BB: 2,
      AVG: "0.250",
      OBP: "0.320",
      SLG: "0.410",
      OPS: "0.730",
    },
    {
      playerName: "신동혁",
      teamName: "사회대",
      teamGameCount: 5,
      PA: 23,
      AB: 20,
      H: 16,
      "2B": 2,
      "3B": 3,
      HR: 3,
      BB: 3,
      AVG: "0.348",
      OBP: "0.400",
      SLG: "0.580",
      OPS: "0.980",
    },
    {
      playerName: "강예진",
      teamName: "공대",
      teamGameCount: 4,
      PA: 20,
      AB: 12,
      H: 10,
      "2B": 1,
      "3B": 2,
      HR: 1,
      BB: 1,
      AVG: "0.300",
      OBP: "0.340",
      SLG: "0.450",
      OPS: "0.790",
    },
    {
      playerName: "장승민",
      teamName: "사범대",
      teamGameCount: 5,
      PA: 21,
      AB: 17,
      H: 12,
      "2B": 3,
      "3B": 2,
      HR: 1,
      BB: 2,
      AVG: "0.286",
      OBP: "0.360",
      SLG: "0.500",
      OPS: "0.860",
    },
    {
      playerName: "백하늘",
      teamName: "키움",
      teamGameCount: 4,
      PA: 19,
      AB: 8,
      H: 8,
      "2B": 2,
      "3B": 1,
      HR: 2,
      BB: 3,
      AVG: "0.211",
      OBP: "0.330",
      SLG: "0.420",
      OPS: "0.750",
    },
    {
      playerName: "문지훈",
      teamName: "삼성",
      teamGameCount: 5,
      PA: 20,
      AB: 18,
      H: 11,
      "2B": 1,
      "3B": 3,
      HR: 2,
      BB: 2,
      AVG: "0.275",
      OBP: "0.350",
      SLG: "0.480",
      OPS: "0.830",
    },
  ];

  const [hitterData, setHitterData] = useRecoilState(hitterStatsState);
  // const [hitterData, setHitterData] = useState<HitterStat[]>([]);
  const [hitterSortKey, setHitterSortKey] =
    React.useState<keyof (typeof hitterData)[0]>("AVG");

  // useEffect(() => {
  //   const sortedData = [...hitterStats].sort((a, b) => b.AVG - a.AVG);
  //   setHitterData(sortedData);
  // }, []);
  // API연결이 안된다면 여기 hitterStats를 의존성 배열에 넣기

  console.log(hitterData);
  // Rate(비율) 정렬 키인지 체크
  const isRateKey = ["AVG", "OBP", "SLG", "OPS"].includes(
    hitterSortKey as string
  );
  // PA 필터링된 데이터
  const filtered = hitterData.filter((p) => p.PA >= p.teamGameCount * 2);

  type HitterNumericKey =
    | "AVG"
    | "AB"
    | "PA"
    | "H"
    | "2B"
    | "3B"
    | "HR"
    | "R"
    | "RBI"
    | "BB"
    | "SO"
    | "OBP"
    | "SLG"
    | "OPS";

  const handleSortHitter = (key: HitterNumericKey) => {
    setHitterSortKey(key);
    const sorted = [...hitterData].sort(
      (a, b) => (b[key] as number) - (a[key] as number)
    );
    setHitterData(sorted);
  };

  // 화면에 실제로 뿌릴 데이터 선택
  const displayData = isRateKey ? filtered : hitterData;

  return (
    <RankingContainer>
      <TableTitle>타자기록</TableTitle>
      <TableWrapper>
        <RankingTable>
          <thead>
            <tr>
              <th>순위</th>
              <th style={{ width: "25vw", textAlign: "left" }}>선수</th>
              <th onClick={() => handleSortHitter("AVG")}>
                타율 <ArrowIcon>{getArrow(hitterSortKey, "AVG")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("PA")}>
                타석 <ArrowIcon>{getArrow(hitterSortKey, "PA")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("AB")}>
                타수 <ArrowIcon>{getArrow(hitterSortKey, "AB")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("H")}>
                안타 <ArrowIcon>{getArrow(hitterSortKey, "H")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("2B")}>
                2루타 <ArrowIcon>{getArrow(hitterSortKey, "2B")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("3B")}>
                3루타 <ArrowIcon>{getArrow(hitterSortKey, "3B")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("HR")}>
                홈런 <ArrowIcon>{getArrow(hitterSortKey, "HR")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("R")}>
                득점 <ArrowIcon>{getArrow(hitterSortKey, "R")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("RBI")}>
                타점 <ArrowIcon>{getArrow(hitterSortKey, "RBI")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("BB")}>
                볼넷 <ArrowIcon>{getArrow(hitterSortKey, "BB")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("SO")}>
                삼진 <ArrowIcon>{getArrow(hitterSortKey, "SO")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("OBP")}>
                출루율 <ArrowIcon>{getArrow(hitterSortKey, "OBP")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("SLG")}>
                장타율 <ArrowIcon>{getArrow(hitterSortKey, "SLG")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("OPS")}>
                OPS <ArrowIcon>{getArrow(hitterSortKey, "OPS")}</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue: number | null = null;

              return displayData.map((item, index) => {
                const currentValue = item[hitterSortKey] as number;
                if (index === 0) {
                  currentRank = 1;
                  tieCount = 1;
                  prevValue = currentValue;
                } else {
                  if (currentValue === prevValue) {
                    tieCount++;
                  } else {
                    currentRank += tieCount;
                    tieCount = 1;
                    prevValue = currentValue;
                  }
                }
                return (
                  <tr key={index}>
                    <td>{currentRank}</td>
                    <td style={{ textAlign: "left" }}>
                      {item.name} ({item.team.slice(0, 3)})
                    </td>
                    <td>
                      {item.AVG}
                      <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.AB}
                      <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.PA}
                      <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.H} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item["2B"]} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item["3B"]} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.HR} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>

                    <td>
                      {item.R} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.RBI} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>

                    <td>
                      {item.BB} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.SO} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.OBP} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.SLG} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                    <td>
                      {item.OPS} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </RankingTable>
      </TableWrapper>
    </RankingContainer>
  );
}
