<template>
  <div>
    <!-- <section class="section left-right-pad is-fluid">
      <div class="hero is-medium is-primary is-bold has-text-centered">
        <div class="hero-body">
          <h1 class="title">
            Warm Welcome to the Nshop!
          </h1>
          <h2 class="subtitle">
            Toys and Gifts for the Geeky Ones!
          </h2>
        </div>
      </div>
    </section> -->

    <section class="section">

      <!-- 搜尋bar區塊 -->
      <div class="box">
        <nav class="level">
          <div class="level-left">
            <div class="field is-grouped is-grouped-multiline">
              <p class="control">
                <input v-model="keyword" class="input"
                  type="text" placeholder="搜尋"
                  @keyup.enter="search">
              </p>
              <p class="control">
                <span class="select">
                  <select v-model="category">
                    <option value="">全部</option>
                    <option v-for="category in categories"
                      :key="category.key" :value="category.key">{{category.name}}</option>
                  </select>
                </span>
              </p>
              <p class="control">
                <a class="button is-primary"
                  @click.prevent="search">
                  搜尋
                </a>
                <!-- <a class="button is-warning"
                  @click.prevent="$store.commit('catalog/emptyCart')">
                  清空購物車
                </a> -->
              </p>
            </div>
          </div>

          <div class="level-right">
            <div class="field is-grouped is-grouped-multiline">
              <p class="control">
                <span class="select">
                  <select v-model="sort">
                    <option value="">排序</option>
                    <option value="low">價格 - 低 至
                      高</option>
                    <option value="high">價格 - 高 至
                      低</option>
                  </select>
                </span>
              </p>
            </div>
          </div>
        </nav>
      </div>

      <!-- 產品目錄顯示區塊 -->
      <div class="columns is-mobile is-multiline">
        <div v-for="product in filterProduct"
          :key="product.key" class="column is-full-mobile is-half-tablet is-half-desktop is-one-third-widescreen is-one-quarter-fullhd">
          <ProductCard :product="product" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ProductCard from "@/components/ProductCard";

export default {
  name: "AppIndex",
  components: {
    ProductCard
  },
  created() {
    // 判斷vuex當下是否有商品目錄資料，沒有則調用取得資料方法
    const loadedProduct = this.$store.getters["catalog/products"];
    if (loadedProduct.length === 0) {
      this.$store.dispatch("catalog/getProducts");
      this.$store.dispatch("catalog/getCategories");
    }
  },
  data() {
    return {
      keyword: "",
      category: "",
      sort: ""
    };
  },
  computed: {
    ...mapGetters({
      products: "catalog/products",
      categories: "catalog/categories"
    }),
    filterProduct() {
      if (!this.keyword && !this.category && !this.sort) {
        return this.products;
      } else {
        const newProduct = this.products.filter(item => {
          return new RegExp(this.keyword, "i").test(item.name);
        });
        // 排序
        if (this.sort) {
          // 價格低到高
          if (this.sort === "low") {
            newProduct.sort((a, b) => {
              return a.price - b.price;
            });
          } else {
            // 價格高到低
            newProduct.sort((a, b) => {
              return b.price - a.price;
            });
          }
        }
        return newProduct;
      }
    }
  },
  watch: {
    products(val) {
      if (val) {
        // console.log("test", val);
      }
    },
    categories(val) {
      if (val) {
        // console.log("categories", val);
      }
    }
  },
  methods: {
    search() {
      const searchData = {
        keyword: this.keyword,
        category: this.category,
        sort: this.sort
      };
      this.$store.dispatch("catalog/productSearch", searchData);
    }
  }
};
</script>
