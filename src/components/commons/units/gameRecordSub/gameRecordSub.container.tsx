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
  battingOrder: number | string;
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
    { battingOrder: 1, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 2, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 3, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 4, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 5, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 6, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 7, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 8, playerId: 0, playerName: "", position: "", isWc: false },
    { battingOrder: 9, playerId: 0, playerName: "", position: "", isWc: false },
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
    battingOrder: batter.battingOrder,
    name: batter.playerName,
    position: batter.position,
    playerId: batter.playerId,
    isWc: batter.isWc,
    selectedViaModal: false,
  })),
  {
    battingOrder: "P",
    name: defaultLineup.pitcher.playerName,
    position: "P",
    playerId: defaultLineup.pitcher.playerId,
    isWc: defaultLineup.pitcher.isWc,
    selectedViaModal: false,
  },
];

export default function TeamRegistrationPageComponent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const teamType = router.query.isHomeTeam === "true" ? "home" : "away";
      try {
        if (queryValue === "true") {
          // 홈팀
          const res = await API.get(
            `/games/${router.query.recordId}/lineup?teamType=home`
          );
          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("홈팀 응답 (lineup API):", dataObj);
          // ★ 이 부분을 추가 ★
          const minimalLineup = {
            batters: dataObj.batters.map(
              ({ battingOrder, playerId, playerName }: any) => ({
                battingOrder,
                playerId,
                playerName,
              })
            ),
            // 만약 투수 정보도 저장하고 싶으면 아래 주석 해제
            pitcher: {
              playerId: dataObj.pitcher.playerId,
              playerName: dataObj.pitcher.playerName,
            },
          };
          localStorage.setItem(
            `lineup_${teamType}`,
            JSON.stringify(minimalLineup)
          );
          // API의 pitcher row 값을 그대로 사용
          let lineupPlayers = [
            ...dataObj.batters.map((batter: any) => ({
              battingOrder: batter.battingOrder,
              name: batter.playerName,
              position: batter.position,
              playerId: batter.playerId,
              selectedViaModal: false,
              isWc: batter.isWC ?? false,
            })),
            {
              battingOrder: "P",
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
            `/games/${router.query.recordId}/lineup?teamType=away`
          );

          const dataObj =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          console.log("원정팀 응답 (lineup API):", dataObj);
          const minimalLineup = {
            batters: dataObj.batters.map(
              ({ battingOrder, playerId, playerName }: any) => ({
                battingOrder,
                playerId,
                playerName,
              })
            ),
            // 만약 투수 정보도 저장하고 싶으면 아래 주석 해제
            pitcher: {
              playerId: dataObj.pitcher.playerId,
              playerName: dataObj.pitcher.playerName,
            },
          };
          localStorage.setItem(
            `lineup_${teamType}`,
            JSON.stringify(minimalLineup)
          );
          let lineupPlayers = [
            ...dataObj.batters.map((batter: any) => ({
              battingOrder: batter.battingOrder,
              name: batter.playerName,
              position: batter.position,
              playerId: batter.playerId,
              selectedViaModal: false,
              isWc: batter.isWC ?? false,
            })),
            {
              battingOrder: "P",
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
  }, [router.query.recordId, lineupPlayersData, teamPlayersData]);

  // 폼 기본값 & players 배열 업데이트
  useEffect(() => {
    if (router.query.isHomeTeam === "true" && homeTeamPlayers.length > 0) {
      const updatedPlayers = players.map((player) => {
        if (player.battingOrder === "P") {
          const pitcherRow = homeTeamPlayers.find(
            (p: any) => p.battingOrder === "P"
          );
          return pitcherRow ? { ...player, ...pitcherRow } : player;
        } else {
          const responsePlayer = homeTeamPlayers.find(
            (p: any) => p.battingOrder === player.battingOrder
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
        if (player.battingOrder === "P") {
          const pitcherRow = awayTeamPlayers.find(
            (p: any) => p.battingOrder === "P"
          );
          return pitcherRow ? { ...player, ...pitcherRow } : player;
        } else {
          const responsePlayer = awayTeamPlayers.find(
            (p: any) => p.battingOrder === player.battingOrder
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

  // 추가: 배터 WC 개수
  const [batterWcCount, setBatterWcCount] = useState(0);
  // 추가: 투수 WC 개수
  const [pitcherWcCount, setPitcherWcCount] = useState(0);
  // WildCardBox 계산 (콘솔용)
  // WildCardBox 계산 (배터/투수 따로, 중복 없이)
  useEffect(() => {
    // 1) 배터(1~9번) WC 개수
    const batterCount = players.filter(
      (p) =>
        p.battingOrder !== "P" &&
        p.name &&
        p.playerId &&
        (p.isWc || wcMap[p.playerId] || customWcMap[p.playerId])
    ).length;

    // 2) 투수(P행) WC 개수 (중복 검사 없이)
    const pitcherCount = players.filter(
      (p) =>
        p.battingOrder === "P" &&
        p.name &&
        p.playerId &&
        (p.isWc || wcMap[p.playerId] || customWcMap[p.playerId])
    ).length;

    console.log("Batter WC count:", batterCount);
    console.log("Pitcher WC count:", pitcherCount);

    // 상태 업데이트
    setBatterWcCount(batterCount);
    setPitcherWcCount(pitcherCount);
    setWildCardCount(batterCount + pitcherCount);
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
    if (updatedPlayers[index].battingOrder !== "P" && pos === "P") {
      setLastPUpdateIndex(index);
    }
    // DH 선택 시 P행 기본값 유지 (API에서 받아온 pitcher 값을 그대로 사용)
    if (pos === "DH" && updatedPlayers[index].battingOrder !== "P") {
      const hasDH = updatedPlayers.some(
        (player) => player.battingOrder !== "P" && player.position === "DH"
      );
      if (!hasDH) {
        const pRowIndex = updatedPlayers.findIndex(
          (p) => p.battingOrder === "P"
        );
        if (pRowIndex !== -1) {
          updatedPlayers[pRowIndex] = {
            battingOrder: "P",
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
      updatedPlayers[selectedPlayerIndex].battingOrder !== "P" &&
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
      updatedPlayers[index].battingOrder !== "P" &&
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

  const duplicatePositions = useMemo(() => {
    const counts: Record<string, number> = {};
    players
      .filter((p) => p.battingOrder !== "P")
      .forEach((p) => {
        if (p.position) counts[p.position] = (counts[p.position] || 0) + 1;
      });
    return new Set(
      Object.entries(counts)
        .filter(([_, c]) => c > 1)
        .map(([pos]) => pos)
    );
  }, [players]);

  // 교체완료 버튼 시
  const onSubmit = async (data: any) => {
    // 이미 제출 중이면 무시
    if (isSubmitting) return;
    // 1) form 에서 넘어온 플레이어들
    const currentPlayersFromForm = getValues("players");
    // 2) WC 플래그 갱신
    const updatedCurrentPlayers = currentPlayersFromForm.map((player: any) => {
      const updatedIsWc = player.playerId
        ? wcMap[player.playerId] === true ||
          customWcMap[player.playerId] === true
        : false;
      return { ...player, isWc: updatedIsWc };
    });

    // ─── 여기서만 쓰는 임시 wildCardCount 계산 ───

    // 3) 배터(1~9번) WC 개수
    const batterWcCount = updatedCurrentPlayers
      .slice(0, -1) // 마지막 요소 제외
      .filter((p) => p.isWc).length; // WC인 선수만

    console.log("batterWcCount", batterWcCount);

    // 4) 투수(P행) WC 개수
    const pitcherWcCount = updatedCurrentPlayers
      .slice(-1) // 마지막 요소만 남음
      .filter((p) => p.isWc).length; // WC 여부 필터
    console.log("pitcherWcCount", pitcherWcCount);

    // 5) 합산
    const rawTotal = batterWcCount + pitcherWcCount;
    // 6) 배터와 투수 같은 ID 로 중복된 경우 1만 빼기

    // 1) pitcher: 배열의 마지막 요소를 가져오기
    const pitcher = updatedCurrentPlayers[updatedCurrentPlayers.length - 1];

    // 2) 마지막 행을 제외한 나머지에서 중복 검사
    const isDuplicate =
      pitcher &&
      updatedCurrentPlayers
        .slice(0, -1) // 마지막 요소(투수) 제외
        .some((p) => p.playerId === pitcher.playerId && p.isWc && pitcher.isWc);

    // 3) 최종 WC 카운트
    const wildCardCount = isDuplicate ? rawTotal - 1 : rawTotal;
    console.log("isDuplicate", isDuplicate);
    console.log("wildCardCount", wildCardCount);

    // 7) 최종 검증 (기존과 동일하게 wildCardCount 사용)
    if (wildCardCount > 3) {
      alert(
        `WC 조건을 만족하는 선수가 3명을 초과합니다. 현재 ${wildCardCount} 명`
      );
      return;
    }
    // ────────────────────────────────────────────────
    const nonPPlayers = updatedCurrentPlayers.slice(0, 9);
    console.log("nonPPlayers", nonPPlayers);
    const ids = nonPPlayers.map((p: any) => p.playerId);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      alert(
        "1번~9번 타순에 중복된 선수가 있습니다. 각 타자를 고유한 선수로 선택해주세요."
      );
      return;
    }

    const hasDHInNonP = nonPPlayers.some((p: any) => p.position === "DH");
    const requiredPositions = hasDHInNonP
      ? ["CF", "LF", "RF", "SS", "1B", "2B", "3B", "C", "DH"]
      : ["CF", "LF", "RF", "SS", "1B", "2B", "3B", "C", "P"];
    const assignedPositionsNonP = nonPPlayers
      .slice(0, 9)
      .map((p: any) => p.position);
    console.log("확인할 포지션", assignedPositionsNonP);
    const missingPositions = requiredPositions.filter(
      (pos) => !assignedPositionsNonP.includes(pos)
    );
    if (missingPositions.length > 0) {
      alert(`포지션 설정이 올바르지 않습니다.`);
      return;
    }
    // const pitcherCandidate = updatedCurrentPlayers.find(
    //   (p: any) => p.position === "P"
    // );
    const batters = updatedCurrentPlayers
      .filter((p: any) => p.battingOrder !== "P")
      .slice(0, -1)
      .map((p: any) => ({
        battingOrder: p.battingOrder,
        playerId: p.playerId,
        position: p.position,
      }));

    // pitcher: 항상 맨마지막행(index가 9인 선수)
    const pitcherRow = updatedCurrentPlayers[9]; //
    console.log(pitcherRow);

    const dupId = pitcherRow.playerId;
    if (nonPPlayers.some((p) => p.playerId === dupId && p.position !== "P")) {
      alert("한 선수가 야수인 동시에 투수일 수 없습니다");
      return;
    }
    const nonPPitchers = nonPPlayers.filter((p) => p.position === "P");
    // 하나라도 있으면 모두 마지막 pitcherRow.playerId 와 일치해야 함
    if (nonPPitchers.some((p) => p.playerId !== pitcherRow.playerId)) {
      alert("투수 이름이 일치하지 않습니다");
      return;
    }

    const formattedObject = {
      batters,
      pitcher: {
        playerId: pitcherRow?.playerId,
      },
    };
    console.log("Formatted Object:", JSON.stringify(formattedObject, null, 2));
    try {
      // 중복 제출 방지 시작
      setIsSubmitting(true);
      const gameId = router.query.recordId;
      const teamType = isHomeTeam ? "home" : "away";
      const url = `/games/${gameId}/lineup?teamType=${teamType}`;
      const response = await API.post(url, formattedObject);
      console.log("전송 성공:", response.data);

      router.push(`/matches/${gameId}/records`);
    } catch (error) {
      console.error("PATCH 요청 에러:", error);
    } finally {
      // 3) 제출 상태 해제
      setIsSubmitting(false);
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
            // 입력된 이름
            const currentName = watch(`players.${index}.name`) || "";

            // 실제 표시할 포지션 (API나 상태값에서 가져온 값)
            const actualPosition =
              player.position ||
              (isHomeTeam
                ? homeTeamPlayers[index]?.position
                : awayTeamPlayers[index]?.position) ||
              "";

            // 중복 포지션인지 여부
            const isDup = duplicatePositions.has(actualPosition);

            return (
              <PlayerRow key={`${player.battingOrder}-${index}`}>
                {/* 순번 */}
                <OrderNumber>{player.battingOrder}</OrderNumber>

                {/* 선수 이름 입력 */}
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
                      <div />
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

                {/* 포지션 */}
                {player.battingOrder !== "P" ? (
                  <PositionWrapper
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePositionClick(index);
                    }}
                  >
                    <PositionText
                      isPlaceholder={!actualPosition}
                      isDuplicate={isDup} // ← 중복 시 빨간색 처리
                    >
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
                          typeof player.battingOrder === "number" &&
                          player.battingOrder >= 6
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
          <ControlButton type="submit" disabled={isSubmitting}>
            교체완료
          </ControlButton>
        </ButtonWrapper>
      </form>
      {isModalOpen && <RecordStartModal setIsModalOpen={setIsModalOpen} />}
      {isPlayerSelectionModalOpen && (
        <SubPlayerSelectionModal
          setIsModalOpen={setIsPlayerSelectionModalOpen}
          onSelectPlayer={handleSelectPlayer}
          isPitcher={
            selectedPlayerIndex !== null &&
            players[selectedPlayerIndex].battingOrder === "P"
          }
          selectedPlayerIds={watch("players")
            .filter((_, idx) =>
              players[selectedPlayerIndex!].battingOrder === "P"
                ? idx === 9
                : idx < 9
            )
            .map((p: any) => p.playerId)
            .filter((id: number) => id != null)}
          rowOrder={players[selectedPlayerIndex!].battingOrder}
        />
      )}
    </Container>
  );
}
