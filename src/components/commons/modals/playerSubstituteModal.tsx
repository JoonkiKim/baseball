import { useEffect } from "react";
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import API from "../../../commons/apis/api";
import {
  HomeTeamPlayerListState,
  AwayTeamPlayerListState,
} from "../../../commons/stores";

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
  /** P행 선택 여부 (true일 때 투수 대체 리스트 호출) */
  isPitcher: boolean;
  selectedPlayerNames: any[];
}

export default function SubPlayerSelectionModal({
  setIsModalOpen,
  onSelectPlayer,
  isPitcher,
}: IPlayerSelectionModalProps) {
  const router = useRouter();
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const isAway = router.query.isHomeTeam === "false";

  useEffect(() => {
    const recordId = router.query.recordId;
    if (!recordId) return;
    const teamType = isAway ? "home" : "away";
    const endpoint = isPitcher
      ? "substitutable-pitchers"
      : "substitutable-batters";

    API.get(`/games/${recordId}/${endpoint}?teamType=${teamType}`)
      .then((res) => {
        const data =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const list = data.players;
        if (isAway) setAwayTeamPlayers(list);
        else setHomeTeamPlayers(list);
      })
      .catch((err) => console.error("대체 선수 목록 요청 실패:", err));
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

  const players = isAway ? awayTeamPlayers : homeTeamPlayers;

  const handleRowClick = (player: any) => {
    if (!player.isSubstitutable) return;
    onSelectPlayer({
      name: player.name,
      playerId: player.id,
      wc: player.isWc ? "WC" : undefined,
    });
    setIsModalOpen(false);
  };

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
              const disabled = player.isSubstitutable === false;
              return (
                <tr
                  key={player.id}
                  onClick={() => handleRowClick(player)}
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
    </ModalOverlay>
  );
}
