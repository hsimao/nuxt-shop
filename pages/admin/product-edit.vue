<template>
  <div>
    <section class="section no-top-pad">
      <nav class="level">
        <div class="level-left">
          <div class="level-item">
            <h5 class="title is-5">新增產品</h5>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <button class="button" @click="goBack">返回</button>
          </div>
        </div>
      </nav>
      <hr>
      <form @submit.prevent="onSubmit">
        <div class="columns">
          <div class="column is-one-third">
            <label class="label">照片</label>
            <div class="file has-name is-fullwidth">
              <label class="file-label">
                <input class="file-input" type="file"
                  @change="onImageSelect">
                <span class="file-cta">
                  <span class="file-icon">
                    <i class="fa fa-upload"></i>
                  </span>
                  <span class="file-label">
                    選擇檔案
                  </span>
                </span>
                <span class="file-name">
                  {{imageName}}
                </span>
              </label>
            </div>
            <br>
            <p class="image">
              <img :src="imageUrl">
            </p>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">名稱*</label>
              <div class="control">
                <input class="input" type="text"
                  name="name" v-model="name"
                  v-validate="'required|min:1'"
                  :class="{ 'is-danger': errors.has('name') }">
                <p v-show="errors.has('name')"
                  class="help is-danger">{{
                  errors.first('name') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Code*</label>
              <div class="control">
                <input class="input" type="text"
                  name="code" v-model="code"
                  v-validate="'required|min:2'"
                  :class="{ 'is-danger': errors.has('code') }">
                <p v-show="errors.has('code')"
                  class="help is-danger">{{
                  errors.first('code') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Brand*</label>
              <div class="control">
                <input class="input" type="text"
                  name="brand" v-model="brand"
                  v-validate="'required|min:2'"
                  :class="{ 'is-danger': errors.has('brand') }">
                <p v-show="errors.has('brand')"
                  class="help is-danger">{{
                  errors.first('brand') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Price*</label>
              <div class="control">
                <input class="input" type="text"
                  name="price" v-model="price"
                  v-validate="'required|decimal:2'"
                  :class="{ 'is-danger': errors.has('price') }">
                <p v-show="errors.has('price')"
                  class="help is-danger">{{
                  errors.first('price') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Stock*</label>
              <div class="control">
                <input class="input" type="number"
                  name="stock" v-model="stock"
                  v-validate="'required|numeric'"
                  :class="{ 'is-danger': errors.has('stock') }">
                <p v-show="errors.has('stock')"
                  class="help is-danger">{{
                  errors.first('stock') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">所屬分類*</label>
              <div class="control">
                <div class="select is-multiple">
                  <select multiple size="3" name="belongs"
                    v-model="belongs" v-validate="'required'"
                    :class="{ 'is-danger': errors.has('belongs') }">
                    <option v-for="category in categories"
                      :key="category.key" :value="category.key">{{category.name}}</option>
                  </select>
                </div>
                <p v-show="errors.has('belongs')"
                  class="help is-danger">{{
                  errors.first('belongs') }}</p>
              </div>
            </div>
            <div class="field">
              <label class="label">Status*</label>
              <div class="control">
                <div class="select">
                  <select name="status" v-model="status">
                    <option value="1">Available</option>
                    <option value="0">Not
                      Available</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Detail</label>
              <div class="control">
                <quill-editor id="editor"
                  :options="editorOption" v-model="description"
                  ref="QuillEditor" @change="onEditorChange($event)"
                  @ready="onEditorReady($event)">
                </quill-editor>
                <!-- <textarea class="textarea"
                  v-model="description">
                </textarea> -->
              </div>
            </div>

            <error-bar :error="error"></error-bar>

            <div class="field">
              <div class="control">
                <button class="button is-primary"
                  :class="{ 'is-loading': busy }"
                  :disabled="busy">{{ !key ?
                  'Add' : 'Update' }}</button>
              </div>
            </div>

          </div>
        </div>
      </form>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ErrorBar from "@/components/ErrorBar";
import apiJobMixin from "@/mixins/apiJobMixin";

import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

export default {
  name: "product-edit",

  data() {
    const self = this;
    return {
      key: 0,
      name: "",
      code: "",
      brand: "",
      price: "",
      stock: "",
      belongs: [],
      status: 1,
      description: "",
      image: null,
      imageName: "",
      imageUrl: "https://placehold.it/800x600",
      oldImageUrl: "",
      editorOption: {
        // some quill options
        modules: {
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"], // toggled buttons
              ["blockquote", "code-block"],
              ["link", "image"],

              [{ header: 1 }, { header: 2 }], // custom button values
              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }], // superscript/subscript
              [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
              [{ direction: "rtl" }], // text direction

              [{ size: ["small", false, "large", "huge"] }], // custom dropdown
              [{ header: [1, 2, 3, 4, 5, 6, false] }],

              [{ color: [] }, { background: [] }], // dropdown with defaults from theme
              [{ font: [] }],
              [{ align: [] }],

              ["clean"],
              ["showHtml"] // remove formatting button
            ]
          }
        }
      }
    };
  },
  middleware: "verify-admin",
  mixins: [apiJobMixin],
  components: {
    ErrorBar
  },
  mounted() {
    if (this.categories.length === 0) {
      this.loadedCategoryies();
    }
    // 如果當前product有值，就將product值呈現
    // 並將該產品的分類值抓出來
    if (this.product !== null) {
      this.populateForm();
      this.$store.dispatch("product/productCategories", this.product.key);
    }
  },
  computed: {
    ...mapGetters({
      categories: "product/categories",
      product: "product/product",
      productCategories: "product/productCategories"
    }),
    editor() {
      return this.$refs.QuillEditor.quill;
    }
  },
  watch: {
    productCategories(val) {
      if (val) {
        this.belongs = val;
      }
    }
  },
  methods: {
    onSubmit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const productData = {
            name: this.name,
            code: this.code,
            brand: this.brand,
            price: this.price,
            stock: this.stock,
            belongs: this.belongs,
            status: this.status,
            description: this.description,
            image: this.image
          };
          // 使用key判斷是否為編輯還是新增
          if (!this.key) {
            this.$store.dispatch("product/addProduct", productData);
          } else {
            // 編輯需另外加上key、imageUrl 跟舊的圖片url, 以便刪除舊照片
            productData.key = this.key;
            productData.imageUrl = this.imageUrl;
            productData.oldImageUrl = this.oldImageUrl;
            this.$store.dispatch("product/updateProduct", productData);
          }
        }
      });
    },
    onImageSelect(event) {
      const files = event.target.files;
      this.imageName = files[0].name;
      this.image = files[0];

      // 圖片預覽
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(files[0]);
    },
    loadedCategoryies() {
      const categoryies = this.$store.getters["product/categories"];
      if (categoryies.length === 0) {
        this.$store.dispatch("product/getCategories");
      }
    },
    // 將當前product值撒到對應的編輯值內
    populateForm() {
      for (let key in this.product) {
        this[key] = this.product[key];
      }
      this.oldImageUrl = this.product.imageUrl;
    },
    jobsDone() {
      // 新增完成後回到產品列表頁面
      this.$router.push("product-list");
    },
    goBack() {
      window.history.go(-1);
    },
    onEditorChange({ editor, html, text }) {
      this.description = html;
    },
    onEditorReady() {
      this.editShowHtml();
    },
    // html 原始碼切換功能
    editShowHtml() {
      const _this = this;
      var txtArea = document.createElement("textarea");
      // 顯示樣式
      txtArea.style.cssText =
        "width: 100%;margin: 0px;background: rgb(29, 29, 29);box-sizing: border-box;color: rgb(204, 204, 204);font-size: 15px;outline: none;padding: 20px;line-height: 24px;font-family: Consolas, Menlo, Monaco, &quot;Courier New&quot;, monospace;position: absolute;top: 0;bottom: 0;border: none;display:none";

      var htmlEditor = this.editor.addContainer("ql-custom");
      htmlEditor.appendChild(txtArea);

      var myEditor = document.querySelector("#editor");
      this.editor.on("text-change", (delta, oldDelta, source) => {
        var html = myEditor.querySelector(".ql-editor").innerHTML;
        txtArea.value = html;
      });

      const toggleBtn = document.querySelector(".ql-showHtml");
      toggleBtn.addEventListener("click", function() {
        if (txtArea.style.display === "") {
          var html = txtArea.value;
          _this.editor.pasteHTML(html);
        }
        txtArea.style.display = txtArea.style.display === "none" ? "" : "none";
      });
    }
  }
};
</script>

<style>
.ql-showHtml {
  outline: none;
}
.ql-showHtml:after {
  content: "[HTML]";
}
</style>