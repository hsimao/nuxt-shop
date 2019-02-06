import Cookie from "js-cookie";

// 將firebase回傳的資料解構, 並儲存到localStorage、Cookie
export const saveUserData = ({ id, email, name }) => {
  Cookie.set("jwt", id);
  Cookie.set("email", email);
  Cookie.set("name", name);
};

// 解析cookie並取出
export const getUserFromCookie = req => {
  if (!req) {
    const jwt = Cookie.get("jwt");
    const email = Cookie.get("email");
    const name = Cookie.get("name");
    if (!jwt || !email || !name) return;
    return { jwt, email, name };
  } else {
    if (!req.headers.cookie) return;
    console.log("yoyo");

    const jwtCookie = req.headers.cookie
      .split(";")
      .find(c => c.trim().startsWith("jwt="));
    const emailCookie = req.headers.cookie
      .split(";")
      .find(c => c.trim().startsWith("email="));
    const nameCookie = req.headers.cookie
      .split(";")
      .find(c => c.trim().startsWith("name="));

    console.log(nameCookie);
    // 若缺少其中一項cookie資訊就返回
    if (!jwtCookie || !emailCookie || !nameCookie) return;

    const jwt = jwtCookie.split("=")[1];
    const email = emailCookie.split("=")[1];
    const name = nameCookie.split("=")[1];

    return { jwt, email, name };
  }
};

// 清空用戶端user快取資料
export const clearUserData = () => {
  Cookie.remove("jwt");
  Cookie.remove("email");
  Cookie.remove("name");
};
