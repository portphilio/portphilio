<template>
  <v-container
    fluid
    class="fill-height"
  >
    <v-row
      align="center"
      justify="center"
    >
      <div class="text-center">
        <v-progress-circular
          :size="70"
          :width="7"
          indeterminate
          color="secondary"
        />
        <p>{{ $t('pages.handle-auth.logging-in') }}</p>
      </div>
    </v-row>
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
        // redirect to the requested page, or dashboard if unspecified
        const to = store.getters['common/destination'] || '/dashboard'
        router.replace(to)
      } catch (err) {
        console.log('Login error', err, store.state.auth.error)
        router.replace('/')
      }
    }
  }
</script>
