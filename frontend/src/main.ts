import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/base.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import icons
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faCog,
  faArrowLeft,
  faDatabase,
  faDollarSign,
  faUsers,
  faCreditCard,
  faUser,
  faEnvelope,
  faPhone,
  faGlobe,
  faBuilding,
  faCalendar,
  faClock,
  faLock,
  faSignOutAlt,
  faCamera,
  faBars,
  faCheckCircle,
  faExclamationCircle,
  faMinus,
  faChevronRight,
  faMapMarker
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faCog,
  faArrowLeft,
  faDatabase,
  faDollarSign,
  faUsers,
  faCreditCard,
  faUser,
  faEnvelope,
  faPhone,
  faGlobe,
  faBuilding,
  faCalendar,
  faClock,
  faLock,
  faSignOutAlt,
  faCamera,
  faBars,
  faCheckCircle,
  faExclamationCircle,
  faMinus,
  faChevronRight,
  faMapMarker
)


const app = createApp(App)
const pinia = createPinia()

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(pinia)
app.use(router)

app.mount('#app')
