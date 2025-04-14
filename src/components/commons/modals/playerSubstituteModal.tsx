import { useEffect } from "react";
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import API from "../../../commons/apis/api";
import {
  AwayTeamPlayerListState,
  HomeTeamPlayerListState,
} from "../../../commons/stores";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 120px; /* 헤더 높이 만큼 띄워줌 */
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start; /* 모달 컨텐츠가 헤더 밑에 표시되도록 */
  justify-content: center;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  width: 100vw; /* 테이블을 위해 살짝 넓힘 */
  height: 100vh; /* 모달의 높이를 고정 */
  max-height: calc(100vh - 120px); /* 헤더를 제외한 최대 높이 */
  margin-bottom: 200px;
  padding: 20px;
  text-align: center;
  overflow-y: auto; /* 콘텐츠가 높이를 넘으면 스크롤되도록 */
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

interface IPlayerSelectionModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPlayer: (selectedPlayer: {
    name: string;
    playerId: number;
    wc?: string;
  }) => void;
  selectedPlayerNames: string[];
}

export default function SubPlayerSelectionModal({
  setIsModalOpen,
  onSelectPlayer,
  selectedPlayerNames,
}: IPlayerSelectionModalProps) {
  const router = useRouter();

  // 홈팀, 원정팀 선수 목록 및 setter 불러오기
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );

  // 쿼리 파라미터 isHomeTeam가 "true"인지 판별 (방법1)
  const isHomeTeam = router.query.isHomeTeam === "true";

  // isHomeTeam에 따라 로컬스토리지에서 homeTeam 또는 awayTeam의 id로 GET 요청 보내기
  useEffect(() => {
    const selectedMatchStr = localStorage.getItem("selectedMatch");
    if (!selectedMatchStr) {
      console.error("selectedMatch 데이터가 로컬스토리지에 없습니다.");
      return;
    }
    try {
      const selectedMatch = JSON.parse(selectedMatchStr);
      if (isHomeTeam) {
        const homeTeamId = selectedMatch?.homeTeam?.id;
        if (homeTeamId) {
          API.get(`/teams/${homeTeamId}/players`)
            .then((res) => {
              // 응답이 JSON 문자열이면 파싱
              const parsedData =
                typeof res.data === "string" ? JSON.parse(res.data) : res.data;
              // parsedData.players에 실제 선수 배열이 있다고 가정
              setHomeTeamPlayers(parsedData.players);
              console.log("HomeTeam Players:", parsedData.players);
            })
            .catch((error) => {
              console.error("Error fetching homeTeam players:", error);
            });
        } else {
          console.error("homeTeam id가 존재하지 않습니다.");
        }
      } else {
        const awayTeamId = selectedMatch?.awayTeam?.id;
        if (awayTeamId) {
          API.get(`/teams/${awayTeamId}/players`)
            .then((res) => {
              const parsedData =
                typeof res.data === "string" ? JSON.parse(res.data) : res.data;
              setAwayTeamPlayers(parsedData.players);
              console.log("AwayTeam Players:", parsedData.players);
            })
            .catch((error) => {
              console.error("Error fetching awayTeam players:", error);
            });
        } else {
          console.error("awayTeam id가 존재하지 않습니다.");
        }
      }
    } catch (error) {
      console.error("로컬스토리지 파싱 에러:", error);
    }
  }, [isHomeTeam, setHomeTeamPlayers, setAwayTeamPlayers]);

  // 현재 URL에 따라 사용할 선수 목록 결정 (홈팀이면 homeTeamPlayers, 아니면 awayTeamPlayers)
  const allPlayersList = isHomeTeam ? homeTeamPlayers : awayTeamPlayers;

  // 모달이 열리면 히스토리 스택에 새 상태 추가 및 popstate 이벤트 처리
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      setIsModalOpen(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setIsModalOpen]);

  const handleOverlayClick = () => {
    setIsModalOpen(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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

    // 선택된 선수 정보 객체 생성
    const selectedPlayer = {
      name: player.name,
      playerId: player.id,
      wc: player.isWc ? "WC" : undefined,
    };

    // 선택된 선수 정보를 콘솔에 찍기
    console.log("선택된 선수 정보:", selectedPlayer);

    // 부모 컴포넌트에서 정의한 onSelectPlayer 함수 호출
    onSelectPlayer(selectedPlayer);
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
            {Array.isArray(allPlayersList) &&
              allPlayersList.map((player) => {
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
