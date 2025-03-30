import React, { useState } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  TableTitle,
  ArrowIcon,
} from "./playerStatsBatterDetail.style"; // 스타일 임포트
import { useRecoilState } from "recoil";
import { initialHitterStatsState } from "../../../../commons/stores";

export default function StatsPageBatterDetail() {
  // 타자 기록 더미 데이터 (30개, rank 속성 제거)
  const [initialHitterStats] = useRecoilState(initialHitterStatsState);

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
