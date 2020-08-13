/**
 * import and init global plugins
 */

import Vue from 'vue'

import globalEventBus from '../plugins/globalEventBus'
import shortkey from 'vue-shortkey'
import fileSaver from '../plugins/fileSaver'

Vue.use(globalEventBus)
Vue.use(shortkey)
Vue.use(fileSaver)
