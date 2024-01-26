import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { manager } from "./utils/history";
import { useRequest } from "ahooks";
import { Spin } from "antd";

const Main = () => {
  const { loading } = useRequest(() => manager.ready);
  return (
    <>
      {loading ? (
        <Spin style={{ marginTop: "50vh", transform: "translateY(-50%)" }} />
      ) : (
        <App />
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />
);
