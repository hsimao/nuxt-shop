import { mapGetters } from "vuex";

export default {
  methods: {
    removeErrors() {
      this.$validator.reset();
      this.$store.commit("clearError");
    }
  },
  computed: {
    ...mapGetters({
      error: "error",
      busy: "busy",
      jobDone: "jobDone"
    })
  },
  watch: {
    jobDone(val) {
      if (val) {
        this.$store.commit("setJobDone", false);
        this.jobsDone();
      }
    }
  }
};
