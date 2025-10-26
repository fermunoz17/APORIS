import assetsSeed from "../assets/syntheticAssets.json";

const initialKPIs = { uptime: 100, cyberRisk: 60, compliance: 80, efficiency: 80, total: 0 };
const initialState = {
  week: 1,
  seed: 42,
  kpis: initialKPIs,
  assets: assetsSeed,
  acceptedPlan: [],
  audit: [],
  federatedMode: false
};

let subscribers = [];
let state = initialState;

export function getState() {
  return state;
}

export function subscribe(fn) {
  subscribers.push(fn);
  return () => (subscribers = subscribers.filter(s => s !== fn));
}

function notify() {
  subscribers.forEach(s => s(state));
}

export function setState(patch) {
  state = { ...state, ...patch };
  notify();
}
