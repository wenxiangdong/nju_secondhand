export const timeToString = function (time: number) {
  return new Date(time).toLocaleDateString();
};

export const relaunchTimeout = 1000;
