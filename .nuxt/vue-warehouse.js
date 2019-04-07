import WarehouseStore from 'vue-warehouse/store'

import WarehouseSync from 'vue-warehouse/sync'

// Define default store
const moduleName = 'warehouse'

// Define the default store, supporting only modern browsers
import store from 'store/dist/store.modern'

// Define default engine
import engine from 'store/src/store-engine'

// Active plugins
import plugin_50311252 from 'store/plugins/expire'
import plugin_bc82f276 from 'store/plugins/defaults'
const plugins = [
  plugin_50311252,
  plugin_bc82f276
]

// Active storages
import storage_7eb3f0fa from 'store/storages/localStorage'
import storage_3ed64ae4 from 'store/storages/cookieStorage'
const storages = [
  storage_7eb3f0fa,
  storage_3ed64ae4
]

export default (ctx, inject) => {
  const warehouseStore = WarehouseStore({
    moduleName: moduleName,
    engine: engine,
    store: store,
    plugins: plugins,
    storages: storages
  })

  const syncModuleName = moduleName

  WarehouseSync(ctx.store, warehouseStore, {
    moduleName: syncModuleName
  })

  // Inject WarehouseStore to the context as $moduleName
  ctx['$' + moduleName] = warehouseStore
  inject(moduleName, warehouseStore)
}