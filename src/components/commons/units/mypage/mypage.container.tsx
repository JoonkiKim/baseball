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

interface User {
  id: number;
  nickname: string;
  photoUrl: string;
  email: string;
}

export default function MypageComponent() {
  // 예시 사용자 데이터
  const user: User = {
    id: 1,
    nickname: "관악산벌꿀오소리",
    photoUrl: "https://example.com/photo.jpg",
    email: "keroro1967@snu.ac.kr",
  };

  return (
    <>
      <Title>내 정보</Title>
      <PageWrapper>
        <InfoRowWrapper>
          <LabelWrapper>닉네임</LabelWrapper>
          <ValueWrapper>{user.nickname}</ValueWrapper>
        </InfoRowWrapper>

        <InfoRowWrapper>
          <LabelWrapper>이메일</LabelWrapper>
          <EmailWrapper>{user.email}</EmailWrapper>
        </InfoRowWrapper>

        <ActionWrapper>
          <Link href="/login/findPassword" passHref>
            <a>
              <LabelWrapper>비밀번호 변경</LabelWrapper>
            </a>
          </Link>
        </ActionWrapper>

        <ActionWrapper>
          <LabelWrapper>로그아웃</LabelWrapper>
        </ActionWrapper>

        <ActionWrapper>
          <LabelWrapper>회원탈퇴</LabelWrapper>
        </ActionWrapper>
      </PageWrapper>
    </>
  );
}
