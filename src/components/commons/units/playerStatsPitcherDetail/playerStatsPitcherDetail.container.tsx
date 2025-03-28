import React, { useState } from "react";
import {
  RankingContainer,
  TableWrapper,
  RankingTable,
  MoreButton,
  RankingTableP,
  TableTitle,
  ArrowIcon,
} from "./playerStatsPitcherDetail.style"; // 스타일 임포트

export default function StatsPagePitcherDetail() {
  // 투수 기록 더미 데이터 (30개)
  const initialPitcherStats = [
    { player: "배찬승(관악사)", so: 12 },
    { player: "정현우(공대)", so: 10 },
    { player: "김야구(경영대)", so: 8 },
    { player: "박야구(포토스)", so: 8 },
    { player: "이동원(팀A)", so: 9 },
    { player: "최준혁(팀B)", so: 11 },
    { player: "홍길동(팀C)", so: 7 },
    { player: "김민수(팀D)", so: 10 },
    { player: "박지훈(팀E)", so: 8 },
    { player: "이서윤(팀F)", so: 9 },
    { player: "정민호(팀G)", so: 12 },
    { player: "오세훈(팀H)", so: 6 },
    { player: "강다현(팀I)", so: 8 },
    { player: "유재민(팀J)", so: 10 },
    { player: "서지훈(팀K)", so: 9 },
    { player: "조현우(팀L)", so: 11 },
    { player: "임상혁(팀M)", so: 7 },
    { player: "김태형(팀N)", so: 8 },
    { player: "박정수(팀O)", so: 9 },
    { player: "이승기(팀P)", so: 10 },
    { player: "신동욱(팀Q)", so: 11 },
    { player: "류재원(팀R)", so: 7 },
    { player: "정세훈(팀S)", so: 8 },
    { player: "김유신(팀T)", so: 10 },
    { player: "최성원(팀U)", so: 9 },
    { player: "이광현(팀V)", so: 11 },
    { player: "윤동현(팀W)", so: 7 },
    { player: "한민재(팀X)", so: 8 },
    { player: "오정환(팀Y)", so: 9 },
    { player: "김동현(팀Z)", so: 10 },
  ];

  // 상태 관리: 데이터를 useState로 관리 및 현재 정렬 기준 저장
  const [pitcherData, setPitcherData] = useState(
    [...initialPitcherStats].sort((a, b) => b.so - a.so)
  );
  const [pitcherSortKey, setPitcherSortKey] = useState("so"); // 기본 정렬 기준: 삼진

  // 투수 기록 정렬 함수 (내림차순)
  const handleSortPitcher = (key) => {
    setPitcherSortKey(key);
    const sortedData = [...pitcherData].sort((a, b) => b[key] - a[key]);
    setPitcherData(sortedData);
  };

  return (
    <RankingContainer>
      {/* 투수기록 섹션 */}
      <TableWrapper>
        <TableTitle>투수기록</TableTitle>
        <RankingTableP>
          <thead>
            <tr>
              <th>순위</th>
              <th>선수</th>
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
              return pitcherData.slice(0, 20).map((item, index) => {
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
    </RankingContainer>
  );
}
