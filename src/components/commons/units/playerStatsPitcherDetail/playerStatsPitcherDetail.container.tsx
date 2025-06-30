import React, { useState, useEffect } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTableP,
  TableTitle,
  ArrowIcon,
} from "./playerStatsPitcherDetail.style"; // 스타일 임포트
import { useRecoilState } from "recoil";
import { pitcherStatsState } from "../../../../commons/stores";
import { ArrowIconNone } from "../playerStats/playerStats.style";

export default function StatsPagePitcherDetail() {
  // Recoil의 pitcherStatsState에서 투수 기록 데이터를 불러옴
  // const [pitcherStats] = useRecoilState(pitcherStatsState);

  const pitcherStats = [
    { playerName: "김민수", teamName: "관악사", K: 12 },
    { playerName: "이준호", teamName: "포톤스", K: 10 },
    { playerName: "박지훈", teamName: "자연대", K: 8 },
    { playerName: "최유진", teamName: "사회대", K: 8 },
    { playerName: "정수빈", teamName: "공대", K: 9 },
    { playerName: "한지민", teamName: "사범대", K: 11 },
    { playerName: "장민호", teamName: "키움", K: 7 },
    { playerName: "오세훈", teamName: "삼성", K: 10 },
    { playerName: "윤지우", teamName: "관악사", K: 8 },
    { playerName: "배진영", teamName: "포톤스", K: 9 },
    { playerName: "서지훈", teamName: "자연대", K: 12 },
    { playerName: "문지훈", teamName: "사회대", K: 6 },
    { playerName: "조현우", teamName: "공대", K: 8 },
    { playerName: "양지민", teamName: "사범대", K: 10 },
    { playerName: "홍예진", teamName: "키움", K: 9 },
    { playerName: "임수정", teamName: "삼성", K: 11 },
    { playerName: "권혁진", teamName: "관악사", K: 7 },
    { playerName: "정윤호", teamName: "포톤스", K: 8 },
    { playerName: "이하은", teamName: "자연대", K: 9 },
    { playerName: "박시은", teamName: "사회대", K: 10 },
    { playerName: "노윤서", teamName: "공대", K: 11 },
    { playerName: "강하늘", teamName: "사범대", K: 7 },
    { playerName: "김서윤", teamName: "키움", K: 8 },
    { playerName: "이채은", teamName: "삼성", K: 9 },
    { playerName: "조윤호", teamName: "관악사", K: 10 },
    { playerName: "신채원", teamName: "포톤스", K: 11 },
    { playerName: "황정민", teamName: "자연대", K: 7 },
    { playerName: "백승우", teamName: "사회대", K: 8 },
    { playerName: "서지민", teamName: "공대", K: 9 },
    { playerName: "남도현", teamName: "사범대", K: 10 },
  ];

  // 로컬 상태에서 정렬된 데이터를 관리 (초기 정렬 기준: 삼진(K))
  const [pitcherData, setPitcherData] = useState(
    [...pitcherStats].sort((a, b) => b.K - a.K)
  );
  const [pitcherSortKey, setPitcherSortKey] = useState("K");

  // Recoil state가 변경될 때 로컬 정렬 데이터 업데이트
  useEffect(() => {
    const sortedData = [...pitcherStats].sort((a, b) => b.K - a.K);
    setPitcherData(sortedData);
  }, []);

  // 투수 기록 정렬 함수 (내림차순)
  const handleSortPitcher = (key: string) => {
    setPitcherSortKey(key);
    const sortedData = [...pitcherData].sort(
      (a, b) => (b[key] as number) - (a[key] as number)
    );
    setPitcherData(sortedData);
  };

  return (
    <RankingContainer>
      {/* 투수기록 섹션 */}
      <TableTitle>투수기록</TableTitle>
      <TableWrapper>
        <RankingTableP>
          <thead>
            <tr>
              <th>순위</th>
              <th style={{ width: "25vw", textAlign: "left" }}>선수</th>
              <th
                onClick={() => handleSortPitcher("K")}
                style={{ textAlign: "left" }}
              >
                삼진 <ArrowIcon>▼</ArrowIcon>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let currentRank = 1;
              let tieCount = 0;
              let prevValue: number | null = null;
              // 상위 20개만 노출
              return pitcherData.slice(0, 20).map((item, index) => {
                const currentValue = item[pitcherSortKey] as number;
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
                    <td style={{ textAlign: "left" }}>
                      {item.playerName} ({item.teamName.slice(0, 3)})
                    </td>
                    <td style={{ textAlign: "left" }}>
                      {item.K} <ArrowIconNone> ▽ </ArrowIconNone>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </RankingTableP>
      </TableWrapper>
    </RankingContainer>
  );
}
