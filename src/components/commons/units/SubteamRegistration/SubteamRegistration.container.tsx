import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import {
  AwayTeamPlayerListState,
  gameId,
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
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";

interface ISubTeamRegistrationProps {
  isHomeTeam: boolean;
}

export default function SubTeamRegistrationComponent({
  isHomeTeam,
}: ISubTeamRegistrationProps) {
  const router = useRouter();
  const recordId = router.query.recordId;
  const [homeTeamPlayers, setHomeTeamPlayers] = useRecoilState(
    HomeTeamPlayerListState
  );
  const [awayTeamPlayers, setAwayTeamPlayers] = useRecoilState(
    AwayTeamPlayerListState
  );

  const [teamName, setTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
        setError(err);
        const errorCode = err?.response?.data?.errorCode;
        console.error(err, "errorCode:", errorCode);
        console.error("JSON parsing error:", err);
      }
    }
  }, [isHomeTeam]);

  useEffect(() => {
    if (!recordId) return;

    const teamType = isHomeTeam ? "home" : "away";
    const url = `/games/${recordId}/players-with-in-lineup?teamType=${teamType}`;

    API.get(url, { withCredentials: true })
      .then((res) => {
        let parsedData;
        console.log("응답이 도착!(교체선수선택)");

        if (typeof res.data === "string") {
          try {
            parsedData = JSON.parse(res.data);
          } catch (e) {
            setError(e);
            const errorCode = e?.response?.data?.errorCode;
            console.error(e, "errorCode:", errorCode);
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
        setError(err);
        const errorCode = err?.response?.data?.errorCode;
        console.error(err, "errorCode:", errorCode);
        console.error("선수 목록 불러오기 실패:", err);
      });
  }, [recordId]);

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("선택된 선수 목록:", selectedPlayers);

    if (selectedPlayers.length === 0) {
      const proceed = window.confirm(
        "교체선수를 한명도 선택하지 않았습니다. 이대로 제출하시겠습니까?"
      );
      if (!proceed) {
        setIsSubmitting(false);
        return;
      }
    }

    if (!recordId) {
      console.error("recordId가 존재하지 않습니다.");
      setIsSubmitting(false);
      return;
    }

    const playerIds = selectedPlayers.map((p) => p.id);
    const payload = { playerIds };
    console.log(payload);

    try {
      const teamType = isHomeTeam ? "home" : "away";
      const res = await API.post(
        `/games/${recordId}/substitution?teamType=${teamType}`,
        payload,
        { withCredentials: true }
      );
      console.log(res.data);

      if (isHomeTeam) {
        router.push(`/matches/${recordId}/awayTeamRegistration`);
      } else {
        const startRes = await API.post(`/games/${recordId}/start`, {
          withCredentials: true,
        });
        console.log(startRes.data);
        router.push(`/matches/${recordId}/records`);
      }
    } catch (err) {
      setError(err);
      const errorCode = err?.response?.data?.errorCode;
      console.error(err, "errorCode:", errorCode);
      console.error("교체명단 등록 실패:", err);
    } finally {
      setIsSubmitting(false);
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
                    if (!isDisabled && !isSubmitting)
                      togglePlayerSelection(player);
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
          <ControlButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "제출 중..." : "제출하기"}
          </ControlButton>
        </ButtonContainer>
      </ModalContainer>
      <LoadingOverlay visible={isSubmitting}>
        <LoadingIcon spin fontSize={48} />
      </LoadingOverlay>
      <ErrorAlert error={error} />
    </ModalOverlay>
  );
}
