<template>
  <v-menu
    bottom
    left
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        class="pr-0"
        v-on="on"
      >
        <v-avatar size="38">
          <img :src="avatar">
        </v-avatar>
        <v-icon>{{ icons.dropdown }}</v-icon>
      </v-btn>
    </template>
    <v-list
      dense
      light
    >
      <v-list-item to="account">
        <v-list-item-action>
          <v-icon>{{ icons.profile }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title class="text-capitalize">
            {{ $t('menus.account.my-profile') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="logout()">
        <v-list-item-action>
          <v-icon>{{ icons.logout }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title class="text-capitalize">
            {{ $t('menus.account.logout') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  import { mdiAccountBox, mdiExitRun, mdiChevronDown } from '@mdi/js'
  export default {
    name: 'TheAccountMenu',
    data: () => ({
      icons: {
        dropdown: mdiChevronDown,
        profile: mdiAccountBox,
        logout: mdiExitRun
      }
    }),
    computed: {
      avatar () {
        return (this.$store.state.auth.user || {}).picture || ''
      }
    },
    methods: {
      logout () {
        this.$store.dispatch('auth/logout', process.env.VUE_APP_AUTH0_LOGOUT_URI)
      }
    }
  }
</script>
