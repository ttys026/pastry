import { useEffect, useRef } from "react";
import { useMemoizedFn, useMouse } from "ahooks";

function useMouseLock(cb: React.Dispatch<React.SetStateAction<string>>) {
  const lock = useRef(false);
  const { clientX, clientY } = useMouse();

  useEffect(() => {
    lock.current = false;
  }, [clientX, clientY]);

  const mouseActiveChange = useMemoizedFn(
    (active: React.SetStateAction<string>) => {
      if (lock.current) {
        return;
      }
      cb(active);
    }
  );

  const lockMouse = useMemoizedFn(() => {
    lock.current = true;
  });

  return { mouseActiveChange, lockMouse };
}

export default useMouseLock;
