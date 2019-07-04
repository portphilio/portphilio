<template>
  <v-dialog
    v-model="deferredPrompt"
  >
    hi
  </v-dialog>
</template>

<script>
  export default {
    name: 'TheInstallToDesktopDialog',
    data: () => ({
      deferredPrompt: null
    }),
    created () {
      // THIS PROBABLY DOESN'T WORK!!!
      this.$on('canInstall', evt => {
        // prevent Chrome >=67 from automatically displaying the "install to home screen" prompt
        evt.preventDefault()
        // stash the event so it can be triggered later
        this.deferredPrompt = evt
      })
    }
  }
</script>
