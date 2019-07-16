<template>
  <v-btn
    color="secondary"
    @click="openPicker()"
  >
    <v-icon left style="fill: white;">
      {{ icons.drive }}
    </v-icon>
    {{ $t('dialogs.google-drive.button') }}
  </v-btn>
</template>

<script>
  /* global gapi google */
  import { mdiGoogleDrive } from '@mdi/js'
  import { setTimeout } from 'timers'
  export default {
    name: 'GoogleDriveFilePickerDialog',
    data: () => ({
      builder: null,
      icons: {
        drive: mdiGoogleDrive
      },
      picker: null,
      token: null
    }),
    async mounted () {
      // load the Google APIs
      await this.$loadScript('https://apis.google.com/js/api.js')
      // initialize code dependent on the Google API
      gapi.load('client', function () {
        gapi.client.init({
          apiKey: process.env.VUE_APP_GOOGLE_API_KEY,
          clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          scope: 'https://www.googleapis.com/auth/drive'
        })
      })
      gapi.load('picker', function () {
        this.builder = new google.picker.PickerBuilder()
      }.bind(this))
    },
    methods: {
      handlePickerActions (result) {
        console.log(result)
        // there are a number of possible actions, e.g. 'loaded', 'canceled', etc.
        if (result.action === 'picked') {
          // result.docs contains an array of selected files
          this.$emit('google-file-picked', result.docs[0].embedUrl)
          // check to make sure artifact files are publicly accessible
          gapi.client.drive.permissions.list({
            fileId: result.docs[0].id,
            oauth_token: this.token
          }).then(
            response => {
              // look for permissions with type === anyone
              const publicPerms = response.result.permissions.filter(perm => perm.type === 'anyone')
              if (publicPerms.length === 0) {
                // uh-oh! the artifact is NOT publicly available
                this.$emit('google-file-accessible', false)
              } else {
                // ok! the artifact is publicly available
                this.$emit('google-file-accessible', true)
              }
            }
          )
        }
      },
      async openPicker () {
        // make sure we have a valid Google API access_token
        this.token = await this.$store.dispatch('auth/getGoogleToken')
        // then finish building the picker and open it
        const picker = this.builder
          .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
          // .addView(new google.picker.DocsView(google.picker.ViewId.RECENTLY_PICKED))
          .addView(new google.picker.DocsView().setIncludeFolders(true).setOwnedByMe(true))
          .addView(new google.picker.DocsView().setOwnedByMe(false))
          .setOAuthToken(this.token)
          .setCallback(this.handlePickerActions)
          .setOrigin(process.env.VUE_APP_AUTH0_LOGOUT_URI)
          .build()

        await setTimeout(() => {}, 500)
        picker.setVisible(true)
      }
    }
  }
</script>
