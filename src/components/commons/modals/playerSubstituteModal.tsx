import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import API from "../../../commons/apis/api";
import {
  HomeTeamPlayerListState,
  AwayTeamPlayerListState,
} from "../../../commons/stores";
import ErrorAlert from "../../../commons/libraries/showErrorCode";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  width: 100vw;
  height: 100vh;
  max-height: calc(100vh - 120px);
  margin-bottom: 200px;
  padding: 20px;
  text-align: center;
  overflow-y: auto;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 35px;
  margin-top: 35px;
  font-size: 18px;
  font-family: "KBO-Dia-Gothic_bold";
`;

export const PlayerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    padding: 10px;
    font-size: 14px;
    text-align: center;
  }

  th {
    background-color: white;
    border-bottom: 1px solid black;
    border-top: 1px solid black;
  }

  tr:last-of-type td {
    border-bottom: none;
  }
`;

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
`;

export const ControlButton = styled.button`
  background-color: #000;
  width: 26vw;
  height: 4.5vh;
  border: 1px solid #999;
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
`;

interface IPlayerSelectionModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPlayer: (selected: {
    name: string;
    playerId: number;
    wc?: string;
  }) => void;
  isPitcher: boolean;
  selectedPlayerIds: number[];
  rowOrder: number | string;
}

export default function SubPlayerSelectionModal({
  setIsModalOpen,
  onSelectPlayer,
  isPitcher,
  selectedPlayerIds,
  rowOrder,
}: IPlayerSelectionModalProps) {
  const router = useRouter();
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const isAway = router.query.isHomeTeam === "false";
  const [error, setError] = useState(null);

  useEffect(() => {
    const recordId = router.query.recordId;
    if (!recordId) return;
    const teamType = isAway ? "away" : "home";
    const endpoint = isPitcher
      ? "substitutable-pitchers"
      : "substitutable-batters";

    API.get(`/games/${recordId}/${endpoint}?teamType=${teamType}`, {
      withCredentials: true,
    })
      .then((res) => {
        const data =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const list = data.players;
        if (isAway) setAwayTeamPlayers(list);
        else setHomeTeamPlayers(list);
      })
      .catch((err) => {
        const errorCode = err?.response?.data?.errorCode; // 에러코드 추출
        console.error(err, "errorCode:", errorCode);
        setError(err);
      });
  }, [
    isAway,
    isPitcher,
    router.query.recordId,
    setAwayTeamPlayers,
    setHomeTeamPlayers,
  ]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPop = () => setIsModalOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setIsModalOpen]);

  // 1) localStorage 에서 최소 라인업 정보 꺼내기
  const teamType = router.query.isHomeTeam === "false" ? "away" : "home";
  const minimalRaw = localStorage.getItem(`lineup_${teamType}`);
  const minimal = minimalRaw ? JSON.parse(minimalRaw) : { batters: [] };
  const originalBatters: { battingOrder: number; playerId: number }[] =
    minimal.batters || [];
  const originalPitcherId: number | null = minimal.pitcher?.playerId ?? null;
  const players = isAway ? awayTeamPlayers : homeTeamPlayers;

  const handleRowClick = (player: any) => {
    onSelectPlayer({
      name: player.name,
      playerId: player.id,
      wc: player.isWc ? "WC" : undefined,
    });
    setIsModalOpen(false);
  };

  console.log("isPitcher", isPitcher);
  console.log(rowOrder);
  return (
    <ModalOverlay onClick={() => setIsModalOpen(false)}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalTitle>선수를 선택해주세요</ModalTitle>
        <PlayerTable>
          <thead>
            <tr>
              <th>학과</th>
              <th>성명</th>
              <th>선출/WC</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              let disabled: boolean;

              if (isPitcher) {
                // P행: 원래 타자나 원래 투수는 반드시 선택 가능
                const isOriginalBatter = originalBatters.some(
                  (b) => b.playerId === player.id
                );
                if (isOriginalBatter || player.id === originalPitcherId) {
                  disabled = false;
                  //  현재 타자투수 라인업명단에 있으면 무조건 선택가능하고, 현재 명단에 없는데 isSub = false이면 선택 불가능
                } else if (player.isSubstitutable) {
                  // 대체 가능한 투수는 이미 선택된 경우만 차단
                  console.log(player.name, player.isSubstitutable);
                  disabled = selectedPlayerIds.includes(player.id);
                } else {
                  // 그 외 교체 불가능 선수는 차단
                  disabled = true;
                }
              } else {
                // 1~9번 타순: 원래 투수는 반드시 선택 가능
                if (player.id === originalPitcherId) {
                  disabled = false;
                } else if (player.isSubstitutable) {
                  // 대체 가능한 타자는 이미 선택된 경우만 차단
                  disabled = selectedPlayerIds.includes(player.id);
                } else {
                  // 그 외 교체 불가능 타자는
                  // 해당 자리에서 교체된 원래 타자만 선택 가능
                  const substitutedOut = originalBatters.filter(
                    (b) => !selectedPlayerIds.includes(b.playerId)
                  );
                  const candidate = substitutedOut.find(
                    (b) => b.battingOrder === rowOrder
                  );
                  disabled = !(candidate && candidate.playerId === player.id);
                }
              }

              return (
                <tr
                  key={player.id}
                  onClick={() => !disabled && handleRowClick(player)}
                  style={{
                    color: disabled ? "gray" : undefined,
                    cursor: disabled ? "default" : "pointer",
                  }}
                >
                  <td>{player.departmentName}</td>
                  <td>{player.name}</td>
                  <td>{player.isWc ? "WC" : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </PlayerTable>
        <ButtonContainer>
          <ControlButton onClick={() => setIsModalOpen(false)}>
            닫기
          </ControlButton>
        </ButtonContainer>
      </ModalContainer>
      <ErrorAlert error={error} />
    </ModalOverlay>
  );
}
