import styled from "@emotion/styled";
import axios from "axios";
import { useEffect, useState } from "react";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function LiveCats() {
  const [cat, setCat] = useState("");

  useEffect(() => {
    const onClickSync = async (): Promise<void> => {
      const result = await axios.get(
        "https://api.thecatapi.com/v1/images/search"
      );

      console.log(result.data[0].url);
      setCat(result.data[0].url);
    };
    onClickSync();
  }, []);

  return (
    <div>
      <img src={cat} />
    </div>
  );
}
