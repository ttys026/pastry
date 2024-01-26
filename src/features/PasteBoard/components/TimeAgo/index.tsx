import { renderTimeAgo } from "@/utils/time";
import { useVisibleChange } from "@/hooks/useVisibleChange";
import { useUpdate } from "ahooks";
import "./index.css";

function TimeAgo(props: { time: number }) {
  const update = useUpdate();
  useVisibleChange({ onShow: update });

  return (
    <div className="timeAgo">
      <span>{renderTimeAgo(props.time)}</span>
    </div>
  );
}

export default TimeAgo;
