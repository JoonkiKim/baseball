import React from "react";
import {
  GroupSelectorContainer,
  GroupSelector,
  RankingTable,
  TableWrapper,
  RankingContainer,
} from "./rankingTable.style";

export default function RankingTableComponent() {
  return (
    <RankingContainer>
      {/* 그룹 선택 영역 */}
      <GroupSelectorContainer>
        <GroupSelector>A조</GroupSelector>
      </GroupSelectorContainer>

      {/* 표 영역 */}
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
            <tr>
              <td>1</td>
              <td>관악사</td>
              <td>3</td>
              <td>3</td>
              <td>0</td>
              <td>0</td>
            </tr>
            <tr>
              <td>2</td>
              <td>자연대</td>
              <td>3</td>
              <td>2</td>
              <td>0</td>
              <td>1</td>
            </tr>
            <tr>
              <td>3</td>
              <td>공대</td>
              <td>3</td>
              <td>1</td>
              <td>0</td>
              <td>2</td>
            </tr>
            <tr>
              <td>4</td>
              <td>건환공</td>
              <td>3</td>
              <td>0</td>
              <td>0</td>
              <td>3</td>
            </tr>
          </tbody>
        </RankingTable>
      </TableWrapper>
    </RankingContainer>
  );
}
