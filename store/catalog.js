import { fireApp } from "@/plugins/firebase";

export const state = () => ({
  products: [],
  categories: [],
  cart: {
    items: []
  },
  currentCart: null,
  cartActive: false
});

export const mutations = {
  loadProducts(state, products) {
    state.products = products;
  },
  loadCategories(state, categories) {
    state.categories = categories;
  },
  updateCart(state, cartItem) {
    state.cart.items.push(cartItem);
  },
  reloadCart(state, cartItems) {
    state.cart.items = cartItems;
  },
  updateCartQuantity(state, { index, quantity }) {
    state.cart.items[index].quantity = quantity;
  },
  increaseQuantity(state, index) {
    state.cart.items[index].quantity++;
  },
  decreaseQuantity(state, index) {
    state.cart.items[index].quantity--;
    // 如果當前數量減完後等於0, 就將該項目從購物車刪除
    if (state.cart.items[index].quantity === 0) {
      state.cart.items.splice(index, 1);
    }
  },
  emptyCart(state) {
    state.cart.items = [];
  },
  updateCurrentCart(state, cartItem) {
    state.currentCart = cartItem;
  },
  updateCartActive(state, payload) {
    state.cartActive = payload;
  }
};

export const actions = {
  // 取得產品資訊
  async getProducts({ commit }) {
    try {
      const products = await fireApp
        .database()
        .ref("products")
        .limitToLast(50) // 限制最多只取出50比資料
        .once("value")
        .then(snapShot => {
          const products = [];
          let item = {};
          snapShot.forEach(child => {
            item = child.val();
            item.key = child.key;
            products.push(item);
          });
          return products;
        });
      commit("loadProducts", products.reverse());
    } catch (error) {
      console.log(error);
    }
  },

  // 取得分類
  async getCategories({ commit }) {
    try {
      const categories = await fireApp
        .database()
        .ref("categories")
        .once("value")
        .then(snapShot => {
          const categories = [];
          let item = {};
          snapShot.forEach(child => {
            item = child.val();
            item.key = child.key;
            categories.push(item);
          });
          return categories;
        });
      commit("loadCategories", categories);
    } catch (error) {
      console.log(error);
    }
  },

  // 搜尋
  async productSearchOld({ commit }, { keyword, category, sort }) {
    try {
      // 關鍵字搜尋
      await fireApp
        .database()
        .ref("products")
        .orderByChild("name")
        .limitToLast(50)
        .startAt(keyword)
        .endAt(keyword + "\uf8ff")
        .once("value")
        .then(snapShot => {
          let products = [];
          let item = {};
          snapShot.forEach(child => {
            item = child.val();
            item.key = child.key;
            products.push(item);
          });
          commit("loadProducts", products.reverse());
        });
    } catch (error) {
      console.log(error);
    }
  },
  // 搜尋
  async productSearch({ commit }, { keyword, category, sort }) {
    try {
      // 判斷是否有篩選類別, 有的話就改取用productCategories內的資料
      let ref = "products";
      if (category) {
        ref = `productCategories/${category}`;
      }

      await fireApp
        .database()
        .ref(ref)
        .limitToLast(50)
        .once("value")
        .then(snapShot => {
          let products = [];
          let item = {};
          snapShot.forEach(child => {
            item = child.val();
            item.key = child.key;
            products.push(item);
          });

          // 關鍵字搜尋過濾
          let productKeyword = products.filter(item =>
            new RegExp(keyword, "i").test(item.name)
          );

          // 排序
          if (sort) {
            // 價格低到高
            if (sort === "low") {
              productKeyword.sort((a, b) => {
                return a.price - b.price;
              });
            } else {
              // 價格高到低
              productKeyword.sort((a, b) => {
                return b.price - a.price;
              });
            }
          } else {
            // 預設排序，最新上架排最前面
            productKeyword = productKeyword.reverse();
          }
          commit("loadProducts", productKeyword);
        });
    } catch (error) {
      console.log(error);
    }
  },

  /*
  儲存訂單
  儲存訂單到資料庫的樹狀圖
  orders/orderKey/userKey/productKey/productDetail
  1. 產生新的orderKey
  2. 取得userkey
  3. 將購物車每項產品資料整理成欲儲存格式
  4. 更新到order上，清空購物車
   */
  async postOrder({ commit }, cart) {
    try {
      const orderKey = await fireApp
        .database()
        .ref("orders")
        .push().key;
      const user = await fireApp.auth().currentUser;
      let orderItems = {};
      cart.items.forEach(item => {
        orderItems[`orders/${orderKey}/${user.uid}/${item.product.key}`] = {
          code: item.product.code,
          product: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
          createdAt: new Date().toISOString()
        };
      });

      fireApp
        .database()
        .ref()
        .update(orderItems)
        .then(() => {
          commit("emptyCart");
          commit("setJobDone", true, { root: true });
        })
        .catch(error => {
          commit("setError", error, { root: true });
        });
    } catch (error) {
      console.log(error);
      commit("setError", error, { root: true });
    }
  }
};

export const getters = {
  products: state => state.products,
  categories: state => state.categories,
  cart: state => state.cart,
  currentCart: state => state.currentCart,
  cartActive: state => state.cartActive
};
