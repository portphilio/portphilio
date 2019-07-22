<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h2 class="display-2 text-left">
          {{ $t('pages.artifacts.title') }}
        </h2>
        <v-card>
          <v-card-title>
            <v-btn
              color="primary pink--text text--darken-4"
              class="ml-3"
              @click.stop="openEditArtifactDialog()"
            >
              <v-icon left>
                {{ icons.newArtifact }}
              </v-icon>
              {{ $t('pages.artifacts.add-new') }}
            </v-btn>
            <div class="flex-grow-1" />
            <v-text-field
              v-model="search"
              :append-icon="icons.searchArtifacts"
              class="pt-0 pl-9 mt-0"
              clearable
              hide-details
              :label="$t('pages.artifacts.search')"
              hint="yo"
              single-line
              @input="debounceSearch"
            />
          </v-card-title>
          <feathers-vuex-find
            :fetch-query="{ userId: $store.state.auth.user._id, $limit: -1 }"
            :query="query"
            service="artifacts"
          >
            <v-data-table
              v-model="selected"
              slot-scope="{ items: artifacts, isFindPending: loading }"
              :footer-props="footerProps"
              :headers="headers"
              :items="artifacts"
              item-key="_id"
              :loading="loading"
              multi-sort
              :no-data-text="$t('pages.artifacts.no-data-text')"
              :no-results-text="$t('pages.artifacts.no-results-text')"
              :options.sync="options"
              show-select
              :value="selected"
              @item-selected="logItem($event)"
            >
              <template v-slot:item.name="{ item }">
                <span class="td-content">
                  <a @click.stop="openEditArtifactDialog(item)">
                    {{ item.name }}
                  </a>
                </span>
              </template>
              <template v-slot:item.status="{ item }">
                <span class="text-capitalize td-content">{{ item.status }}</span>
              </template>
              <template v-slot:item.createdAt="{ item }">
                <span class="td-content">
                  {{ format(new Date(item.createdAt), 'YYYY-MM-DD h:mm a') }}
                </span>
              </template>
              <template v-slot:item.updatedAt="{ item }">
                <span class="td-content">
                  {{ format(new Date(item.updatedAt), 'YYYY-MM-DD h:mm a') }}
                </span>
              </template>
              <template v-slot:item.actions="{ item }">
                <span class="td-content">
                  <v-btn
                    color="primary darken-2"
                    icon
                    :title="$t('dialogs.delete-artifact.button')"
                    @click.stop="openDeleteArtifactDialog(item)"
                  >
                    <v-icon>
                      {{ icons.trashCan }}
                    </v-icon>
                  </v-btn>
                </span>
              </template>
              <template v-slot:top>
                <v-container class="py-0 px-3">
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      offset-sm="6"
                    >
                      <v-select
                        v-model="statusFilter"
                        class="pa-0 ma-0"
                        clearable
                        deletable-chips
                        dense
                        :placeholder="$t('pages.artifacts.statuses.hint')"
                        hide-details
                        :items="statuses"
                        multiple
                        single-line
                        small-chips
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </template>
            </v-data-table>
          </feathers-vuex-find>
        </v-card>
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
        <the-edit-artifact-dialog
          :artifact="artifactToEdit"
          :show="showDialog"
          @close="closeEditArtifactDialog"
        />
        <the-delete-artifact-dialog
          :artifact="artifactToDelete"
          :show="showDeleteDialog"
          @close="closeDeleteArtifactDialog"
          @remove="handleDeletion($event)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { debounce } from 'debounce'
  import { format } from 'date-fns'
  import { mdiClose, mdiTrashCan } from '@mdi/js'
  import TheDeleteArtifactDialog from '@/components/dialogs/TheDeleteArtifactDialog'
  import TheEditArtifactDialog from '@/components/dialogs/TheEditArtifactDialog'
  export default {
    name: 'TheArtifactsPage',
    components: {
      TheDeleteArtifactDialog,
      TheEditArtifactDialog
    },
    data () {
      return {
        artifactToDelete: {},
        artifactToEdit: {},
        footerProps: {
          itemsPerPageOptions: [10, 25, 50, -1],
          itemsPerPageText: this.$t('pages.artifacts.items-per-page-text'),
          itemsPerPageAllText: this.$t('pages.artifacts.items-per-page-all-text'),
          showFirstLastPage: true,
          showCurrentPage: true
        },
        format,
        headers: [
          {
            text: this.$t('pages.artifacts.column-labels.name'),
            value: 'name'
          },
          {
            text: this.$t('pages.artifacts.column-labels.status'),
            value: 'status',
            align: 'center'
          },
          {
            text: this.$t('pages.artifacts.column-labels.createdAt'),
            value: 'createdAt',
            align: 'center'
          },
          {
            text: this.$t('pages.artifacts.column-labels.updatedAt'),
            value: 'updatedAt',
            align: 'center'
          },
          {
            text: this.$t('pages.artifacts.column-labels.actions'),
            align: 'center',
            sortable: false,
            value: 'actions'
          }
        ],
        icons: {
          close: mdiClose,
          newArtifact: 'M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,17V15H7V17H12M17,11H7V13H14.69C13.07,14.07 12,15.91 12,18C12,19.09 12.29,20.12 12.8,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V12.8C20.12,12.29 19.09,12 18,12L17,12.08V11M17,9V7H7V9H17Z',
          searchArtifacts: 'M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M7,15V17H9C9.14,18.55 9.8,19.94 10.81,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V13.03C19.85,11.21 17.82,10 15.5,10C14.23,10 13.04,10.37 12.04,11H7V13H10C9.64,13.6 9.34,14.28 9.17,15H7M17,9V7H7V9H17Z',
          trashCan: mdiTrashCan
        },
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: ['updatedAt'],
          sortDesc: [true]
        },
        search: '',
        searchTerms: '',
        selected: [],
        showDeleteDialog: false,
        showDialog: false,
        snackbar: {
          color: 'success',
          text: '',
          visible: false
        },
        statusFilter: [],
        statuses: [
          { value: 'idea', text: this.$t('pages.artifacts.statuses.idea') },
          { value: 'draft', text: this.$t('pages.artifacts.statuses.draft') },
          { value: 'work-in-progress', text: this.$t('pages.artifacts.statuses.work-in-progress') },
          { value: 'complete', text: this.$t('pages.artifacts.statuses.complete') },
          { value: 'will-not-complete', text: this.$t('pages.artifacts.statuses.will-not-complete') }
        ]
      }
    },
    computed: {
      query () {
        // create an empty query
        let q = {}
        // add status filter, if necessary
        if (this.statusFilter.length > 0) {
          q.status = { $in: this.statusFilter }
        }
        // add search terms, if necessary
        if (this.searchTerms !== '') {
          // convert searchTerms into a $regex
          const $regex = new RegExp(this.searchTerms.replace(',', ' ').replace(/\s+/g, '|'), 'gi')
          q.$or = [
            { name: { $regex } },
            { uri: { $regex } },
            { narrative: { $regex } },
            { tags: { $regex } },
            { 'notes.note': { $regex } }
          ]
        }
        // update the query
        return q
      }
    },
    methods: {
      closeDeleteArtifactDialog () {
        this.showDeleteDialog = false
      },
      closeEditArtifactDialog () {
        this.showDialog = false
      },
      /**
       * Dispatches the setSearchTerms() action after half a second
       * when people stop typing in the search box.
       */
      debounceSearch: debounce(function () {
        this.searchTerms = this.search
      }, 500),
      handleDeletion (artifact) {
        // tell the store to remove the artifact
        artifact.remove()

        // notify the user that it was done
        this.snackbar.color = 'success'
        this.snackbar.text = this.$t('pages.artifacts.artifact-removed', { name: artifact.name })
        this.snackbar.visible = true
      },
      openDeleteArtifactDialog (artifact) {
        this.artifactToDelete = artifact
        this.showDeleteDialog = true
      },
      openEditArtifactDialog (artifact) {
        this.artifactToEdit = artifact || new this.$FeathersVuex.api.Artifact({ userId: this.$store.state.auth.user._id })
        this.showDialog = true
      }
    }
  }
</script>

<style lang="sass">
  .td-content
    vertical-align: -6px
  .v-data-table__checkbox.v-simple-checkbox
    padding-top: 2px
</style>
