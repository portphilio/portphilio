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
  export default {
    name: 'GoogleDriveFilePickerDialog',
    data: () => ({
      drive: googleApis.drive('v3'),
      icons: {
        drive: mdiGoogleDrive
      },
      picker: null,
      token: null
    }),
    async mounted () {
      [this.picker, this.token] = await Promise.all([
        // load the Google APIs and get the user's profile from Auth0
        this.$loadScript('https://apis.google.com/js/api.js'),
        this.$store.dispatch('api/call', {
          method: 'get',
          service: 'auth0/users',
          params: {
            id: this.$store.state.auth.user.email
          }
        })
      ]).then(
        // load the picker API and extract the access_token
        ([evt, user]) => Promise.all([
          new Promise((resolve, reject) => {
            gapi.load('picker', {
              callback: () => { resolve(true) },
              onerror: () => { reject(new Error('picker failed to load')) }
            })
          }),
          user.identities.filter(id => id.provider === 'google-oauth2')[0].access_token
        ])
      ).then(
        // build and return the actual picker
        ([pickerResult, token]) => {
          if (pickerResult === true) {
            const picker = new google.picker.PickerBuilder()
              .addView(google.picker.ViewId.DOCS)
              .setOAuthToken(token)
              .build()
            return [picker, token]
          }
        }
      ).catch(
        err => {
          console.log(err)
        }
      )
    },
    methods: {
      handlePickerActions (result) {
        // there are a number of possible actions, e.g. 'loaded', 'canceled', etc.
        if (result.action === 'picked') {
          // result.docs contains an array of selected files
          // check to make sure artifact files are publicly accessible
          this.drive.permissions.list({
            fileId: result.docs[0].id,
            oauth_token: this.token
          }).then(
            res => {
              // look for permissions with type === anyone
              const publicPerms = res.data.permissions.filter(perm => perm.type === 'anyone')
              if (publicPerms.length === 0) {
                // the artifact is NOT publicly available
              }
            }
          )
        }
      },
      openPicker () {
        if (this.picker && typeof this.picker.setVisible === 'function') {
          this.picker.setCallback(this.handlePickerActions)
          this.picker.setVisible(true)
        }
      }
    }
  }
</script>
