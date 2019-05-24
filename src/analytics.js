import Vue from 'vue'
import VueAnalytics from 'vue-analytics'

Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_GOOGLE_ANALYTICS_TRACKING_ID
})
