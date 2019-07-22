<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="display-2">
          {{ $t('pages.dashboard.title') }}
        </h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  // import { api } from '@/services/feathers.service'
  export default {
    name: 'TheDashboardPage'
  }
</script>
