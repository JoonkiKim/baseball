// TeamRegistrationPageComponent.tsx

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
// 기존 기본값은 사용하지 않고 API에서 받아온 pitcher row가 초기값으로 반영됩니다.
const defaultLineup = {
  batters: [
    { order: 1, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 2, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 3, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 4, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 5, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 6, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 7, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 8, playerId: 0, playerName: "", position: "", isWc: false },
    { order: 9, playerId: 0, playerName: "", position: "", isWc: false },
  ],
  pitcher: {
    playerId: 0,
    playerName: "", // 이 값은 API 결과에서 대체됩니다.
    isWc: false,
  },
};

// defaultPlayers 초기값 (초기 렌더링 전에 사용하므로 API 호출 전 fallback 값)
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
  const [wildCardCount, setWildCardCount] = useState(0);

  // 홈/원정 여부 상태
  const [isHomeTeam, setIsHomeTeam] = useState(true);

  // Recoil: 홈/원정 선수 목록
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );

  // 팀 API 응답 (선수 목록)
  const [teamPlayersData, setTeamPlayersData] = useState<any[]>([]);
  // 라인업 API 응답
  const [lineupPlayersData, setLineupPlayersData] = useState<any[]>([]);
  // 커스텀으로 WC 체크된 선수 관리 (key=playerId, value=true/false)
  const [customWcMap, setCustomWcMap] = useState<{
    [playerId: number]: boolean;
  }>({});

  // react-hook-form 및 선수 state 초기화
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

  // ★ 최근 수정한 batter 행(투수 행 제외)의 인덱스를 추적하는 state
  const [lastPUpdateIndex, setLastPUpdateIndex] = useState<number | null>(null);

  // URL 쿼리로 홈/원정 설정
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

  // localStorage에서 selectedMatch 읽고 팀 선수 목록(API) 호출
  useEffect(() => {
    const selectedMatchStr = localStorage.getItem("selectedMatch");
    if (!selectedMatchStr) {
      console.error("selectedMatch 데이터가 없습니다.");
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
        }
      }
    } catch (error) {
      console.error("로컬스토리지 파싱 에러:", error);
    }
  }, [isHomeTeam]);

  // 라인업 API 호출 & recoil 업데이트
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      const queryValue = router.query.isHomeTeam;
      if (!router.query.recordId) return;

      try {
        if (queryValue === "true") {
          // 홈팀
          const res = await API.get(
            `/games/${router.query.recordId}/lineup?teamType="home"`
          );
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("홈팀 응답 (lineup API):", dataObj);

          // API의 pitcher row 값을 그대로 사용
          let lineupPlayers = [
            ...dataObj.batters.map((batter: any) => ({
              order: batter.order,
              name: batter.playerName,
              position: batter.position,
              playerId: batter.playerId,
              selectedViaModal: false,
              isWc: batter.isWC ?? false,
            })),
            {
              order: "P",
              name: dataObj.pitcher.playerName,
              position: "P",
              playerId: dataObj.pitcher.playerId,
              selectedViaModal: false,
              isWc: dataObj.pitcher.isWC ?? false,
            },
          ];
          // 기존에는 DH가 없으면 P행을 초기화했지만, 이제 API의 pitcher 값을 그대로 유지합니다.
          setHomeTeamPlayers(lineupPlayers);
          setLineupPlayersData(lineupPlayers);
        } else {
          // 원정팀
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
              isWc: batter.isWC ?? false,
            })),
            {
              order: "P",
              name: dataObj.pitcher.playerName,
              position: "P",
              playerId: dataObj.pitcher.playerId,
              selectedViaModal: false,
              isWc: dataObj.pitcher.isWC ?? false,
            },
          ];
          // 원정팀도 DH 여부 상관없이 API의 pitcher 값을 그대로 사용합니다.
          setAwayTeamPlayers(lineupPlayers);
          setLineupPlayersData(lineupPlayers);
          console.log("awayTeamPlayers", awayTeamPlayers);
        }
      } catch (err) {
        console.error("팀 선수 목록 요청 에러:", err);
      }
    };
    fetchTeamPlayers();
  }, [router]);

  useEffect(() => {
    console.log("Updated homeTeamPlayers:", homeTeamPlayers);
  }, [homeTeamPlayers]);

  // wcMap 계산 (lineupPlayersData & teamPlayersData)
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

  // 폼 기본값 & players 배열 업데이트
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

  // WildCardBox 계산 (콘솔용)
  useEffect(() => {
    let wildCardCountCalc = players.filter(
      (player) =>
        player.name &&
        player.playerId &&
        (player.isWc || wcMap[player.playerId] || customWcMap[player.playerId])
    ).length;

    const pitcherPlayer = players.find((player) => player.order === "P");
    if (pitcherPlayer && pitcherPlayer.name.trim() !== "") {
      const isDuplicate = players.some(
        (player) =>
          player.order !== "P" &&
          player.name.trim() !== "" &&
          player.name === pitcherPlayer.name
      );
      if (isDuplicate) {
        wildCardCountCalc = Math.max(wildCardCountCalc - 1, 0);
      }
    }
    console.log("WildCardBox count:", wildCardCountCalc);
    setWildCardCount(wildCardCountCalc);
  }, [players, wcMap, customWcMap]);

  // 포지션 드롭다운 관련 상태 및 핸들러
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };

  // ★ handlePositionSelect에서 batter 행(투수 행이 아닌)에서 "P" 선택 시 lastPUpdateIndex 업데이트
  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;
    if (updatedPlayers[index].order !== "P" && pos === "P") {
      setLastPUpdateIndex(index);
    }
    // DH 선택 시 P행 기본값 유지 (API에서 받아온 pitcher 값을 그대로 사용)
    if (pos === "DH" && updatedPlayers[index].order !== "P") {
      const hasDH = updatedPlayers.some(
        (player) => player.order !== "P" && player.position === "DH"
      );
      if (!hasDH) {
        const pRowIndex = updatedPlayers.findIndex((p) => p.order === "P");
        if (pRowIndex !== -1) {
          updatedPlayers[pRowIndex] = {
            order: "P",
            name: players[pRowIndex].name, // 기존 API에서 받아온 값 유지
            position: "P",
            playerId: players[pRowIndex].playerId,
            selectedViaModal: false,
            isWc: players[pRowIndex].isWc,
          };
          setValue(`players.${pRowIndex}.name`, players[pRowIndex].name);
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

  // Recoil 전역 상태
  const [teamName] = useRecoilState(TeamListState);

  // localPlayerList (제안 목록)
  const [localPlayerList, setLocalPlayerList] = useState<IHAPlayer[]>([]);
  useEffect(() => {
    if (router.asPath.includes("homeTeamRegistration")) {
      setLocalPlayerList(homeTeamPlayers);
    } else {
      setLocalPlayerList(awayTeamPlayers);
    }
  }, [router.asPath, homeTeamPlayers, awayTeamPlayers]);

  // ★ 모달에서 선수를 선택했을 때, batter 행(투수 행이 아닌)에서 선택 시 lastPUpdateIndex 업데이트
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
      updatedPlayers[selectedPlayerIndex].isWc = false;
    }
    if (
      updatedPlayers[selectedPlayerIndex].order !== "P" &&
      updatedPlayers[selectedPlayerIndex].position === "P"
    ) {
      setLastPUpdateIndex(selectedPlayerIndex);
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

  // ★ 입력창 수정 시, batter 행(투수 행이 아닌)에서 입력하면 lastPUpdateIndex 업데이트
  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].selectedViaModal = false;
    updatedPlayers[index].playerId = undefined;
    setPlayers(updatedPlayers);
    if (
      updatedPlayers[index].order !== "P" &&
      updatedPlayers[index].position === "P"
    ) {
      setLastPUpdateIndex(index);
    }
  };

  // Hidden inputs
  const renderHiddenPositionInput = (index: number) => {
    return <input type="hidden" {...register(`players.${index}.position`)} />;
  };
  const renderHiddenPlayerIdInput = (index: number) => {
    return <input type="hidden" {...register(`players.${index}.playerId`)} />;
  };

  // 교체완료 버튼 시
  const onSubmit = async (data: any) => {
    const currentPlayersFromForm = getValues("players");
    console.log("currentPlayersFromForm", currentPlayersFromForm);
    const updatedCurrentPlayers = currentPlayersFromForm.map((player: any) => {
      const updatedIsWc = player.playerId
        ? wcMap[player.playerId] === true ||
          customWcMap[player.playerId] === true
        : false;
      return { ...player, isWc: updatedIsWc };
    });
    if (wildCardCount > 3) {
      alert(
        `WC 조건을 만족하는 선수가 3명을 초과합니다. 현재 ${wildCardCount} 명`
      );
      return;
    }
    const nonPPlayers = updatedCurrentPlayers.filter(
      (p: any) => p.order !== "P"
    );
    const hasDHInNonP = nonPPlayers.some((p: any) => p.position === "DH");
    const requiredPositions = hasDHInNonP
      ? ["CF", "LF", "RF", "SS", "1B", "2B", "3B", "C", "DH"]
      : ["CF", "LF", "RF", "SS", "1B", "2B", "3B", "C", "P"];
    const assignedPositionsNonP = nonPPlayers
      .slice(0, -1)
      .map((p: any) => p.position);
    console.log("확인할 포지션", assignedPositionsNonP);
    const missingPositions = requiredPositions.filter(
      (pos) => !assignedPositionsNonP.includes(pos)
    );
    if (missingPositions.length > 0) {
      alert(`포지션 설정이 올바르지 않습니다.`);
      return;
    }
    const pitcherCandidate = updatedCurrentPlayers.find(
      (p: any) => p.position === "P"
    );
    const batters = updatedCurrentPlayers
      .filter((p: any) => p.order !== "P")
      .slice(0, -1)
      .map((p: any) => ({
        order: p.order,
        playerId: p.playerId,
        position: p.position,
      }));
    const formattedObject = {
      batters,
      pitcher: {
        playerId: pitcherCandidate?.playerId,
      },
    };
    console.log("Formatted Object:", JSON.stringify(formattedObject, null, 2));
    try {
      const gameId = router.query.recordId;
      const response = await API.post(
        `/games/${gameId}/lineup`,
        formattedObject
      );
      console.log("전송 성공:", response.data);
      router.push(`/matches/${router.query.recordId}/records`);
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
            const currentName = watch(`players.${index}.name`) || "";
            const actualPosition =
              player.position ||
              (isHomeTeam
                ? homeTeamPlayers[index]?.position
                : awayTeamPlayers[index]?.position) ||
              "";
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
                    {currentName && player.playerId && player.isWc ? (
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
                    <PositionText isPlaceholder={!actualPosition}>
                      {actualPosition ? (
                        <>
                          <ArrowIconNone>▽</ArrowIconNone>
                          <span>{actualPosition}</span>
                          <ArrowIconNone>▽</ArrowIconNone>
                        </>
                      ) : (
                        <>
                          <ArrowIconNone>▽</ArrowIconNone>
                          <span>포지션 입력</span>
                          <ArrowIcon>▽</ArrowIcon>
                        </>
                      )}
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
          isPitcher={
            selectedPlayerIndex !== null &&
            players[selectedPlayerIndex].order === "P"
          }
        />
      )}
    </Container>
  );
}
