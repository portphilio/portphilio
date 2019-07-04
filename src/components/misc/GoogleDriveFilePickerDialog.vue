<template>
  <v-btn
    color="secondary"
    @click="openPicker()"
  >
    <v-icon left>
      {{ icons.drive }}
    </v-icon>
    {{ $t('dialogs.google-drive.button') }}
  </v-btn>
</template>

<script>
  /* global gapi google */
  import { mdiGoogleDrive } from '@mdi/js'
  import { google as googleApis } from 'googleapis'
  import { setTimeout } from 'timers'
  export default {
    name: 'GoogleDriveFilePickerDialog',
    data: () => ({
      builder: null,
      drive: googleApis.drive('v3'),
      icons: {
        drive: mdiGoogleDrive
      },
      picker: null,
      token: null
    }),
    async mounted () {
      // load the Google APIs
      await this.$loadScript('https://apis.google.com/js/api.js')
      // then load the picker builder API
      const loaded = await new Promise((resolve, reject) => {
        gapi.load('picker', {
          callback: () => { resolve(true) },
          onerror: () => { reject(new Error('picker failed to load')) }
        })
      })
      // if it loaded successfully
      if (loaded === true) {
        this.builder = new google.picker.PickerBuilder()
      }
    },
    methods: {
      handlePickerActions (result) {
        console.log(result)
        // there are a number of possible actions, e.g. 'loaded', 'canceled', etc.
        if (result.action === 'picked') {
          // result.docs contains an array of selected files
          this.$emit('google-file-picked', result.docs[0].embedUrl)
          // check to make sure artifact files are publicly accessible
          this.drive.permissions.list({
            fileId: result.docs[0].id,
            oauth_token: this.token
          }).then(
            res => {
              // look for permissions with type === anyone
              const publicPerms = res.data.permissions.filter(perm => perm.type === 'anyone')
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
        await this.$store.dispatch('auth/getGoogleToken')
        // then finish building the picker and open it
        const picker = this.builder
          .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
          // .addView(new google.picker.DocsView(google.picker.ViewId.RECENTLY_PICKED))
          .addView(new google.picker.DocsView().setIncludeFolders(true).setOwnedByMe(true))
          .addView(new google.picker.DocsView().setOwnedByMe(false))
          .setOAuthToken(this.$store.state.auth.googleToken)
          .setCallback(this.handlePickerActions)
          .setOrigin('https://portphilio.test:8080')
          .build()

        await setTimeout(() => {}, 500)
        picker.setVisible(true)
      }
    }
  }
</script>
