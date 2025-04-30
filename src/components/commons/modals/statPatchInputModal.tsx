import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  LongModalContainer,
  ModalButton,
  ModalCancleButton,
  ModalContainer,
  ModalOverlay,
  ModalTitleSmall,
  StatPatchInput,
} from "./modal.style";
import API from "../../../commons/apis/api";
import { useModalBack } from "../../../commons/hooks/useModalBack";

/* ──────────────────────────────────────────
   props
   ────────────────────────────────────────── */
interface IStatPatchInputModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mode: "score" | "batter" | "pitcher"; // 어떤 스탯인지
  alertMessage: string; // FinalGameRecordPage 에서 넘어온 msg
}

type StatFields = Record<string, string | number>;

export default function StatPatchInputModal({
  setIsModalOpen,
  mode,
  alertMessage,
}: IStatPatchInputModalProps) {
  // useModalBack(() => setIsModalOpen(false));
  const router = useRouter();

  /* msg(문자열) → 객체로 변환 */
  const parseMessage = (msg: string): StatFields => {
    const obj: StatFields = {};
    msg.split("\n").forEach((line) => {
      if (!line.trim()) return;
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.trim();
      const value = rest.join(":").trim();
      obj[key] = isNaN(Number(value)) ? value : Number(value);
    });
    return obj;
  };

  /* 원본 스탯 */
  const [stat, setStat] = useState<StatFields>({});

  /* 파싱 & 초기값 세팅 */
  useEffect(() => {
    setStat(parseMessage(alertMessage));
  }, [alertMessage]);

  /* input onChange 헬퍼 */
  const handleChange = (key: string, val: string) => {
    setStat((prev) => ({
      ...prev,
      [key]: val === "" ? "" : isNaN(Number(val)) ? val : Number(val),
    }));
  };

  /* PATCH 요청 */
  const handleSubmit = async () => {
    try {
      const id = stat.id;
      if (!id) {
        alert("id가 없습니다.");
        return;
      }

      /* ❶ 영문 키 매핑 테이블 */
      const batterKeyMap: Record<string, string> = {
        타수: "AB",
        안타: "H",
        "볼넷/사구": "BB",
        "2루타": "2B",
        "3루타": "3B",
        홈런: "HR",
        희생타: "SAC",
      };
      const pitcherKeyMap: Record<string, string> = {
        삼진: "K",
      };

      /* ❷ id·이름 제외하고, 키 변환하여 body 구성 */
      const { id: _omit, 플레이어, playerName, ...rest } = stat;
      const body: Record<string, number> = {};
      Object.entries(rest).forEach(([k, v]) => {
        const key =
          mode === "batter"
            ? batterKeyMap[k] ?? k
            : mode === "pitcher"
            ? pitcherKeyMap[k] ?? k
            : k;
        body[key] = Number(v); // 숫자로 변환
      });

      /* ❸ URL 분기 동일 */
      const url =
        mode === "batter"
          ? `/games/${router.query.recordId}/results/batters/${id}`
          : mode === "pitcher"
          ? `/games/${router.query.recordId}/results/pitchers/${id}`
          : null;

      if (!url) {
        alert("수정에 실패하였습니다.");
        return;
      }
      console.log("url", url);

      console.log(body);
      console.log(id);
      const res = await API.patch(url, body);
      console.log("응답:", res.data);

      alert("스탯 수정이 완료되었습니다.");
      router.reload();
      setIsModalOpen(false);
    } catch (err) {
      const errorCode = err?.response?.data?.error_code; // 에러코드 추출
      console.error(err, "error_code:", errorCode);
      console.error(err);
      alert("수정 실패");
    }
  };
  /* ───────────────── UI 렌더 ───────────────── */
  return (
    <ModalOverlay>
      <LongModalContainer>
        <ModalTitleSmall>스탯을 수정해주세요</ModalTitleSmall>

        {/* id, playerName 은 읽기 전용으로 표시 */}
        {/* {"id" in stat && (
          <div style={{ marginBottom: 8 }}>
            <b>id</b>: {stat.id}
          </div>
        )} */}
        {("플레이어" in stat || "playerName" in stat) && (
          <div style={{ marginBottom: 30 }}>
            {stat["플레이어"] ?? stat.playerName}
          </div>
        )}

        {/* 숫자 스탯 input */}
        {Object.entries(stat).map(([key, value]) => {
          if (key === "id" || key === "플레이어" || key === "playerName")
            return null;

          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 25,
              }}
            >
              <label
                style={{
                  width: "20vw",
                  marginRight: 6,
                  textAlign: "left",
                  fontWeight: 600,
                }}
              >
                {key}
              </label>

              <StatPatchInput
                type="number"
                value={stat[key] as string | number}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          );
        })}

        <ModalButton onClick={handleSubmit}>수정하기</ModalButton>
        <ModalCancleButton onClick={() => setIsModalOpen(false)}>
          닫기
        </ModalCancleButton>
      </LongModalContainer>
    </ModalOverlay>
  );
}
