// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   ScoreBoardWrapper,
//   InningHeader,
//   InningCell,
//   TeamScoreCell,
//   TeamTitle,
//   TableWrapper,
//   TableTitle,
//   RecordTable,
//   ControlButton,
//   HomeButton,
//   ButtonContainer,
//   RecordTableP,
//   TeamRow,
//   TeamNameCell,
// } from "./gameResult.style";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import ResultSubmitModal from "../../modals/submitModal/resultSubmitModal";
// import API from "../../../../commons/apis/api";

// // 기본 점수 배열 (1~7회, R, H)
// const defaultTeamAScores = ["0", "0", "0", "0", "", "", "", "0", "0"];
// const defaultTeamBScores = ["0", "0", "0", "0", "", "", "", "0", "0"];

// export default function FinalGameRecordPage() {
//   const inningHeaders = ["", "1", "2", "3", "4", "5", "6", "7", "R", "H"];
//   const router = useRouter();

//   // 팀 이름은 API 응답을 통해 업데이트 (팀A: 원정, 팀B: 홈)
//   const [teamAName, setTeamAName] = useState("관악사");
//   const [teamBName, setTeamBName] = useState("건환공");

//   // 점수 배열 상태
//   const [teamAScores, setTeamAScores] = useState(defaultTeamAScores);
//   const [teamBScores, setTeamBScores] = useState(defaultTeamBScores);

//   // 타자 및 투수 기록 상태
//   const [awayBatters, setAwayBatters] = useState([]);
//   const [homeBatters, setHomeBatters] = useState([]);
//   const [awayPitchers, setAwayPitchers] = useState([]);
//   const [homePitchers, setHomePitchers] = useState([]);

//   const [isResultSubmitModalOpen, setIsResultSubmitModalOpen] = useState(false);

//   useEffect(() => {
//     API.get("/matches/1001/results")
//       .then((response) => {
//         console.log("GET /matches/1001/results 응답:", response.data);
//         const {
//           scoreboard,
//           awayTeam,
//           homeTeam,
//           awayBatters,
//           homeBatters,
//           awayPitchers,
//           homePitchers,
//         } = response.data;

//         // 팀 이름 업데이트 (앞 3글자 사용)
//         setTeamAName(awayTeam.name.substring(0, 3));
//         setTeamBName(homeTeam.name.substring(0, 3));

//         // scoreboard 데이터를 반영하여 팀 점수를 업데이트 (이닝번호 1은 index 0)
//         const newTeamAScores = [...teamAScores];
//         const newTeamBScores = [...teamBScores];
//         scoreboard.forEach((item) => {
//           const inningIndex = item.inning - 1;
//           if (item.inning_half === "TOP") {
//             newTeamAScores[inningIndex] = String(item.runs);
//           } else if (item.inning_half === "BOT") {
//             newTeamBScores[inningIndex] = String(item.runs);
//           }
//         });
//         // 배열의 8번째 칸(index 7)와 9번째 칸(index 8)을 팀 정보(총 runs, hits)로 업데이트
//         newTeamAScores[7] = String(awayTeam.runs);
//         newTeamAScores[8] = String(awayTeam.hits);
//         newTeamBScores[7] = String(homeTeam.runs);
//         newTeamBScores[8] = String(homeTeam.hits);
//         setTeamAScores(newTeamAScores);
//         setTeamBScores(newTeamBScores);

//         // 타자 기록 매핑: API에서 전달된 값을 필드 이름에 맞게 변환
//         const mappedAwayBatters = awayBatters.map((item) => ({
//           order: item.order,
//           name: item.playerName,
//           ab: item.AB,
//           hit: item["1B"],
//           bb: item.BB,
//           doubles: item["2B"],
//           triples: item["3B"],
//           hr: item.HR,
//         }));
//         setAwayBatters(mappedAwayBatters);

//         const mappedHomeBatters = homeBatters.map((item) => ({
//           order: item.order,
//           name: item.playerName,
//           ab: item.AB,
//           hit: item["1B"],
//           bb: item.BB,
//           doubles: item["2B"],
//           triples: item["3B"],
//           hr: item.HR,
//         }));
//         setHomeBatters(mappedHomeBatters);

//         // 투수 기록 매핑: 배열의 index + 1을 order로 사용
//         const mappedAwayPitchers = awayPitchers.map((item, idx) => ({
//           order: idx + 1,
//           name: item.playerName,
//           so: item.K,
//         }));
//         setAwayPitchers(mappedAwayPitchers);

//         const mappedHomePitchers = homePitchers.map((item, idx) => ({
//           order: idx + 1,
//           name: item.playerName,
//           so: item.K,
//         }));
//         setHomePitchers(mappedHomePitchers);
//       })
//       .catch((error) => {
//         console.error("API GET 요청 에러:", error);
//       });
//   }, []);

//   const handleSubmitClick = () => {
//     setIsResultSubmitModalOpen(true);
//   };

