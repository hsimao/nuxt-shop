import Vue from "vue";

if (process.browser) {
  const VueQuillEditor = require("vue-quill-editor");
  Vue.use(VueQuillEditor);
}
