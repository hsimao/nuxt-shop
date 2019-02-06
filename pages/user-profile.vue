<template>
  <div>
    <section class="section no-top-pad">
      <h5 class="title is-5">Profile</h5>
      <hr>

      <div class="columns is-centered is-mobile">

        <div class="column is-half-desktop is-full-mobile is-full-tablet">
          <form @submit.prevent="updateProfile">
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <input class="input" type="text"
                  name="name" v-model="name"
                  v-validate="'required|min:4'"
                  :class="{ 'is-danger': errors.has('name') }">
                <p v-show="errors.has('name')"
                  class="help is-danger">{{
                  errors.first('name') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Email</label>
              <div class="control">
                <input class="input" type="email"
                  name="email" v-model="email"
                  v-validate="'required|email'"
                  :class="{ 'is-danger': errors.has('email') }">
                <p v-show="errors.has('email')"
                  class="help is-danger">{{
                  errors.first('email') }}</p>
              </div>
            </div>

            <error-bar :error="error"></error-bar>

            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary"
                  :class="{ 'is-loading': busy }"
                  :disabled="busy">Update</button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </section>
  </div>
</template>

<script>
import ErrorBar from "@/components/ErrorBar";
import apiJobMixin from "@/mixins/apiJobMixin";

export default {
  data() {
    return {
      email: "",
      name: ""
    };
  },
  mixins: [apiJobMixin],
  components: {
    ErrorBar: ErrorBar
  },
  mounted: function() {
    this.$store.commit("clearError");
    const user = this.$store.getters["auth/user"];
    if (user) {
      this.email = user.email;
      this.name = user.name;
    }
  },
  methods: {
    updateProfile() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.$store.dispatch("auth/updateProfile", {
            name: this.name,
            email: this.email
          });
        }
      });
    },
    jobsDone() {
      this.$swal({
        title: "個人資料更新成功",
        icon: "success"
      });
    }
  },
  // If data gone after page reload
  computed: {
    userData() {
      return this.$store.getters["auth/user"];
    }
  },
  watch: {
    userData(value) {
      if (value) {
        this.email = value.email;
        this.name = value.name;
      }
    }
  }
};
</script>