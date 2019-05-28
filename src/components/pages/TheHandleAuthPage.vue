<template>
  <v-container
    fluid
    fill-height
  >
    <v-layout
      align-center
      justify-center
    >
      <div class="text-xs-center">
        <v-progress-circular
          :size="70"
          :width="7"
          indeterminate
          color="secondary"
        />
        <p>{{ $t('pages.handle-auth.logging-in') }}</p>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
  import { store } from '@/store'
  import router from '@/router'
  export default {
    name: 'TheHandleAuthPage',
    mounted () {
      // for some reason, this component gets created
      // twice when navigating here from Auth0. In that
      // case, tries to handle the login twice, and the
      // second time fails. So, we need to check to make
      // sure we're not already logged in before trying
      // to handle the login attempt.
      if (!store.getters['auth/isAuthenticated']) {
        // handle the login
        store.dispatch('auth/handle').then(() => {
          let to
          // if login was successful
          if (store.getters['auth/isAuthenticated']) {
            // get the original destination (or dashboard page)
            to = store.getters['common/destination'] || '/dashboard'
          } else {
            // ruh-roh!
            const error = store.state.auth.error
            console.log(error)
            to = '/'
          }
          // redirect to the destination
          router.replace(to)
        })
      }
    }
  }
</script>