//   return (
//     <Container>
//       {/* 스코어보드 부분 */}
//       <ScoreBoardWrapper>
//         <InningHeader>
//           {inningHeaders.map((inn, idx) => (
//             <InningCell key={idx}>{inn}</InningCell>
//           ))}
//         </InningHeader>
//         <TeamRow>
//           <TeamNameCell>{teamAName}</TeamNameCell>
//           {teamAScores.map((score, idx) => (
//             <TeamScoreCell key={idx}>{score}</TeamScoreCell>
//           ))}
//         </TeamRow>
//         <TeamRow>
//           <TeamNameCell>{teamBName}</TeamNameCell>
//           {teamBScores.map((score, idx) => (
//             <TeamScoreCell key={idx}>{score}</TeamScoreCell>
//           ))}
//         </TeamRow>
//       </ScoreBoardWrapper>

//       {/* 원정팀(팀A) 기록 */}
//       <TeamTitle>{teamAName} 야구부</TeamTitle>
//       {/* 원정팀 타자 기록 */}
//       <TableWrapper>
//         <TableTitle>타자기록</TableTitle>
//         <RecordTable>
//           <thead>
//             <tr>
//               <th></th>
//               <th>이름</th>
//               <th>타수</th>
//               <th>안타</th>
//               <th>볼넷</th>
//               <th>2루타</th>
//               <th>3루타</th>
//               <th>홈런</th>
//             </tr>
//           </thead>
//           <tbody>
//             {awayBatters.map((player, idx) => (
//               <tr key={idx}>
//                 <td>{player.order}</td>
//                 <td>{player.name}</td>
//                 <td>{player.ab}</td>
//                 <td>{player.hit}</td>
//                 <td>{player.bb}</td>
//                 <td>{player.doubles}</td>
//                 <td>{player.triples}</td>
//                 <td>{player.hr}</td>
//               </tr>
//             ))}
//           </tbody>
//         </RecordTable>
//       </TableWrapper>
//       {/* 원정팀 투수 기록 */}
//       <TableWrapper>
//         <TableTitle>투수기록</TableTitle>
//         <RecordTableP>
//           <thead>
//             <tr>
//               <th></th>
//               <th>이름</th>
//               <th>삼진</th>
//             </tr>
//           </thead>
//           <tbody>
//             {awayPitchers.map((pitcher, idx) => (
//               <tr key={idx}>
//                 <td>{pitcher.order}</td>
//                 <td>{pitcher.name}</td>
//                 <td>{pitcher.so}</td>
//               </tr>
//             ))}
//           </tbody>
//         </RecordTableP>
//       </TableWrapper>

//       {/* 홈팀(팀B) 기록 */}
//       <TeamTitle>{teamBName} 야구부</TeamTitle>
//       {/* 홈팀 타자 기록 */}
//       <TableWrapper>
//         <TableTitle>타자기록</TableTitle>
//         <RecordTable>
//           <thead>
//             <tr>
//               <th></th>
//               <th>이름</th>
//               <th>타수</th>
//               <th>안타</th>
//               <th>볼넷</th>
//               <th>2루타</th>
//               <th>3루타</th>
//               <th>홈런</th>
//             </tr>
//           </thead>
//           <tbody>
//             {homeBatters.map((player, idx) => (
//               <tr key={idx}>
//                 <td>{player.order}</td>
//                 <td>{player.name}</td>
//                 <td>{player.ab}</td>
//                 <td>{player.hit}</td>
//                 <td>{player.bb}</td>
//                 <td>{player.doubles}</td>
//                 <td>{player.triples}</td>
//                 <td>{player.hr}</td>
//               </tr>
//             ))}
//           </tbody>
//         </RecordTable>
//       </TableWrapper>
//       {/* 홈팀 투수 기록 */}
//       <TableWrapper>
//         <TableTitle>투수기록</TableTitle>
//         <RecordTableP>
//           <thead>
//             <tr>
//               <th></th>
//               <th>이름</th>
//               <th>삼진</th>
//             </tr>
//           </thead>
//           <tbody>
//             {homePitchers.map((pitcher, idx) => (
//               <tr key={idx}>
//                 <td>{pitcher.order}</td>
//                 <td>{pitcher.name}</td>
//                 <td>{pitcher.so}</td>
//               </tr>
//             ))}
//           </tbody>
//         </RecordTableP>
//       </TableWrapper>

//       {/* 하단 버튼 */}
//       <ButtonContainer>
//         <Link href="/" passHref>
//           <a>
//             <HomeButton>홈으로</HomeButton>
//           </a>
//         </Link>
//         <ControlButton onClick={handleSubmitClick}>제출하기</ControlButton>
//       </ButtonContainer>

//       {isResultSubmitModalOpen && (
//         <ResultSubmitModal
//           setIsResultSubmitModalOpen={setIsResultSubmitModalOpen}
//         />
//       )}
//     </Container>
//   );
// }
