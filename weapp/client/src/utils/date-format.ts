export default function dateFormat(date: number) {
  // console.log(date)
  const temp = new Date(date);
  return `${temp.toLocaleDateString()} ${temp.toLocaleTimeString()}`;
}
