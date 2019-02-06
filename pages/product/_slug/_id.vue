<template>
  <div>
    <section class="section left-right-pad">
      <div class="columns">
        <div class="column is-6">
          <div class="image is-4by3">
            <img :src="product.imageUrl">
          </div>
        </div>
        <div class="column is-5 is-offset-1">
          <div class="title is-2">{{product.name}}</div>
          <p class="title is-3 has-text-muted">{{product.price
            | currency}}</p>
          <hr>
          <table class="table">
            <tbody>
              <tr>
                <td class="">
                  <strong>商品代號：</strong>
                </td>
                <td>{{product.code}}</td>
              </tr>
              <tr>
                <td class="">
                  <strong>品牌：</strong>
                </td>
                <td>{{product.brand}}</td>
              </tr>
              <tr>
                <td>
                  <strong>庫存：</strong>
                </td>
                <td :class="{'has-text-danger': product.stock <= 0}">{{product.stock
                  > 0 ?
                  product.stock :
                  '缺貨中' }}</td>
              </tr>
            </tbody>
          </table>

          <div class="field is-grouped is-grouped-multiline">
            <p class="control">
              <input ref="quantity" class="input has-text-centered"
                style="width:50px;" type="number"
                name="" value="1">
            </p>
            <p class="control">
              <a class="button is-primary"
                @click.prevent="addToCart(product, $refs.quantity.value, $event)">加入購物車</a>
            </p>
          </div>

        </div>
      </div>
    </section>

    <section class="section" v-if="product.description">
      <h6 class="title is-6">產品說明</h6>
      <hr size="1">
      <div class="content" v-html="product.description">
      </div>
    </section>
  </div>
</template>

<script>
import { fireApp } from "@/plugins/firebase";
import cartMixin from "@/mixins/cartMixin";

export default {
  name: "product",
  mixins: [cartMixin],
  // 動態meta SEO 優化
  head() {
    return {
      title: this.product.name,
      meta: [
        { hid: "description", name: "description", content: this.product.name }
      ]
    };
  },
  // 使用asynData, 先在伺服器讀取完資料才傳到前端, 方可使用動態meta, 來優化SEO
  asyncData({ params }) {
    return fireApp
      .database()
      .ref(`products/${params.id}`)
      .once("value")
      .then(snapShot => {
        let product = snapShot.val();
        product.key = params.id;
        return { product };
      });
  },
  mounted() {
    const id = this.$route.params.id;
  }
};
</script>