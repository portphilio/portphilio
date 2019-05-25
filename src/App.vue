<template>
  <v-app :dark="dark">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      :mini-variant="mini"
    >
      <v-list>
        <a-menu-item
          to="/"
          icon="mdi-home"
          :text="$t('pages.home.title')"
        />
        <a-menu-item
          to="/about"
          icon="mdi-information"
          :text="$t('pages.about.title')"
        />
        <v-divider />
        <v-list-item>
          <v-btn
            icon
            color="pink darken-3"
            @click="$store.dispatch('common/toggleNavDrawerMini')"
          >
            <v-icon>{{ mini ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      clipped-left
      class="primary"
    >
      <v-app-bar-nav-icon
        class="pink--text text--darken-3 hidden-lg-and-up"
        @click.stop="drawer = !drawer"
      />
      <img
        src="@/assets/logo.svg"
        width="38"
        height="38"
        class="mr-2"
      >
      <v-toolbar-title class="headline text-uppercase pt-1 pink--text text--darken-3">
        Portphilio
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          v-if="!isAuthenticated"
          text
          class="text-uppercase font-weight-black pink--text text--darken-3"
          @click="$store.dispatch('auth/login')"
        >
          Login
        </v-btn>
        <the-account-menu
          v-if="isAuthenticated"
        />
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <router-view/>
    </v-content>
    <v-footer
      app
      inset
    >
      <span class="mx-2">&copy; {{ copy }} Morgan C. Benton, All Rights Reserved</span>
    </v-footer>
  </v-app>
</template>

<script>
  import AMenuItem from '@/components/menus/AMenuItem'
  import TheAccountMenu from '@/components/menus/TheAccountMenu'
  export default {
    name: 'App',
    components: {
      AMenuItem,
      TheAccountMenu
    },
    data: () => ({
      dark: false,
      drawer: true
    }),
    computed: {
      copy () {
        const now = new Date().getFullYear()
        return now === 2019 ? now : `2019-${now}`
      },
      isAuthenticated () {
        return this.$store.getters['auth/isAuthenticated']
      },
      mini () {
        return this.$store.state.common.navDrawerIsMini
      }
    }
  }
</script>

<style lang="sass" scoped>
.v-toolbar__items
  .v-btn
    padding-top: 5px
</style>
