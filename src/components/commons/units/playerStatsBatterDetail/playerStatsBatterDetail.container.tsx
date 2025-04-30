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

export default function StatsPageBatterDetail() {
  const getArrow = (currentKey: string, columnKey: string) =>
    currentKey === columnKey ? "▼" : "▲";

  const [hitterStats] = useRecoilState<HitterStat[]>(hitterStatsState);
  const [hitterData, setHitterData] = useState<HitterStat[]>([]);
  const [hitterSortKey, setHitterSortKey] = useState<keyof HitterStat>("H");

  useEffect(() => {
    const sortedData = [...hitterStats].sort((a, b) => b.H - a.H);
    setHitterData(sortedData);
  }, [hitterStats]);
  console.log(hitterData);
  // Rate(비율) 정렬 키인지 체크
  const isRateKey = ["AVG", "OBP", "SLG", "OPS"].includes(
    hitterSortKey as string
  );
  // PA 필터링된 데이터
  const filtered = hitterData.filter((p) => p.PA >= p.teamGameCount * 2);

  type HitterNumericKey =
    | "PA"
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
      <TableWrapper>
        <TableTitle>타자기록</TableTitle>
        <RankingTable>
          <thead>
            <tr>
              <th>순위</th>
              <th style={{ width: "25vw" }}>선수</th>
              <th onClick={() => handleSortHitter("PA")}>
                타수 <ArrowIcon>{getArrow(hitterSortKey, "PA")}</ArrowIcon>
              </th>
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
              // slice 해서 최대 20명까지 출력
              return displayData.slice(0, 20).map((item, index) => {
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
                      {item.playerName} ({item.teamName.slice(0, 3)})
                    </td>
                    <td>{item.PA}</td>
                    <td>{item.AB}</td>
                    <td>{item.H}</td>
                    <td>{item.AVG}</td>
                    <td>{item["2B"]}</td>
                    <td>{item["3B"]}</td>
                    <td>{item.HR}</td>
                    <td>{item.BB}</td>
                    <td>{item.OBP}</td>
                    <td>{item.SLG}</td>
                    <td>{item.OPS}</td>
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
