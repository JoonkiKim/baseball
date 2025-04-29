import React, { useEffect, useState } from "react";
import {
  GroupSelectorContainer,
  GroupSelector,
  RankingTable,
  TableWrapper,
  RankingContainer,
} from "./rankingTable.style";

import API from "../../../../commons/apis/api"; // api.ts에서 axios 인스턴스 가져옴

export default function RankingTableComponent() {
  const [groupData, setGroupData] = useState<Record<string, any[]>>({});

  // 그룹별 팀 정보 가져오는 함수
  const fetchGroupedTeams = async (group: string) => {
    const response = await API.get("/teams/grouped", {
      params: { group },
    });
    // const response = await API.get("/teams/grouped"
    // );
    return response.data;
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // const groups = ["A", "B", "C", "D"];

        const groups = ["A", "B", "C"];

        const results = await Promise.all(
          groups.map((group) => fetchGroupedTeams(group))
        );
        console.log(results);

        const newGroupData: Record<string, any[]> = {};
        groups.forEach((g, i) => {
          newGroupData[g] = results[i][g] || [];
        });

        setGroupData(newGroupData);
      } catch (err) {
        console.error("❌ 그룹 요청 에러:", err);
      }
    };

    fetchGroups();
  }, []);

  const getGroupName = (key: string) => `${key}조`;

  return (
    <RankingContainer>
      <div
        style={{
          // overflowY: "auto",
          marginBottom: "100px",
        }}
      >
        {Object.entries(groupData).map(([groupKey, teams]) => (
          <div key={groupKey}>
            <GroupSelectorContainer>
              <GroupSelector>{getGroupName(groupKey)}</GroupSelector>
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
                  {[...teams]
                    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
                    .map((team: any, index: number) => (
                      <tr key={index}>
                        <td>{team.rank ?? ""}</td>
                        <td>{team.name ?? team.teamName ?? ""}</td>
                        <td>{team.games ?? ""}</td>
                        <td>{team.wins ?? ""}</td>
                        <td>{team.draws ?? ""}</td>
                        <td>{team.losses ?? ""}</td>
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
