"use client";

import React from "react";
import styled from "@emotion/styled";

// ─── 루트 컨테이너 ─────────────────────────────
const Container = styled.div`
  box-sizing: border-box;
  background: var(--white, #ffffff);
  height: 812px;
  position: relative;
  overflow: hidden;
`;

// ─── 배경 및 날짜 영역 ─────────────────────────────
const Background = styled.div`
  background: var(--green-primary, #5db075);
  height: 147px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const DaysOfWeekContainer = styled.div`
  width: 334px;
  height: 24px;
  position: static;
`;

const LeftArrow = styled.div`
  color: #000000;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  position: absolute;
  left: calc(50% - 166.5px);
  top: 173px;
`;

const DateDisplay = styled.div`
  color: #000000;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 20px;
  font-weight: 400;
  position: absolute;
  left: calc(50% - 73.5px);
  top: 173px;
`;

const RightArrow = styled.div`
  color: #000000;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  position: absolute;
  left: calc(50% - -156.5px);
  top: 173px;
`;

const CalendarIcon = styled.img`
  width: 21px;
  height: 21px;
  position: absolute;
  left: 278px;
  top: 174px;
  object-fit: cover;
  aspect-ratio: 1;
`;

// ─── 경기 카드 공통 스타일 ─────────────────────────────
const MatchCard = styled.div`
  width: 343px;
  height: 76px;
  position: absolute;
  left: 19px;
`;

// 각 경기 카드의 top 위치만 다르므로 확장해서 사용합니다.
const MatchCard1 = styled(MatchCard)`
  top: 339px;
`;
const MatchCard2 = styled(MatchCard)`
  top: 433px;
`;
const MatchCard3 = styled(MatchCard)`
  top: 527px;
`;
const MatchCard4 = styled(MatchCard)`
  top: 621px;
`;
const MatchCard5 = styled(MatchCard)`
  top: 245px;
