import slugify from "slugify";

// 字串格式化, 空格用"-"替代, 刪除特殊符號, 全部改為小寫
export const slugString = str => {
  if (!str) return "";
  return slugify(str, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g, // 刪除特殊符號
    lower: true
  });
};
