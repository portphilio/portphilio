<template>
  <v-menu
    bottom
    left
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn
        flat
        class="pr-0"
        v-on="on"
      >
        <v-avatar size="38">
          <img :src="avatar">
        </v-avatar>
        <v-icon>expand_more</v-icon>
      </v-btn>
    </template>
    <v-list
      dense
      light
    >
      <v-list-tile to="account">
        <v-list-tile-action>
          <v-icon>account_box</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="text-capitalize">
            {{ $t('my-profile') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile @click="logout()">
        <v-list-tile-action>
          <v-icon>meeting_room</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title class="text-capitalize">
            {{ $t('logout') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
  export default {
    name: 'TheAccountMenu',
    props: {
      avatar: {
        type: null,
        required: true,
        default: ''
      }
    },
    methods: {
      logout () {
        this.$store.dispatch('auth/logout').then(function () {
          this.$router.push('/')
        })
      }
    }
  }
</script>
