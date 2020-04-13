export default function({ store, req }) {
  console.log("hello");
  const userLoggedIn = store.getters["auth/loginStatus"];
  if (!userLoggedIn) {
    store.dispatch("auth/setAuthStatus");
  }
}
