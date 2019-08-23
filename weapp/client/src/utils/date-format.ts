export default function dateFormat(date: number) {
  // console.log(date)
  const temp = new Date(date);
  return `${temp.getFullYear()}/${temp.getMonth() + 1}/${temp.getDate()}-${temp.getHours()}:${temp.getMinutes()}:${temp.getSeconds()}`;
  // return `${temp.toLocaleDateString()} ${temp.toLocaleTimeString()}`;
}
