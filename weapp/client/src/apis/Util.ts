export function copy<T>(data: any): T {
  return JSON.parse(JSON.stringify(data))
}

export function createRandomNumberStr() {
  return (Math.random() * 100).toFixed(2).toString();
}
