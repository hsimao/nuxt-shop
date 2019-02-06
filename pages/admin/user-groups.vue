<template>
  <div>
    <section class="section no-top-pad">
      <h5 class="title is-5">用戶群組</h5>
      <hr>
      <div class="columns">
        <div class="column is-one-third">
          <form @submit.prevent="onSubmit">
            <div class="field">
              <label class="label" v-if="!editGroup">創建新群組</label>
              <label class="label" v-else>更新群組</label>
              <div class="control">
                <input class="input" type="text"
                  name="name" v-model="name"
                  v-validate="'required|min:4'"
                  :class="{'is-danger' : errors.has('name')}">
                <p v-show="errors.has('name')"
                  class="help is-danger">{{errors.first('name')}}</p>
              </div>
            </div>

            <ErrorBar :error="error" />

            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary"
                  :class="{'is-loading': busy}"
                  :disabled="busy">{{!editGroup ?
                  '新增' : '更新'}}
                </button>
                <button style="margin-left: 5px;"
                  type="button" class="button"
                  @click="cancelEdit()" v-if="editGroup">取消</button>
              </div>
            </div>
          </form>
        </div>
        <div class="column">
          <table class="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>#</th>
                <th>User group</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody v-if="groups.length > 0">
              <tr v-for="(group, index) in groups"
                :key="group.key">
                <th>{{index+1}}</th>
                <td><a href="#" @click.prevent="selectGroup(group)">{{group.name}}</a></td>
                <td>
                  <a href="#" @click.prevent="removeGroup(group)">
                    <span class="icon has-text-danger">
                      <i class="fa fa-lg fa-times-circle"></i>
                    </span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import apiJobMixin from "@/mixins/apiJobMixin";
import { mapGetters } from "vuex";
import ErrorBar from "@/components/ErrorBar";

export default {
  name: "user-groups",
  components: {
    ErrorBar
  },
  middleware: "verify-admin",
  mixins: [apiJobMixin],
  data() {
    return {
      name: "",
      editGroup: null
    };
  },
  computed: {
    ...mapGetters({
      groups: "admin/groups"
    })
  },
  created() {
    const loadedGroups = this.$store.getters["admin/groups"];
    // 如果vuex內還沒有groups資料，就調用重新從資料庫取得資料方法
    if (loadedGroups.length === 0) {
      this.$store.dispatch("admin/getGroups");
    }
  },
  methods: {
    onSubmit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          if (!this.editGroup) {
            this.$store.dispatch("admin/createGroup", { name: this.name });
          } else {
            this.$store.dispatch("admin/updateGroup", {
              name: this.name,
              group: this.editGroup
            });
          }
        }
      });
    },
    selectGroup(group) {
      this.editGroup = group;
      this.name = group.name;
    },
    cancelEdit() {
      this.editGroup = null;
      this.jobsDone();
    },
    removeGroup(group) {
      this.$swal({
        title: "確定要刪除此群組？",
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(ok => {
        if (ok) {
          this.$store.dispatch("admin/removeGroup", { group });
        }
      });
    },
    jobsDone() {
      this.name = "";
      this.editGroup = null;
      // dom更新完後才觸發
      this.$nextTick(() => {
        this.removeErrors();
      });
    }
  }
};
</script>