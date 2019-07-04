<template>
  <v-menu
    bottom
    :close-on-content-click="false"
    left
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn
        color="primary pink--text text--darken-3"
        v-on="on"
      >
        <v-icon>{{ icons.filter }}</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-subheader>
        {{ $t('pages.artifacts.statuses.hint') }}
      </v-subheader>
      <v-list-item-group
        v-model="statusFilter"
        multiple
      >
        <v-list-item
          v-for="status in statuses"
          :key="status.value"
          color="primary"
          link
        >
          <template #default="{ active }">
            <v-list-item-action>
              <v-checkbox
                v-model="active"
                color="primary"
              />
            </v-list-item-action>
            <v-list-item-content>
              {{ status.text }}
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
  import { mdiFilterVariant } from '@mdi/js'
  export default {
    name: 'TheStatusFilterMenu',
    data: function () {
      return {
        icons: {
          filter: mdiFilterVariant
        },
        statusFilter: [],
        statuses: [
          { value: 'idea', text: this.$t('pages.artifacts.statuses.idea') },
          { value: 'draft', text: this.$t('pages.artifacts.statuses.draft') },
          { value: 'work-in-progress', text: this.$t('pages.artifacts.statuses.work-in-progress') },
          { value: 'complete', text: this.$t('pages.artifacts.statuses.complete') },
          { value: 'will-not-complete', text: this.$t('pages.artifacts.statuses.will-not-complete') }
        ]
      }
    }
  }
</script>

<style lang="sass" scoped>
  .v-btn:not(.v-btn--round).v-size--default
    min-width: 36px
    padding: 0
</style>
