import { fireApp } from "@/plugins/firebase";

export const state = () => ({
  categories: [],
  products: [],
  product: null,
  productCategories: []
});

export const mutations = {
  loadCategories(state, payload) {
    state.categories.push(payload);
  },
  updateCategory(state, { category, name }) {
    const index = state.categories.indexOf(category);
    state.categories[index].name = name;
  },
  removeCategory(state, category) {
    const index = state.categories.indexOf(category);
    state.categories.splice(index, 1);
  },
  loadProducts(state, products) {
    state.products = products;
  },
  removeProduct(state, product) {
    const index = state.products.indexOf(product);
    state.products.splice(index, 1);
  },
  loadProduct(state, product) {
    state.product = product;
  },
  loadProductCategories(state, category) {
    state.productCategories.push(category);
  },
  clearProductCategories(state) {
    state.productCategories = [];
  }
};

export const actions = {
  // 新增產品分類
  createCategory({ commit }, category) {
    commit("setBusy", true, { root: true });
    commit("clearError", null, { root: true });
    fireApp
      .database()
      .ref("categories")
      .push(category)
      .then(() => {
        commit("setBusy", false, { root: true });
        commit("setJobDone", true, { root: true });
      })
      .catch(error => {
        commit("setBusy", false, { root: true });
        commit("setError", error, { root: true });
      });
  },

  // 取得產品分類列表
  // 逐一取得分類後push到vuex
  getCategories({ commit }) {
    fireApp
      .database()
      .ref("categories")
      .on("child_added", snapShot => {
        let item = snapShot.val();
        item.key = snapShot.key;
        commit("loadCategories", item);
      });
  },

  // 更新產品分類
  updateCategory({ commit }, { category, name }) {
    commit("setBusy", true, { root: true });
    commit("clearError", null, { root: true });
    fireApp
      .database()
      .ref(`categories/${category.key}`)
      .update({ name: name })
      .then(() => {
        const categoryData = {
          category: category,
          name: name
        };
        commit("updateCategory", categoryData);
        commit("setBusy", false, { root: true });
        commit("setJobDone", true, { root: true });
      })
      .catch(error => {
        commit("setBusy", false, { root: true });
        commit("setError", error, { root: true });
      });
  },

  // 刪除產品分類
  removeCategory({ commit }, { category }) {
    fireApp
      .database()
      .ref(`categories/${category.key}`)
      .remove()
      .then(() => {
        commit("removeCategory", category);
      })
      .catch(error => {
        console.log(error);
      });
  },

  /*
  新增產品
  1. 將圖片儲存到Storage，並取出預覽網址，在加到productData物件內
  2. 取出需要儲存到products的資料
  3. 取出產品所屬分類，並儲存到對應productCategories資料內
  4. 重新呼叫getProducts方法，更新vuex
  */
  async addProduct({ commit, dispatch }, payload) {
    try {
      commit("setBusy", true, { root: true });
      commit("clearError", null, { root: true });

      const productData = payload;
      const categories = payload.belongs;
      const image = payload.image;
      let productKey = null;
      // 不將分類儲存到product內，後面將會獨立記錄在productCategories
      delete productData.belongs;
      // 圖片將另外儲存到Storage
      delete productData.image;

      // 儲存product到database
      const productSnippet = await fireApp
        .database()
        .ref("products")
        .push(productData)
        .then(result => {
          productKey = result.key;
          return {
            key: result.key,
            product: {
              name: productData.name,
              price: productData.price,
              status: productData.status
              // imageUrl: productData.imageUrl
            }
          };
        });

      // 儲存圖片到Storage, 並取得下載網址後加到productData
      if (image) {
        const uploadTask = await fireApp
          .storage()
          .ref(`products/${productKey}/${image.name}`)
          .put(image);
        const imageUrl = await uploadTask.ref
          .getDownloadURL()
          .then(function(downloadURL) {
            return downloadURL;
          });

        productData.imageUrl = imageUrl;
        productSnippet.product.imageUrl = imageUrl;
      } else {
        productData.imageUrl = "";
        productSnippet.product.imageUrl = "";
      }

      await fireApp
        .database()
        .ref(`products/${productKey}`)
        .update({ imageUrl: productData.imageUrl });

      // 重新取得產

      // 針對product所屬分類，將資料儲存到對應分類database
      let categoryUpdate = {};
      // 一樣商品可能會有多個分類
      categories.forEach(key => {
        categoryUpdate[`productCategories/${key}/${productSnippet.key}`] =
          productSnippet.product;
      });
      await fireApp
        .database()
        .ref()
        .update(categoryUpdate);

      // 重新執行getProducts, 取得最新products資訊更新當前vuex資訊
      dispatch("getProducts");
      commit("setBusy", false, { root: true });
      commit("setJobDone", true, { root: true });
    } catch (error) {
      commit("setBusy", false, { root: true });
      commit("setError", error, { root: true });
    }
  },

  /*
  [取得產品列表]
  1. 從firebase database 抓出所有products資料
  2. 重新格式化products資料：將各products加上id屬性
  3. 儲存到vuex
  */
  getProducts({ commit }) {
    fireApp
      .database()
      .ref("products")
      .once("value")
      .then(snapShot => {
        const products = [];
        let item = {};
        snapShot.forEach(product => {
          item = product.val();
          item.key = product.key;
          products.push(item);
        });
        commit("loadProducts", products.reverse());
      });
  },

  /*
  [刪除產品]
  1. 刪除Storage內的圖片
  2. 刪除產品資訊 products
  3. 刪除產品所屬分類資訊 productCategories
  4. 刪除vuex的product資訊
  */
  async removeProduct({ commit }, product) {
    try {
      // 刪除Storage內的圖片
      // 使用照片預覽網址並過濾後，以便後續使用storage api
      const imageUrl = product.imageUrl;
      if (imageUrl) {
        const refUrl = imageUrl.split("?")[0];
        const httpsRef = fireApp.storage().refFromURL(refUrl);
        await httpsRef.delete().then(() => {
          console.log("照片刪除成功");
        });
      }

      //  刪除產品資訊 products
      await fireApp
        .database()
        .ref(`products/${product.key}`)
        .remove();

      // 刪除產品所屬分類資訊 productCategories
      // 先找出所有分類key, 再產生一組將該產品所屬分類變成null的路徑，並更新
      await fireApp
        .database()
        .ref("categories")
        .once("value")
        .then(snapShot => {
          const catKeys = Object.keys(snapShot.val());
          let updates = {};
          catKeys.forEach(key => {
            updates[`productCategories/${key}/${product.key}`] = null;
          });
          return fireApp
            .database()
            .ref()
            .update(updates);
        })
        .then(() => {
          console.log("刪除成功");
        });
      commit("removeProduct", product);
    } catch (error) {
      console.log(error);
    }
  },

  /*
  [更新產品]
  1. 格式化資料, 將要儲存到products、productCategories、Storage區分整理
  2. 更新照片：判斷照片是否有更換，有就刪掉舊的，新增新的
  3. 更新products
  4. 更新productCategories
  5. 更新products資料到vuex
   */
  async updateProduct({ commit, dispatch }, product) {
    try {
      const productData = product;
      const image = product.image;
      const productKey = product.key;
      const categories = productData.belongs;
      delete productData.belongs; // 改存到productCategories
      delete productData.images; // 改存到Storage

      commit("setBusy", true, { root: true });
      commit("clearError", null, { root: true });

      // 更新照片
      // 如果舊照片不等於新照片，就表示有更新，要將舊照片刪除並新增新的
      if (product.oldImageUrl !== product.imageUrl) {
        const refUrl = product.oldImageUrl.split("?")[0];
        const httpsRef = fireApp.storage().refFromURL(refUrl);
        httpsRef.delete();

        const uploadTask = await fireApp
          .storage()
          .ref(`products/${productKey}/${image.name}`)
          .put(image);
        productData.imageUrl = await uploadTask.ref
          .getDownloadURL()
          .then(downloadURL => {
            console.log("取得imageUrl", downloadURL);
            return downloadURL;
          });
      }

      // 更新products
      await fireApp
        .database()
        .ref(`products/${productKey}`)
        .update(productData)
        .then(() => {
          console.log("更新products完畢");
        });

      // 更新productCategroies, 先刪除舊的，在新增新的
      // 刪除舊的
      let oldCatsRemoval = {};
      await fireApp
        .database()
        .ref(`productCategories`)
        .on("child_added", snapShot => {
          oldCatsRemoval[
            `productCategories/${snapShot.key}/${productKey}`
          ] = null;
        });
      await fireApp
        .database()
        .ref()
        .update(oldCatsRemoval);

      // 新增新的
      // 整理出需要儲存到分類內的資訊
      const productSnippet = {
        name: productData.name,
        imageUrl: productData.imageUrl,
        price: productData.price,
        status: productData.status
      };
      let catUpdates = {};
      categories.forEach(catKey => {
        catUpdates[
          `productCategories/${catKey}/${productKey}`
        ] = productSnippet;
      });
      await fireApp
        .database()
        .ref()
        .update(catUpdates);

      // 將最新products資料重新更新到vuex
      dispatch("getProducts");
      commit("setBusy", false, { root: true });
      commit("setJobDone", true, { root: true });
    } catch (error) {
      console.log(error);
      commit("setBusy", false, { root: true });
      commit("setError", error, { root: true });
    }
  },

  /*
  [取得產品所屬分類]
  1. 先清空當前分類值
  2. 用產品key值從資料庫抓取對應的分類
  3. 逐一push到vuex上
  */
  productCategories({ commit }, productKey) {
    commit("clearProductCategories");
    fireApp
      .database()
      .ref("productCategories")
      .on("child_added", snapShot => {
        let item = snapShot.val();
        item.key = snapShot.key;
        if (item[productKey] !== undefined) {
          commit("loadProductCategories", item.key);
        }
      });
  }
};

export const getters = {
  categories: state => state.categories,
  products: state => state.products,
  product: state => state.product,
  productCategories: state => state.productCategories
};
