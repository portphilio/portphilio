<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h2 class="display-2">
          {{ $t('pages.new-artifact.title') }}
        </h2>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header class="title">
              {{ $t('pages.new-artifact.instructions') }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              {{ $t('pages.new-artifact.instructions-text') }}
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="title">
              {{ $t('pages.new-artifact.guidance') }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              Here is some content
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <!-- <v-form v-model="valid"> -->
        <v-card>
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
                  v-model="theArtifact.name"
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
          <v-card-actions>
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
          </v-card-actions>
        </v-card>
        <!-- </v-form> -->
        <v-snackbar
          v-model="snackbar.visible"
          :color="snackbar.color"
          top
          vertical
        >
          {{ snackbar.text }}
          <v-btn
            dark
            icon
            @click="snackbar.visible = false"
          >
            <v-icon>
              {{ icons.close }}
            </v-icon>
          </v-btn>
        </v-snackbar>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mdiCloseCircle, mdiContentSave } from '@mdi/js'
  import GoogleDriveFilePickerDialog from '@/components/misc/GoogleDriveFilePickerDialog'
  import ToDoList from '@/components/misc/ToDoList'
  export default {
    name: 'TheNewArtifactPage',
    components: {
      'google-drive': GoogleDriveFilePickerDialog,
      ToDoList
    },
    data: () => ({
      icons: {
        close: mdiCloseCircle,
        save: mdiContentSave
      },
      isPublic: null,
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
        userId: null,
        name: '',
        uri: '',
        narrative: '',
        status: 'draft',
        tags: [],
        notes: []
      },
      valid: true
    }),
    mounted () {
      // set the userId for the artifact
      this.theArtifact.userId = this.$store.state.auth.apiUserId
      // listen for events
    },
    methods: {
      /**
       * Creates or updates the artifact. Consider figuring out how
       * to save multiple versions, so there is a revision history
       * for each artifact in the database.
       */
      save () {
        const method = this.theArtifact._id ? 'update' : 'create'
        const params = this.theArtifact._id ? { id: this.theArtifact._id } : {}
        params.data = this.theArtifact
        console.log(params)
        this.$store.dispatch('api/call', {
          method,
          service: 'artifacts',
          params
        }).then(
          function (artifact) {
            console.log(artifact)
            this.theArtifact._id = artifact._id
            this.snackbar.color = 'success'
            this.snackbar.text = this.$t('pages.new-artifact.save-success')
            this.snackbar.visible = true
          }.bind(this)
        ).catch(
          function (err) {
            console.log(err)
            this.snackbar.color = 'error'
            this.snackbar.text = this.$t('pages.new-artifact.save-failure') + err.message
            this.snackbar.visible = true
          }.bind(this)
        )
      },
      updateNotes (notes) {
        this.theArtifact.notes = notes
      }
    }
  }
</script>
