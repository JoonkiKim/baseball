import React, { useState } from "react";
import {
  RankingContainer,
  SortButtonWrapper,
  SortButton,
  TableWrapper,
  RankingTable,
} from "./playerStats.style";

interface PlayerData {
  rank: number;
  name: string;
  team: string;
  hits: number;
  doubles: number;
  avg: number;
}

export default function RankingHitterStatsPage() {
  // 정렬 기준 상태 (예시)
  const [sortBy, setSortBy] = useState("타자");
  const [sortBy2, setSortBy2] = useState("안타");

  // 예시 데이터
  const data: PlayerData[] = [
    {
      rank: 1,
      name: "박병호",
      team: "관악사",
      hits: 3,
      doubles: 1,
      avg: 0.312,
    },
    {
      rank: 2,
      name: "김지찬",
      team: "관악사",
      hits: 3,
      doubles: 1,
      avg: 0.312,
    },
    {
      rank: 3,
      name: "이재현",
      team: "관악사",
      hits: 3,
      doubles: 1,
      avg: 0.312,
    },
    {
      rank: 4,
      name: "이정후",
      team: "관악사",
      hits: 3,
      doubles: 1,
      avg: 0.312,
    },
    {
      rank: 5,
      name: "박병호",
      team: "관악사",
      hits: 3,
      doubles: 1,
      avg: 0.312,
    },
    {
      rank: 6,
      name: "박병호",
      team: "관악사",
      hits: 3,
      doubles: 1,
      avg: 0.312,
    },
  ];

  // 버튼 클릭 시 정렬 기준을 변경 (실제 정렬 로직은 상황에 맞게 추가)
  const handleSortBy = (type: string) => {
    if (type === "타자") {
      setSortBy("타자");
      // 예) data.sort( ... )
    } else if (type === "안타") {
      setSortBy2("안타");
      // 예) data.sort( ... )
    }
  };

  return (
    <RankingContainer>
      {/* 상단 정렬 버튼 */}
      <SortButtonWrapper>
        <SortButton onClick={() => handleSortBy("타자")}>{sortBy} ▼</SortButton>
        <SortButton onClick={() => handleSortBy("안타")}>
          {sortBy2} ▼
        </SortButton>
      </SortButtonWrapper>

      {/* 통계 테이블 */}
      <TableWrapper>
        <RankingTable>
          <thead>
            <tr>
              <th>순위</th>
              <th>선수</th>
              <th>소속</th>
              <th>안타</th>
              <th>2루타</th>
              <th>타율</th>
            </tr>
          </thead>
          <tbody>
            {data.map((player, index) => (
              <tr key={index}>
                <td>{player.rank}</td>
                <td>{player.name}</td>
                <td>{player.team}</td>
                <td>{player.hits}</td>
                <td>{player.doubles}</td>
                <td>{player.avg.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </RankingTable>
      </TableWrapper>
    </RankingContainer>
  );
}
