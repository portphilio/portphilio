<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      :mini-variant="mini"
    >
      <v-col class="fill-height">
        <v-list>
          <can I="update" a="Artifact">
            <a-menu-item
              to="/dashboard"
              :icon="icons.dashboard"
              :text="$t('pages.dashboard.title')"
            />
            <a-menu-item
              to="/artifacts"
              :icon="icons.artifacts"
              :text="$t('pages.artifacts.title')"
            />
          </can>
          <a-menu-item
            to="/"
            :icon="icons.home"
            :text="$t('pages.home.title')"
          />
          <a-menu-item
            to="/about"
            :icon="icons.about"
            :text="$t('pages.about.title')"
          />
          <v-divider />
          <v-list-item>
            <v-btn
              color="pink darken-3"
              icon
              name="toggleNavDrawerMini"
              @click="$store.dispatch('common/toggleNavDrawerMini')"
            >
              <v-icon>{{ mini ? icons.right : icons.left }}</v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
        <div class="flex-grow-1" />
        <v-list dense class="py-0">
          <v-list-item
            v-if="deferredPrompt"
            @click="promptInstall"
          >
            <v-list-item-action>
              <v-icon color="info">
                {{ icons.install }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content class="text-capitalize font-weight-bold">
              <v-list-item-title class="info--text">
                {{ $t('install') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="isOnline">
            <v-list-item-action>
              <v-icon color="success">
                {{ icons.connected }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content class="text-capitalize font-weight-bold">
              <v-list-item-title class="success--text">
                {{ $t('online') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="isOffline">
            <v-list-item-action>
              <v-icon color="error">
                {{ icons.disconnected }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content class="text-capitalize font-weight-bold">
              <v-list-item-title class="error--text">
                {{ $t('offline') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
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
      <div class="flex-grow-1" />
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
      <router-view />
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
  import {
    mdiBriefcaseDownload,
    mdiChevronLeft,
    mdiChevronRight,
    mdiFileDocumentBoxMultiple,
    mdiHome,
    mdiInformation,
    mdiViewDashboard,
    mdiWifi,
    mdiWifiOff
  } from '@mdi/js'
  import { VueOfflineMixin } from 'vue-offline'
  import AMenuItem from '@/components/menus/AMenuItem'
  import TheAccountMenu from '@/components/menus/TheAccountMenu'
  export default {
    name: 'App',
    components: {
      AMenuItem,
      TheAccountMenu
    },
    mixins: [VueOfflineMixin],
    data: () => ({
      deferredPrompt: null,
      drawer: true,
      icons: {
        about: mdiInformation,
        artifacts: mdiFileDocumentBoxMultiple,
        connected: mdiWifi,
        dashboard: mdiViewDashboard,
        disconnected: mdiWifiOff,
        home: mdiHome,
        install: mdiBriefcaseDownload,
        left: mdiChevronLeft,
        right: mdiChevronRight
      }
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
    },
    created () {
      // get a reference to the store
      // const store = this.$store
      // when the state has been restored
      // store._vm.$root.$on('storageReady', () => {
      //   // set our online status
      //   store.dispatch(this.isOnline ? 'common/resumeQueue' : 'common/pauseQueue')
      // })
      // // setup listeners to keep track of our current connection status
      // this.$on('online', () => store.dispatch('common/resumeQueue'))
      // this.$on('offline', () => store.dispatch('common/pauseQueue'))

      // explicitly handle invitations to install the app
      this.$on('canInstall', evt => {
        // prevent Chrome 67 and earlier from automatically showing the prompt
        evt.preventDefault()
        // stash the event for later use
        this.deferredPrompt = evt
      })
    },
    methods: {
      promptInstall () {
        // show the prompt
        this.deferredPrompt.prompt()

        this.deferredPrompt.userChoice.then(res => {
          if (res.outcome === 'accepted') {
            console.log('installed!')
          } else {
            console.log('dismissed')
          }
        })

        this.deferredPrompt = null
      }
    }
  }
</script>

<style lang="sass">
.v-toolbar__items
  .v-btn
    padding-top: 5px !important

.v-btn__content
  padding-top: 4px

.v-btn__content .v-icon--left
  margin-left: 0
  margin-top: -4px

.v-list-item__action:first-child
  margin-right: 8px

.v-list-item .v-list-item__content
  padding: 14px 0 10px

.v-list--dense .v-list-item .v-list-item__content
  padding: 10px 0 6px

.v-content
  a
    color: var(--v-primary-darken3)
</style>
