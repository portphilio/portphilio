<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-2">
          {{ $t('pages.dashboard.title') }}
        </h1>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  // import { api } from '@/services/feathers.service'
  export default {
    name: 'TheDashboardPage'
  }
</script>
