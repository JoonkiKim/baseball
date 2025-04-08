import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import {
  Container,
  Title,
  PlayerList,
  PlayerRow,
  BlankPlayerRow,
  OrderNumber,
  NameWrapper,
  InputWrapper,
  PlayerNameInput,
  SearchIcon,
  PositionWrapper,
  PositionText,
  PositionDropdown,
  ControlButton,
  LargeTitle,
  WildCardBox,
  ArrowIcon,
  SuggestionList,
  SuggestionItem,
  ButtonWrapper,
  ArrowIconNone,
  PitcherPositionText,
} from "./teamRegistration.style";
import RecordStartModal from "../../modals/recordStart";
import PlayerSelectionModal from "../../modals/playerSelectionModal";
import { playerListState } from "../../../../commons/stores/index";

interface PlayerInfo {
  order: number | string;
  name?: string;
  position?: string;
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

  // 초기 선수 배열에 "P" 행을 추가하여 항상 자리 유지
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

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      players: players.map((player) => ({ name: player.name || "" })),
    },
  });

  // 포지션 드롭다운 관련 상태
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };

  // 단순히 포지션 업데이트만 수행
  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;
    setPlayers(updatedPlayers);
    setOpenPositionRow(null);
  };

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] =
    useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );

  // 추천 목록 활성 인덱스 상태
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  // Recoil 전역 상태에서 playerList 불러오기
  const [globalPlayerList] = useRecoilState(playerListState);

  // 헬퍼: 입력 텍스트와 일치하는 부분 빨간색 표시
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

  // 돋보기 버튼(모달)로 선수 선택 후 해당 행 업데이트
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

  // 입력창 변경 시 해당 행은 수동 입력 상태로 전환
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

  // 검색 아이콘 클릭 시 선수 선택 모달 열기
  const handleOpenPlayerModal = (index: number) => {
    setSelectedPlayerIndex(index);
    setIsPlayerSelectionModalOpen(true);
  };

  // 전체 폼의 선수명 배열 (중복 체크용)
  const formPlayers = watch("players") || [];
  const selectedPlayerNames = formPlayers
    .map((player) => player.name)
    .filter((name) => name.trim() !== "");

  // P 행 렌더링 여부: DH가 선택된 선수가 있는지 (P 행 제외)
  const hasDHOverall = players
    .filter((p) => p.order !== "P")
    .some((p) => p.position === "DH");

  return (
    <Container onClick={() => setOpenPositionRow(null)}>
      <LargeTitle>라인업을 등록해주세요</LargeTitle>
      <Title>관악사 야구부</Title>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <PlayerList style={{ flexGrow: 1 }}>
          {players.map((player, index) => {
            if (player.order === "P" && !hasDHOverall) {
              return <BlankPlayerRow key={`${player.order}-${index}`} />;
            }

            const currentName = watch(`players.${index}.name`) || "";
            // index가 0이 아닌 경우 이전 row의 선수명과 포지션 모두 체크
            const prevName =
              index === 0 ? "dummy" : watch(`players.${index - 1}.name`) || "";
            const prevPosition =
              index === 0 ? "dummy" : players[index - 1].position || "";
            const isRowEnabled =
              index === 0 ||
              (prevName.trim() !== "" && prevPosition.trim() !== "");

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
            const globalPlayer = globalPlayerList.find(
              (p) => p.name === currentName
            );

            return (
              <PlayerRow key={`${player.order}-${index}`}>
                <OrderNumber>{player.order}</OrderNumber>
                <NameWrapper hasValue={!!currentName}>
                  <InputWrapper hasValue={!!currentName}>
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
                      disabled={!isRowEnabled} // 이전 row가 완성되지 않은 경우 입력 불가
                    />
                    {currentName &&
                      (globalPlayer &&
                      globalPlayer.wc &&
                      globalPlayer.wc.includes("WC") ? (
                        <WildCardBox>WC</WildCardBox>
                      ) : (
                        <div></div>
                      ))}
                  </InputWrapper>
                  <SearchIcon
                    src="/images/magnifier.png"
                    alt="Search Icon"
                    onClick={() => {
                      if (isRowEnabled) {
                        handleOpenPlayerModal(index);
                      }
                    }}
                  />
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
                      {isPositionEmpty ? (
                        <>
                          <ArrowIconNone>▽</ArrowIconNone>
                          포지션 입력
                          <ArrowIcon>▽</ArrowIcon>
                        </>
                      ) : (
                        <>
                          <ArrowIconNone>▽</ArrowIconNone>
                          {player.position}
                          <ArrowIconNone>▽</ArrowIconNone>
                        </>
                      )}
                    </PositionText>
                    {openPositionRow === index && (
                      <PositionDropdown
                        dropUp={
                          typeof player.order === "number" && player.order >= 6
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
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
                    <PitcherPositionText>{"P"}</PitcherPositionText>
                  </PositionWrapper>
                )}
              </PlayerRow>
            );
          })}
        </PlayerList>
        <ButtonWrapper>
          <ControlButton type="submit">제출하기</ControlButton>
        </ButtonWrapper>
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
