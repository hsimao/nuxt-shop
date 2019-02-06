export default function({ store, req }) {
  const userLoggedIn = store.getters["auth/loginStatus"];
  if (!userLoggedIn) {
    store.dispatch("auth/setAuthStatus");
  }
}
