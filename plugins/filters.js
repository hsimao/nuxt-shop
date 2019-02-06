import Vue from "vue";

Vue.filter("currency", val => {
  if (!val || isNaN(val)) val = 0;
  // 台幣
  const formatter = Intl.NumberFormat("zh-Hant", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0
  });
  // 美金
  // const formatter = Intl.NumberFormat("en-US", {
  //   style: "currency",
  //   currency: "USD",
  //   minimumFractionDigits: 2
  // });
  return formatter.format(val);
});
