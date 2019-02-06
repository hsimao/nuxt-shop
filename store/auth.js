import { fireApp } from "@/plugins/firebase";

export const state = () => ({
  user: null
});

export const mutations = {
  setUser(state, user) {
    state.user = user;
  }
};

export const actions = {
  // 註冊
  async signUp({ commit }, user) {
    try {
      commit("setBusy", true, { root: true });
      commit("clearError", true, { root: true });

      // firebase auth註冊
      const newUser = await fireApp
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(val => {
          const currentUser = fireApp.auth().currentUser;
          if (currentUser !== null) {
            currentUser.updateProfile({ displayName: user.name });
          }
          const userTemp = {
            id: val.user.uid,
            email: user.email,
            name: user.name,
            role: "consumer",
            createAt: new Date().toISOString()
          };
          return userTemp;
        });

      // 將用戶資料儲存到資料庫
      await fireApp
        .database()
        .ref(`users/${newUser.id}`)
        .set(newUser);

      // 新增到userGroups資料內
      const groupId = await fireApp
        .database()
        .ref("groups")
        .orderByChild("name")
        .equalTo("Customer")
        .once("value")
        .then(snapShot => {
          return Object.keys(snapShot.val())[0];
        });
      /* 產生一個以下資料結構
      userGroups: {
          groupsId: {
            userId: "userName"
          }
      }
      */
      let groupUser = {};
      groupUser[newUser.id] = user.name;
      await fireApp
        .database()
        .ref(`userGroups/${groupId}`)
        .update(groupUser);

      // 將user資料更新到vuex store
      commit("setUser", newUser);
      commit("setBusy", false, { root: true });
      commit("setJobDone", true, { root: true });
    } catch (error) {
      let message = null;
      if (error.code === "auth/email-already-in-use") {
        message = "此信箱已經註冊過！";
      }
      if (message) error.message = message;
      commit("setBusy", false, { root: true });
      commit("setError", error, { root: true });
      console.error(error);
    }
  },

  /*
  [登入]
  1.驗證登入，取得用戶資料
  2.驗證用戶所屬群組，設置為管理員或一般用戶屬性
  3.將登入資料儲存到用戶本地
  */
  async login({ commit }, { email, password }) {
    commit("setBusy", true, { root: true });
    commit("clearError", true, { root: true });

    // 驗證登入，取得用戶資料
    try {
      const authUser = await fireApp
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(val => {
          const authUser = {
            id: val.user.uid,
            email: val.user.email,
            name: val.user.displayName
          };
          return authUser;
        });

      // 取得管理員群組的key
      const adminKey = await fireApp
        .database()
        .ref("groups")
        .orderByChild("name")
        .equalTo("Admin")
        .once("value")
        .then(snapShot => {
          return Object.keys(snapShot.val())[0];
        });

      // 驗證用戶所屬群組，設置為管理員或一般用戶屬性
      await fireApp
        .database()
        .ref(`userGroups/${adminKey}`)
        .child(`${authUser.id}`)
        .once("value")
        .then(groupSnap => {
          authUser.role = groupSnap.exists() ? "admin" : "customer";
        });
      commit("setUser", authUser);
      commit("setJobDone", true, { root: true });
      commit("setBusy", false, { root: true });
    } catch (error) {
      let message = null;
      // 錯誤訊息改為中文
      if (error.code === "auth/wrong-password") {
        message = "密碼錯誤！";
      }
      if (error.code === "auth/user-not-found") {
        message = "查無此帳號，請重新輸入！";
      }
      if (error.code === "auth/network-request-failed") {
        message = "無法連接網路";
      }
      if (message) error.message = message;
      commit("setBusy", false, { root: true });
      commit("setError", error, { root: true });
      console.error(error);
    }
  },

  /*
  [網頁整理後的驗證登入方法] - 使用firebase auth api
  1. 先調用firebase auth api 判斷session是否已過期
  2. 判斷用戶權限，重新設置user資料
  3. 更新用戶資料到vuex
  4. 在layouts/default.vue中的created()調用此方法
  備註：onAuthStateChanged 沒有callback 無法使用async await, 所以用牽套寫法
  */
  setAuthStatus({ commit }) {
    fireApp.auth().onAuthStateChanged(user => {
      if (user) {
        commit("setBusy", true, { root: true });
        commit("clearError", true, { root: true });

        const authUser = {
          id: user.uid,
          email: user.email,
          name: user.displayName
        };

        // 取得管理者key
        fireApp
          .database()
          .ref("groups")
          .orderByChild("name")
          .equalTo("Admin")
          .once("value")
          .then(snapShot => {
            const adminKey = Object.keys(snapShot.val())[0];

            // 驗證設置管理者權限
            fireApp
              .database()
              .ref(`userGroups/${adminKey}`)
              .child(`${authUser.id}`)
              .once("value")
              .then(groupSnap => {
                if (groupSnap.exists()) {
                  authUser.role = "admin";
                } else {
                  authUser.role = "customer";
                }

                // 更新用戶登入資料
                commit("setUser", authUser);
                commit("setBusy", false, { root: true });
              })
              .catch(error => {
                commit("setBusy", false, { root: true });
                commit("setError", error, { root: true });
                console.error(error);
              });
          })
          .catch(error => {
            commit("setBusy", false, { root: true });
            commit("setError", error, { root: true });
            console.error(error);
          });
      }
    });
  },

  /*
  [更新用戶資料]
  1. 更新fiebase auth updateProfile
  2. 更新firebase auth email
  3. 更新firebase database資料
  4. 更新vuex user資料
  */
  async updateProfile({ commit, getters }, { name, email }) {
    try {
      commit("setBusy", true, { root: true });
      commit("clearError", true, { root: true });
      const oldUser = getters.user;

      // 更新fiebase auth 的displayName、email
      const currentUser = await fireApp.auth().currentUser;
      const updateEmail = await currentUser.updateEmail(email);

      // 更新database方法封裝
      const updateDb = () => {
        const updateObj = {};
        // 更新userGroups路徑配置
        if (oldUser.role === "admin") {
          updateObj[
            `userGroups/-LWfSQj71clTpqRVWPw2/${currentUser.uid}`
          ] = name;
        } else {
          updateObj[
            `userGroups/-LWfSXgHDLoybsuZeizB/${currentUser.uid}`
          ] = name;
        }
        // 更新users路徑配置
        updateObj[`users/${currentUser.uid}/email`] = email;
        updateObj[`users/${currentUser.uid}/name`] = name;
        return fireApp
          .database()
          .ref()
          .update(updateObj);
      };

      // 這邊才開始執行上方配置，並執行更新
      const updateUser = await currentUser
        .updateProfile({ displayName: name })
        .then(updateEmail)
        .then(updateDb)
        .then(() => {
          const updateUser = {
            id: oldUser.id,
            email: email,
            name: name,
            role: oldUser.role
          };
          return updateUser;
        });
      // 更新vuex user資料
      commit("setUser", updateUser);
      commit("setBusy", false, { root: true });
      commit("setJobDone", true, { root: true });
    } catch (error) {
      commit("setBusy", false, { root: true });
      commit("setError", error, { root: true });
      console.error(error);
    }
  },

  /*
  [登出]
  1. firebase auth 登出
  2. vuex 用戶資料清空
  */
  logOut({ commit }) {
    fireApp.auth().signOut();
    commit("setUser", null);
  },

  // 更改密碼
  changePassword({ commit }, { password }) {
    commit("setBusy", true, { root: true });
    commit("clearError", true, { root: true });
    const user = fireApp.auth().currentUser;
    user
      .updatePassword(password)
      .then(() => {
        commit("setBusy", false, { root: true });
        commit("setJobDone", true, { root: true });
      })
      .catch(error => {
        commit("setBusy", false, { root: true });
        commit("setError", error, { root: true });
      });
  }
};

export const getters = {
  user: state => state.user,
  loginStatus: state => state.user !== null && state.user !== undefined,
  isAdmin(state) {
    const isLoggedIn = state.user !== null && state.user !== undefined;
    return isLoggedIn && state.user.role === "admin";
  }
};
