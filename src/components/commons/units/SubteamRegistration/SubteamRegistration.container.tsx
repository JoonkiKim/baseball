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
import RecordStartModal from "../../modals/recordStart";

interface ISubTeamRegistrationProps {
  isHomeTeam: boolean;
}

export default function SubTeamRegistrationComponent({
  isHomeTeam,
}: ISubTeamRegistrationProps) {
  const router = useRouter();
  // const [isModalOpen, setIsModalOpen] = useState(false);
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
        const errorCode = err?.response?.data?.error_code; // 에러코드 추출
        console.error(err, "error_code:", errorCode);
        console.error("JSON parsing error:", err);
      }
    }
  }, [isHomeTeam]);

  useEffect(() => {
    const recordId = router.query.recordId;
    if (!recordId) return;

    const teamType = isHomeTeam ? "home" : "away";
    const url = `/games/${recordId}/players-with-in-lineup?teamType=${teamType}`;

    API.get(url)
      .then((res) => {
        let parsedData;

        if (typeof res.data === "string") {
          try {
            parsedData = JSON.parse(res.data);
          } catch (e) {
            const errorCode = e?.response?.data?.error_code; // 에러코드 추출
            console.error(e, "error_code:", errorCode);
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
        const errorCode = err?.response?.data?.error_code; // 에러코드 추출
        console.error(err, "error_code:", errorCode);
        console.error("선수 목록 불러오기 실패:", err);
      });
  }, [isHomeTeam, router.query.recordId]);

  const allPlayersList = router.asPath.includes("homeTeamSubRegistration")
    ? homeTeamPlayers
    : awayTeamPlayers;
  console.log("allPlayersList:", allPlayersList);

  const handleContainerClick = (e: React.MouseEvent) => e.stopPropagation();

  const [selectedPlayers, setSelectedPlayers] = useState<
    { id: number; name: string }[]
  >([]);

  const togglePlayerSelection = (player: {
    id: number;
    name: string;
    departmentName: string;
    isWc: boolean;
  }) => {
    setSelectedPlayers((prev) =>
      prev.find((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, { id: player.id, name: player.name }]
    );
  };
  const handleSubmit = async () => {
    console.log("선택된 선수 목록:", selectedPlayers);
    // ① 아무도 선택하지 않은 경우 먼저 확인을 받는다
    if (selectedPlayers.length === 0) {
      const proceed = window.confirm(
        "교체선수를 한명도 선택하지 않았습니다. 이대로 제출하시겠습니까?"
      );
      if (!proceed) return; // 사용자가 취소를 누르면 여기서 중단
    }

    console.log("선택된 선수 목록:", selectedPlayers);
    const recordId = router.query.recordId;

    if (!recordId) {
      console.error("recordId가 존재하지 않습니다.");
      return;
    }

    // ② 선택한 선수 id만 추출해 요청 바디를 만든다
    const playerIds = selectedPlayers.map((p) => p.id);
    const payload = { playerIds };
    console.log(payload);

    try {
      const teamType = isHomeTeam ? "home" : "away";
      const res = await API.post(
        `/games/${recordId}/substitution?teamType=${teamType}`,
        payload
      );
      console.log(res.data);

      if (isHomeTeam) {
        router.push(`/matches/${recordId}/awayTeamRegistration`);
      } else {
        // setIsModalOpen(true)
        const res = await API.post(`/games/${recordId}/start`);
        console.log(res.data);
        router.push(`/matches/${recordId}/records`);
      }
    } catch (err) {
      const errorCode = err?.response?.data?.error_code; // 에러코드 추출
      console.error(err, "error_code:", errorCode);
      console.error("교체명단 등록 실패:", err);
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
              const isDisabled = player.inLineup;

              return (
                <tr
                  key={player.id}
                  onClick={() => {
                    if (!isDisabled) togglePlayerSelection(player);
                  }}
                  style={{
                    backgroundColor: isSelected ? "#f2f2f2" : "transparent",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    color: isDisabled ? "#999" : "#000",
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
      {/* {isModalOpen && <RecordStartModal setIsModalOpen={setIsModalOpen} />} */}
    </ModalOverlay>
  );
}
