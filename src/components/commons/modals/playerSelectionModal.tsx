// PlayerSelectionModal.tsx (전체 코드)
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { playerListState } from "../../../commons/stores";

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
  margin-top: 80px;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  width: 300px; // 이걸로 모달 가로 길이 조정
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

  /* 기본 hover 효과 */
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

interface IPlayerSelectionModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPlayer: (playerName: string) => void;
  selectedPlayerNames: string[];
}

export default function PlayerSelectionModal({
  setIsModalOpen,
  onSelectPlayer,
  selectedPlayerNames,
}: IPlayerSelectionModalProps) {
  const [playerList] = useRecoilState(playerListState);

  // (1) 기존에는 filter로 "이미 선택된 선수"를 제외했지만
  //     이제는 전체 목록을 노출해야 하므로 그대로 사용
  const allPlayersList = playerList;

  const handleOverlayClick = () => {
    setIsModalOpen(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // (2) 이미 선택된 선수라면 클릭이 안 되도록 처리
  const handleRowClick = (playerName: string, isAlreadySelected: boolean) => {
    if (isAlreadySelected) return; // 이미 선택된 선수는 클릭 무효
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
            {allPlayersList.map((player, idx) => {
              const isAlreadySelected = selectedPlayerNames.includes(
                player.name
              );
              return (
                <tr
                  key={idx}
                  // 이미 선택된 선수면 onClick 무효 & 텍스트 회색 + 취소선
                  onClick={() => handleRowClick(player.name, isAlreadySelected)}
                  style={{
                    color: isAlreadySelected ? "gray" : "inherit",
                    cursor: isAlreadySelected ? "default" : "pointer",
                  }}
                >
                  <td>{player.department}</td>
                  <td>{player.name}</td>
                  <td>{player.wc || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </PlayerTable>
        <CloseButton onClick={() => setIsModalOpen(false)}>닫기</CloseButton>
      </ModalContainer>
    </ModalOverlay>
  );
}
