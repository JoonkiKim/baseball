import React, { useEffect, useState } from "react";
import {
  GroupSelectorContainer,
  GroupSelector,
  RankingTable,
  TableWrapper,
  RankingContainer,
} from "./rankingTable.style";

import axios from "axios";

export default function RankingTableComponent() {
  // 그룹별 데이터 배열
  const [groupData, setGroupData] = useState<any>(null);

  useEffect(() => {
    // 그룹 A 데이터를 요청
    axios
      .get(
        "https://c7356d20-9a2a-4d0e-b490-8726df0cff4a.mock.pstmn.io/teams/grouped",
        {
          params: { group: "C" },
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log("✅ 그룹 응답:", res.data);
        setGroupData(res.data);
      })
      .catch((err) => {
        console.error("❌ 그룹 요청 에러:", err);
      });
  }, []);

  const groups = [
    {
      groupName: "A조",
      rankingData: [
        { rank: 1, teamName: "관악사", games: 3, wins: 3, draws: 0, losses: 0 },
        { rank: 2, teamName: "자연대", games: 3, wins: 2, draws: 0, losses: 1 },
        { rank: 3, teamName: "공대", games: 3, wins: 1, draws: 0, losses: 2 },
        { rank: 4, teamName: "건환공", games: 3, wins: 0, draws: 0, losses: 3 },
      ],
    },
    {
      groupName: "B조",
      rankingData: [
        { rank: 1, teamName: "팀B1", games: 4, wins: 3, draws: 0, losses: 1 },
        { rank: 2, teamName: "팀B2", games: 4, wins: 2, draws: 1, losses: 1 },
        { rank: 3, teamName: "팀B3", games: 4, wins: 1, draws: 1, losses: 2 },
        { rank: 4, teamName: "팀B4", games: 4, wins: 0, draws: 0, losses: 4 },
      ],
    },
    {
      groupName: "C조",
      rankingData: [
        { rank: 1, teamName: "팀C1", games: 5, wins: 4, draws: 0, losses: 1 },
        { rank: 2, teamName: "팀C2", games: 5, wins: 3, draws: 0, losses: 2 },
        { rank: 3, teamName: "팀C3", games: 5, wins: 2, draws: 1, losses: 2 },
        { rank: 4, teamName: "팀C4", games: 5, wins: 1, draws: 0, losses: 4 },
      ],
    },
  ];

  return (
    <RankingContainer>
      <div
        style={{
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          marginBottom: "100px",
        }}
      >
        {groups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <GroupSelectorContainer>
              <GroupSelector>{group.groupName}</GroupSelector>
            </GroupSelectorContainer>
            <TableWrapper>
              <RankingTable>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>팀명</th>
                    <th>경기수</th>
                    <th>승</th>
                    <th>무</th>
                    <th>패</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rankingData.map((team, index) => (
                    <tr key={index}>
                      <td>{team.rank}</td>
                      <td>{team.teamName}</td>
                      <td>{team.games}</td>
                      <td>{team.wins}</td>
                      <td>{team.draws}</td>
                      <td>{team.losses}</td>
                    </tr>
                  ))}
                </tbody>
              </RankingTable>
            </TableWrapper>
          </div>
        ))}
      </div>
    </RankingContainer>
  );
}
