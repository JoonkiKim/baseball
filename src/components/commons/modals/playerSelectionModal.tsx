import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { playerListState } from "../../../commons/stores";

// ModalOverlay를 full-screen으로 설정
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ModalContainer의 높이를 50vh로 설정하고 내부 스크롤 추가
export const ModalContainer = styled.div`
  background-color: #fff;
  width: 400px; /* 테이블을 위해 살짝 넓힘 */
  height: 70vh;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  overflow-y: auto;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 18px;
`;

// 테이블 스타일 예시
export const PlayerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    border-bottom: 1px solid #ddd;
    padding: 10px;
    font-size: 14px;
    text-align: center;
  }

  th {
    background-color: #f7f7f7;
  }

  tr:last-of-type td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: #f2f2f2;
    cursor: pointer;
  }
`;

export const CloseButton = styled.button`
  background-color: #0f0f70;
  border: none;
  color: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #2f2f9f;
  }
`;

interface IPlayer {
  department: string; // 학과
  name: string; // 이름
  wc?: string; // '선출', 'WC', '선출/WC' 등
}

interface IPlayerSelectionModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPlayer: (playerName: string) => void;
}

export default function PlayerSelectionModal({
  setIsModalOpen,
  onSelectPlayer,
}: IPlayerSelectionModalProps) {
  const [playerList] = useRecoilState(playerListState);

  const handleOverlayClick = () => {
    setIsModalOpen(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRowClick = (playerName: string) => {
    onSelectPlayer(playerName);
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
            {playerList.map((player, idx) => (
              <tr key={idx} onClick={() => handleRowClick(player.name)}>
                <td>{player.department}</td>
                <td>{player.name}</td>
                <td>{player.wc || ""}</td>
              </tr>
            ))}
          </tbody>
        </PlayerTable>
        <CloseButton onClick={() => setIsModalOpen(false)}>닫기</CloseButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
