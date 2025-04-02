import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import {
  Container,
  Title,
  PlayerList,
  PlayerRow,
  OrderNumber,
  NameWrapper,
  PlayerNameInput,
  SearchIcon,
  PositionWrapper,
  PositionText,
  PositionDropdown,
  NextButton,
  LargeTitle,
  ControlButton,
  WildCardBox,
  NoWildCardBox,
  NoWildCardBoxL,
  SuggestionList,
  SuggestionItem,
} from "./teamRegistration.style";
import RecordStartModal from "../../modals/recordStart";
import PlayerSelectionModal from "../../modals/playerSelectionModal";
import { playerListState } from "../../../../commons/stores/index";
import styled from "@emotion/styled";

interface PlayerInfo {
  order: number | string;
  name?: string;
  position?: string;
  // 추가: 돋보기 버튼(모달)로 선택되었는지 여부
  selectedViaModal?: boolean;
}

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

  // 1. 로컬 선수 데이터 - 초기에는 1~9번만 있고, "P"행은 없음
  const [players, setPlayers] = useState<PlayerInfo[]>([
    { order: 1, selectedViaModal: false },
    { order: 2, selectedViaModal: false },
    { order: 3, selectedViaModal: false },
    { order: 4, selectedViaModal: false },
    { order: 5, selectedViaModal: false },
    { order: 6, selectedViaModal: false },
    { order: 7, selectedViaModal: false },
    { order: 8, selectedViaModal: false },
    { order: 9, selectedViaModal: false },
  ]);

  // 2. react-hook-form 세팅
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      players: players.map((player) => ({ name: player.name || "" })),
    },
  });

  // 3. 포지션 드롭다운 관련 상태
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };

  const handlePositionSelect = (index: number, pos: string) => {
    // 현재 선수 목록 복사 및 해당 행 업데이트
    let updatedPlayers = [...players];
    updatedPlayers[index].position = pos;

    // DH가 선택된 행이 하나라도 있는지 확인 (order가 숫자인 행만 확인)
    const hasDH = updatedPlayers.some(
      (player) => player.position === "DH" && typeof player.order === "number"
    );

    // 이미 "P"행이 있는지 여부 확인
    const hasP = updatedPlayers.some((player) => player.order === "P");

    if (hasDH && !hasP) {
      // DH가 선택되었고, 아직 "P"행이 없다면 "P"행 추가
      updatedPlayers = [
        ...updatedPlayers,
        { order: "P", selectedViaModal: false },
      ];
    } else if (!hasDH && hasP) {
      // DH가 없는 경우, 만약 기존에 "P"행이 있다면 제거
      updatedPlayers = updatedPlayers.filter((player) => player.order !== "P");
    }

    setPlayers(updatedPlayers);
    setOpenPositionRow(null);
  };

  // 4. 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] =
    useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );

  // 5. 현재 활성화된 추천 목록의 인덱스 상태
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  // 6. Recoil 전역 상태에서 playerList 불러오기
  const [globalPlayerList] = useRecoilState(playerListState);

  // 입력 텍스트와 일치하는 부분을 빨간색으로 표시하는 헬퍼 함수
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} style={{ color: "red" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // 돋보기 버튼(모달)로 선수 선택 후, 해당 행은 모달 선택 상태로 업데이트
  const handleSelectPlayer = (playerName: string) => {
    if (selectedPlayerIndex === null) return;
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].name = playerName;
    updatedPlayers[selectedPlayerIndex].selectedViaModal = true;
    setPlayers(updatedPlayers);
    setValue(`players.${selectedPlayerIndex}.name`, playerName);
    setIsPlayerSelectionModalOpen(false);
    setSelectedPlayerIndex(null);
  };

  // 입력창에 변경이 생기면, 해당 행은 수동 입력 상태로 전환(모달 선택 해제)
  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].selectedViaModal = false;
    setPlayers(updatedPlayers);
  };

  // 폼 제출 시
  const onSubmit = (data: any) => {
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      name: data.players[index].name,
    }));
    setPlayers(updatedPlayers);
    setIsModalOpen(true);
  };

  // (A) 검색 아이콘 클릭 시 선수 선택 모달 열기
  const handleOpenPlayerModal = (index: number) => {
    setSelectedPlayerIndex(index);
    setIsPlayerSelectionModalOpen(true);
  };

  // 전체 폼의 선수명 배열 (중복 체크용)
  const formPlayers = watch("players") || [];
  const selectedPlayerNames = formPlayers
    .map((player) => player.name)
    .filter((name) => name.trim() !== "");

  return (
    <Container onClick={() => setOpenPositionRow(null)}>
      <LargeTitle>라인업을 등록해주세요</LargeTitle>
      <Title>관악사 야구부</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PlayerList>
          {players.map((player, index) => {
            // 현재 입력값
            const currentName = watch(`players.${index}.name`) || "";
            // 이전 행의 선수명이 입력되었는지 확인 (첫 행은 항상 활성)
            const prevName =
              index === 0 ? "dummy" : watch(`players.${index - 1}.name`) || "";
            const isRowEnabled = index === 0 || prevName.trim() !== "";

            // 전역 playerList에서 입력값을 포함하는 선수 필터링 (대소문자 무시)
            const filteredSuggestions = globalPlayerList.filter((p) => {
              const pName = p.name;
              const matchesQuery = pName
                .toLowerCase()
                .includes(currentName.toLowerCase());
              const isAlreadySelected = formPlayers.some(
                (item, idx) =>
                  idx !== index &&
                  item.name &&
                  item.name.toLowerCase() === pName.toLowerCase()
              );
              return matchesQuery && !isAlreadySelected;
            });

            const isPositionEmpty = !player.position;

            // globalPlayerList에서 현재 입력된 이름과 일치하는 선수 찾기
            const globalPlayer = globalPlayerList.find(
              (p) => p.name === currentName
            );

            return (
              <PlayerRow key={`${player.order}-${index}`}>
                <OrderNumber>{player.order}</OrderNumber>
                <NameWrapper
                  style={{ position: "relative" }}
                  hasValue={!!currentName}
                >
                  {currentName && <NoWildCardBoxL />}
                  <PlayerNameInput
                    {...register(`players.${index}.name`, {
                      onChange: (e) => {
                        if (isRowEnabled) {
                          handleInputChange(index, e);
                        }
                      },
                    })}
                    placeholder="선수명 입력"
                    onFocus={() => {
                      if (isRowEnabled) {
                        setActiveSuggestionIndex(index);
                      }
                    }}
                    autoComplete="off"
                  />
                  {currentName ? (
                    globalPlayer &&
                    globalPlayer.wc &&
                    globalPlayer.wc.includes("WC") ? (
                      <WildCardBox>WC</WildCardBox>
                    ) : (
                      <NoWildCardBox />
                    )
                  ) : (
                    <SearchIcon
                      src="/images/magnifier.png"
                      alt="Search Icon"
                      onClick={() => {
                        if (isRowEnabled) {
                          handleOpenPlayerModal(index);
                        }
                      }}
                    />
                  )}
                  {activeSuggestionIndex === index &&
                    !player.selectedViaModal &&
                    currentName &&
                    filteredSuggestions.length > 0 && (
                      <SuggestionList>
                        {filteredSuggestions.map((suggestion, idx) => (
                          <SuggestionItem
                            key={idx}
                            onClick={() => {
                              setValue(
                                `players.${index}.name`,
                                suggestion.name
                              );
                              setActiveSuggestionIndex(null);
                            }}
                          >
                            {highlightText(suggestion.name, currentName)}
                          </SuggestionItem>
                        ))}
                      </SuggestionList>
                    )}
                </NameWrapper>

                {/* order가 "P"인 경우에는 포지션 선택 칸을 렌더링하지 않음 */}
                {player.order !== "P" ? (
                  <PositionWrapper
                    onClick={(e) => {
                      if (isRowEnabled) {
                        e.stopPropagation();
                        handlePositionClick(index);
                      }
                    }}
                  >
                    <PositionText isPlaceholder={isPositionEmpty}>
                      {isPositionEmpty ? "포지션 입력 ▽" : player.position}
                    </PositionText>
                    {openPositionRow === index && (
                      <PositionDropdown onClick={(e) => e.stopPropagation()}>
                        {positionOptions.map((pos) => (
                          <li
                            key={pos}
                            onClick={(e) => {
                              if (isRowEnabled) {
                                e.stopPropagation();
                                handlePositionSelect(index, pos);
                              }
                            }}
                          >
                            {pos}
                          </li>
                        ))}
                      </PositionDropdown>
                    )}
                  </PositionWrapper>
                ) : (
                  <PositionWrapper>
                    <PositionText>{player.order}</PositionText>
                  </PositionWrapper>
                )}
              </PlayerRow>
            );
          })}
        </PlayerList>
        <ControlButton type="submit">제출하기</ControlButton>
      </form>

      {isModalOpen && <RecordStartModal setIsModalOpen={setIsModalOpen} />}
      {isPlayerSelectionModalOpen && (
        <PlayerSelectionModal
          setIsModalOpen={setIsPlayerSelectionModalOpen}
          onSelectPlayer={handleSelectPlayer}
          selectedPlayerNames={selectedPlayerNames}
        />
      )}
    </Container>
  );
}
