import React, { useState } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  MoreButton,
  RankingTableP,
  TableTitle,
  ArrowIcon,
} from "./playerStatsPitcherDetail.style"; // 스타일 임포트
import { useRecoilState } from "recoil";
import { initialPitcherStatsState } from "../../../../commons/stores";

export default function StatsPagePitcherDetail() {
  // 투수 기록 더미 데이터 (30개)
  const [initialPitcherStats] = useRecoilState(initialPitcherStatsState);

  // 상태 관리: 데이터를 useState로 관리 및 현재 정렬 기준 저장
  const [pitcherData, setPitcherData] = useState(
    [...initialPitcherStats].sort((a, b) => b.so - a.so)
  );
  const [pitcherSortKey, setPitcherSortKey] = useState("so"); // 기본 정렬 기준: 삼진

  // 투수 기록 정렬 함수 (내림차순)
  const handleSortPitcher = (key) => {
    setPitcherSortKey(key);
    const sortedData = [...pitcherData].sort((a, b) => b[key] - a[key]);
    setPitcherData(sortedData);
  };

  return (
    <RankingContainer>
      {/* 투수기록 섹션 */}
      <TableWrapper>
        <TableTitle>투수기록</TableTitle>
        <RankingTableP>
          <thead>
            <tr>
              <th>순위</th>
              <th>선수</th>
              <th onClick={() => handleSortPitcher("so")}>
                삼진 <ArrowIcon>▼</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue = null;
              // 상위 20개만 노출
              return pitcherData.slice(0, 20).map((item, index) => {
                const currentValue = item[pitcherSortKey];
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
                    <td>{item.so}</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </RankingTableP>
      </TableWrapper>
    </RankingContainer>
  );
}
