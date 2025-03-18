import React, { useState } from "react";
import Router, { useRouter } from "next/router";
import {
  Container,
  Title,
  PlayerList,
  PlayerRow,
  OrderNumber,
  NameWrapper,
  PlayerName,
  SearchIcon,
  PositionWrapper,
  PositionText,
  PositionDropdown,
  NextButton,
} from "./teamRegistration.style";

interface PlayerInfo {
  order: number | string;
  name?: string; // 선수명
  position?: string; // 포지션
}

// 포지션 리스트
const positionOptions = [
  "CF",
  "LF",
  "RF",
  "SS",
  "1B",
  "2B",
  "3B",
  "C",
  "DH",
  "P",
];

export default function TeamRegistrationPageComponent() {
  const router = useRouter();
  // 예시 데이터 (타순 1~9, P)
  const [players, setPlayers] = useState<PlayerInfo[]>([
    { order: 1 },
    { order: 2 },
    { order: 3 },
    { order: 4 },
    { order: 5 },
    { order: 6 },
    { order: 7 },
    { order: 8 },
    { order: 9 },
    { order: "P" },
  ]);

  // 어떤 행(인덱스)의 포지션 드롭다운이 열려있는지 추적 (없으면 null)
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);

  // "포지션 입력 ▼" 클릭 시 드롭다운 열고/닫기
  const handlePositionClick = (index: number) => {
    // 이미 열려있으면 닫고, 아니면 해당 index로 열기
    setOpenPositionRow(openPositionRow === index ? null : index);
  };

  // 포지션 선택 시 해당 플레이어 정보 업데이트
  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;
    setPlayers(updatedPlayers);
    // 선택 후 드롭다운 닫기
    setOpenPositionRow(null);
  };

  // "다음" 버튼 클릭 시
  const handleNext = () => {
    router.push("/records");
    alert("다음 단계로 이동합니다.");
  };

  return (
    <Container>
      <Title>관악사 야구부</Title>

      <PlayerList>
        {players.map((player, index) => {
          const isNameEmpty = !player.name; // 선수명 미입력 상태
          const isPositionEmpty = !player.position; // 포지션 미입력 상태

          return (
            <PlayerRow key={`${player.order}-${index}`}>
              {/* 타순 번호 */}
              <OrderNumber>{player.order}</OrderNumber>

              {/* 선수명 + 돋보기 아이콘 */}
              <NameWrapper>
                <PlayerName isPlaceholder={isNameEmpty}>
                  {isNameEmpty ? "선수명 입력" : player.name}
                </PlayerName>
                {/* 돋보기 아이콘 (미등록 상태일 때만 표시) */}
                {isNameEmpty && (
                  <SearchIcon
                    src="/images/magnifier.png"
                    alt="Search Icon"
                    onClick={() => alert(`${player.order}번 선수 검색`)}
                  />
                )}
              </NameWrapper>

              {/* 포지션 영역 (클릭 시 드롭다운 열림/닫힘) */}
              <PositionWrapper onClick={() => handlePositionClick(index)}>
                <PositionText isPlaceholder={isPositionEmpty}>
                  {isPositionEmpty ? "포지션 입력 ▼" : player.position}
                </PositionText>
                {/* 드롭다운: 해당 row가 열려있을 때만 표시 */}
                {openPositionRow === index && (
                  <PositionDropdown>
                    {positionOptions.map((pos) => (
                      <li
                        key={pos}
                        onClick={(e) => {
                          // 부모 onClick 버블링 방지
                          e.stopPropagation();
                          handlePositionSelect(index, pos);
                        }}
                      >
                        {pos}
                      </li>
                    ))}
                  </PositionDropdown>
                )}
              </PositionWrapper>
            </PlayerRow>
          );
        })}
      </PlayerList>

      {/* 하단 버튼 */}
      <NextButton onClick={handleNext}>다음</NextButton>
    </Container>
  );
}
