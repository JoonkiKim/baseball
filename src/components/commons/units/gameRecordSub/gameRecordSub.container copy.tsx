// import React, { useState } from "react";
// import { useRouter } from "next/router";
// import { useForm } from "react-hook-form";
// import { useRecoilState } from "recoil";
// import {
//   Container,
//   Title,
//   PlayerList,
//   PlayerRow,
//   OrderNumber,
//   NameWrapper,
//   PlayerNameInput,
//   SearchIcon,
//   PositionWrapper,
//   PositionText,
//   PositionDropdown,
//   ControlButton,
//   WildCardBox,
//   NoWildCardBox,
//   NoWildCardBoxL,
//   SuggestionList,
//   SuggestionItem,
//   ButtonWrapper,
// } from "./gameRecordSub.style";
// import RecordStartModal from "../../modals/recordStart";
// import PlayerSelectionModal from "../../modals/playerSelectionModal";
// import PlayerSubstituteModal from "../../modals/playerSubstituteModal";
// import {
//   defaultplayerList,
//   playerListState,
// } from "../../../../commons/stores/index";

// interface PlayerInfo {
//   order: number | string;
//   name?: string;
//   position?: string;
//   selectedViaModal?: boolean;
// }

// const positionOptions = [
//   "CF",
//   "LF",
//   "RF",
//   "SS",
//   "1B",
//   "2B",
//   "3B",
//   "C",
//   "DH",
//   "P",
// ];

// export default function SubstitutionPageComponent() {
//   const router = useRouter();
//   const [defaultPlayers] = useRecoilState(defaultplayerList);

//   // 1. 로컬 선수 데이터 (초기값)
//   const [players, setPlayers] = useState<PlayerInfo[]>([
//     { order: 1, selectedViaModal: false },
//     { order: 2, selectedViaModal: false },
//     { order: 3, selectedViaModal: false },
//     { order: 4, selectedViaModal: false },
//     { order: 5, selectedViaModal: false },
//     { order: 6, selectedViaModal: false },
//     { order: 7, selectedViaModal: false },
//     { order: 8, selectedViaModal: false },
//     { order: 9, selectedViaModal: false },
//     { order: "P", selectedViaModal: false },
//   ]);

//   // 2. react-hook-form 세팅
//   const { register, handleSubmit, watch, setValue } = useForm({
//     defaultValues: {
//       players: players.map((player) => {
//         // order가 숫자면 기존 로직, 그렇지 않으면 (P행이면) defaultPlayers[9] (즉, 10번째 요소)를 사용
//         return {
//           name:
//             typeof player.order === "number"
//               ? defaultPlayers[(player.order as number) - 1]?.name || ""
//               : defaultPlayers[9]?.name || "",
//         };
//       }),
//     },
//   });

//   // 3. 포지션 드롭다운 관련 상태
//   const [openPositionRow, setOpenPositionRow] = useState<number | null>(null);
//   const handlePositionClick = (index: number) => {
//     setOpenPositionRow(openPositionRow === index ? null : index);
//   };
//   const handlePositionSelect = (index: number, pos: string) => {
//     const updatedPlayers = [...players];
//     updatedPlayers[index].position = pos;
//     setPlayers(updatedPlayers);
//     setOpenPositionRow(null);
//   };

//   // 4. 모달 및 선택 관련 상태
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] =
//     useState(false);
//   const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
//     null
//   );
//   const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
//     number | null
//   >(null);

//   // 전역 플레이어 목록
//   const [globalPlayerList] = useRecoilState(playerListState);

//   // 헬퍼: 입력 텍스트 내 하이라이트 처리
//   const highlightText = (text: string, query: string) => {
//     if (!query) return text;
//     const regex = new RegExp(`(${query})`, "gi");
//     const parts = text.split(regex);
//     return (
//       <>
//         {parts.map((part, idx) =>
//           part.toLowerCase() === query.toLowerCase() ? (
//             <span key={idx} style={{ color: "red" }}>
//               {part}
//             </span>
//           ) : (
//             part
//           )
//         )}
//       </>
//     );
//   };

//   // 돋보기(모달)로 선수 선택 시 처리
//   const handleSelectPlayer = (playerName: string) => {
//     if (selectedPlayerIndex === null) return;
//     const updatedPlayers = [...players];
//     updatedPlayers[selectedPlayerIndex].name = playerName;
//     updatedPlayers[selectedPlayerIndex].selectedViaModal = true;
//     setPlayers(updatedPlayers);
//     setValue(`players.${selectedPlayerIndex}.name`, playerName);
//     setIsPlayerSelectionModalOpen(false);
//     setSelectedPlayerIndex(null);
//   };

//   // 입력창 변경 시 수동 입력 상태로 전환
//   const handleInputChange = (
//     index: number,
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const updatedPlayers = [...players];
//     updatedPlayers[index].selectedViaModal = false;
//     setPlayers(updatedPlayers);
//   };

