export class DateUtil {
    static format(date: number): string {
        const temp = new Date(date);
        return `${temp.toLocaleDateString()} ${temp.toLocaleTimeString()}`
    }
}