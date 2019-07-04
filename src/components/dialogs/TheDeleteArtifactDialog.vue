<template>
  <v-dialog
    v-model="showDialog"
    max-width="600"
    @keydown.enter="!unconfirmed && deleteArtifact()"
  >
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
            {{ theArtifact.name }}
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
      artifactId: {
        type: String,
        default: ''
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      confirmation: '',
      icons: {
        alert: mdiAlert,
        close: mdiClose,
        trashCan: mdiTrashCan
      },
      showDialog: false,
      theArtifact: {
        name: null
      }
    }),
    computed: {
      unconfirmed () {
        return this.confirmation !== this.theArtifact.name
      }
    },
    watch: {
      show (open) {
        this.showDialog = open
        if (open) {
          this.theArtifact = this.$store.getters['artifacts/artifact'](this.artifactId)
          this.title = this.theArtifact.name
        }
      }
    },
    methods: {
      async deleteArtifact () {
        this.$emit('remove', this.theArtifact)
        this.showDialog = false
      }
    }
  }
</script>
