import React, { useEffect } from "react";
import Link from "next/link";

import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  RankingTableP,
  TableTitle,
  ArrowIcon,
  MoreButton,
} from "./playerStats.style";
import { useRecoilState } from "recoil";
import {
  hitterStatsState,
  pitcherStatsState,
} from "../../../../commons/stores";
import API from "../../../../commons/apis/api";

export default function StatsPage() {
  /* ▼ / ▲ 표기를 결정하는 유틸 */
  const getArrow = (currentKey: string, columnKey: string) =>
    currentKey === columnKey ? "▼" : "▲";
  // 타자 기록 데이터를 전역 Recoil 스테이트에 저장 (초기값은 빈 배열)
  const [hitterData, setHitterData] = useRecoilState(hitterStatsState);
  // 초기 정렬 기준: 안타("H") 기준 내림차순 정렬
  const [hitterSortKey, setHitterSortKey] = React.useState("H");

  // 투수 기록 데이터를 전역 Recoil 스테이트에 저장 (초기값은 빈 배열)
  const [pitcherData, setPitcherData] = useRecoilState(pitcherStatsState);
  // 초기 정렬 기준: 삼진("K") 기준 내림차순 정렬
  const [pitcherSortKey, setPitcherSortKey] = React.useState("K");

  // 타자 기록 API 호출 및 Recoil 스테이트 업데이트
  useEffect(() => {
    const fetchBatters = async () => {
      try {
        const response = await API.get("/records/batters");
        // 응답: { count: 30, batters: [ ... ] }
        const sortedData = response.data.batters.sort((a, b) => b.H - a.H);
        setHitterData(sortedData);
      } catch (error) {
        console.error("Error fetching hitter stats:", error);
      }
    };
    fetchBatters();
  }, [setHitterData]);

  // 투수 기록 API 호출 및 Recoil 스테이트 업데이트
  useEffect(() => {
    const fetchPitchers = async () => {
      try {
        const response = await API.get("/records/pitchers");
        // 응답: { count: 30, pitchers: [ ... ] }
        const sortedData = response.data.pitchers.sort((a, b) => b.K - a.K);
        setPitcherData(sortedData);
      } catch (error) {
        console.error("Error fetching pitcher stats:", error);
      }
    };
    fetchPitchers();
  }, [setPitcherData]);

  // 타자 기록 정렬 핸들러 (Recoil 스테이트 업데이트)
  const handleSortHitter = (key) => {
    setHitterSortKey(key);
    const sortedData = [...hitterData].sort((a, b) => b[key] - a[key]);
    setHitterData(sortedData);
  };

  // 투수 기록 정렬 핸들러 (Recoil 스테이트 업데이트)
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

              <th onClick={() => handleSortHitter("AB")}>
                타수 <ArrowIcon>{getArrow(hitterSortKey, "AB")}</ArrowIcon>
              </th>

              <th onClick={() => handleSortHitter("H")}>
                안타 <ArrowIcon>{getArrow(hitterSortKey, "H")}</ArrowIcon>
              </th>

              <th onClick={() => handleSortHitter("AVG")}>
                타율 <ArrowIcon>{getArrow(hitterSortKey, "AVG")}</ArrowIcon>
              </th>

              <th onClick={() => handleSortHitter("BB")}>
                볼넷 <ArrowIcon>{getArrow(hitterSortKey, "BB")}</ArrowIcon>
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
              let prevValue = null;
              // 예시로 상위 5개만 노출 (필요에 따라 조정)
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
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
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
              <th onClick={() => handleSortPitcher("K")}>
                삼진 <ArrowIcon>{getArrow(pitcherSortKey, "K")}</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue = null;
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
                    <td>{item.K}</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </RankingTableP>
      </TableWrapper>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Link href="/playerStats/playerStatsPitcherDetail">
          <MoreButton>더보기</MoreButton>
        </Link>
      </div>
    </RankingContainer>
  );
}
