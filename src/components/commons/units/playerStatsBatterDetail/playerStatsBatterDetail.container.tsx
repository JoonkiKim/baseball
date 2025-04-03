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
import { HitterStat } from "../../../../commons/stores"; // 인터페이스 import (필요시)

export default function StatsPageBatterDetail() {
  // Recoil의 hitterStatsState에서 타자 기록 데이터를 가져옴 (타입은 HitterStat[]로 추론됨)
  const [hitterStats] = useRecoilState<HitterStat[]>(hitterStatsState);

  // 로컬 상태로 정렬된 데이터를 관리 (초기 정렬 기준: 안타(H) 기준 내림차순)
  const [hitterData, setHitterData] = useState<HitterStat[]>([]);
  const [hitterSortKey, setHitterSortKey] = useState<keyof HitterStat>("H");

  // Recoil 상태가 변경될 때마다 정렬된 데이터를 로컬 상태에 저장
  useEffect(() => {
    const sortedData = [...hitterStats].sort((a, b) => b.H - a.H);
    setHitterData(sortedData);
  }, [hitterStats]);

  // 정렬 핸들러: 각 컬럼 클릭 시 해당 키로 데이터를 정렬합니다.
  const handleSortHitter = (key: keyof HitterStat) => {
    setHitterSortKey(key);
    const sortedData = [...hitterData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return bValue - aValue;
      }
      // 문자열 비교가 필요한 경우 (예: 사전순 정렬)
      if (typeof aValue === "string" && typeof bValue === "string") {
        return bValue.localeCompare(aValue);
      }
      // 서로 다른 타입이면 원하는 정렬 로직에 따라 처리
      return 0;
    });
    setHitterData(sortedData);
  };

  return (
    <RankingContainer>
      <TableWrapper>
        <TableTitle>타자기록</TableTitle>
        <RankingTable>
          <thead>
            <tr>
              <th>순위</th>
              <th>선수</th>
              <th onClick={() => handleSortHitter("AB")}>
                타수 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("H")}>
                안타 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("AVG")}>
                타율 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("BB")}>
                볼넷 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("OBP")}>
                출루율 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("SLG")}>
                장타율 <ArrowIcon>▼</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("OPS")}>
                OPS <ArrowIcon>▼</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue: number | null = null;
              return hitterData.slice(0, 20).map((item, index) => {
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
                    <td>
                      {item.playerName} ({item.teamName})
                    </td>
                    <td>{item.AB}</td>
                    <td>{item.H}</td>
                    <td>{item.AVG.toFixed(3)}</td>
                    <td>{item.BB}</td>
                    <td>{item.OBP.toFixed(3)}</td>
                    <td>{item.SLG.toFixed(3)}</td>
                    <td>{item.OPS.toFixed(3)}</td>
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
