<template>
  <div>
    <section class="section no-top-pad">
      <nav class="level">
        <div class="level-left">
          <div class="level-item">
            <h5 class="title is-5">產品列表</h5>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <nuxt-link class="button is-primary"
              to="/admin/product-edit">新增</nuxt-link>
          </div>
        </div>
      </nav>
      <hr>
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>#</th>
            <th>照片</th>
            <th>產品</th>
            <th>編號</th>
            <th>品牌</th>
            <th class="has-text-centered">數量</th>
            <th class="has-text-centered">狀態</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in products"
            :key="product.key">
            <th>{{index+1}}</th>
            <td>
              <div class="product-image" :style="`backgroundImage: url(${product.imageUrl})`"></div>
            </td>
            <td><a href="#" @click.prevent="editProduct(product)">{{product.name}}</a></td>
            <td>{{product.code}}</td>
            <td>{{product.brand}}</td>
            <td class="has-text-centered">{{product.stock}}</td>
            <td class="has-text-centered">{{product.status
              === 1 ? '已上架' :
              '未上架'}}</td>
            <td>
              <a href="#" @click.prevent="removeProduct(product)">
                <span class="icon has-text-danger">
                  <i class="fa fa-lg fa-times-circle"></i>
                </span>
              </a>
            </td>
          </tr>

        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "product-list",
  created() {
    const loadedProducts = this.$store.getters["product/products"];
    if (loadedProducts.length === 0) {
      this.$store.dispatch("product/getProducts");
    }
    // 清空product跟產品分類productCategories, 避免新增產品時出現之前點擊過的編輯資料
    this.$store.commit("product/loadProduct", null);
    this.$store.commit("product/clearProductCategories", null);
  },
  computed: {
    ...mapGetters({
      products: "product/products"
    })
  },
  methods: {
    removeProduct(product) {
      this.$swal({
        title: `確認要刪除 ${product.name} 產品？`,
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(ok => {
        if (ok) {
          this.$store.dispatch("product/removeProduct", product);
        }
      });
    },
    editProduct(product) {
      this.$store.commit("product/loadProduct", product);
      this.$router.push("product-edit");
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