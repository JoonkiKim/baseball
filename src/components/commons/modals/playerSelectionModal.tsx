import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import {
  AwayTeamPlayerListState,
  HomeTeamPlayerListState,
  playerListState,
} from "../../../commons/stores";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  margin-top: 120px;
  justify-content: center;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  width: 100vw; /* 테이블을 위해 살짝 넓힘 */
  height: calc((100vh - 120px));
  padding: 20px;
  /* border-radius: 8px; */
  text-align: center;
  overflow-y: auto;
`;
export const ModalTitle = styled.h2`
  margin-bottom: 35px;
  margin-top: 35px;
  font-size: 18px;
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

  tbody tr:hover {
    background-color: #f2f2f2;
    cursor: pointer;
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
  background-color: #000000;
  width: 26vw;
  height: 4.5vh;
  border: 1px solid #999;
  font-family: "KBO-Dia-Gothic_bold";
  font-weight: bold;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
`;

// onSelectPlayer에서 전달받는 객체는 { name: string, playerId: number, wc?: string } 형태입니다.
interface IPlayerSelectionModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPlayer: (selectedPlayer: {
    name: string;
    playerId: number;
    wc?: string;
  }) => void;
  selectedPlayerNames: string[];
}

export default function PlayerSelectionModal({
  setIsModalOpen,
  onSelectPlayer,
  selectedPlayerNames,
}: IPlayerSelectionModalProps) {
  const router = useRouter();

  // 홈팀 선수 목록, 원정팀 선수 목록 리코일 상태 불러오기
  const [homeTeamPlayers] = useRecoilState(HomeTeamPlayerListState);
  const [awayTeamPlayers] = useRecoilState(AwayTeamPlayerListState);

  // 현재 URL에 따라 사용할 선수 목록을 결정합니다.
  const allPlayersList = router.asPath.includes("homeTeamRegistration")
    ? homeTeamPlayers
    : awayTeamPlayers;

  const handleOverlayClick = () => {
    setIsModalOpen(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 이미 선택된 선수면 클릭이 무효하도록 처리하고,
  // onSelectPlayer에 전달 시 IHAPlayer의 필드들을 변환하여 전달합니다.
  const handleRowClick = (
    player: {
      id: number;
      departmentName: string;
      name: string;
      isElite: boolean;
      isWc: boolean;
    },
    isAlreadySelected: boolean
  ) => {
    if (isAlreadySelected) return;
    onSelectPlayer({
      name: player.name,
      playerId: player.id,
      wc: player.isWc ? "WC" : undefined,
    });
    setIsModalOpen(false);
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer onClick={handleContainerClick}>
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
            {allPlayersList.map((player) => {
              const isAlreadySelected = selectedPlayerNames.includes(
                player.name
              );
              return (
                <tr
                  key={player.id}
                  onClick={() => handleRowClick(player, isAlreadySelected)}
                  style={{
                    color: isAlreadySelected ? "gray" : "inherit",
                    cursor: isAlreadySelected ? "default" : "pointer",
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
