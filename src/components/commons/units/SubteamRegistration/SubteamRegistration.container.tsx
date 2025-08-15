import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import {
  AwayTeamPlayerListState,
  HomeTeamPlayerListState,
  lastRouteState,
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
import {
  LoadingIcon,
  LoadingOverlay,
} from "../../../../commons/libraries/loadingOverlay";
import ErrorAlert from "../../../../commons/libraries/showErrorCode";
import {
  ModalButton,
  ModalButtonEx,
  ModalCancleButtonEx,
  ModalContainerEx,
  ModalOverlayEx,
  ModalTitleSmaller,
} from "../../modals/modal.style";

interface ISubTeamRegistrationProps {
  isHomeTeam: boolean;
}

export default function SubTeamRegistrationComponent({
  isHomeTeam,
}: ISubTeamRegistrationProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
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
  const [error, setError] = useState<any>(null);
  const [teamId, setTeamId] = useState<number | null>(null);

  useEffect(() => {
    const matchDataString = localStorage.getItem("selectedMatch");
    if (matchDataString) {
      try {
        const matchData = JSON.parse(matchDataString);
        const name = isHomeTeam
          ? matchData.homeTeam?.name || ""
          : matchData.awayTeam?.name || "";
        setTeamName(name);
        setTeamId(isHomeTeam ? matchData.homeTeam?.id : matchData.awayTeam?.id);
      } catch (err: any) {
        setError(err);
        console.error("JSON parsing error:", err);
      }
    }
  }, [router.asPath]);

  useEffect(() => {
    if (!recordId || !teamId) return;

    // if (!teamId) return;
    // const teamType = isHomeTeam ? "home" : "away";
    const url = `/games/${recordId}/teams/${teamId}/players-with-in-lineup`;
    console.log("url", url);
    console.log("요청시작");
    API.get(url)
      .then((res) => {
        const parsed =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const players = parsed.players;
        if (Array.isArray(players)) {
          isHomeTeam
            ? setHomeTeamPlayers(players)
            : setAwayTeamPlayers(players);
        } else {
          console.error("players가 배열이 아님:", players);
        }
      })
      .catch((err) => {
        setError(err);
        console.error("선수 목록 불러오기 실패:", err);
      });
  }, [router.asPath, recordId, teamId, isHomeTeam]);

  const allPlayersList = router.asPath.includes("homeTeamSubRegistration")
    ? homeTeamPlayers
    : awayTeamPlayers;

  const handleContainerClick = (e: React.MouseEvent) => e.stopPropagation();

  const [selectedPlayers, setSelectedPlayers] = useState<
    { id: number; name: string }[]
  >([]);

  const togglePlayerSelection = (player: {
    id: number;
    name: string;
    department: string;
    isWc: boolean;
  }) => {
    setSelectedPlayers((prev) =>
      prev.find((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, { id: player.id, name: player.name }]
    );
  };

  const proceedSubmission = async () => {
    setIsSubmitting(true);
    if (!recordId) {
      console.error("recordId가 존재하지 않습니다.");
      setIsSubmitting(false);
      return;
    }
    if (!teamId) return;
    const playerIds = selectedPlayers.map((p) => p.id);
    try {
      await API.post(`/games/${recordId}/teams/${teamId}/substitution`, {
        playerIds,
      });
      if (isHomeTeam) {
        router.push(`/matches/${recordId}/awayTeamRegistration`);
      } else {
        await API.post(`/games/${recordId}/start`);
        router.push(`/matches/${recordId}/records`);
      }
    } catch (err) {
      setError(err);
      console.error("교체명단 등록 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (selectedPlayers.length === 0) {
      setConfirmMessage(
        "교체선수를 한명도 선택하지 않았습니다.\n이대로 제출하시겠습니까?"
      );
      setConfirmOpen(true);
    } else {
      proceedSubmission();
    }
  };

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => setValidationError(msg);
    return () => {
      window.alert = originalAlert;
    };
  }, []);
  const [, setLastRoute] = useRecoilState(lastRouteState);
  // 페이지가 마운트될 때 현재 경로 저장
  useEffect(() => {
    if (router.pathname !== "/") {
      // 홈은 굳이 저장하지 않음
      setLastRoute(router.asPath);
    }
  }, [router.asPath]);

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
                  <td>{player.department}</td>
                  <td>{player.name}</td>
                  <td>
                    {player.isElite && player.isWc
                      ? "선출/WC"
                      : player.isElite
                      ? "선출"
                      : player.isWc
                      ? "WC"
                      : ""}
                  </td>
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
      {validationError && (
        <ModalOverlayEx>
          <ModalContainerEx>
            <ModalTitleSmaller>{validationError}</ModalTitleSmaller>
            <ModalButtonEx onClick={() => setValidationError(null)}>
              예
            </ModalButtonEx>
            <ModalCancleButtonEx onClick={() => setValidationError(null)}>
              아니오
            </ModalCancleButtonEx>
          </ModalContainerEx>
        </ModalOverlayEx>
      )}
      {confirmOpen && (
        <ModalOverlayEx>
          <ModalContainerEx>
            <ModalTitleSmaller>{confirmMessage}</ModalTitleSmaller>
            {/* <p style={{ whiteSpace: "pre-line", margin: "1rem 0" }}>
              {confirmMessage}
            </p> */}
            <ModalButtonEx
              onClick={() => {
                setConfirmOpen(false);
                proceedSubmission();
              }}
            >
              예
            </ModalButtonEx>
            <ModalCancleButtonEx onClick={() => setConfirmOpen(false)}>
              아니오
            </ModalCancleButtonEx>
          </ModalContainerEx>
        </ModalOverlayEx>
      )}
    </ModalOverlay>
  );
}
