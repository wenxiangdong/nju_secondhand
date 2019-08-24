import dateFormat from "./date-format";

export const timeToString = function (time: number) {
  return dateFormat(time);
};

export const relaunchTimeout = 1000;
