/*
 * @Author: Younchen
 * @Description:
 * @Younchen's code.: 匠人精神
 * @Date: 2021-08-04 22:21:07
 * @LastEditTime: 2021-08-04 22:25:44
 */
import { useEffect, useRef } from "react";

const useMounted = () => {
  const isMounted = useRef(true);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  return isMounted;
};

export default useMounted;
