import React, { useState } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  TableTitle,
  ArrowIcon,
} from "./playerStatsBatterDetail.style"; // 스타일 임포트

export default function StatsPageBatterDetail() {
  // 타자 기록 더미 데이터 (30개, rank 속성 제거)
  const initialHitterStats = [
    {
      player: "박병호(관악사)",
      ab: 20,
      hits: 12,
      avg: 0.312,
      bb: 3,
      obp: 0.4,
      slg: 0.6,
      ops: 1.0,
    },
    {
      player: "김지찬(포토스)",
      ab: 20,
      hits: 12,
      avg: 0.312,
      bb: 2,
      obp: 0.37,
      slg: 0.52,
      ops: 0.89,
    },
    {
      player: "이재천(아라쥐)",
      ab: 20,
      hits: 12,
      avg: 0.312,
      bb: 4,
      obp: 0.45,
      slg: 0.63,
      ops: 1.08,
    },
    {
      player: "이정후(포토스)",
      ab: 19,
      hits: 5,
      avg: 0.263,
      bb: 1,
      obp: 0.31,
      slg: 0.38,
      ops: 0.69,
    },
    {
      player: "이치수(관악사)",
      ab: 20,
      hits: 5,
      avg: 0.25,
      bb: 2,
      obp: 0.33,
      slg: 0.42,
      ops: 0.75,
    },
    {
      player: "홍길동(팀A)",
      ab: 18,
      hits: 10,
      avg: 0.278,
      bb: 3,
      obp: 0.35,
      slg: 0.45,
      ops: 0.8,
    },
    {
      player: "김철수(팀B)",
      ab: 22,
      hits: 15,
      avg: 0.341,
      bb: 1,
      obp: 0.36,
      slg: 0.5,
      ops: 0.86,
    },
    {
      player: "이영희(팀C)",
      ab: 21,
      hits: 13,
      avg: 0.31,
      bb: 2,
      obp: 0.37,
      slg: 0.48,
      ops: 0.85,
    },
    {
      player: "박영수(팀D)",
      ab: 19,
      hits: 11,
      avg: 0.289,
      bb: 0,
      obp: 0.3,
      slg: 0.47,
      ops: 0.77,
    },
    {
      player: "최민수(팀E)",
      ab: 20,
      hits: 14,
      avg: 0.35,
      bb: 4,
      obp: 0.42,
      slg: 0.64,
      ops: 1.06,
    },
    {
      player: "한지민(팀F)",
      ab: 18,
      hits: 9,
      avg: 0.25,
      bb: 2,
      obp: 0.32,
      slg: 0.41,
      ops: 0.73,
    },
    {
      player: "서현우(팀G)",
      ab: 23,
      hits: 16,
      avg: 0.348,
      bb: 3,
      obp: 0.4,
      slg: 0.58,
      ops: 0.98,
    },
    {
      player: "조민준(팀H)",
      ab: 20,
      hits: 10,
      avg: 0.3,
      bb: 1,
      obp: 0.34,
      slg: 0.45,
      ops: 0.79,
    },
    {
      player: "강민재(팀I)",
      ab: 21,
      hits: 12,
      avg: 0.286,
      bb: 2,
      obp: 0.36,
      slg: 0.5,
      ops: 0.86,
    },
    {
      player: "유승민(팀J)",
      ab: 19,
      hits: 8,
      avg: 0.211,
      bb: 3,
      obp: 0.33,
      slg: 0.42,
      ops: 0.75,
    },
    {
      player: "오민석(팀K)",
      ab: 20,
      hits: 11,
      avg: 0.275,
      bb: 2,
      obp: 0.35,
      slg: 0.48,
      ops: 0.83,
    },
    {
      player: "김예린(팀L)",
      ab: 22,
      hits: 14,
      avg: 0.318,
      bb: 1,
      obp: 0.39,
      slg: 0.54,
      ops: 0.93,
    },
    {
      player: "박지훈(팀M)",
      ab: 20,
      hits: 12,
      avg: 0.3,
      bb: 2,
      obp: 0.36,
      slg: 0.52,
      ops: 0.88,
    },
    {
      player: "이수민(팀N)",
      ab: 19,
      hits: 10,
      avg: 0.263,
      bb: 2,
      obp: 0.34,
      slg: 0.46,
      ops: 0.8,
    },
    {
      player: "정민호(팀O)",
      ab: 21,
      hits: 13,
      avg: 0.31,
      bb: 3,
      obp: 0.37,
      slg: 0.55,
      ops: 0.92,
    },
    {
      player: "선수21(팀P)",
      ab: 20,
      hits: 11,
      avg: 0.305,
      bb: 2,
      obp: 0.355,
      slg: 0.515,
      ops: 0.87,
    },
    {
      player: "선수22(팀Q)",
      ab: 19,
      hits: 9,
      avg: 0.263,
      bb: 3,
      obp: 0.345,
      slg: 0.425,
      ops: 0.77,
    },
    {
      player: "선수23(팀R)",
      ab: 22,
      hits: 13,
      avg: 0.295,
      bb: 1,
      obp: 0.365,
      slg: 0.495,
      ops: 0.86,
    },
    {
      player: "선수24(팀S)",
      ab: 21,
      hits: 12,
      avg: 0.286,
      bb: 2,
      obp: 0.35,
      slg: 0.48,
      ops: 0.83,
    },
    {
      player: "선수25(팀T)",
      ab: 20,
      hits: 10,
      avg: 0.28,
      bb: 2,
      obp: 0.34,
      slg: 0.46,
      ops: 0.8,
    },
    {
      player: "선수26(팀U)",
      ab: 23,
      hits: 15,
      avg: 0.326,
      bb: 3,
      obp: 0.4,
      slg: 0.58,
      ops: 0.98,
    },
    {
      player: "선수27(팀V)",
      ab: 20,
      hits: 11,
      avg: 0.295,
      bb: 1,
      obp: 0.36,
      slg: 0.5,
      ops: 0.86,
    },
    {
      player: "선수28(팀W)",
      ab: 19,
      hits: 10,
      avg: 0.263,
      bb: 2,
      obp: 0.335,
      slg: 0.47,
      ops: 0.805,
    },
    {
      player: "선수29(팀X)",
      ab: 21,
      hits: 13,
      avg: 0.31,
      bb: 2,
      obp: 0.375,
      slg: 0.54,
      ops: 0.915,
    },
    {
      player: "선수30(팀Y)",
      ab: 20,
      hits: 12,
      avg: 0.3,
      bb: 3,
      obp: 0.36,
      slg: 0.52,
      ops: 0.88,
    },
  ];

  // 페이지 접속 시 초기 상태에서 안타 개수("hits") 기준 내림차순 정렬 적용
  const [hitterData, setHitterData] = useState(
    [...initialHitterStats].sort((a, b) => b.hits - a.hits)
  );
  const [hitterSortKey, setHitterSortKey] = useState("hits");

  const handleSortHitter = (key) => {
    setHitterSortKey(key);
    const sortedData = [...hitterData].sort((a, b) => b[key] - a[key]);
    setHitterData(sortedData);
  };

  return (
    <RankingContainer>
      {/* 타자기록 섹션 */}
      <TableWrapper>
        <TableTitle>타자기록</TableTitle>
        <RankingTable>
          <thead>
            <tr>
              <th>순위</th>
              <th>선수</th>
              <th onClick={() => handleSortHitter("ab")}>
                타수 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("hits")}>
                안타 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("avg")}>
                타율 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("bb")}>
                볼넷 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("obp")}>
                출루율 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("slg")}>
                장타율 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("ops")}>
                OPS <ArrowIcon>▼</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue = null;
              // 상위 20개만 노출
              return hitterData.slice(0, 20).map((item, index) => {
                const currentValue = item[hitterSortKey];
                if (index === 0) {
                  currentRank = 1;
                  tieCount = 1;
                  prevValue = currentValue;
                } else {
                  if (currentValue === prevValue) {
                    tieCount++;
                  } else {
                    currentRank = currentRank + tieCount;
                    tieCount = 1;
                    prevValue = currentValue;
                  }
                }
                return (
                  <tr key={index}>
                    <td>{currentRank}</td>
                    <td>{item.player}</td>
                    <td>{item.ab}</td>
                    <td>{item.hits}</td>
                    <td>{item.avg.toFixed(3)}</td>
                    <td>{item.bb}</td>
                    <td>{item.obp.toFixed(3)}</td>
                    <td>{item.slg.toFixed(3)}</td>
                    <td>{item.ops.toFixed(3)}</td>
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
