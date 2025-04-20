// TeamRegistrationPageComponent.tsx
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
  playerId?: number;
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
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );
  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");

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
  }, [router.asPath, teamInfo, setHomeTeamPlayers, setAwayTeamPlayers]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      players: players.map((player) => ({
        name: player.name ?? "",
        position: player.position ?? "",
        playerId: player.playerId,
      })),
    },
  });

  const [lastPUpdateIndex, setLastPUpdateIndex] = useState<number | null>(null);
  const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
  const handlePositionClick = (index: number) => {
    setOpenPositionRow(openPositionRow === index ? null : index);
  };
  const handlePositionSelect = (index: number, pos: string) => {
    const updated = [...players];
    updated[index].position = pos;
    if (pos === "P" && updated[index].order !== "P") {
      setLastPUpdateIndex(index);
    }
    setPlayers(updated);
    setValue(`players.${index}.position`, pos);
    setOpenPositionRow(null);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] =
    useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );

  const [localPlayerList, setLocalPlayerList] = useState<IHAPlayer[]>([]);
  useEffect(() => {
    if (router.asPath.includes("homeTeamRegistration")) {
      setLocalPlayerList(homeTeamPlayers);
    } else {
      setLocalPlayerList(awayTeamPlayers);
    }
  }, [router.asPath, homeTeamPlayers, awayTeamPlayers]);

  const handleSelectPlayer = (sel: {
    name: string;
    playerId: number;
    wc?: string;
  }) => {
    if (selectedPlayerIndex === null) return;
    const updated = [...players];
    updated[selectedPlayerIndex].name = sel.name;
    updated[selectedPlayerIndex].playerId = sel.playerId;
    updated[selectedPlayerIndex].selectedViaModal = true;
    setPlayers(updated);
    setValue(`players.${selectedPlayerIndex}.name`, sel.name);
    if (
      updated[selectedPlayerIndex].order !== "P" &&
      updated[selectedPlayerIndex].position === "P"
    ) {
      setLastPUpdateIndex(selectedPlayerIndex);
    }
    setIsPlayerSelectionModalOpen(false);
    setSelectedPlayerIndex(null);
  };
  const onSubmit = async (data: any) => {
    // 1. 폼의 입력값으로 players 배열 업데이트
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
        position: data.players[index].position,
      };
    });

    // 2. P행 제외한 선수들
    const nonPRows = updatedPlayers.filter((player) => player.order !== "P");

    // 3. 비‑P 행 필수값 체크 (이름, 포지션)
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

    // 4. 1~9번 행에서 DH와 P가 동시에 선택되지 않도록 검증
    const nonPPositions = nonPRows.map((player) => player.position!.trim());
    const hasDH = nonPPositions.includes("DH");
    const hasP = nonPPositions.includes("P");
    if (hasDH && hasP) {
      alert(
        "1번~9번 타순에서는 DH와 P를 동시에 선택할 수 없습니다. DH만 선택하거나 P만 선택해주세요."
      );
      return;
    }

    // 5. 1~9번 행에 P만 있을 때, 그 P 선수명과 P행 이름이 일치하는지 검증
    const pRow = updatedPlayers.find((player) => player.order === "P");
    if (!hasDH && hasP) {
      const nonPpitcher = nonPRows.find((player) => player.position === "P");
      if (nonPpitcher && pRow && nonPpitcher.name !== pRow.name) {
        alert(
          "1번~9번 타순에 투수가 있는 경우, 해당 선수명과 P행 선수명이 일치해야 합니다."
        );
        return;
      }
    }

    // 6. 1~9번 행에 DH가 있는 경우, P행의 선수이름은 1~9번 행 내에 존재하면 안됨
    if (hasDH) {
      if (pRow && nonPRows.some((player) => player.name === pRow.name)) {
        alert(
          "1번~9번 타순에 DH가 있는 경우, P행 선수명은 1번~9번 행 내에 존재해서는 안됩니다."
        );
        return;
      }
    }

    // 7. DH 여부 확인
    const hasDHOverall = hasDH;

    // 8. DH가 없고 P행이 비어 있으면, 비‑P 행 중 P 포지션 선수명 복사
    if (!hasDHOverall && pRow && !pRow.name?.trim()) {
      const sourceRow = nonPRows.find(
        (player) => player.position === "P" && player.name?.trim()
      );
      if (sourceRow) {
        pRow.name = sourceRow.name!;
        pRow.playerId = sourceRow.playerId;
        pRow.selectedViaModal = sourceRow.selectedViaModal;
        const pIndex = updatedPlayers.findIndex(
          (player) => player.order === "P"
        );
        setValue(`players.${pIndex}.name`, sourceRow.name);
      }
    }

    // 9. P행 검증
    if (pRow && !pRow.name?.trim()) {
      alert("P행의 선수명 입력 칸이 비어 있습니다.");
      return;
    }

    // 10. 필수 포지션 검증
    const requiredPositions = hasDHOverall
      ? ["CF", "LF", "RF", "SS", "1B", "2B", "3B", "C", "DH"]
      : ["CF", "LF", "RF", "SS", "1B", "2B", "3B", "C", "P"];
    const nonPPosList = nonPRows.map((player) => player.position!.trim());
    for (const pos of requiredPositions) {
      if (!nonPPosList.includes(pos)) {
        alert("포지션 입력이 올바르지 않습니다.");
        return;
      }
    }

    // 11. 와일드카드(WC) 제한 체크
    const uniqueWildcardNames = new Set(
      updatedPlayers.reduce<string[]>((acc, player) => {
        if (player.name?.trim()) {
          const global = localPlayerList.find((p) => p.name === player.name);
          if (global?.isWc) acc.push(player.name.trim());
        }
        return acc;
      }, [])
    );
    const wildcardCount = uniqueWildcardNames.size;
    if (wildcardCount > 3) {
      alert(`와일드카드 제한을 초과했습니다 (현재 ${wildcardCount}명)`);
      return;
    }

    // 12. 요청 바디 구성
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
      pitcherData = nonPRows.find((player) => player.position === "P");
    }

    const requestBody = {
      teamId: 10,
      batters,
      pitcher: pitcherData,
    };

    console.log(requestBody);

    // 13. 서버에 POST 요청
    setIsSubmitting(true);
    try {
      const res = await API.post(
        `/games/${router.query.recordId}/lineup`,
        requestBody
      );
      console.log("POST 요청 성공:", res.data);
      setPlayers(updatedPlayers);
      setIsSubmitting(false);

      // 14. 홈/원정 분기 후 다음 화면 이동
      if (props.isHomeTeam) {
        router.push(`/matches/${router.query.recordId}/awayTeamRegistration`);
      } else {
        // await API.post(`/games/${router.query.recordId}/start`, requestBody);
        // router.push(`/matches/${router.query.recordId}/records`);
        router.push(
          `/matches/${router.query.recordId}/homeTeamRegistration/homeTeamSubRegistration`
        );
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
            const prevName =
              index === 0 ? "dummy" : watch(`players.${index - 1}.name`) || "";
            const prevPos =
              index === 0 ? "dummy" : players[index - 1].position || "";
            const isRowEnabled =
              index === 0 || (prevName.trim() !== "" && prevPos.trim() !== "");

            const globalPlayer = localPlayerList.find(
              (p) => p.name === currentName
            );

            return (
              <PlayerRow key={`${player.order}-${index}`}>
                <OrderNumber>{player.order}</OrderNumber>
                <NameWrapper hasValue={!!currentName}>
                  <InputWrapper hasValue={!!currentName}>
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
                    {currentName && globalPlayer?.isWc && (
                      <WildCardBox>WC</WildCardBox>
                    )}
                  </InputWrapper>
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
      {isPlayerSelectionModalOpen && selectedPlayerIndex !== null && (
        <PlayerSelectionModal
          setIsModalOpen={setIsPlayerSelectionModalOpen}
          onSelectPlayer={handleSelectPlayer}
          selectedPlayerNames={(watch("players") || [])
            .map((p: any) => p.name)
            .filter((n: string) => n.trim() !== "")}
          allowDuplicates={players[selectedPlayerIndex].order === "P"}
        />
      )}
    </Container>
  );
}
