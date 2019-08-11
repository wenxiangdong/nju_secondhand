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

  static readonly loadMoreBtnStyle:CSSProperties = {
    // TODO 优先级 低 增加样式
    // 加载更多按钮样式
  };
}

export {
  StyleHelper
};
