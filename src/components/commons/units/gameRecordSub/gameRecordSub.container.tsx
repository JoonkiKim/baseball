import React, { useState, useEffect, useMemo } from "react";
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
  ArrowIconNone,
  PitcherPositionText,
  SuggestionList,
  SuggestionItem,
  ButtonWrapper,
} from "./gameRecordSub.style";
import RecordStartModal from "../../modals/recordStart";
import PlayerSelectionModal from "../../modals/playerSelectionModal";
import {
  TeamListState,
  HomeTeamPlayerListState,
  AwayTeamPlayerListState,
  IHAPlayer,
} from "../../../../commons/stores/index";
import API from "../../../../commons/apis/api";
import SubPlayerSelectionModal from "../../modals/playerSubstituteModal";

// 선수 정보를 나타내는 인터페이스
interface PlayerInfo {
  order: number | string;
  name?: string;
  position?: string;
  selectedViaModal?: boolean;
  playerId?: number;
  isWc: boolean;
}

// 포지션 선택 옵션
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

// 기본 라인업 (API 응답 전 fallback default 값)
const defaultLineup = {
  batters: [
    { order: 1, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 2, playerId: 102, playerName: "", position: "", isWc: false },
    { order: 3, playerId: 103, playerName: "", position: "", isWc: false },
    { order: 4, playerId: 104, playerName: "", position: "", isWc: false },
    { order: 5, playerId: 105, playerName: "", position: "", isWc: false },
    { order: 6, playerId: 106, playerName: "", position: "", isWc: false },
    { order: 7, playerId: 107, playerName: "", position: "", isWc: false },
    { order: 8, playerId: 108, playerName: "", position: "", isWc: false },
    { order: 9, playerId: 109, playerName: "", position: "", isWc: false },
  ],
  pitcher: {
    playerId: 110,
    playerName: "",
    isWc: false,
  },
};

const defaultPlayers: PlayerInfo[] = [
  ...defaultLineup.batters.map((batter) => ({
    order: batter.order,
    name: batter.playerName,
    position: batter.position,
    playerId: batter.playerId,
    isWc: batter.isWc,
    selectedViaModal: false,
  })),
  {
    order: "P",
    name: defaultLineup.pitcher.playerName,
    position: "P",
    playerId: defaultLineup.pitcher.playerId,
    isWc: defaultLineup.pitcher.isWc,
    selectedViaModal: false,
  },
];

