// 驗證是否為管理員, 否則返回首頁
export default function({ store, redirect }) {
  const user = store.getters["auth/user"];
  if (!user || user.role !== "admin") {
    return redirect("/");
  }
}
