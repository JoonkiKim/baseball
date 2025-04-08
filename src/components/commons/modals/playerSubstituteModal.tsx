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
  display: flex;
  align-items: center;
  margin-top: 120px;
  justify-content: center;
`;

// ModalContainer의 높이를 70vh로 설정하고 내부 스크롤 추가
export const ModalContainer = styled.div`
  background-color: #fff;
  /* background-color: red; */
  width: 100vw; /* 테이블을 위해 살짝 넓힘 */
  height: calc((100vh - 120px));
  padding: 20px;
  /* border-radius: 8px; */
  text-align: center;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 35px;
  margin-top: 35px;
  font-size: 18px;
`;

// 테이블 스타일 예시
export const PlayerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    /* border-bottom: 1px solid #ddd; */
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
  /* background-color: red; */
  display: flex;
  justify-content: flex-end; /* 컨텐츠(버튼)를 오른쪽에 정렬 */
  align-items: center;
  padding: 10px; /* 필요에 따라 추가 */
`;

export const CloseButton = styled.button`
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

interface IPlayerSubstituteModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPlayer: (playerName: string) => void;
  selectedPlayerNames: string[]; // 이미 선택된 선수 이름 배열
}

export default function PlayerSubstituteModal({
  setIsModalOpen,
  onSelectPlayer,
  selectedPlayerNames,
}: IPlayerSubstituteModalProps) {
  const [playerList] = useRecoilState(playerListState);

  // 전체 플레이어 목록을 그대로 사용 (이미 선택된 선수는 별도 스타일 처리)
  const handleOverlayClick = () => {
    setIsModalOpen(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRowClick = (playerName: string, isAlreadySelected: boolean) => {
    if (isAlreadySelected) return; // 이미 선택된 선수는 클릭 무효
    onSelectPlayer(playerName);
    setIsModalOpen(false);
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer onClick={handleContainerClick}>
        <ModalTitle>교체할 선수를 선택해주세요</ModalTitle>
        <PlayerTable>
          <thead>
            <tr>
              <th>학과</th>
              <th>성명</th>
              <th>선출/WC</th>
            </tr>
          </thead>
          <tbody>
            {playerList.map((player, idx) => {
              const isAlreadySelected = selectedPlayerNames.includes(
                player.name
              );
              return (
                <tr
                  key={idx}
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
        <ButtonContainer>
          <CloseButton onClick={() => setIsModalOpen(false)}>
            뒤로가기
          </CloseButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
}
