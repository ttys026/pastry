import dayjs from "dayjs";

export const renderTimeAgo = (time: number) => {
  const second = dayjs().diff(dayjs(time), "s");
  if (second <= 20) {
    return "几秒前";
  }
  if (second <= 60) {
    return "1 分钟内";
  }
  const minutes = Math.round(second / 60);
  if (minutes <= 60) {
    return `${minutes} 分钟前`;
  }
  const hours = Math.round(minutes / 60);
  if (hours <= 24) {
    return `${hours} 小时前`;
  }
  return `超过一天`;
};
