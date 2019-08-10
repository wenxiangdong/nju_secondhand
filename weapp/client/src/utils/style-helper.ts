import {CSSProperties} from "react";

class StyleHelper {
  static readonly NORMAL_BORDER = '1px solid lightgray';

  static numberToPxStr(num): string {
    return `${num}px`;
  }

  static readonly ONE_LINE_WRAP: CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  };
}

export {
  StyleHelper
};
