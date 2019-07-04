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
    async mounted () {
      try {
        // handle the login
        await store.dispatch('auth/handle')
        // load the user's profile
        await store.dispatch('user/getProfile', store.state.auth.user_id)
        // get the original destination (if any)
        const to = store.getters['common/destination'] || '/dashboard'
        router.replace(to)
      } catch (err) {
        console.log('Login error', err, store.state.auth.error)
        router.replace('/')
      }
    }
  }
</script>
