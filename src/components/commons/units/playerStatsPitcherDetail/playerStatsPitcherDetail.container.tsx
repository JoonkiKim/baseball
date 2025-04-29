import React, { useState, useEffect } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTableP,
  TableTitle,
  ArrowIcon,
} from "./playerStatsPitcherDetail.style"; // 스타일 임포트
import { useRecoilState } from "recoil";
import { pitcherStatsState } from "../../../../commons/stores";

export default function StatsPagePitcherDetail() {
  // Recoil의 pitcherStatsState에서 투수 기록 데이터를 불러옴
  const [pitcherStats] = useRecoilState(pitcherStatsState);

  // 로컬 상태에서 정렬된 데이터를 관리 (초기 정렬 기준: 삼진(K))
  const [pitcherData, setPitcherData] = useState(
    [...pitcherStats].sort((a, b) => b.K - a.K)
  );
  const [pitcherSortKey, setPitcherSortKey] = useState("K");

  // Recoil state가 변경될 때 로컬 정렬 데이터 업데이트
  useEffect(() => {
    const sortedData = [...pitcherStats].sort((a, b) => b.K - a.K);
    setPitcherData(sortedData);
  }, [pitcherStats]);

  // 투수 기록 정렬 함수 (내림차순)
  const handleSortPitcher = (key: string) => {
    setPitcherSortKey(key);
    const sortedData = [...pitcherData].sort(
      (a, b) => (b[key] as number) - (a[key] as number)
    );
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
              <th style={{ width: "25vw" }}>선수</th>
              <th onClick={() => handleSortPitcher("K")}>
                삼진 <ArrowIcon>▼</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue: number | null = null;
              // 상위 20개만 노출
              return pitcherData.slice(0, 20).map((item, index) => {
                const currentValue = item[pitcherSortKey] as number;
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
                    <td>
                      {item.playerName} ({item.teamName.slice(0, 3)})
                    </td>
                    <td>{item.K}</td>
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
