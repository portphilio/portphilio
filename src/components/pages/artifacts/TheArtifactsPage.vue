<template>
  <v-container>
    <v-layout text-xs-center>
      <v-flex xs12>
        <h2 class="display-2 text-xs-left">
          {{ $t('pages.artifacts.title') }}
        </h2>
        <v-card>
          <v-card-title>
            <v-btn
              color="primary pink--text text--darken-4"
              class="ml-3"
              to="/artifacts/new"
            >
              <v-icon left>
                {{ icons.newArtifact }}
              </v-icon>
              {{ $t('pages.artifacts.add-new') }}
            </v-btn>
            <v-spacer />
            <v-text-field
              v-model="search"
              :append-icon="icons.searchArtifacts"
              class="pt-0 mt-0"
              clearable
              hide-details
              :label="$t('pages.artifacts.search')"
              hint="yo"
              single-line
              @input="debounceSearch"
            />
          </v-card-title>
          <v-data-table
            v-model="selected"
            :footer-props="footerProps"
            :headers="headers"
            :items="artifacts.data"
            item-key="_id"
            :loading="loading"
            multi-sort
            :no-data-text="$t('pages.artifacts.no-data-text')"
            :no-results-text="$t('pages.artifacts.no-results-text')"
            :options.sync="options"
            :server-items-length="artifacts.total"
            show-select
            :value="selected"
          >
            <template v-slot:item.name="{ item }">
              <router-link
                :to="`/artifacts/${item._id}`"
                class="td-content"
              >
                {{ item.name }}
              </router-link>
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
                <the-delete-artifact-dialog
                  :artifact="item"
                  @remove="handleDeletion($event)"
                />
              </span>
            </template>
            <template v-slot:top>
              <v-container py-0 px-3>
                <v-layout>
                  <v-flex
                    xs12
                    sm6
                    offset-sm6
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
                      @change="getArtifacts()"
                    />
                  </v-flex>
                </v-layout>
              </v-container>
            </template>
          </v-data-table>
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
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { debounce } from 'debounce'
  import { format } from 'date-fns'
  import { mdiClose } from '@mdi/js'
  import TheDeleteArtifactDialog from '@/components/dialogs/TheDeleteArtifactDialog'
  export default {
    name: 'TheArtifactsPage',
    components: {
      TheDeleteArtifactDialog
    },
    data () {
      return {
        artifacts: {
          total: 0,
          limit: 10,
          skip: 0,
          data: []
        },
        icons: {
          close: mdiClose,
          newArtifact: 'M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,17V15H7V17H12M17,11H7V13H14.69C13.07,14.07 12,15.91 12,18C12,19.09 12.29,20.12 12.8,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V12.8C20.12,12.29 19.09,12 18,12L17,12.08V11M17,9V7H7V9H17Z',
          searchArtifacts: 'M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M7,15V17H9C9.14,18.55 9.8,19.94 10.81,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V13.03C19.85,11.21 17.82,10 15.5,10C14.23,10 13.04,10.37 12.04,11H7V13H10C9.64,13.6 9.34,14.28 9.17,15H7M17,9V7H7V9H17Z'
        },
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
        loading: true,
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: ['updatedAt'],
          sortDesc: [true]
        },
        search: '',
        searchTerms: null,
        selected: [],
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
    watch: {
      options: function () {
        this.getArtifacts()
      }
    },
    mounted () {
      this.getArtifacts()
    },
    methods: {
      debounceSearch: debounce(function (terms) {
        // split the search terms up into an array
        // and submit it to the API
        this.searchTerms = terms ? { $search: terms.split(' ') } : null
        this.getArtifacts()
      }, 500),
      async getArtifacts (search) {
        // activate the progress bar on the table header
        this.loading = true
        // extract the necessary query parameters from the table options
        const { sortBy, sortDesc, page, itemsPerPage } = this.options
        // combine sortBy and sortDesc into a $sort object
        const $sort = sortBy.reduce((a, s, i) => {
          a[s] = sortDesc[i] ? -1 : 1
          return a
        }, {})
        // create the base query
        const query = {
          $limit: itemsPerPage,
          $skip: (page - 1) * itemsPerPage,
          $sort,
          userId: this.$store.state.auth.apiUserId
        }
        // filter by status, if necessary
        if (this.statusFilter.length > 0) {
          query['status'] = { $in: this.statusFilter }
        }
        // add the search terms, if necessary
        // it only searches on the artifact name
        if (this.searchTerms !== null) {
          query['name'] = this.searchTerms
        }
        try {
          // submit the query to the API, and wait for the results
          this.artifacts = await this.$store.dispatch('api/call', {
            method: 'find',
            service: 'artifacts',
            params: { params: { query } }
          })
        } catch (err) {
          // handle any API request errors
        }
        // de-activate the progress bar
        this.loading = false
      },
      handleDeletion (artifact) {
        if (artifact instanceof Error) {
          this.snackbar.color = 'error'
          this.snackbar.text = artifact.message
          this.snackbar.visible = true
        } else {
          this.snackbar.color = 'success'
          this.snackbar.text = this.$t('pages.artifacts.artifact-removed', { name: artifact.name })
          this.snackbar.visible = true
          this.getArtifacts()
        }
      }
    }
  }
</script>

<style lang="sass">
  .td-content
    vertical-align: -2px
  .v-data-table__checkbox.v-simple-checkbox
    padding-top: 2px
  th.sortable
    svg
      width: 16px
      height: 16px
      opacity: 0
      transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)

    &:hover, &:focus
      svg
        opacity: 0.6

  th.active
    svg
      opacity: 1

  th.active.desc
    svg
      transform: rotate(-180deg)
</style>
