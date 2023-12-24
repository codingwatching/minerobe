import { OUTFIT_TYPE } from "$data/consts";
import { COLORS, COLORS_ARRAY } from "$data/consts";
import NewOutfitBottomAnimation from "$src/animation/bottom";
import HatAnimation from "$src/animation/hat";
import WavingAnimation from "$src/animation/waving";
import type { OutfitPackage } from "$src/data/common";
import { closest } from "color-diff";
import HatIcon from "$icons/clothes/hat.svg?raw";
import TopIcon from "$icons/clothes/top.svg?raw";
import BottomIcon from "$icons/clothes/bottom.svg?raw";
import ShoesIcon from "$icons/clothes/shoes.svg?raw";
import HoodieIcon from "$icons/clothes/hoodie.svg?raw";

export const GetOutfitType = function (imageContext: any) {
  const hatArea =
    GetPixelCountInArea(imageContext, 0, 0, 32, 16) +
    GetPixelCountInArea(imageContext, 32, 0, 32, 16);

  const bodyArea =
    GetPixelCountInArea(imageContext, 16, 16, 24, 16) +
    GetPixelCountInArea(imageContext, 16, 32, 24, 16);

  const legsArea =
    GetPixelCountInArea(imageContext, 0, 16, 16, 16) +
    GetPixelCountInArea(imageContext, 16, 48, 16, 16) +
    GetPixelCountInArea(imageContext, 0, 48, 16, 16) +
    GetPixelCountInArea(imageContext, 0, 32, 16, 16);

  const shoesArea =
    GetPixelCountInArea(imageContext, 0, 24, 16, 8) +
    GetPixelCountInArea(imageContext, 16, 56, 16, 8) +
    GetPixelCountInArea(imageContext, 0, 56, 16, 8) +
    GetPixelCountInArea(imageContext, 0, 40, 16, 8);

  const hatPercentage = hatArea / 1024;
  const bodyPercentage = bodyArea / 768;
  const legsPercentage = legsArea / 512;
  const shoesPercentage = shoesArea / 256;
  //console.log(hatPercentage, bodyPercentage, legsPercentage, shoesPercentage)
  //hat / hoodie
  if (bodyPercentage > 0.3 && legsPercentage > 0.3 && shoesPercentage > 0.3) {
    return OUTFIT_TYPE.SUIT;
  }
  if (hatPercentage > 0) {
    if (bodyPercentage > 0.3) {
      return OUTFIT_TYPE.HOODIE;
    } else {
      return OUTFIT_TYPE.HAT;
    }
  }
  //body
  if (bodyPercentage > 0.3) {
    return OUTFIT_TYPE.TOP;
  }
  //shoes / bottom
  if (shoesPercentage > 0.2) {
    if (legsPercentage > 0.5) {
      return OUTFIT_TYPE.BOTTOM;
    } else {
      return OUTFIT_TYPE.SHOES;
    }
  }
  return OUTFIT_TYPE.DEFAULT;
};
export const GetPixelCountInArea = function (
  imageContext: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imageData = imageContext.getImageData(x, y, width, height, {
    willReadFrequently: true,
  });
  let nonTransparentPixelsCount = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha !== 0) {
      nonTransparentPixelsCount++;
    }
  }

  return nonTransparentPixelsCount;
};

export const GetContextFromBase64 = async function (base64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(ctx);
    };
    img.onerror = reject;
    img.src = base64;
  });
};
export const GetDominantColorFromImage = async function (base64) {
  const ctx = (await GetContextFromBase64(base64)) as any;
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const colorMap = {};
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3]; // Alpha channel
    if (a === 0) continue; // Skip transparent pixels
    const rgb = `${r},${g},${b}`;
    if (colorMap[rgb]) {
      colorMap[rgb]++;
    } else {
      colorMap[rgb] = 1;
    }
  }

  const dominantColor = Object.keys(colorMap).reduce((a, b) =>
    colorMap[a] > colorMap[b] ? a : b
  );
  return dominantColor;
};
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};
export const stringToRgb = (rgbString: string) => {
  const [r, g, b] = rgbString.split(",").map(Number);
  return { r, g, b };
};
export const FindClosestColorHex = (hexColor: string) => {
  // convert hex into rgb object
  const rgbColor = hexToRgb(hexColor);
  return closest(rgbColor, COLORS_ARRAY);
};
export const FindClosestColorString = (rgbString: string) => {
  // convert hex into rgb object
  const rgbColor = stringToRgb(rgbString);
  return closest(rgbColor, COLORS_ARRAY);
};
export const FindInColors = (rgb: any) => {
  return Object.keys(COLORS).find((key) => {
    const color = COLORS[key];
    return color.r === rgb.r && color.g === rgb.g && color.b === rgb.b && key;
  });
};
export const GetColorFromImage = async function (base64: string) {
  let dominantColor = await GetDominantColorFromImage(base64);
  let closestColor = FindClosestColorString(dominantColor);
  return closestColor;
};
export const ConvertRGBToHex = (rgb: any) => {
  const { r, g, b } = rgb;
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
export const ConvertRGBToHSL = (rgb: any) => {
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max != min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      case g:
        h = ((b - r) / d + 2) / 6;
      case b:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h, s, l };
};
export const GetAnimationForType = function (type: string) {
  switch (type) {
    case OUTFIT_TYPE.HAT:
      return HatAnimation;
    case OUTFIT_TYPE.TOP:
    case OUTFIT_TYPE.HOODIE:
      return NewOutfitBottomAnimation;
    case OUTFIT_TYPE.SHOES:
      return WavingAnimation;
  }
};
export const GetCategoriesFromList = function (list: OutfitPackage[]) {
  let categories = Object.keys(OUTFIT_TYPE).filter(
    (x) => OUTFIT_TYPE[x] != OUTFIT_TYPE.OUTFIT_SET
  );
  let categoryCount = {};
  categories.forEach((category) => {
    categoryCount[category] = list.filter((outfit) => {
      if (outfit.layers.length == 0) return false;
      if (outfit.layers[0] == null) return false;
      return outfit.layers[0]["steve"].type == OUTFIT_TYPE[category];
    }).length;
  });
  return categoryCount;
};
export const GetOutfitIconFromType = function (type: string) {
  switch (type.toLowerCase()) {
    case OUTFIT_TYPE.HAT:
      return HatIcon;
    case OUTFIT_TYPE.TOP:
      return TopIcon;
    case OUTFIT_TYPE.HOODIE:
      return HoodieIcon;
    case OUTFIT_TYPE.SHOES:
      return ShoesIcon;
    case OUTFIT_TYPE.BOTTOM:
      return BottomIcon;
    default:
      return TopIcon;
  }
};
