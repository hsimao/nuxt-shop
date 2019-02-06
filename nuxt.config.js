const pkg = require("./package");

module.exports = {
  mode: "universal",
  // 在每頁渲染前運行，調用中間件check-auth檢查
  router: {
    middleware: "check-auth"
  },
  /*
   ** Headers of the page
   */
  head: {
    title: "Nuxt Stop",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Nuxt Stop - A Nuxt Project"
      }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: "/bulma.css" },
      { rel: "stylesheet", href: "/styles.css" },
      { rel: "stylesheet", href: "/font-awesome.min.css" }
    ],
    script: [{ src: "/util.js", type: "text/javascript" }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },

  /*
   ** Global CSS
   */
  css: [
    // toasted訊息彈窗css
    "@/static/toasted.css",
    // edit編輯器css
    "quill/dist/quill.snow.css",
    "quill/dist/quill.bubble.css",
    "quill/dist/quill.core.css"
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "@/plugins/filters",
    "@/plugins/vee-validate",
    "@/plugins/vue-swal",
    {
      src: "@/plugins/vue-quill-editor",
      ssr: false //僅在客戶端渲染
    }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // 訊息彈窗插件
    "@nuxtjs/toast",
    // 本地儲存資料插件
    [
      "vue-warehouse/nuxt",
      {
        vuex: true,
        plugins: ["store/plugins/expire", "store/plugins/defaults"],
        storages: [
          "store/storages/localStorage",
          "store/storages/cookieStorage"
        ]
      }
    ]
  ],

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    // 將打包的檔案優化拆分，讓各個單一檔案不過大
    optimization: {
      splitChunks: {
        maxSize: 244000
      }
    },
    extend(config, ctx) {}
  }
};
