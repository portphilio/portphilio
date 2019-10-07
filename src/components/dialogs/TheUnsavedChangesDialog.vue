<template>
  <v-dialog
    v-model="showDialog"
    persistent
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
        {{ $t('dialogs.unsaved-changes.title') }}
        <div class="flex-grow-1" />
        <v-btn
          color="warning"
          icon
          large
          @click="close"
        >
          <v-icon class="mb-2">
            {{ icons.close }}
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <p v-html="$t('dialogs.unsaved-changes.text')" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row
          align="center"
          class="fill-height"
          justify="space-around"
        >
          <v-btn
            color="warning"
            @click.stop="close('discard')"
          >
            <v-icon left>
              {{ icons.trashCan }}
            </v-icon>
            {{ $t('dialogs.unsaved-changes.discard') }}
          </v-btn>
          <v-btn
            color="secondary"
            @click.stop="close('close')"
          >
            <v-icon left>
              {{ icons.edit }}
            </v-icon>
            {{ $t('dialogs.unsaved-changes.continue-editing') }}
          </v-btn>
          <v-btn
            color="primary"
            @click.stop="close('save')"
          >
            <v-icon left>
              {{ icons.save }}
            </v-icon>
            {{ $t('dialogs.unsaved-changes.save') }}
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mdiAlert, mdiClose, mdiContentSave, mdiPencil, mdiTrashCan } from '@mdi/js'
  export default {
    name: 'TheUnsavedChangesDialog',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        confirmation: '',
        icons: {
          alert: mdiAlert,
          close: mdiClose,
          edit: mdiPencil,
          save: mdiContentSave,
          trashCan: mdiTrashCan
        }
      }
    },
    computed: {
      showDialog () {
        return this.show
      }
    },
    methods: {
      close (type) {
        console.log('clicked: ', type)
        this.$emit('close', type)
      }
    }
  }
</script>