export default function TeamRegistrationPageComponent() {
  const router = useRouter();

  // 홈/원정 여부 상태
  const [isHomeTeam, setIsHomeTeam] = useState(true);
  // Recoil 상태 (홈/원정 선수 목록)
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );
  // 팀 API 응답 및 라인업 API 응답 저장
  const [teamPlayersData, setTeamPlayersData] = useState<any[]>([]);
  const [lineupPlayersData, setLineupPlayersData] = useState<any[]>([]);
  // 추가로 등록되는 isWc 값이 true인 선수 id를 담는 state
  const [customWcMap, setCustomWcMap] = useState<{
    [playerId: number]: boolean;
  }>({});

  // URL 쿼리를 이용한 홈/원정 여부 설정
  useEffect(() => {
    if (router.isReady) {
      const queryValue = router.query.isHomeTeam;
      if (queryValue === "true") {
        setIsHomeTeam(true);
        console.log("홈팀입니다");
      } else if (queryValue === "false") {
        setIsHomeTeam(false);
        console.log("원정입니다");
      }
    }
  }, [router.isReady, router.query.isHomeTeam]);

  // 로컬스토리지의 selectedMatch를 읽고 팀 선수 목록(API) 호출
  useEffect(() => {
    const selectedMatchStr = localStorage.getItem("selectedMatch");
    if (!selectedMatchStr) {
      console.error("selectedMatch 데이터가 로컬스토리지에 없습니다.");
      return;
    }
    try {
      const selectedMatch = JSON.parse(selectedMatchStr);
      if (isHomeTeam) {
        const homeTeamId = selectedMatch?.homeTeam?.id;
        if (homeTeamId) {
          API.get(`/teams/${homeTeamId}/players`)
            .then((res) => {
              const parsedData =
                typeof res.data === "string" ? JSON.parse(res.data) : res.data;
              setTeamPlayersData(parsedData.players);
              console.log("HomeTeam Players (team API):", parsedData.players);
            })
            .catch((error) => {
              console.error("Error fetching homeTeam players:", error);
            });
        } else {
          console.error("homeTeam id가 존재하지 않습니다.");
        }
      } else {
        const awayTeamId = selectedMatch?.awayTeam?.id;
        if (awayTeamId) {
          API.get(`/teams/${awayTeamId}/players`)
            .then((res) => {
              const parsedData =
                typeof res.data === "string" ? JSON.parse(res.data) : res.data;
              setTeamPlayersData(parsedData.players);
              console.log("AwayTeam Players (team API):", parsedData.players);
            })
            .catch((error) => {
              console.error("Error fetching awayTeam players:", error);
            });
        } else {
          console.error("awayTeam id가 존재하지 않습니다.");
        }
      }
    } catch (error) {
      console.error("로컬스토리지 파싱 에러:", error);
    }
  }, [isHomeTeam]);

  // react-hook-form 설정: 기본값에 playerId 포함
  const [players, setPlayers] = useState<PlayerInfo[]>(defaultPlayers);
  const { register, handleSubmit, watch, getValues, setValue } = useForm({
    defaultValues: {
      players: defaultPlayers.map((player) => ({
        name: player.name || "",
        position: player.position || "",
        isWc: player.isWc,
        playerId: player.playerId,
      })),
    },
  });

  // 게임 라인업 API 호출 및 Recoil 상태 업데이트
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      const queryValue = router.query.isHomeTeam;
      try {
        if (queryValue === "true") {
          const res = await API.get(
            `/games/${router.query.recordId}/lineup?teamType="home"`
          );
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("홈팀 응답 (lineup API):", dataObj);
          let lineupPlayers = [
            ...dataObj.batters.map((batter: any) => ({
              order: batter.order,
              name: batter.playerName,
              position: batter.position,
              playerId: batter.playerId,
              selectedViaModal: false,
              isWc: false,
            })),
            {
              order: "P",
              name: dataObj.pitcher.playerName,
              position: "P",
              playerId: dataObj.pitcher.playerId,
              selectedViaModal: false,
              isWc: false,
            },
          ];
          // DH가 없으면 원래 P행의 데이터를 초기화(제거)합니다.
          if (
            !dataObj.batters.some((batter: any) => batter.position === "DH")
          ) {
            lineupPlayers = lineupPlayers.map((player: any) =>
              player.order === "P"
                ? {
                    order: "P",
                    name: "",
                    position: "P",
                    playerId: undefined,
                    selectedViaModal: false,
                    isWc: false,
                  }
                : player
            );
          }
          setHomeTeamPlayers(lineupPlayers);
          setLineupPlayersData(lineupPlayers);
        } else {
          const res = await API.get(
            `/games/${router.query.recordId}/lineup?teamType="away"`
          );
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("원정팀 응답 (lineup API):", dataObj);
          let lineupPlayers = [
            ...dataObj.batters.map((batter: any) => ({
              order: batter.order,
              name: batter.playerName,
              position: batter.position,
              playerId: batter.playerId,
              selectedViaModal: false,
              isWc: false,
            })),
            {
              order: "P",
              name: dataObj.pitcher.playerName,
              position: "P",
              playerId: dataObj.pitcher.playerId,
              selectedViaModal: false,
              isWc: false,
            },
          ];
          if (
            !dataObj.batters.some((batter: any) => batter.position === "DH")
          ) {
            lineupPlayers = lineupPlayers.map((player: any) =>
              player.order === "P"
                ? {
                    order: "P",
                    name: "",
                    position: "P",
                    playerId: undefined,
                    selectedViaModal: false,
                    isWc: false,
                  }
                : player
            );
          }
          setAwayTeamPlayers(lineupPlayers);
          setLineupPlayersData(lineupPlayers);
        }
      } catch (err) {
        console.error("팀 선수 목록 요청 에러:", err);
      }
    };
    fetchTeamPlayers();
  }, [router]);

  // wcMap 계산 (lineupPlayersData와 teamPlayersData 기반)
  const wcMap = useMemo(() => {
    if (!lineupPlayersData.length || !teamPlayersData.length) return {};
    const map: { [playerId: number]: boolean } = {};
    lineupPlayersData.forEach((player) => {
      const matchingPlayer = teamPlayersData.find(
        (tp) => tp.id === player.playerId
      );
      if (matchingPlayer) {
        map[player.playerId] = matchingPlayer.isWc;
      }
    });
    console.log("wcMap (useMemo):", map);
    return map;
  }, [lineupPlayersData, teamPlayersData]);

  // API 응답 기반으로 form 기본 값 및 players 배열 업데이트
  useEffect(() => {
    if (router.query.isHomeTeam === "true" && homeTeamPlayers.length > 0) {
      const updatedPlayers = players.map((player) => {
        if (player.order === "P") {
          const pitcherRow = homeTeamPlayers.find((p: any) => p.order === "P");
          return pitcherRow ? { ...player, ...pitcherRow } : player;
        } else {
          const responsePlayer = homeTeamPlayers.find(
            (p: any) => p.order === player.order
          );
          return responsePlayer ? { ...player, ...responsePlayer } : player;
        }
      });
      setPlayers(updatedPlayers);
      updatedPlayers.forEach((player, index) => {
        setValue(`players.${index}.name`, player.name || "");
        setValue(`players.${index}.position`, player.position || "");
        setValue(`players.${index}.playerId`, player.playerId);
      });
    } else if (
      router.query.isHomeTeam === "false" &&
      awayTeamPlayers.length > 0
    ) {
      const updatedPlayers = players.map((player) => {
        if (player.order === "P") {
          const pitcherRow = awayTeamPlayers.find((p: any) => p.order === "P");
          return pitcherRow ? { ...player, ...pitcherRow } : player;
        } else {
          const responsePlayer = awayTeamPlayers.find(
            (p: any) => p.order === player.order
          );
          return responsePlayer ? { ...player, ...responsePlayer } : player;
        }
      });
      setPlayers(updatedPlayers);
      updatedPlayers.forEach((player, index) => {
        setValue(`players.${index}.name`, player.name || "");
        setValue(`players.${index}.position`, player.position || "");
        setValue(`players.${index}.playerId`, player.playerId);
      });
    }
  }, [router.query.isHomeTeam, homeTeamPlayers, awayTeamPlayers]);

  // WildCardBox 개수를 계산해서 콘솔에 찍는 useEffect 추가
  useEffect(() => {
    const wildCardCountCalc = players.filter(
      (player) =>
        player.name &&
        player.playerId &&
        (wcMap[player.playerId] || customWcMap[player.playerId])
    ).length;
    console.log("WildCardBox count:", wildCardCountCalc);
  }, [players, wcMap, customWcMap]);

  // 포지션 드롭다운 관련 상태 및 핸들러
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };

  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;
    // DH 선택 시 P행 초기화 처리 (DH가 아직 등록되지 않은 경우)
    if (pos === "DH" && updatedPlayers[index].order !== "P") {
      const hasDH = updatedPlayers.some(
        (player) => player.order !== "P" && player.position === "DH"
      );
      if (!hasDH) {
        const pRowIndex = updatedPlayers.findIndex(
          (player) => player.order === "P"
        );
        if (pRowIndex !== -1) {
          updatedPlayers[pRowIndex] = {
            order: "P",
            name: "",
            position: "P",
            playerId: undefined,
            selectedViaModal: false,
            isWc: false,
          };
          setValue(`players.${pRowIndex}.name`, "");
          setValue(`players.${pRowIndex}.position`, "P");
        }
      }
    }
    setPlayers(updatedPlayers);
    setValue(`players.${index}.position`, pos);
    setOpenPositionRow(null);
  };

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] =
    useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  // Recoil 전역 상태에서 팀 이름 불러오기
  const [teamName] = useRecoilState(TeamListState);

  // 팀별 선수 제안을 위한 localPlayerList 상태 업데이트
  const [localPlayerList, setLocalPlayerList] = useState<IHAPlayer[]>([]);
  useEffect(() => {
    if (router.asPath.includes("homeTeamRegistration")) {
      setLocalPlayerList(homeTeamPlayers);
    } else {
      setLocalPlayerList(awayTeamPlayers);
    }
  }, [router.asPath, homeTeamPlayers, awayTeamPlayers]);

  // 헬퍼: 검색 시 입력 문자 강조 (빨간색)
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

  // 포지션 입력값을 최신 상태로 getValues()에 반영하기 위해 hidden input 등록
  const renderHiddenPositionInput = (index: number) => {
    return <input type="hidden" {...register(`players.${index}.position`)} />;
  };

  // playerId를 반영하는 hidden input 등록
  const renderHiddenPlayerIdInput = (index: number) => {
    return <input type="hidden" {...register(`players.${index}.playerId`)} />;
  };

  // 모달에서 선수 선택 후 해당 행 업데이트 및 isWc 업데이트
  const handleSelectPlayer = (selectedPlayer: {
    name: string;
    playerId: number;
  }) => {
    if (selectedPlayerIndex === null) return;
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].name = selectedPlayer.name;
    updatedPlayers[selectedPlayerIndex].playerId = selectedPlayer.playerId;
    updatedPlayers[selectedPlayerIndex].selectedViaModal = true;
    const matchingPlayer = teamPlayersData.find(
      (tp) => tp.id === selectedPlayer.playerId
    );
    if (matchingPlayer) {
      if (matchingPlayer.isWc) {
        setCustomWcMap((prev) => ({
          ...prev,
          [selectedPlayer.playerId]: true,
        }));
      }
      updatedPlayers[selectedPlayerIndex].isWc = matchingPlayer.isWc;
    } else {
      console.log(
        `매칭된 선수 없음: 선택된 playerId = ${selectedPlayer.playerId}`
      );
      updatedPlayers[selectedPlayerIndex].isWc = false;
    }
    setPlayers(updatedPlayers);
    setValue(`players.${selectedPlayerIndex}.name`, selectedPlayer.name);
    setValue(
      `players.${selectedPlayerIndex}.playerId`,
      selectedPlayer.playerId
    );
    setIsPlayerSelectionModalOpen(false);
    setSelectedPlayerIndex(null);
  };

  // 입력창 변경 시 수동 입력 상태로 전환
  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].selectedViaModal = false;
    updatedPlayers[index].playerId = undefined;
    setPlayers(updatedPlayers);
  };

  // players와 wcMap, customWcMap 조건에 맞는 선수 id 콘솔 출력
  useEffect(() => {
    players.forEach((player) => {
      if (
        player.name &&
        player.playerId &&
        (wcMap[player.playerId] || customWcMap[player.playerId])
      ) {
        console.log(`조건 만족 선수 id: ${player.playerId}`);
      }
    });
  }, [players, wcMap, customWcMap]);

  // WildCardBox count를 저장할 state
  const [wildCardCount, setWildCardCount] = useState<number>(0);
  // WildCardBox 조건에 맞는 플레이어 수를 계산해 wildCardCount state에 저장
  useEffect(() => {
    const count = players.filter(
      (player) =>
        player.name &&
        player.playerId &&
        (wcMap[player.playerId] || customWcMap[player.playerId])
    ).length;
    setWildCardCount(count);
    console.log("WildCardBox count updated:", count);
  }, [players, wcMap, customWcMap]);

  // onSubmit 함수 (교체완료 버튼 클릭 시)
  const onSubmit = async (data: any) => {
    // 1. react-hook-form에서 저장된 players 데이터를 가져오기
    const currentPlayersFromForm = getValues("players");

    // 2. 각 플레이어의 isWc 값을 wcMap과 customWcMap을 기준으로 재계산
    const updatedCurrentPlayers = currentPlayersFromForm.map((player: any) => {
      const updatedIsWc = player.playerId
        ? wcMap[player.playerId] === true ||
          customWcMap[player.playerId] === true
        : false;
      return { ...player, isWc: updatedIsWc };
    });

    // 3. DH 존재 여부 판단
    const hasDH = updatedCurrentPlayers.some(
      (player) => player.position === "DH"
    );

    let formattedObject;
    if (hasDH) {
      // DH가 있는 경우: "P" 행 데이터는 pitcher로 사용하고, batters에는 "P"행 제외
      const pitcherCandidate = updatedCurrentPlayers.find(
        (player) => player.position === "P"
      );
      formattedObject = {
        batters: updatedCurrentPlayers
          .filter((player) => player.position !== "P")
          .map((player) => ({
            order: player.order,
            playerId: player.playerId,
            position: player.position,
          })),
        pitcher: {
          playerId: pitcherCandidate?.playerId,
        },
      };
    } else {
      // DH가 없는 경우: non-P 행 중 포지션이 "P"인 선수는 pitcher 후보로 사용
      const pitcherCandidate = updatedCurrentPlayers.find(
        (player) => player.position === "P"
      );
      // non-P 행 필터링
      let nonPRows = updatedCurrentPlayers.filter(
        (player) => player.position !== "P"
      );
      // pitcherCandidate가 존재하면 nonPRows에 추가
      if (pitcherCandidate) {
        nonPRows = [...nonPRows, pitcherCandidate];
      }
      formattedObject = {
        batters: nonPRows.map((player) => ({
          order: player.order,
          playerId: player.playerId,
          position: player.position,
        })),
        pitcher: {
          playerId: pitcherCandidate?.playerId,
        },
      };
    }

    console.log("Formatted Object:", JSON.stringify(formattedObject, null, 2));

    // 4. PATCH 요청: /games/{gameId}/lineup 엔드포인트에 formattedObject를 request body로 전송
    try {
      const gameId = router.query.recordId; // URL 쿼리에서 gameId(또는 recordId) 추출
      const response = await API.patch(
        `/games/${gameId}/lineup`,
        formattedObject
      );
      console.log("PATCH 요청 성공:", response);
      router.push(`/matches/${router.query.recordId}/records`);
      // 이후 필요한 후속 처리 (예: 알림, 페이지 이동 등)를 추가할 수 있습니다.
    } catch (error) {
      console.error("PATCH 요청 에러:", error);
    }
  };

  return (
    <Container onClick={() => setOpenPositionRow(null)}>
      <LargeTitle>교체할 선수를 선택해주세요</LargeTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <PlayerList style={{ flexGrow: 1 }}>
          {players.map((player, index) => {
            if (
              player.order === "P" &&
              !players.some((p) => p.position === "DH")
            ) {
              return <BlankPlayerRow key={`${player.order}-${index}`} />;
            }
            const currentName = watch(`players.${index}.name`) || "";
            const displayPosition =
              player.position ||
              (isHomeTeam
                ? homeTeamPlayers[index]?.position
                : awayTeamPlayers[index]?.position) ||
              "포지션 입력 ▽";
            return (
              <PlayerRow key={`${player.order}-${index}`}>
                <OrderNumber>{player.order}</OrderNumber>
                <NameWrapper
                  onClick={() => {
                    setSelectedPlayerIndex(index);
                    setIsPlayerSelectionModalOpen(true);
                  }}
                  hasValue={!!currentName}
                >
                  <InputWrapper hasValue={!!currentName}>
                    <PlayerNameInput
                      {...register(`players.${index}.name`, {
                        onChange: (e) => handleInputChange(index, e),
                      })}
                      placeholder="선수명 입력"
                      autoComplete="off"
                      readOnly
                    />
                    {currentName &&
                    player.playerId &&
                    (wcMap[player.playerId] || customWcMap[player.playerId]) ? (
                      <WildCardBox>WC</WildCardBox>
                    ) : (
                      <div></div>
                    )}
                  </InputWrapper>
                  <SearchIcon
                    src="/images/magnifier.png"
                    alt="Search Icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlayerIndex(index);
                      setIsPlayerSelectionModalOpen(true);
                    }}
                  />
                </NameWrapper>
                {player.order !== "P" ? (
                  <PositionWrapper
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePositionClick(index);
                    }}
                  >
                    <PositionText isPlaceholder={!player.position}>
                      <ArrowIconNone>▽</ArrowIconNone>
                      {displayPosition}
                      <ArrowIconNone>▽</ArrowIconNone>
                    </PositionText>
                    {renderHiddenPositionInput(index)}
                    {renderHiddenPlayerIdInput(index)}
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
          <ControlButton type="submit">교체완료</ControlButton>
        </ButtonWrapper>
      </form>
      {isModalOpen && <RecordStartModal setIsModalOpen={setIsModalOpen} />}
      {isPlayerSelectionModalOpen && (
        <SubPlayerSelectionModal
          setIsModalOpen={setIsPlayerSelectionModalOpen}
          onSelectPlayer={handleSelectPlayer}
          selectedPlayerNames={watch("players")
            .map((p: any) => p.name)
            .filter((name: string) => name.trim() !== "")}
        />
      )}
    </Container>
  );
}
