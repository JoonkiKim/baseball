import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import {
  AwayTeamPlayerListState,
  HomeTeamPlayerListState,
} from "../../../../commons/stores";
import {
  ButtonContainer,
  ControlButton,
  ModalContainer,
  ModalOverlay,
  ModalSmallTitle,
  ModalTitle,
  PlayerTable,
} from "./SubteamRegistration.style";
import API from "../../../../commons/apis/api";

interface ISubTeamRegistrationProps {
  // setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // onSelectPlayer: (selectedPlayer: {
  //   name: string;
  //   playerId: number;
  //   wc?: string;
  // }) => void;
  // selectedPlayerNames: string[];
  // allowDuplicates: boolean; // P행에서 중복 선택 허용 여부
  isHomeTeam: boolean;
}

export default function SubTeamRegistrationComponent({
  isHomeTeam,
}: ISubTeamRegistrationProps) {
  const router = useRouter();
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );

  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const matchDataString = localStorage.getItem("selectedMatch");
    if (matchDataString) {
      try {
        const matchData = JSON.parse(matchDataString);
        const name = isHomeTeam
          ? matchData.homeTeam?.name || ""
          : matchData.awayTeam?.name || "";
        setTeamName(name);
      } catch (err) {
        console.error("JSON parsing error:", err);
      }
    }
  }, [isHomeTeam]); // isHomeTeam 변경될 때만 다시 실행

  useEffect(() => {
    const recordId = router.query.recordId;
    if (!recordId) return;

    const teamType = isHomeTeam ? "home" : "away";
    const url = `/games/${recordId}/players?teamType=${teamType}`;

    API.get(url)
      .then((res) => {
        let parsedData;

        // JSON 파싱
        if (typeof res.data === "string") {
          try {
            parsedData = JSON.parse(res.data);
          } catch (e) {
            console.error("응답 JSON 파싱 실패:", e);
            return;
          }
        } else {
          parsedData = res.data;
        }

        const players = parsedData.players;
        if (!Array.isArray(players)) {
          console.error("players가 배열이 아님:", players);
          return;
        }

        if (isHomeTeam) {
          setHomeTeamPlayers(players);
          console.log("home", players);
        } else {
          setAwayTeamPlayers(players);
          console.log("away", players);
        }
      })
      .catch((err) => {
        console.error("선수 목록 불러오기 실패:", err);
      });
  }, [isHomeTeam, router.query.recordId]);

  const allPlayersList = router.asPath.includes("homeTeamSubRegistration")
    ? homeTeamPlayers
    : awayTeamPlayers;
  console.log("allPlayersList:", allPlayersList);

  const handleContainerClick = (e: React.MouseEvent) => e.stopPropagation();

  // 1) 선택된 선수 배열 상태 (id, name)
  const [selectedPlayers, setSelectedPlayers] = useState<
    { id: number; name: string }[]
  >([]);

  // 2) 클릭 토글 함수
  const togglePlayerSelection = (player: {
    id: number;
    name: string;
    departmentName: string;
    isWc: boolean;
  }) => {
    setSelectedPlayers((prev) => {
      const exists = prev.find((p) => p.id === player.id);
      if (exists) {
        // 이미 있으면 제거
        return prev.filter((p) => p.id !== player.id);
      } else {
        // 없으면 추가
        return [...prev, { id: player.id, name: player.name }];
      }
    });
  };

  const handleSubmit = async () => {
    // 선택된 선수 배열 로그
    console.log("선택된 선수 목록:", selectedPlayers);
    const recordId = router.query.recordId;

    if (!recordId) {
      console.error("recordId가 존재하지 않습니다.");
      return;
    }

    if (isHomeTeam) {
      // 홈팀이면 어웨이 팀 교체등록 페이지로 이동
      router.push(
        `/matches/${recordId}/awayTeamRegistration/awayTeamSubRegistration`
      );
    } else {
      // 어웨이팀이면 경기 시작 요청 후 기록 페이지로 이동
      try {
        await API.post(`/games/${recordId}/start`);
        router.push(`/matches/${recordId}/records`);
      } catch (err) {
        console.error("경기 시작 요청 실패:", err);
      }
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer onClick={handleContainerClick}>
        <ModalTitle>교체명단을 등록해주세요</ModalTitle>
        <ModalSmallTitle>{teamName} 야구부</ModalSmallTitle>
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
              const isSelected = selectedPlayers.some(
                (p) => p.id === player.id
              );
              const isDisabled = player.inLineup; // 이미 라인업에 올라간 선수는 비활성화

              return (
                <tr
                  key={player.id}
                  // inLineup 선수는 클릭해도 아무 동작 안 하도록
                  onClick={() => {
                    if (!isDisabled) togglePlayerSelection(player);
                  }}
                  style={{
                    backgroundColor: isSelected ? "#f2f2f2" : "transparent",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    color: isDisabled ? "#999" : "#000", // disabled 느낌을 주기 위해 색상 변경
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
          <ControlButton onClick={handleSubmit}>제출하기</ControlButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
}
