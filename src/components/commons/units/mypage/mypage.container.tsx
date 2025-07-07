import { useCallback, useEffect, useState } from "react";
import {
  PageWrapper,
  InfoRowWrapper,
  ActionWrapper,
  LabelWrapper,
  ValueWrapper,
  EmailWrapper,
  Title,
} from "./mypage.style";
import Link from "next/link";
import NickNamePutModal from "../../modals/nicknamePutModal";
import API from "../../../../commons/apis/api";
import LogOutModal from "../../modals/logOutModal";

interface User {
  id: number;
  nickname: string;
  photoUrl: string;
  email: string;
}

export default function MypageComponent() {
  // 예시 사용자 데이터
  const userExample: User = {
    id: 1,
    nickname: "예시입니다",
    photoUrl: "https://example.com/photo.jpg",
    email: "예시입니다",
  };
  // 모달 열림 상태 관리
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(userExample);
  // 1) loadProfile을 useCallback으로 감싸기
  const loadProfile = useCallback(async () => {
    try {
      // const res = await API.get<User>("/profile/me");
      // setUser(res.data);
      setUser(userExample);
    } catch (err) {
      console.error("프로필 로드 실패:", err);
    }
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 생성

  // 2) 마운트 시, 그리고 loadProfile이 변경될 때 호출
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // 3) 로딩 처리가 필요하다면 아래와 같이 early return
  if (!user.nickname) {
    return <div></div>;
  }

  console.log(user);

  return (
    <>
      <Title>내 정보</Title>
      <PageWrapper>
        <InfoRowWrapper>
          <LabelWrapper>닉네임</LabelWrapper>
          <ValueWrapper
            onClick={() => setIsAskModalOpen(true)}
            style={{ cursor: "pointer" }}
          >
            {user.nickname}
          </ValueWrapper>
        </InfoRowWrapper>

        <InfoRowWrapper>
          <LabelWrapper>이메일</LabelWrapper>
          <EmailWrapper>{user.email}</EmailWrapper>
        </InfoRowWrapper>

        <ActionWrapper>
          <Link href="/changePassword" passHref>
            <a>
              <LabelWrapper>비밀번호 변경</LabelWrapper>
            </a>
          </Link>
        </ActionWrapper>

        <ActionWrapper>
          {/* 3) 클릭하면 모달을 연다 */}
          <LabelWrapper
            style={{ cursor: "pointer" }}
            onClick={() => setIsLogOutModalOpen(true)}
          >
            로그아웃
          </LabelWrapper>
        </ActionWrapper>

        <ActionWrapper>
          <LabelWrapper>회원탈퇴</LabelWrapper>
        </ActionWrapper>
      </PageWrapper>
      {/* 4) 로그아웃 모달 조건부 렌더링 */}
      {isLogOutModalOpen && (
        <LogOutModal
          setIsLogOutModalOpen={setIsLogOutModalOpen}
          inningScore={0} // LogOutModal 인터페이스가 inningScore를 요구하므로 임시로 0 전달
        />
      )}

      {/* 모달 조건부 렌더링 */}
      {isAskModalOpen && (
        <NickNamePutModal
          setIsModalOpen={setIsAskModalOpen}
          cellValue={user.nickname}
          onSuccess={loadProfile}
        />
      )}
    </>
  );
}
