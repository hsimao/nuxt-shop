<template>
  <div>
    <section class="section no-top-pad">
      <h5 class="title is-5">Login</h5>
      <hr>

      <div class="columns is-centered is-mobile">
        <div class="column is-half-desktop is-full-mobile is-full-tablet">
          <form @submit.prevent="onLogin">
            <div class="field">
              <label class="label">Email</label>
              <div class="control">
                <input class="input" type="email"
                  v-model="email" v-validate="'required|email'"
                  :class="{'is-danger' : errors.has('email')}"
                  name="email">
                <p v-show="errors.has('email')"
                  class="help is-danger">{{errors.first('email')}}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Password</label>
              <div class="control">
                <input class="input" type="password"
                  v-model="password" v-validate="'required|min:6'"
                  :class="{'is-danger': errors.has('password')}"
                  name="password">
                <p v-show="errors.has('password')"
                  class="help is-danger">{{errors.first('password')}}</p>
              </div>
            </div>

            <ErrorBar :error="error" />

            <div class="field">
              <div class="control">
                <button class="button is-primary"
                  :class="{'is-loading': busy}"
                  :disabled="busy">登入</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import apiJobMixin from "@/mixins/apiJobMixin";
import ErrorBar from "@/components/ErrorBar";

export default {
  name: "login",
  mixins: [apiJobMixin],
  components: {
    ErrorBar
  },
  data() {
    return {
      email: "mars@gmail.com",
      password: "123456"
    };
  },

  beforeCreate() {
    // 渲染前先判斷是否已經登入過，若已經登入就導回首頁
    const isLoggedIn = this.$store.getters["auth/loginStatus"];
    if (isLoggedIn) {
      this.$router.replace("/");
    }
  },
  methods: {
    onLogin() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const loginData = {
            email: this.email,
            password: this.password
          };
          this.$store.dispatch("auth/login", loginData);
        }
      });
    },
    jobsDone() {
      this.removeErrors();
      let nextRoute = "/";
      // 判斷是否有設置forwardRoute, 有的話登入完後將轉跳到特定頁面
      const forwardRoute = this.$store.getters.forwardRoute;
      if (forwardRoute !== null) {
        nextRoute = forwardRoute;
        this.$store.commit("setForwardRoute", null);
      }
      this.$router.replace(nextRoute);
    }
  }
};
</script>