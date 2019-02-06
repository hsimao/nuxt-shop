import firebase from "firebase";
const config = require("../config")();
const fireConfig = config.fireConfig;

let fireApp, adminApp;

// 判斷是否已經初始化過，如果沒有才初始化，有就直接使用firebase.app()
if (!fireApp && !firebase.apps.length) {
  fireApp = firebase.initializeApp(fireConfig);
  adminApp = firebase.initializeApp(fireConfig, "fireAdmin");
} else {
  fireApp = firebase.app();
  adminApp = firebase.app("fireAdmin");
}

export { fireApp, adminApp };
