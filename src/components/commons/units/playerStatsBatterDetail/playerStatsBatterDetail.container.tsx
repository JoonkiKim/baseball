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
  /* ▼ / ▲ 표기를 결정하는 유틸 */
  const getArrow = (currentKey: string, columnKey: string) =>
    currentKey === columnKey ? "▼" : "▲";
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
  useEffect(() => {
    hitterData.forEach((p) => {
      if (p.PA >= p.teamGameCount * 2) {
        console.log(
          `${p.playerName} (${p.teamName}) — PA: ${p.PA}, teamGameCount: ${p.teamGameCount}`
        );
      }
    });
  }, [hitterData]);

  type HitterNumericKey =
    | "AB"
    | "H"
    | "2B"
    | "3B"
    | "HR"
    | "BB"
    | "AVG"
    | "OBP"
    | "SLG"
    | "OPS";

  // 정렬 핸들러
  const handleSortHitter = (key: HitterNumericKey) => {
    setHitterSortKey(key);
    const sorted = [...hitterData].sort(
      (a, b) =>
        // 이제 key가 숫자 타입만 보장하므로 빼기가 가능합니다
        (b[key] as number) - (a[key] as number)
    );
    setHitterData(sorted);
  };

  // AVG, OBP, SLG, OPS 정렬 시에만 PA 필터 적용
  const isRateKey = ["AVG", "OBP", "SLG", "OPS"].includes(
    hitterSortKey as string
  );
  console.log("전체 선수 수:", hitterData.length);
  const filtered = hitterData.filter((p) => p.PA >= p.teamGameCount * 2);
  console.log("비율키 정렬 적용 후 남은 선수 수:", filtered.length);
  console.table(
    filtered.map((p) => ({
      name: p.playerName,
      PA: p.PA,
      teamGC: p.teamGameCount,
    }))
  );

  return (
    <RankingContainer>
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
              <th onClick={() => handleSortHitter("2B")}>
                2루타 <ArrowIcon>{getArrow(hitterSortKey, "2B")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("3B")}>
                3루타 <ArrowIcon>{getArrow(hitterSortKey, "3B")}</ArrowIcon>
              </th>
              <th onClick={() => handleSortHitter("HR")}>
                홈런 <ArrowIcon>{getArrow(hitterSortKey, "HR")}</ArrowIcon>
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
                    <td>{item["2B"]}</td>
                    <td>{item["3B"]}</td>
                    <td>{item.HR}</td>
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
