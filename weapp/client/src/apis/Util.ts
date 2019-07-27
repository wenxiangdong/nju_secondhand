export function copy<T>(data: any): T {
  return JSON.parse(JSON.stringify(data))
}