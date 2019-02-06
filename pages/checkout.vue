<template>
  <div>
    <section class="section no-top-pad">
      <h5 class="title is-5">結帳</h5>
      <hr>

      <h5 class="title is-5" v-if="orderSuccess">
        <span class="icon is-medium has-text-success">
          <i class="fa fa-check-square"></i>
        </span>
        已經收到了您的訂單，感謝您的選購。
      </h5>

      <h5 v-else class="title is-5 has-text-info">
        處理中...
      </h5>

      <ErrorBar :error="error" />
    </section>
  </div>
</template>

<script>
import cartMixin from "@/mixins/cartMixin";
import apiJobMixin from "@/mixins/apiJobMixin";
import ErrorBar from "@/components/ErrorBar";

export default {
  name: "checkout",
  mixins: [cartMixin, apiJobMixin],
  components: {
    ErrorBar
  },
  data() {
    return {
      orderSuccess: false
    };
  },
  created() {
    if (this.cart.items.length === 0) {
      this.$router.replace("/");
    }
  },
  mounted() {
    this.$store.dispatch("catalog/postOrder", this.cart);
  },
  methods: {
    jobsDone() {
      this.$warehouse.remove("cart");
      this.orderSuccess = true;
    }
  }
};
</script>