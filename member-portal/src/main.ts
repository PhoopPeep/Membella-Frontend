// member-portal/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/base.css'

// FontAwesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUser,
  faSearch,
  faCreditCard,
  faCheck,
  faCheckCircle,
  faExclamationCircle,
  faChevronDown,
  faSignOutAlt,
  faBars,
  faTimes,
  faClock,
  faCalendar,
  faEnvelope,
  faPhone,
  faEdit,
  faSave,
  faArrowLeft,
  faPlus,
  faMinus,
  faHeart,
  faStar
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faUser,
  faSearch,
  faCreditCard,
  faCheck,
  faCheckCircle,
  faExclamationCircle,
  faChevronDown,
  faSignOutAlt,
  faBars,
  faTimes,
  faClock,
  faCalendar,
  faEnvelope,
  faPhone,
  faEdit,
  faSave,
  faArrowLeft,
  faPlus,
  faMinus,
  faHeart,
  faStar
)

const app = createApp(App)
const pinia = createPinia()

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(pinia)
app.use(router)

app.mount('#app')
