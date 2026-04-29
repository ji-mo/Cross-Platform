import { BreakPointEnum, uiWidthPx, ZoomRatioEnum } from "../constants/app";

import { Dimensions } from "react-native";
// 设备的宽度，单位:dp。安卓小窗会影响window.width，变成和小窗一样宽，所以这里用screen.width
export const deviceWidthDp = Dimensions.get("screen").width;
// 设备的高度，单位:dp。安卓小窗会影响window.width，变成和小窗一样宽，所以这里用screen.height
export const deviceHeightDp = Dimensions.get("screen").height;

/*
 * 将px转换到pd
 * @param uiElementPx 设计稿元素的尺寸
 * @return {number} 实际屏幕的尺寸
 */
export const p2d = (uiElePx: number) => {
  if (uiElePx === 0) {
    return 0;
  }
  // 判断设备类型
  let scalableRadio = ZoomRatioEnum.MOBILE;
  if (deviceWidthDp >= BreakPointEnum.TABLET) {
    scalableRadio = ZoomRatioEnum.TABLET;
  }
  // 解决精度问题
  if (uiElePx === 1) {
    return Math.floor(((uiElePx * deviceWidthDp) / uiWidthPx) * 100) / 100;
  }
  // 取值问题
  if (uiElePx > 0 && uiElePx !== 1) {
    return Math.max(Math.floor((uiElePx * deviceWidthDp * scalableRadio) / uiWidthPx), 1);
  } else {
    return Math.floor((uiElePx * deviceWidthDp) / uiWidthPx);
  }
};