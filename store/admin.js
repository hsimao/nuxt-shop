import { fireApp, adminApp } from "@/plugins/firebase";

export const state = () => ({
  groups: [],
  admins: []
});

export const mutations = {
  loadGroups(state, payload) {
    state.groups.push(payload);
  },
  editGroup(state, { name, group }) {
    const index = state.groups.indexOf(group);
    state.groups[index].name = name;
  },
  removeGroup(state, group) {
    const index = state.groups.indexOf(group);
    state.groups.splice(index, 1);
  },
  loadAdmins(state, payload) {
    state.admins.push(payload);
  },
  removeAdmin(state, admin) {
    const index = state.admins.indexOf(admin);
    state.admins.splice(index, 1);
  }
};

export const actions = {
  // 新增user group
  createGroup({ commit }, payload) {
    // 第三個參數{root: true} 設置後可調用store其他模塊的 mutations
    commit("setBusy", true, { root: true });
    commit("clearError", true, { root: true });
    fireApp
      .database()
      .ref("groups")
      .push(payload)
      .then(() => {
        commit("setBusy", false, { root: true });
        commit("setJobDone", true, { root: true });
      })
      .catch(error => {
        commit("setBusy", false, { root: true });
        commit("setError", error, { root: true });
      });
  },
  // 更新group
  updateGroup({ commit }, { name, group }) {
    commit("setBusy", true, { root: true });
    commit("clearError", true, { root: true });
    fireApp
      .database()
      .ref(`groups/${group.key}`)
      .update({ name: name })
      .then(() => {
        commit("setBusy", false, { root: true });
        commit("setJobDone", true, { root: true });

        // 同步更新當前vuex group資料
        const editGroup = {
          group,
          name
        };
        commit("editGroup", editGroup);
      })
      .catch(error => {
        commit("setBusy", false, { root: true });
        commit("setError", error, { root: true });
      });
  },
  // 刪除group
  removeGroup({ commit }, { group }) {
    fireApp
      .database()
      .ref(`groups/${group.key}`)
      .remove()
      .then(() => {
        commit("removeGroup", group);
      })
      .catch(error => console.log(error));
  },
  // 從資料庫取得user group
  getGroups({ commit }) {
    fireApp
      .database()
      .ref("groups")
      .on("child_added", snapShot => {
        let item = snapShot.val();
        item.key = snapShot.key;
        commit("loadGroups", item);
      });
  },

  /*
  [新增管理者]
  1. 使用firebase auth api 註冊新用戶
  2. 將用戶資料儲存到database
  3. 將用戶的資料更新到groups上(管理者、一般用戶都要新增)
  */
  async createAdmin({ commit }, { name, email, password }) {
    try {
      commit("setBusy", true, { root: true });
      commit("clearError", null, { root: true });

      let newAdmin = null;

      // 註冊新用戶
      const userProfile = await adminApp
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(user => {
          const currentUser = adminApp.auth().currentUser;
          if (currentUser !== null) {
            currentUser.updateProfile({ displayName: name });
            newAdmin = currentUser;
          }
          const userProfile = {
            email: email,
            name: name,
            created_at: new Date().toISOString()
          };
          return userProfile;
        });

      // 用戶資料儲存到database
      await fireApp
        .database()
        .ref(`users/${newAdmin.uid}`)
        .set(userProfile);

      // 更新database groups資料
      // 1. 取得管理者跟一般用戶在groups內的uid
      const groupsAdminKey = await fireApp
        .database()
        .ref("groups")
        .orderByChild("name")
        .equalTo("Admin")
        .once("value")
        .then(snapShot => {
          return Object.keys(snapShot.val())[0];
        });
      const groupsConsumerKey = await fireApp
        .database()
        .ref("groups")
        .orderByChild("name")
        .equalTo("Customer")
        .once("value")
        .then(snapShot => {
          return Object.keys(snapShot.val())[0];
        });

      // 2. 將新增的管理者新增到groups內(admin跟consumer都要新增)
      let groupedUser = {};
      groupedUser[newAdmin.uid] = name;
      await fireApp
        .database()
        .ref(`userGroups/${groupsAdminKey}`)
        .update(groupedUser);
      await fireApp
        .database()
        .ref(`userGroups/${groupsConsumerKey}`)
        .update(groupedUser);

      commit("setJobDone", true, { root: true });
      commit("setBusy", false, { root: true });
    } catch (error) {
      commit("setBusy", false, { root: true });
      commit("setError", error, { root: true });
    }
  },

  /*
  [取得管理者列表]
  1. 抓出管理者群組uid
  2. 用管理者uid取出管理者列表
  */
  async getAdmins({ commit }) {
    try {
      const groupsAdminKey = await fireApp
        .database()
        .ref("groups")
        .orderByChild("name")
        .equalTo("Admin")
        .once("value")
        .then(snapShot => {
          return Object.keys(snapShot.val())[0];
        });

      // 用child_added方法將將管理逐一取出
      // child_added無法使用await
      let item = {};
      fireApp
        .database()
        .ref(`userGroups/${groupsAdminKey}`)
        .on("child_added", snapShot => {
          item = {
            id: snapShot.key,
            name: snapShot.val()
          };
          // 調用loadAdmins方法push到vuex上
          commit("loadAdmins", item);
        });
    } catch (error) {
      console.log(error);
    }
  },

  /*
  [移除管理者權限]
  1. 取的管理者群組uid
  2. 將用戶從管理者群組中移除
  */
  async removeAdmin({ commit }, admin) {
    console.log("payload", admin);
    try {
      const groupsAdminKey = await fireApp
        .database()
        .ref("groups")
        .orderByChild("name")
        .equalTo("Admin")
        .once("value")
        .then(snapShot => {
          return Object.keys(snapShot.val())[0];
        });

      await fireApp
        .database()
        .ref(`userGroups/${groupsAdminKey}/${admin.id}`)
        .remove()
        .then(() => {
          // 將vuex中的管理者移除
          commit("removeAdmin", admin);
        });
    } catch (error) {
      console.log(error);
    }
  }
};

export const getters = {
  groups: state => state.groups,
  admins: state => state.admins
};
