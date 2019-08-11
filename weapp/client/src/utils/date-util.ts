export const timeToString = function (time: number) {
  return new Date(time).toLocaleDateString();
};
