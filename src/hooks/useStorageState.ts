import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";
import { storage } from "../utils/storage";

const useStorageState = <T>(key: string, initialValiue?: T | (() => T)) => {
  const [state, setState] = useState(initialValiue);

  useMemo(() => {
    storage.get(key).then((res) => {
      try {
        const json = JSON.parse(res);
        setState(json.data);
      } catch (e) {
        // no initial value
      }
    });
  }, []);

  const _setState = useMemoizedFn((val) => {
    const nextVal = typeof val === "function" ? val(state) : val;
    storage.set(key, JSON.stringify({ data: nextVal }));
    setState(nextVal);
  });

  return [state, _setState] as [T, React.Dispatch<React.SetStateAction<T>>];
};

export default useStorageState;