`;

// ─── 경기 카드 내부 ─────────────────────────────
const Divider = styled.div`
  margin-top: -1px;
  border-style: solid;
  border-color: var(--gray-02, #e8e8e8);
  border-width: 1px 0 0 0;
  height: 0px;
  position: absolute;
  top: 65px;
  left: 0;
  right: 0;
`;

const MatchTimeLabel = styled.div`
  color: var(--black, #000000);
  text-align: left;
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  position: absolute;
  left: 11px;
  top: 21px;
`;

const MatchInfoContainer = styled.div`
  width: 192px;
  height: 62px;
  position: static;
`;

const TeamLeft = styled.div`
  width: 68px;
  height: 62px;
  position: absolute;
  left: 195px;
  top: calc(50% - 39px);
  overflow: hidden;
`;

const TeamScoreLeft = styled.div`
  color: var(--black, #000000);
  text-align: left;
  font-family: "Inter-Medium", sans-serif;
  font-size: 12px;
  font-weight: 500;
  position: absolute;
  left: 31px;
  top: 37px;
`;

const TeamNameLeft = styled.div`
  color: var(--black, #000000);
  text-align: left;
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  position: absolute;
  left: 12px;
  top: 11px;
`;

const TeamRight = styled.div`
  width: 68px;
  height: 62px;
  position: absolute;
  left: 71px;
  top: -1px;
  overflow: hidden;
`;

const TeamScoreRight = styled.div`
  color: #ff0000;
  text-align: left;
  font-family: "Inter-Medium", sans-serif;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
  position: absolute;
  left: 31px;
  top: 37px;
`;

const TeamNameRight = styled.div`
  color: var(--black, #000000);
  text-align: left;
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  position: absolute;
  left: 12px;
  top: 11px;
`;

const VsText = styled.div`
  color: #000000;
  text-align: left;
  font-family: "Inter-Medium", sans-serif;
  font-size: 16px;
  font-weight: 500;
  position: absolute;
  left: 164px;
  top: 17px;
`;

const RecordButton = styled.div`
  background: var(--grey-400, #bdbdbd);
  border-radius: 4px;
  padding: 16px 24px;
  width: 60px;
  height: 40%;
  position: absolute;
  left: calc(50% - -96.5px);
  top: 17.47%;
  bottom: 42.53%;
`;

const RecordButtonText = styled.div`
  color: #000000;
  text-align: right;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  font-weight: 400;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
`;

// ─── iOS 상태바 영역 ─────────────────────────────
const IOSStatusBarWhite = styled.div`
  height: 44px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const IOSStatusBarBlack = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
`;

const BgImage = styled.img`
  height: auto;
  position: absolute;
  top: -2px;
  bottom: 16px;
  left: 78px;
  right: 78px;
  overflow: visible;
`;

const RightSideImage = styled.img`
  height: auto;
  position: absolute;
  top: 17.33px;
  left: 293.67px;
  overflow: visible;
`;

const LeftSideImage = styled.img`
  height: auto;
  position: absolute;
  top: 17.17px;
  left: 33.45px;
  overflow: visible;
`;

// ─── 하단 네비게이션 영역 ─────────────────────────────
const BottomNav = styled.div`
  background: #ffffff;
  width: 375px;
  height: 83px;
  position: absolute;
  left: 0;
  top: 727px;
  overflow: hidden;
`;

const Group5 = styled.div`
  position: absolute;
  inset: 0;
`;

const RectangleLeft = styled.div`
  background: #d9d9d9;
  border: 1px solid #000000;
  width: 125px;
  height: 83px;
  position: absolute;
  left: 125px;
  top: 1px;
`;

const NavTextLeft = styled.div`
  color: #000000;
  text-align: right;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  top: 32px;
`;

const RectangleCenter = styled.div`
  background: #d9d9d9;
  border-style: solid;
  border-color: #000000;
  border-width: 1px 0 1px 1px;
  width: 125px;
  height: 83px;
  position: absolute;
  left: 250px;
  top: 1px;
`;

const NavTextCenter = styled.div`
  color: #000000;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  position: absolute;
  left: calc(50% - -95.5px);
  top: 32px;
`;

const Group2 = styled.div`
  position: absolute;
  inset: 0;
`;

const RectangleRight = styled.div`
  background: #d9d9d9;
  border-style: solid;
  border-color: #000000;
  border-width: 1px 1px 1px 0;
  width: 125px;
  height: 83px;
  position: absolute;
  left: 0;
  top: 1px;
`;

const NavTextRight = styled.div`
  color: #000000;
  text-align: right;
  font-family: "Inter-Regular", sans-serif;
  font-size: 16px;
  font-weight: 400;
  position: absolute;
  left: 33px;
  top: 33px;
`;

// ─── 페이지 헤더 및 최종 버튼 ─────────────────────────────
const PageHeader = styled.div`
  height: 36px;
  position: absolute;
  top: 74px;
  left: 13px;
  right: 19px;
`;

const PageTitle = styled.div`
  color: var(--white, #ffffff);
  text-align: center;
  font-family: "Inter-SemiBold", sans-serif;
  font-size: 30px;
  font-weight: 600;
  position: absolute;
  left: calc(50% - 140.5px);
  top: 0;
`;

const FinalButton = styled.div`
  background: var(--grey-400, #bdbdbd);
  border-radius: 4px;
  padding: 16px 24px;
  width: 54px;
  height: 2.09%;
  position: absolute;
  left: calc(50% - -120.5px);
  top: 14.53%;
  bottom: 83.37%;
`;

const FinalButtonText = styled.div`
  color: #000000;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  font-weight: 400;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
`;

export default function SchedulePage() {
  return (
    <Container>
      <Background />
      <DaysOfWeekContainer>
        <LeftArrow>&lt;</LeftArrow>
        <DateDisplay>2025. 04. 13 (일)</DateDisplay>
        <RightArrow>&gt;</RightArrow>
        <CalendarIcon src="image-10.png" alt="Calendar Icon" />
      </DaysOfWeekContainer>

      {/* 경기 카드 1 */}
      <MatchCard1>
        <Divider />
        <Divider />
        <MatchTimeLabel>11:00</MatchTimeLabel>
        <MatchInfoContainer>
          <TeamLeft>
            <TeamScoreLeft>6</TeamScoreLeft>
            <TeamNameLeft>건환공</TeamNameLeft>
          </TeamLeft>
          <TeamRight>
            <TeamScoreRight>9</TeamScoreRight>
            <TeamNameRight>자연대</TeamNameRight>
          </TeamRight>
          <VsText>vs</VsText>
        </MatchInfoContainer>
        <RecordButton>
          <RecordButtonText>경기기록</RecordButtonText>
        </RecordButton>
      </MatchCard1>

      {/* 경기 카드 2 */}
      <MatchCard2>
        <Divider />
        <MatchTimeLabel>14:00</MatchTimeLabel>
        <MatchInfoContainer>
          <TeamLeft>
            <TeamScoreLeft>6</TeamScoreLeft>
            <TeamNameLeft>공대</TeamNameLeft>
          </TeamLeft>
          <TeamRight>
            <TeamScoreRight>19</TeamScoreRight>
            <TeamNameRight>관악사</TeamNameRight>
          </TeamRight>
          <VsText>vs</VsText>
        </MatchInfoContainer>
        <RecordButton>
          <RecordButtonText>경기기록</RecordButtonText>
        </RecordButton>
      </MatchCard2>

      {/* 경기 카드 3 */}
      <MatchCard3>
        <Divider />
        <MatchTimeLabel>16:30</MatchTimeLabel>
        <MatchInfoContainer>
          <TeamLeft>
            <TeamNameLeft>공대</TeamNameLeft>
          </TeamLeft>
          <TeamRight>
            <TeamNameRight>자연대</TeamNameRight>
          </TeamRight>
          <VsText>vs</VsText>
        </MatchInfoContainer>
        <RecordButton>
          <RecordButtonText>경기기록</RecordButtonText>
        </RecordButton>
      </MatchCard3>

      {/* 경기 카드 4 */}
      <MatchCard4>
        <Divider />
        <MatchTimeLabel>19:00</MatchTimeLabel>
        <MatchInfoContainer>
          <TeamLeft>
            <TeamNameLeft>공대</TeamNameLeft>
          </TeamLeft>
          <TeamRight>
            <TeamNameRight>자연대</TeamNameRight>
          </TeamRight>
          <VsText>vs</VsText>
        </MatchInfoContainer>
        <RecordButton>
          <RecordButtonText>경기기록</RecordButtonText>
        </RecordButton>
      </MatchCard4>

      {/* 경기 카드 5 */}
      <MatchCard5>
        <Divider />
        <MatchTimeLabel>09:00</MatchTimeLabel>
        <MatchInfoContainer>
          <TeamLeft>
            <TeamScoreLeft>16</TeamScoreLeft>
            <TeamNameLeft>공대</TeamNameLeft>
          </TeamLeft>
          <TeamRight>
            <TeamScoreRight>9</TeamScoreRight>
            <TeamNameRight>자연대</TeamNameRight>
          </TeamRight>
          <VsText>vs</VsText>
        </MatchInfoContainer>
        <RecordButton>
          <RecordButtonText>경기기록</RecordButtonText>
        </RecordButton>
      </MatchCard5>

      {/* iOS 상태바 */}
      <IOSStatusBarWhite>
        <IOSStatusBarBlack>
          <BgImage src="bg0.svg" alt="Background" />
          <RightSideImage src="right-side0.svg" alt="Right Side" />
          <LeftSideImage src="left-side0.svg" alt="Left Side" />
        </IOSStatusBarBlack>
      </IOSStatusBarWhite>

      {/* 하단 네비게이션 */}
      <BottomNav>
        <Group5>
          <RectangleLeft />
          <NavTextLeft>팀순위</NavTextLeft>
          <RectangleCenter />
          <NavTextCenter>선수기록</NavTextCenter>
          <Group2>
            <RectangleRight />
            <NavTextRight>경기일정</NavTextRight>
          </Group2>
        </Group5>
      </BottomNav>

      {/* 페이지 헤더 */}
      <PageHeader>
        <PageTitle>2025 총장배 야구대회</PageTitle>
      </PageHeader>

      {/* 최종 버튼 */}
      <FinalButton>
        <FinalButtonText>심판등록</FinalButtonText>
      </FinalButton>
    </Container>
  );
}
