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
  /* ▼ / ▲ 표시 결정 유틸 */
  const getArrow = (currentKey: string, columnKey: string) =>
    currentKey === columnKey ? "▼" : "▲";

  // 타자 기록 Recoil
  const [hitterData, setHitterData] = useRecoilState(hitterStatsState);
  const [hitterSortKey, setHitterSortKey] =
    React.useState<keyof (typeof hitterData)[0]>("H");

  // 투수 기록 Recoil
  const [pitcherData, setPitcherData] = useRecoilState(pitcherStatsState);
  const [pitcherSortKey, setPitcherSortKey] =
    React.useState<keyof (typeof pitcherData)[0]>("K");

  // --- 데이터 Fetch ---
  useEffect(() => {
    const fetchBatters = async () => {
      try {
        const res = await API.get("/records/batters");
        const sorted = res.data.batters.sort((a, b) => b.H - a.H);
        setHitterData(sorted);
      } catch (e) {
        console.error("Error fetching hitter stats:", e);
      }
    };
    fetchBatters();
  }, [setHitterData]);

  useEffect(() => {
    const fetchPitchers = async () => {
      try {
        const res = await API.get("/records/pitchers");
        const sorted = res.data.pitchers.sort((a, b) => b.K - a.K);
        setPitcherData(sorted);
      } catch (e) {
        console.error("Error fetching pitcher stats:", e);
      }
    };
    fetchPitchers();
  }, [setPitcherData]);
  // --------------------

  // PA >= teamGameCount * 2 이상인 선수만 콘솔 출력 (디버깅용)
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

  type PitcherNumericKey = "K";
  const handleSortPitcher = (key: PitcherNumericKey) => {
    setPitcherSortKey(key);
    const sorted = [...pitcherData].sort((a, b) => b[key] - a[key]);
    setPitcherData(sorted);
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
      {/* ── 타자기록 ── */}
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
              // 필터링
              const list = isRateKey
                ? hitterData.filter((p) => p.PA >= p.teamGameCount * 2)
                : hitterData;
              let currentRank = 1;
              let tieCount = 0;
              let prevValue: number | null = null;
              return list.slice(0, 5).map((item, idx) => {
                const val = item[hitterSortKey] as number;
                if (idx === 0) {
                  tieCount = 1;
                  prevValue = val;
                } else if (val === prevValue) {
                  tieCount++;
                } else {
                  currentRank += tieCount;
                  tieCount = 1;
                  prevValue = val;
                }
                return (
                  <tr key={idx}>
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
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Link href="/playerStats/playerStatsBatterDetail">
          <MoreButton>더보기</MoreButton>
        </Link>
      </div>

      {/* ── 투수기록 ── */}
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
              let prevValue: number | null = null;
              return pitcherData.slice(0, 5).map((item, idx) => {
                const val = item[pitcherSortKey] as number;
                if (idx === 0) {
                  tieCount = 1;
                  prevValue = val;
                } else if (val === prevValue) {
                  tieCount++;
                } else {
                  currentRank += tieCount;
                  tieCount = 1;
                  prevValue = val;
                }
                return (
                  <tr key={idx}>
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
