import { fireApp } from "@/plugins/firebase";

export const state = () => ({
  error: null,
  busy: false,
  jobDone: false,
  forwardRoute: null
});

export const mutations = {
  setError(state, payload) {
    state.error = payload;
  },
  clearError(state) {
    state.error = null;
  },
  setBusy(state, payload) {
    state.busy = payload;
  },
  setJobDone(state, payload) {
    state.jobDone = payload;
  },
  setForwardRoute(state, route) {
    state.forwardRoute = route;
  }
};

export const actions = {};

export const getters = {
  error: state => state.error,
  busy: state => state.busy,
  jobDone: state => state.jobDone,
  forwardRoute: state => state.forwardRoute
};
