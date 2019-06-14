<template>
  <v-dialog
    v-model="showDialog"
    max-width="600"
    @keydown.enter="!unconfirmed && deleteArtifact()"
  >
    <template v-slot:activator="{ on }">
      <!-- <v-tooltip
        v-if="item.email_verified"
        color="warning black--text"
        top
      >
        <template v-slot:activator="{ on }">
          <v-icon
            v-if="!item.email_verified"
            color="warning"
            small
            v-on="on"
          >
            {{ icons.alert }}
          </v-icon>
        </template>
        <span>{{ $t('pages.admin.users.email-not-verified') }}</span>
      </v-tooltip> -->
      <v-btn
        color="primary darken-2"
        icon
        :title="$t('dialogs.delete-artifact.button')"
        v-on="on"
      >
        <v-icon>
          {{ icons.trashCan }}
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title
        class="warning lighten-3 warning--text text--darken-4"
        primary-title
      >
        <v-icon
          class="mb-2"
          color="warning"
          large
        >
          {{ icons.alert }}
        </v-icon>
        {{ $t('dialogs.delete-artifact.title') }}
        <v-spacer />
        <v-btn
          color="warning"
          icon
          large
          @click="showDialog = false"
        >
          <v-icon class="mb-2">
            {{ icons.close }}
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <p v-html="$t('dialogs.delete-artifact.instructions')" />
        <ul>
          <li class="body-2 pink--text text--darken-4">
            {{ artifact.name }}
          </li>
        </ul>
        <v-text-field
          ref="confirm"
          v-model="confirmation"
          autofocus
          class="pt-3"
          :hint="$t('dialogs.delete-artifact.hint')"
          :label="$t('dialogs.delete-artifact.name')"
          solo
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-layout
          align-center
          fill-height
          justify-space-around
          row
        >
          <v-btn
            color="accent"
            text
            @click="showDialog = false"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="warning"
            :disabled="unconfirmed"
            @click="deleteArtifact()"
          >
            <v-icon left>
              {{ icons.trashCan }}
            </v-icon>
            {{ $t('dialogs.delete-artifact.button') }}
          </v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mdiTrashCan, mdiAlert, mdiClose } from '@mdi/js'
  export default {
    name: 'TheDeleteArtifactDialog',
    props: {
      artifact: {
        type: Object,
        default: () => ({})
      }
    },
    data: () => ({
      confirmation: '',
      icons: {
        alert: mdiAlert,
        close: mdiClose,
        trashCan: mdiTrashCan
      },
      showDialog: false
    }),
    computed: {
      unconfirmed () {
        return this.confirmation !== this.artifact.name
      }
    },
    // watch: {
    //   showDialog (showing) {
    //     console.log(this.$nextTick(function () { return this.$refs.confirm }.bind(this)))
    //     if (showing) this.$nextTick(this.$refs.confirm.focus)
    //   }
    // },
    methods: {
      async deleteArtifact () {
        try {
          const removed = await this.$store.dispatch('api/call', {
            method: 'remove',
            service: 'artifacts',
            params: { id: this.artifact._id }
          })
          this.$emit('remove', removed)
        } catch (err) {
          this.$emit('remove', err)
        }
        this.showDialog = false
      }
    }
  }
</script>
