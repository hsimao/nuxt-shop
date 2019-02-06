<template>
  <div>
    <section class="section no-top-pad">
      <h5 class="title is-5">Signup</h5>
      <hr>

      <div class="columns is-centered is-mobile">

        <div class="column is-half-desktop is-full-mobile is-full-tablet">
          <form @submit.prevent="onSignUp">
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <input class="input" type="text"
                  name="name" v-model="name"
                  v-validate="'required|min:2'"
                  :class="{'is-danger': errors.has('name')}">
                <p v-show="errors.has('name')"
                  class="help is-danger">{{errors.first('name')}}</p>
              </div>
            </div>
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
                  :disabled="busy">註冊</button>
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
  name: "signup",
  components: {
    ErrorBar
  },
  mixins: [apiJobMixin],
  data() {
    return {
      name: "",
      email: "",
      password: ""
    };
  },
  methods: {
    onSignUp() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const signUpData = {
            name: this.name,
            email: this.email,
            password: this.password
          };
          this.$store.dispatch("auth/signUp", signUpData);
        }
      });
    },
    jobsDone() {
      this.removeErrors();
      this.$router.replace("/");
    }
  }
};
</script>