//   // 폼 제출 (교체완료 버튼)
//   const onSubmit = (data: any) => {
//     const updatedPlayers = players.map((player, index) => ({
//       ...player,
//       name: data.players[index].name,
//     }));
//     setPlayers(updatedPlayers);
//     router.push("/records");
//   };

//   // NameWrapper 클릭 시 선수 선택 모달 열기
//   const handleOpenPlayerModal = (index: number) => {
//     setSelectedPlayerIndex(index);
//     setIsPlayerSelectionModalOpen(true);
//   };

//   // 전체 폼의 선수명 배열 (중복 체크용)
//   const formPlayers = watch("players") || [];
//   const selectedPlayerNames = formPlayers
//     .map((player) => player.name)
//     .filter((name) => name.trim() !== "");

//   return (
//     <Container onClick={() => setOpenPositionRow(null)}>
//       <Title>관악사 야구부</Title>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <PlayerList>
//           {players.map((player, index) => {
//             const currentName = watch(`players.${index}.name`) || "";
//             const filteredSuggestions = globalPlayerList.filter((p) => {
//               const matchesQuery = p.name
//                 .toLowerCase()
//                 .includes(currentName.toLowerCase());
//               const isAlreadySelected = formPlayers.some(
//                 (item, idx) =>
//                   idx !== index &&
//                   item.name &&
//                   item.name.toLowerCase() === p.name.toLowerCase()
//               );
//               return matchesQuery && !isAlreadySelected;
//             });
//             const isPositionEmpty = !player.position;
//             const globalPlayer = globalPlayerList.find(
//               (p) => p.name === currentName
//             );

//             return (
//               <PlayerRow key={`${player.order}-${index}`}>
//                 <OrderNumber>{player.order}</OrderNumber>
//                 <NameWrapper
//                   hasValue={!!currentName}
//                   onClick={() => handleOpenPlayerModal(index)}
//                 >
//                   {currentName && <NoWildCardBoxL />}
//                   <PlayerNameInput
//                     defaultValue={
//                       player.order === "P"
//                         ? defaultPlayers[9]?.name // "P"행이면 10번째 데이터의 name
//                         : defaultPlayers[(player.order as number) - 1]?.name
//                     }
//                     {...register(`players.${index}.name`, {
//                       onChange: (e) => handleInputChange(index, e),
//                     })}
//                     placeholder="선수명 입력"
//                     autoComplete="off"
//                   />
//                   {currentName ? (
//                     globalPlayer &&
//                     globalPlayer.wc &&
//                     globalPlayer.wc.includes("WC") ? (
//                       <WildCardBox>WC</WildCardBox>
//                     ) : (
//                       <NoWildCardBox />
//                     )
//                   ) : null}
//                   {activeSuggestionIndex === index &&
//                     !player.selectedViaModal &&
//                     currentName &&
//                     filteredSuggestions.length > 0 && (
//                       <SuggestionList>
//                         {filteredSuggestions.map((suggestion, idx) => (
//                           <SuggestionItem
//                             key={idx}
//                             onClick={() => {
//                               setValue(
//                                 `players.${index}.name`,
//                                 suggestion.name
//                               );
//                               setActiveSuggestionIndex(null);
//                             }}
//                           >
//                             {highlightText(suggestion.name, currentName)}
//                           </SuggestionItem>
//                         ))}
//                       </SuggestionList>
//                     )}
//                 </NameWrapper>
//                 <PositionWrapper
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handlePositionClick(index);
//                   }}
//                 >
//                   <PositionText isPlaceholder={isPositionEmpty}>
//                     {player.position ||
//                       defaultPlayers[index]?.position ||
//                       "포지션 입력 ▽"}
//                   </PositionText>
//                   {openPositionRow === index && (
//                     <PositionDropdown
//                       dropUp={
//                         (typeof player.order === "number" &&
//                           player.order >= 7) ||
//                         player.order === "P"
//                       }
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {positionOptions.map((pos) => (
//                         <li
//                           key={pos}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handlePositionSelect(index, pos);
//                           }}
//                         >
//                           {pos}
//                         </li>
//                       ))}
//                     </PositionDropdown>
//                   )}
//                 </PositionWrapper>
//               </PlayerRow>
//             );
//           })}
//         </PlayerList>
//         <ButtonWrapper>
//           <ControlButton type="submit">교체완료</ControlButton>
//         </ButtonWrapper>
//       </form>

//       {isModalOpen && <RecordStartModal setIsModalOpen={setIsModalOpen} />}
//       {isPlayerSelectionModalOpen && (
//         <PlayerSubstituteModal
//           setIsModalOpen={setIsPlayerSelectionModalOpen}
//           onSelectPlayer={handleSelectPlayer}
//           selectedPlayerNames={selectedPlayerNames}
//         />
//       )}
//     </Container>
//   );
// }
