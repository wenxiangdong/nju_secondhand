class StyleHelper {
  public numberToPxStr(num): string {
    return `${num}px`;
  }
}

const styleHelper = new StyleHelper();
export {
  styleHelper
};
