// 날짜 바꿀때는 밖에서 함수를 따로 만들어서 해준다
// dateString라는 매개변수를 통해서 presenter의 el.createAt을 받아온거임

export const formatDate = (dateString: any) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // getMonth만 0부터 시작한다
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate2 = (dateString: any) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = daysOfWeek[date.getDay()];
  return `${year}. ${month}. ${day} (${dayOfWeek})`;
};
