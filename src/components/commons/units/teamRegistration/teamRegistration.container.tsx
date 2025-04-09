import React, { useState, useEffect } from "react";
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
import {
  TeamListState,
  HomeTeamPlayerListState,
  AwayTeamPlayerListState,
  IHAPlayer,
} from "../../../../commons/stores/index";
import API from "../../../../commons/apis/api";

interface PlayerInfo {
  order: number | string;
  name?: string;
  position?: string;
  selectedViaModal?: boolean;
  playerId?: number; // 선택한 선수가 있을 경우 playerId도 저장
}

interface IProps {
  isHomeTeam: boolean;
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

export default function TeamRegistrationPageComponent(props: IProps) {
  const router = useRouter();

  // 페이지 주소에 따라 팀 선수 목록을 불러올 리코일 상태
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );

  // 페이지 주소 변화에 따라 GET 요청 보내기 (JSON 파싱 처리 포함)
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      try {
        if (router.asPath.includes("homeTeamRegistration")) {
          const res = await API.get("/teams/1/players");
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("응답", dataObj);
          setHomeTeamPlayers(dataObj.players);
        } else {
          const res = await API.get("/teams/2/players");
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("응답", dataObj.players);
          setAwayTeamPlayers(dataObj.players);
        }
      } catch (err) {
        console.error("팀 선수 목록 요청 에러:", err);
      }
    };
    fetchTeamPlayers();
  }, [router.asPath, setHomeTeamPlayers, setAwayTeamPlayers]);

  // 제출 중복 방지를 위한 isSubmitting state (초기값 false)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기 선수 배열에 "P"행을 추가하여 항상 자리 유지
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

  // 포지션 선택 시, non‑P 행에서 "P" 포지션 선택 시 P행 업데이트 처리
  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;
    if (pos === "P" && updatedPlayers[index].order !== "P") {
      const nonPRows = updatedPlayers.filter((player) => player.order !== "P");
      const hasDHOverall = nonPRows.some((p) => p.position === "DH");
      if (!hasDHOverall) {
        const pRowIndex = updatedPlayers.findIndex(
          (player) => player.order === "P"
        );
        if (pRowIndex !== -1) {
          updatedPlayers[pRowIndex].name = updatedPlayers[index].name;
          updatedPlayers[pRowIndex].playerId = updatedPlayers[index].playerId;
          updatedPlayers[pRowIndex].selectedViaModal =
            updatedPlayers[index].selectedViaModal;
          setValue(`players.${pRowIndex}.name`, updatedPlayers[index].name);
        }
      }
    }
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

  // Recoil 전역 상태에서 teamName 불러오기
  const [teamName] = useRecoilState(TeamListState);

  // 페이지 주소에 따라 사용될 선수 목록(제안 목록)을 위한 localPlayerList 상태 선언 및 업데이트
  const [localPlayerList, setLocalPlayerList] = useState<IHAPlayer[]>([]);
  useEffect(() => {
    if (router.asPath.includes("homeTeamRegistration")) {
      setLocalPlayerList(homeTeamPlayers);
    } else {
      setLocalPlayerList(awayTeamPlayers);
    }
  }, [router.asPath, homeTeamPlayers, awayTeamPlayers]);

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
  const handleSelectPlayer = (selectedPlayer: {
    name: string;
    playerId: number;
    wc?: string;
  }) => {
    if (selectedPlayerIndex === null) return;
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].name = selectedPlayer.name;
    updatedPlayers[selectedPlayerIndex].playerId = selectedPlayer.playerId;
    updatedPlayers[selectedPlayerIndex].selectedViaModal = true;
    setPlayers(updatedPlayers);
    setValue(`players.${selectedPlayerIndex}.name`, selectedPlayer.name);
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
    updatedPlayers[index].playerId = undefined;
    setPlayers(updatedPlayers);
  };

  // 폼 제출 시
  const onSubmit = async (data: any) => {
    let updatedPlayers = players.map((player, index) => {
      if (player.order === "P") {
        return {
          ...player,
          name: data.players[index].name,
          position: "P",
        };
      }
      return {
        ...player,
        name: data.players[index].name,
      };
    });

    const nonPRows = updatedPlayers.filter((player) => player.order !== "P");
    const blankNameNonP = nonPRows.find((player) => !player.name?.trim());
    if (blankNameNonP) {
      alert(`${blankNameNonP.order}번 타자의 선수명 입력칸이 비어 있습니다.`);
      return;
    }
    const blankPositionNonP = nonPRows.find(
      (player) => !player.position?.trim()
    );
    if (blankPositionNonP) {
      alert(
        `${blankPositionNonP.order}번 타자의 포지션 입력칸이 비어 있습니다.`
      );
      return;
    }
    const pRow = updatedPlayers.find((player) => player.order === "P");
    if (pRow && !pRow.name?.trim()) {
      alert(`P행의 선수명 입력 칸이 비어 있습니다.`);
      return;
    }

    const hasDHOverall = nonPRows.some((p) => p.position === "DH");

    if (hasDHOverall) {
      const requiredPositions = [
        "CF",
        "LF",
        "RF",
        "SS",
        "1B",
        "2B",
        "3B",
        "C",
        "DH",
      ];
      const nonPPositions = nonPRows.map((player) => player.position?.trim());
      for (const pos of requiredPositions) {
        if (!nonPPositions.includes(pos)) {
          alert(`필수 포지션 ${pos}가 입력되지 않았습니다.`);
          return;
        }
      }
    } else {
      const requiredPositions = [
        "CF",
        "LF",
        "RF",
        "SS",
        "1B",
        "2B",
        "3B",
        "C",
        "P",
      ];
      const nonPPositions = nonPRows.map((player) => player.position?.trim());
      for (const pos of requiredPositions) {
        if (!nonPPositions.includes(pos)) {
          alert(`필수 포지션 ${pos}가 입력되지 않았습니다.`);
          return;
        }
      }
    }

    let batters, pitcherData;
    if (hasDHOverall) {
      batters = nonPRows.map((player) => ({
        order: player.order,
        playerId: player.playerId,
        position: player.position,
      }));
      pitcherData = pRow;
    } else {
      batters = nonPRows.map((player) => ({
        order: player.order,
        playerId: player.playerId,
        position: player.position,
      }));
      pitcherData = nonPRows.find((player) => player.position!.trim() === "P");
    }

    const requestBody = {
      teamId: 10,
      batters: batters,
      pitcher: pitcherData,
    };

    setIsSubmitting(true);
    try {
      const response = await API.post(
        `/matches/${router.query.recordId}/lineup`,
        requestBody
      );
      console.log("POST 요청 성공:", response.data);
      console.log(requestBody);
      setPlayers(updatedPlayers);
      setIsSubmitting(false);
      if (props.isHomeTeam) {
        router.push(`/matches/${router.query.recordId}/awayTeamRegistration`);
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("POST 요청 실패:", error);
      setIsSubmitting(false);
    }
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

  const hasDHOverall = players
    .filter((p) => p.order !== "P")
    .some((p) => p.position === "DH");

  return (
    <Container onClick={() => setOpenPositionRow(null)}>
      <LargeTitle>라인업을 등록해주세요</LargeTitle>
      <Title>
        {router.asPath.includes("homeTeamRegistration")
          ? teamName[0].team1Name
          : teamName[0].team2Name}{" "}
        야구부
      </Title>
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
            const prevName =
              index === 0 ? "dummy" : watch(`players.${index - 1}.name`) || "";
            const prevPosition =
              index === 0 ? "dummy" : players[index - 1].position || "";
            const isRowEnabled =
              index === 0 ||
              (prevName.trim() !== "" && prevPosition.trim() !== "");
            const filteredSuggestions = localPlayerList.filter((p) => {
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
            const globalPlayer = localPlayerList.find(
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
                      disabled={!isRowEnabled}
                    />
                    {currentName &&
                      (globalPlayer &&
                      globalPlayer.isWc &&
                      globalPlayer.isWc === true ? (
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
                              const updatedPlayers = [...players];
                              updatedPlayers[index].name = suggestion.name;
                              updatedPlayers[index].playerId = suggestion.id;
                              updatedPlayers[index].selectedViaModal = true;
                              setPlayers(updatedPlayers);
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
          <ControlButton type="submit" disabled={isSubmitting}>
            제출하기
          </ControlButton>
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
