import React, { useState, useEffect } from "react";
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
  const [teamInfo] = useRecoilState(TeamListState);

  // 홈/원정 선수 목록 전역 상태
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );

  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");

  // 팀 선수 목록 GET
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      try {
        if (router.asPath.includes("homeTeamRegistration")) {
          const res = await API.get(`/teams/${teamInfo[0].homeTeamId}/players`);
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          setHomeTeamName(dataObj.name);
          setHomeTeamPlayers(dataObj.players);
        } else {
          const res = await API.get(`/teams/${teamInfo[0].awayTeamId}/players`);
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          setAwayTeamName(dataObj.name);
          setAwayTeamPlayers(dataObj.players);
        }
      } catch (err) {
        console.error("팀 선수 목록 요청 에러:", err);
      }
    };
    fetchTeamPlayers();
  }, [router.asPath, setHomeTeamPlayers, setAwayTeamPlayers]);

  // 제출 중복 방지
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1~9번 + P행
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

  // useForm
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      players: players.map((player) => ({
        name: player.name ?? "",
        position: player.position ?? "",
        playerId: player.playerId,
      })),
    },
  });

  // "비(非)‑P 행에서 P를 선택"했을 때 해당 row 인덱스를 기억
  const [lastPUpdateIndex, setLastPUpdateIndex] = useState<number | null>(null);

  // 포지션 드롭다운
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };
  const handlePositionSelect = (index: number, pos: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].position = pos;

    // batter 행에서 "P" 선택 시 lastPUpdateIndex 업데이트
    if (pos === "P" && updatedPlayers[index].order !== "P") {
      setLastPUpdateIndex(index);
    }

    setPlayers(updatedPlayers);
    setValue(`players.${index}.position`, pos);
    setOpenPositionRow(null);
  };

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] =
    useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );

  // 페이지 주소에 따라 사용할 선수 데이터
  const [localPlayerList, setLocalPlayerList] = useState<IHAPlayer[]>([]);
  useEffect(() => {
    if (router.asPath.includes("homeTeamRegistration")) {
      setLocalPlayerList(homeTeamPlayers);
    } else {
      setLocalPlayerList(awayTeamPlayers);
    }
  }, [router.asPath, homeTeamPlayers, awayTeamPlayers]);

  // 모달에서 선수 선택 시
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

    // batter 행이면서 포지션이 "P"라면 lastPUpdateIndex 업데이트
    if (
      updatedPlayers[selectedPlayerIndex].order !== "P" &&
      updatedPlayers[selectedPlayerIndex].position === "P"
    ) {
      setLastPUpdateIndex(selectedPlayerIndex);
    }

    setIsPlayerSelectionModalOpen(false);
    setSelectedPlayerIndex(null);
  };

  // ★ 투수행 자동 업데이트
  useEffect(() => {
    const pitcherIndex = players.findIndex((player) => player.order === "P");
    if (pitcherIndex === -1) return;

    if (lastPUpdateIndex !== null) {
      const candidate = players[lastPUpdateIndex];
      if (
        candidate &&
        candidate.name?.trim() !== "" &&
        candidate.position === "P"
      ) {
        // 이름이 다를 때에만 동기화
        if (players[pitcherIndex].name !== candidate.name) {
          const updatedPlayers = [...players];
          updatedPlayers[pitcherIndex] = {
            ...updatedPlayers[pitcherIndex],
            name: candidate.name,
            playerId: candidate.playerId,
            selectedViaModal: candidate.selectedViaModal,
            position: "P", // P행은 항상 P
          };
          setPlayers(updatedPlayers);
          setValue(`players.${pitcherIndex}.name`, candidate.name);
          setValue(`players.${pitcherIndex}.playerId`, candidate.playerId);
        }
      }
    } else {
      // lastPUpdateIndex가 null이면 P행 초기화
      if (players[pitcherIndex].name?.trim() !== "") {
        const updatedPlayers = [...players];
        updatedPlayers[pitcherIndex] = {
          ...updatedPlayers[pitcherIndex],
          name: "",
          playerId: undefined,
          selectedViaModal: false,
        };
        setPlayers(updatedPlayers);
        setValue(`players.${pitcherIndex}.name`, "");
        setValue(`players.${pitcherIndex}.playerId`, undefined);
      }
    }
  }, [lastPUpdateIndex, players, setValue]);

  // 폼 제출
  const onSubmit = async (data: any) => {
    const updatedPlayers = players.map((player, index) => {
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

    // 비‑P 행 필수값 체크 (이름, 포지션)
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

    // DH 체크
    const hasDHOverall = nonPRows.some((p) => p.position === "DH");
    const pRow = updatedPlayers.find((player) => player.order === "P");

    // DH가 없으면, P행 비어있을 경우 비‑P 행의 "P" 선수명을 복사
    if (!hasDHOverall && pRow && !pRow.name?.trim()) {
      const sourceRow = nonPRows.find(
        (player) => player.position?.trim() === "P" && player.name?.trim()
      );
      if (sourceRow) {
        pRow.name = sourceRow.name;
        pRow.playerId = sourceRow.playerId;
        pRow.selectedViaModal = sourceRow.selectedViaModal;
        const pIndex = updatedPlayers.findIndex(
          (player) => player.order === "P"
        );
        setValue(`players.${pIndex}.name`, sourceRow.name);
      }
    }

    // P행 검증
    if (pRow && !pRow.name?.trim()) {
      alert(`P행의 선수명 입력 칸이 비어 있습니다.`);
      return;
    }

    // 필수 포지션 검증
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
          alert(`포지션 입력이 올바르지 않습니다.`);
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
          alert(`포지션 입력이 올바르지 않습니다.`);
          return;
        }
      }
    }

    // 와일드카드(WC) 제한 체크
    const uniqueWildcardNames = new Set(
      updatedPlayers.reduce((acc: string[], player) => {
        if (player.name && player.name.trim()) {
          const globalPlayer = localPlayerList.find(
            (p) => p.name === player.name
          );
          if (globalPlayer && globalPlayer.isWc === true) {
            acc.push(player.name.trim());
          }
        }
        return acc;
      }, [])
    );
    const wildcardCount = uniqueWildcardNames.size;
    if (wildcardCount > 3) {
      alert(`와일드카드 제한을 초과했습니다 (현재 ${wildcardCount}명)`);
      return;
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
      // 라인업 제출
      const response = await API.post(
        `/matches/${router.query.recordId}/lineup`,
        requestBody
      );
      console.log("POST 요청 성공:", response.data);
      setPlayers(updatedPlayers);
      setIsSubmitting(false);

      // 홈/원정에 따라 분기
      if (props.isHomeTeam) {
        router.push(`/matches/${router.query.recordId}/awayTeamRegistration`);
      } else {
        // 기록 시작
        const response = await API.post(
          `/games/${router.query.recordId}/start`,
          requestBody
        );
        console.log(response);
        router.push(`/matches/${router.query.recordId}/records`);
      }
    } catch (error) {
      console.error("POST 요청 실패:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Container onClick={() => setOpenPositionRow(null)}>
      <LargeTitle>라인업을 등록해주세요</LargeTitle>
      <Title>
        {router.asPath.includes("homeTeamRegistration")
          ? homeTeamName
          : awayTeamName}{" "}
        야구부
      </Title>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <PlayerList style={{ flexGrow: 1 }}>
          {players.map((player, index) => {
            const currentName = watch(`players.${index}.name`) || "";
            // 바로 전 행이 비어있는 경우 현재 행 비활성화
            const prevName =
              index === 0 ? "dummy" : watch(`players.${index - 1}.name`) || "";
            const prevPosition =
              index === 0 ? "dummy" : players[index - 1].position || "";
            const isRowEnabled =
              index === 0 ||
              (prevName.trim() !== "" && prevPosition.trim() !== "");

            // 전체 목록에서 현재 이름이 WC인지 체크
            const globalPlayer = localPlayerList.find(
              (p) => p.name === currentName
            );

            return (
              <PlayerRow key={`${player.order}-${index}`}>
                <OrderNumber>{player.order}</OrderNumber>
                <NameWrapper hasValue={!!currentName}>
                  <InputWrapper hasValue={!!currentName}>
                    {/* ★ readOnly 적용, 클릭 시 모달 오픈 */}
                    <PlayerNameInput
                      {...register(`players.${index}.name`)}
                      placeholder="선수명 선택"
                      autoComplete="off"
                      readOnly
                      disabled={!isRowEnabled}
                      onClick={() => {
                        if (isRowEnabled) {
                          setSelectedPlayerIndex(index);
                          setIsPlayerSelectionModalOpen(true);
                        }
                      }}
                    />
                    {currentName &&
                      globalPlayer &&
                      globalPlayer.isWc === true && (
                        <WildCardBox>WC</WildCardBox>
                      )}
                  </InputWrapper>
                  {/* 돋보기 아이콘 유지 */}
                  <SearchIcon
                    src="/images/magnifier.png"
                    alt="Search Icon"
                    onClick={() => {
                      if (isRowEnabled) {
                        setSelectedPlayerIndex(index);
                        setIsPlayerSelectionModalOpen(true);
                      }
                    }}
                  />
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
                    <PositionText isPlaceholder={!player.position}>
                      {!player.position ? (
                        <>
                          <ArrowIconNone>▽</ArrowIconNone>
                          포지션 선택
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
                    <PitcherPositionText>P</PitcherPositionText>
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
          selectedPlayerNames={(watch("players") || [])
            .map((p: any) => p.name)
            .filter((name: string) => name && name.trim() !== "")}
        />
      )}
    </Container>
  );
}
