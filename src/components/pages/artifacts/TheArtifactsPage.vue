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
              :label="$t('pages.artifacts.search')"
              single-line
              hide-details
            />
          </v-card-title>
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="artifacts.data"
            item-key="_id"
            :loading="loading"
            :options="pagination"
            :footer-props="footerProps"
            show-select
            :server-items-length="artifacts.total"
            sort-by="updated_at"
          >
            <template v-slot:items="{ selected, item }">
              <tr
                :active="selected"
                @click="selected = !selected"
              >
                <th>
                  <v-checkbox
                    :input-value="selected"
                    hide-details
                  />
                </th>
                <td>
                  <a :href="`/artifacts/${item._id}`">
                    {{ item.name }}
                  </a>
                </td>
                <td>
                  <span class="text-capitalize">{{ item.status }}</span>
                </td>
                <td>
                  {{ format(new Date(item.updated_at), 'YYYY-MM-DD h:mm a') }}
                </td>
                <td>
                  {{ item.updated_at ? format(new Date(item.updated_at), 'YYYY-MM-DD h:mm a') : 'never' }}
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  // import { mdiFileDocumentBox } from '@mdi/js'
  import { debounce } from 'debounce'
  import { format } from 'date-fns'
  export default {
    name: 'TheArtifactsPage',
    data () {
      return {
        icons: {
          newArtifact: 'M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,17V15H7V17H12M17,11H7V13H14.69C13.07,14.07 12,15.91 12,18C12,19.09 12.29,20.12 12.8,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V12.8C20.12,12.29 19.09,12 18,12L17,12.08V11M17,9V7H7V9H17Z',
          searchArtifacts: 'M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M7,15V17H9C9.14,18.55 9.8,19.94 10.81,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V13.03C19.85,11.21 17.82,10 15.5,10C14.23,10 13.04,10.37 12.04,11H7V13H10C9.64,13.6 9.34,14.28 9.17,15H7M17,9V7H7V9H17Z'
        },
        footerProps: {
          itemsPerPageOptions: [10, 25, 50]
        },
        headers: [
          {
            text: this.$t('pages.artifacts.column-labels.name'),
            value: 'name'
          },
          {
            text: this.$t('pages.artifacts.column-labels.status'),
            value: 'status'
          },
          {
            text: this.$t('pages.artifacts.column-labels.created_at'),
            value: 'created_at'
          },
          {
            text: this.$t('pages.artifacts.column-labels.updated_at'),
            value: 'updated_at'
          }
        ],
        loading: true,
        pagination: {
          descending: true,
          page: 1,
          itemsPerPage: 10,
          // sortBy: 'updated_at',
          totalItems: 0
        },
        search: '',
        selected: [],
        artifacts: {
          total: 0,
          limit: 10,
          skip: 0,
          data: []
        }
      }
    },
    async mounted () {
      this.getArtifacts()
    },
    methods: {
      debounceSearch: debounce(function (searchTerms) {
        this.api.searchArtifacts(searchTerms)
      }, 500),
      format,
      async getArtifacts () {
        this.loading = true
        const { sortBy, descending, page, itemsPerPage } = this.pagination
        const query = {
          $limit: itemsPerPage,
          $skip: (page - 1) * itemsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          userId: this.$store.state.auth.user_id
        }
        this.artifacts = await this.$store.dispatch('api/call', {
          method: 'find',
          service: 'artifacts',
          params: { params: { query } }
        })
        this.loading = false
      }
    }
  }
</script>

<style lang="sass">
.v-data-table-header
  .v-icon--svg
    height: 16px
    width: 16px
</style>
