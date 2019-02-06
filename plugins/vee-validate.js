import Vue from "vue";
import VeeValidate, { Validator } from "vee-validate";
import zhTW_Validate from "vee-validate/dist/locale/zh_TW";

Vue.use(VeeValidate);

Validator.localize("zh_TW", zhTW_Validate);
