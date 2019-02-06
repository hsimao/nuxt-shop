if (process.browser) {
  const { TweenMax } = require("gsap/TweenMax");
}

import { mapGetters } from "vuex";

export default {
  data() {
    return {
      cart: this.$store.getters["catalog/cart"]
    };
  },
  computed: {
    // 購物車總金額
    cartTotal() {
      let totalAmount = 0;
      this.cart.items.forEach(item => {
        totalAmount += item.quantity * parseFloat(item.product.price);
      });
      return totalAmount;
    },
    ...mapGetters({
      currentCartItem: "catalog/currentCart",
      cartActive: "catalog/cartActive"
    })
  },
  methods: {
    // 檢查產品是否已經在購物車內, 有則返回資料存放的位置
    productInCart(product) {
      let index = null;
      this.cart.items.forEach((item, i) => {
        if (item.product.key === product.key) {
          index = i;
        }
      });
      return index;
    },

    /*
    加入購物車
    參數說明：
    product：當下加入的產品物件
    evt：點擊事件物件：用$event傳遞過來
    quantity：加入數量，若沒給該參數，將預設為1
    1. 格式化數量quantity參數，若是首頁傳來'add', 可改為1, 若無給值或小於1將預設為1, 並轉為數值
    2. 檢查當下加入產品是否已經在夠物車內，有的話將不加入產品資訊，直接更新數量
    3. 將當下加入個產品資訊、與狀態加到vuex
    4. 啟用加入購物車動畫，等待0.8秒動畫結束後才將產品資料更新到購物車內
    */
    addToCart(product, quantity, evt) {
      if (this.cartActive) return;
      let productQuantity = !quantity || quantity < 1 ? 1 : parseInt(quantity);
      if (quantity === "add") {
        productQuantity = 1;
      }

      const item = {
        product: product,
        quantity: productQuantity
      };

      this.$store.commit("catalog/updateCurrentCart", product);
      this.$store.commit("catalog/updateCartActive", true);

      // 加入購物車動畫
      TweenMax.killAll();
      this.current = product;
      // 抓取按鈕當下位置，將右上角隱藏元素從該位置移到原位
      let pos = this.getPos(evt.target);

      // 使用this.$nextTick(), 等vue將資料更新完後才執行以下動畫, 才可避免第一次異常
      this.$nextTick(() => {
        TweenMax.from(".addCartAnimation", 0.8, {
          left: pos.x - 150,
          top: pos.y - 350,
          width: "300px",
          height: "300px",
          opacity: 1,
          ease: Power1.easeOut
        });

        // 等0.8秒上方動畫結束後才將產品加入購物車並觸發icon抖動動畫
        setTimeout(() => {
          // 判斷是否已經有加入過購物車
          const index = this.productInCart(product);

          // 尚未加入過購物車
          if (index === null) {
            this.$store.commit("catalog/updateCart", item);
            this.updateLocalStorage();
          } else {
            // 已加入過購物車, 判斷是否首頁數量+1,或者是產品內頁自訂數量
            if (quantity === "add") {
              // 只更新數量++
              this.$store.commit("catalog/increaseQuantity", index);
              this.updateLocalStorage();
            } else {
              // 自訂數量，全部更新
              this.$store.commit("catalog/updateCartQuantity", {
                index,
                quantity: productQuantity
              });
              this.updateLocalStorage();
            }
          }

          this.$store.commit("catalog/updateCartActive", false);
          TweenMax.from(".animation-button", 0.3, {
            scale: 0.7
          });

          // 使用彈窗插件, 參數設定參考：
          // https://shakee93.github.io/vue-toasted/
          this.$toast.show(`${item.product.name} 已加入購物車`, {
            theme: "toasted-primary",
            position: "bottom-right",
            duration: 2000 // 訊息停留時間
          });
        }, 800);
      });
    },
    increaseQuantity(index) {
      this.$store.commit("catalog/increaseQuantity", index);
      this.updateLocalStorage();
    },
    decreaseQuantity(index) {
      this.$store.commit("catalog/decreaseQuantity", index);
      this.updateLocalStorage();
    },
    updateLocalStorage() {
      this.$warehouse.set("cart", this.cart);
    },
    // 取得元素座標方法
    getPos(el) {
      var x = 0;
      var y = 0;
      while (el) {
        x += el.offsetLeft - el.scrollLeft + el.clientLeft;
        y += el.offsetTop - el.scrollLeft + el.clientTop;
        el = el.offsetParent;
      }
      return { x: x, y: y };
    }
  }
};
