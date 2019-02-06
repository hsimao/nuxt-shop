<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <nuxt-link :to="{path: productPath(product.name, product.key)}"
          class="product-image-box">
          <div class="product-image" :style="`backgroundImage: url(${product.imageUrl})`"></div>
          <!-- <img
                    :src="product.imageUrl" alt="Image"> -->
        </nuxt-link>
      </figure>
    </div>
    <div class="card-content">
      <div class="media-content has-text-centered">
        <p class="subtitle is-6">{{product.name}}</p>
        <p class="title is-4">{{product.price |
          currency}}</p>
      </div>
    </div>
    <footer class="card-footer">
      <p class="card-footer-item">
        <span>
          <a href="#" class="button is-primary"
            @click.prevent="addToCart(product, 'add', $event)">加入購物車</a>
        </span>
      </p>
    </footer>
  </div>
</template>

<script>
import { slugString } from "@/plugins/helpers";
import cartMixin from "@/mixins/cartMixin";

export default {
  name: "ProductCard",
  props: ["product"],
  mixins: [cartMixin],
  methods: {
    // 將產品名稱寫入路由，優化搜尋
    productPath(name, key) {
      const slug = slugString(name);
      return `/product/${slug}/${key}`;
    }
  }
};
</script>

<style scoped>
.product-image-box {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.product-image {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100%;
}

.addCartAnimation {
  position: absolute;
  right: 100px;
  top: 5px;
  width: 50px;
  height: 50px;
  background-color: #fff;
  opacity: 0;
  background-position: center center;
  background-size: cover;
  z-index: 100;
}
</style>