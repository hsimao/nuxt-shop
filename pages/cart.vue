<template>
  <div>
    <section class="section no-top-pad">

      <h5 class="title is-5">購物車</h5>
      <hr>
      <div v-if="cart.items.length > 0">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th></th>
              <th>名稱</th>
              <th class="has-text-right">價格</th>
              <th class="has-text-centered">數量</th>
              <th class="has-text-right">總計</th>
            </tr>
          </thead>
          <tbody class="cart">
            <tr v-for="(item, index) in cart.items"
              :key="item.product.key">
              <td>
                <div class="product-image" :style="`backgroundImage: url(${item.product.imageUrl})`"></div>
                <!-- <img class="" src="http://placehold.it/48x48"
                alt="Image"></td> -->
              <td>{{item.product.name}}</td>
              <td class="has-text-right">{{item.product.price
                | currency}}</td>
              <td class="has-text-centered">
                {{item.quantity}}
                <!-- 增加數量按鈕 -->
                <a @click.prevent="increaseQuantity(index)"
                  class="button is-primary is-outlined is-small">
                  <span class="icon is-small">
                    <i class="fa fa-plus"></i>
                  </span>
                </a>
                <!-- 減少數量按鈕 -->
                <a @click.prevent="decreaseQuantity(index)"
                  class="button is-danger is-outlined is-small">
                  <span class="icon is-small">
                    <i class="fa fa-minus"></i>
                  </span>
                </a>
              </td>
              <td class="has-text-right">{{item.product.price
                * item.quantity
                | currency}}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td class="has-text-right"><strong>總金額：
                  <span class="cart-total">{{cartTotal
                    | currency}}</span></strong></td>
            </tr>
          </tbody>
        </table>

        <div class="field is-grouped is-grouped-centered">
          <div class="control">
            <nuxt-link class="button is-info" to="/">繼續選購</nuxt-link>
          </div>
          <div class="control">
            <a class="button is-primary"
              @click.prevent="checkout">結帳</a>
          </div>
        </div>
      </div>
      <div v-else class="has-text-centered">
        <h5 class="title is-5">您的購物車目前沒有東西</h5>
        <!-- <div class="field is-grouped is-grouped-centered"> -->
        <!-- <div class="control"> -->
        <nuxt-link class="button is-primary" to="/">回去選購</nuxt-link>
        <!-- </div> -->
        <!-- </div> -->
      </div>

    </section>
  </div>
</template>

<script>
import cartMixin from "@/mixins/cartMixin";

export default {
  name: "cart",
  mixins: [cartMixin],
  methods: {
    /*
    結帳
    1. 驗證是否有登入, 若沒登入將導到登入頁面
    2. 設置登入成功後的下個轉跳頁面到
     */
    checkout() {
      const isLoaggedIn = this.$store.getters["auth/loginStatus"];

      if (!isLoaggedIn) {
        this.$store.commit("setForwardRoute", "/checkout");
        this.$router.push("/login");
      } else {
        this.$router.push("/checkout");
      }
    }
  }
};
</script>

<style  scoped>
.product-image {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 48px;
  height: 48px;
}
</style>