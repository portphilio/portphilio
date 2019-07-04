<template>
  <v-dialog
    v-model="showDialog"
    persistent
  >
    <v-card>
      <v-card-title class="primary primary--text text--darken-3">
        {{ title }}
        <v-spacer />
        <v-btn
          color="primary--darken-2"
          icon
          large
          @click="close"
        >
          <v-icon class="mb-2">
            {{ icons.exit }}
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout
            row
            wrap
          >
            <v-flex
              xs12
              md8
            >
              <v-text-field
                v-if="showDialog"
                v-model="theArtifact.name"
                autofocus
                :hint="$t('pages.new-artifact.name-hint')"
                :label="$t('pages.new-artifact.name')"
                required
              />
            </v-flex>
            <v-flex
              xs12
              md4
            >
              <v-select
                v-model="theArtifact.status"
                :hint="$t('pages.new-artifact.status-hint')"
                :items="statuses"
                :label="$t('pages.new-artifact.status')"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="theArtifact.uri"
                :hint="$t('pages.new-artifact.link-hint')"
                :label="$t('pages.new-artifact.link')"
              />
              <google-drive
                @google-file-picked="theArtifact.uri = $event"
              />
            </v-flex>
            <v-flex xs12>
              <v-textarea
                v-model="theArtifact.narrative"
                :hint="$t('pages.new-artifact.narrative-hint')"
                :label="$t('pages.new-artifact.narrative')"
              />
            </v-flex>
            <v-flex xs12>
              <v-combobox
                v-model="theArtifact.tags"
                chips
                :hint="$t('pages.new-artifact.tags-hint')"
                :label="$t('pages.new-artifact.tags')"
                multiple
              />
            </v-flex>
            <v-flex xs12>
              <span class="grey--text text--darken-1">Notes/ToDo Items</span>
              <to-do-list
                :items="theArtifact.notes"
                @changed="updateNotes"
              />
            </v-flex>
          </v-layout>
        </v-container>
        <v-divider />
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          @click="close"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="save()"
        >
          <v-icon left>
            {{ icons.save }}
          </v-icon>
          {{ $t('pages.new-artifact.save') }}
        </v-btn>
        <v-btn
          color="secondary"
          @click="saveAndClose()"
        >
          <v-icon left>
            {{ icons.save }}
          </v-icon>
          {{ $t('pages.new-artifact.save-and-close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import uuid from 'uuid/v5'
  import { mdiClose, mdiCloseCircle, mdiContentSave } from '@mdi/js'
  import GoogleDriveFilePickerDialog from '@/components/misc/GoogleDriveFilePickerDialog'
  import ToDoList from '@/components/misc/ToDoList'
  export default {
    name: 'TheEditArtifactDialog',
    components: {
      'google-drive': GoogleDriveFilePickerDialog,
      ToDoList
    },
    props: {
      artifactId: {
        type: String,
        default: 'new'
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        icons: {
          close: mdiCloseCircle,
          exit: mdiClose,
          newArtifact: 'M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,17V15H7V17H12M17,11H7V13H14.69C13.07,14.07 12,15.91 12,18C12,19.09 12.29,20.12 12.8,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V12.8C20.12,12.29 19.09,12 18,12L17,12.08V11M17,9V7H7V9H17Z',
          save: mdiContentSave
        },
        isPublic: null,
        loading: false,
        showDialog: this.show,
        snackbar: {
          visible: false,
          color: '',
          text: ''
        },
        statuses: [
          { value: 'idea', text: 'Idea' },
          { value: 'draft', text: 'Draft' },
          { value: 'work-in-progress', text: 'Work-in-Progress' },
          { value: 'complete', text: 'Complete' },
          { value: 'will-not-complete', text: 'Will-Not-Complete' }
        ],
        theArtifact: {
          _id: null,
          createdAt: null,
          name: '',
          notes: [],
          narrative: '',
          status: 'draft',
          tags: [],
          updatedAt: null,
          uri: '',
          userId: null,
          uuid: null
        },
        title: '',
        valid: true
      }
    },
    watch: {
      show (open) {
        this.showDialog = open
        if (open) {
          if (this.artifactId === 'new') {
            this.theArtifact = {
              userId: this.$store.state.auth.apiId,
              uuid: uuid(process.env.VUE_APP_AUTH0_NAMESPACE, uuid.URL)
            }
            this.title = this.$t('pages.new-artifact.title')
          } else {
            this.theArtifact = this.$store.getters['artifacts/artifact'](this.artifactId)
            this.title = this.theArtifact.name
          }
        }
      }
    },
    methods: {
      close () {
        this.$emit('close')
      },
      /**
       * Creates or updates the artifact. Consider figuring out how
       * to save multiple versions, so there is a revision history
       * for each artifact in the database.
       */
      save () {
        // get the current timestamp and set the updatedAt time
        const now = (new Date()).toISOString()
        this.theArtifact.updatedAt = now
        // clean the _id field for any new notes
        this.theArtifact.notes = this.theArtifact.notes.map(n => {
          if (Number.isInteger(+n._id)) delete n._id
          return n
        })
        // if this is a new artifact
        if (this.artifactId === 'new') {
          // set the createdAt timestamp
          this.theArtifact.createdAt = now
          // save the artifact to the store
          this.$store.dispatch('artifacts/save', this.theArtifact)
        }
      },
      saveAndClose () {
        this.save()
        this.close()
      },
      updateNotes (notes) {
        this.theArtifact.notes = notes
      }
    }
  }
</script>
