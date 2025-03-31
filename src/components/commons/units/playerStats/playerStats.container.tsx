import React, { useState } from "react";
import Link from "next/link";
import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  RankingTableP,
  TableTitle,
  ArrowIcon,
  MoreButton,
} from "./playerStats.style"; // 스타일 임포트
import { useRecoilState } from "recoil";
import {
  initialHitterStatsState,
  initialPitcherStatsState,
} from "../../../../commons/stores";

export default function StatsPage() {
  // 타자 기록 더미 데이터 (30개)

  const [initialHitterStats] = useRecoilState(initialHitterStatsState);

  // 투수 기록 더미 데이터 (30개)
  const [initialPitcherStats] = useRecoilState(initialPitcherStatsState);

  // 기본 정렬 기준: 타자 기록은 안타 개수("hits"), 투수 기록은 삼진("so")
  const [hitterData, setHitterData] = useState(
    [...initialHitterStats].sort((a, b) => b.hits - a.hits)
  );
  const [pitcherData, setPitcherData] = useState(
    [...initialPitcherStats].sort((a, b) => b.so - a.so)
  );
  const [hitterSortKey, setHitterSortKey] = useState("hits");
  const [pitcherSortKey, setPitcherSortKey] = useState("so");

  const handleSortHitter = (key) => {
    setHitterSortKey(key);
    const sortedData = [...hitterData].sort((a, b) => b[key] - a[key]);
    setHitterData(sortedData);
  };

  const handleSortPitcher = (key) => {
    setPitcherSortKey(key);
    const sortedData = [...pitcherData].sort((a, b) => b[key] - a[key]);
    setPitcherData(sortedData);
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
              <th style={{ width: "90px" }}>선수</th>
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
              return hitterData.slice(0, 5).map((item, index) => {
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
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {/* 첫번째 더보기 버튼: Next.js Link 태그 사용 */}
        <Link href="/playerStats/playerStatsBatterDetail">
          <MoreButton>더보기</MoreButton>
        </Link>
      </div>

      {/* 투수기록 섹션 */}
      <TableWrapper>
        <TableTitle>투수기록</TableTitle>
        <RankingTableP>
          <thead>
            <tr>
              <th>순위</th>
              <th style={{ width: "90px" }}>선수</th>
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
              return pitcherData.slice(0, 5).map((item, index) => {
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
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {/* 두번째 더보기 버튼: Next.js Link 태그 사용 */}
        <Link href="/playerStats/playerStatsPitcherDetail">
          <MoreButton>더보기</MoreButton>
        </Link>
      </div>
    </RankingContainer>
  );
}
