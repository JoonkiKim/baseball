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
} from "./gameRecordSub.style";
import RecordStartModal from "../../modals/recordStart";
import PlayerSelectionModal from "../../modals/playerSelectionModal";
import {
  defaultplayerList,
  playerListState,
} from "../../../../commons/stores/index";
import styled from "@emotion/styled";

// 추천 목록 스타일 컴포넌트
const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
`;

const SuggestionItem = styled.li`
  padding: 8px;
  cursor: pointer;
  &:hover {
    background: #f2f2f2;
  }
`;

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

export default function SubstitutionPageComponent() {
  const router = useRouter();
  const [defaultPlayers] = useRecoilState(defaultplayerList);

  // 1. 로컬 선수 데이터 (초기에는 모두 모달 선택 여부 false)
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
    { order: "P", selectedViaModal: false },
  ]);

  // 2. react-hook-form 세팅
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      players: players.map((player, index) => ({
        // 기본 선수명은 defaultPlayers의 값으로 설정 (없으면 빈 문자열)
        name: defaultPlayers[index]?.name || "",
      })),
    },
  });

  // 3. 포지션 드롭다운 관련 상태
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };
  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;
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

  // 폼 제출 시 (교체완료 버튼 클릭 시)
  const onSubmit = (data: any) => {
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      name: data.players[index].name,
    }));
    setPlayers(updatedPlayers);
    // 교체완료 후 "/records" 페이지로 이동
    router.push("/records");
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
      <Title>관악사 야구부</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PlayerList>
          {players.map((player, index) => {
            // 현재 입력값
            const currentName = watch(`players.${index}.name`) || "";
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
                    defaultValue={defaultPlayers[index]?.name}
                    {...register(`players.${index}.name`, {
                      onChange: (e) => handleInputChange(index, e),
                    })}
                    placeholder="선수명 입력"
                    onFocus={() => setActiveSuggestionIndex(index)}
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
                      onClick={() => handleOpenPlayerModal(index)}
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

                <PositionWrapper
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePositionClick(index);
                  }}
                >
                  <PositionText isPlaceholder={isPositionEmpty}>
                    {player.position ||
                      defaultPlayers[index]?.position ||
                      "포지션 입력 ▽"}
                  </PositionText>
                  {openPositionRow === index && (
                    <PositionDropdown onClick={(e) => e.stopPropagation()}>
                      {positionOptions.map((pos) => (
                        <li
                          key={pos}
                          onClick={(e) => {
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
        <ControlButton type="submit">교체완료</ControlButton>
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
