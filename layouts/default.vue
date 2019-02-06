<template>
  <div>
    <div class="container main-body">

      <!-- 選單 $navbar -->
      <nav class="navbar is-fixed-top section">
        <!-- 購物車動畫圖片 -->
        <div v-if="currentCartItem" class="product-image addCartAnimation"
          :style="`backgroundImage: url(${currentCartItem.imageUrl})`"></div>

        <div class="navbar-brand">
          <nuxt-link class="navbar-item" to="/">
            <img src="/logo.jpg">
          </nuxt-link>

          <div class="navbar-burger burger"
            data-target="top-menu">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div id="top-menu" class="navbar-menu">
          <div class="navbar-start">
            <nuxt-link class="navbar-item" to="/">
              首頁
            </nuxt-link>
            <div class="navbar-item has-dropdown is-hoverable"
              v-if="userIsAdmin">
              <a class="navbar-link is-active"
                href="#">
                Admin
              </a>
              <div class="navbar-dropdown ">
                <nuxt-link class="navbar-item" to="/admin/product-list">
                  商品管理
                </nuxt-link>
                <nuxt-link class="navbar-item" to="/admin/product-categories">
                  分類管理
                </nuxt-link>
                <a class="navbar-item " href="#">
                  訂單列表
                </a>
                <nuxt-link class="navbar-item" to="/admin/customers">
                  客戶列表
                </nuxt-link>
                <nuxt-link class="navbar-item" to="/admin/administrators">
                  管理者設定
                </nuxt-link>
                <nuxt-link class="navbar-item" to="/admin/user-groups">
                  用戶群組
                </nuxt-link>
              </div>
            </div>
          </div>

          <div class="navbar-end">
            <!-- 已登入後的用戶下拉選單 -->
            <div class="navbar-item has-dropdown is-hoverable"
              v-if="userLoggedIn">
              <a href="#" class="navbar-link is-active">
                Hi, {{username}}</a>
              <div class="navbar-dropdown">
                <nuxt-link to="/user-profile"
                  class="navbar-item">個人資料</nuxt-link>
                <nuxt-link to="/user-pwd-change"
                  class="navbar-item">修改密碼</nuxt-link>
                <a @click="logOut" class="navbar-item">登出</a>
              </div>
            </div>
            <div class="navbar-item" v-else>
              Hi, {{username}}
            </div>
            <div class="navbar-item">
              <div class="field is-grouped is-grouped-multiline">
                <p class="control">
                  <nuxt-link class="button animation-button"
                    to="/cart">
                    <span class="icon is-small">
                      <i class="fa fa-shopping-cart"></i>
                    </span>
                    <span v-if="cart">&bullet;
                      {{cart.items.length}} 項
                      ({{cartTotal | currency}})</span>
                  </nuxt-link>
                </p>

                <p class="control" v-if="!userLoggedIn">
                  <nuxt-link class="button is-primary"
                    to="/login">
                    <span class="icon is-small">
                      <i class="fa fa-unlock-alt"></i>
                    </span>
                    <span>
                      Login
                    </span>
                  </nuxt-link>
                </p>

                <p class="control" v-if="!userLoggedIn">
                  <nuxt-link class="button is-info"
                    to="/signup">
                    <span class="icon is-small">
                      <i class="fa fa-user-o"></i>
                    </span>
                    <span>Sign up</span>
                  </nuxt-link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </nav>

      <!-- 中間內容區塊 $content -->
      <nuxt />
      <!-- This is where the pages are presented -->
    </div>

    <!-- $footer -->
    <footer class="footer">
      <div class="container">
        <div class="content has-text-centered">
          <p>
            &copy; Under Armour.<br>
            Nuxt & Vue Jump-start.
          </p>
          <p>
            <img src="/logo.jpg" width="32px">
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import cartMixin from "@/mixins/cartMixin";
import { mapGetters } from "vuex";

export default {
  mixins: [cartMixin],
  data() {
    return {
      username: "用戶"
    };
  },
  computed: {
    ...mapGetters({
      userProfile: "auth/user",
      userLoggedIn: "auth/loginStatus",
      userIsAdmin: "auth/isAdmin"
    })
  },
  watch: {
    userProfile(val) {
      if (val) {
        this.username = val.name;
      } else {
        this.username = "用戶";
      }
    }
  },
  components: {},
  middleware: "",
  created() {
    // 判斷當下是否登入，若沒先調用firebase驗證是否已經登入過
    if (!this.userLoggedIn) {
      this.$store.dispatch("auth/setAuthStatus");
    }
  },
  mounted() {
    // 查看用戶端瀏覽器是否有購物車快取資料，若有就取用快取資料
    const cartInMemory = this.$warehouse.get("cart");
    if (this.cart.items.length === 0 && cartInMemory !== undefined) {
      this.$store.commit("catalog/reloadCart", cartInMemory.items);
    }
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logOut");
      this.$router.push("/");
    }
  }
};
</script>

<style scoped>
.addCartAnimation {
  position: absolute;
  right: 130px;
  top: 60px;
  width: 50px;
  height: 50px;
  background-color: #fff;
  opacity: 0;
  background-position: center center;
  background-size: cover;
  z-index: 100;
}
</style>