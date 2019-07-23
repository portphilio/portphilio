<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="display-2">
          {{ $t('pages.profile.title') }}
        </h2>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-row class="px-4">
            <v-col
              cols="12"
              sm="7"
            >
              <v-row>
                <v-col
                  cols="12"
                  md="2"
                >
                  <v-select
                    v-model="profile.user_metadata.title"
                    :items="titles"
                    :label="$t('pages.profile.honorific')"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="profile.given_name"
                    :label="$t('pages.profile.first-name')"
                    :hint="$t('pages.profile.first-name-hint')"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="profile.nickname"
                    :label="$t('pages.profile.nickname')"
                    :hint="$t('pages.profile.nickname-hint')"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field
                    v-model="profile.family_name"
                    :label="$t('pages.profile.last-name')"
                  />
                </v-col>
              </v-row>
              <v-row align="start">
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="profile.email"
                    :label="$t('pages.profile.email')"
                    :hint="$t('pages.profile.email-hint')"
                    disabled
                    persistent-hint
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-checkbox
                    v-model="profile.user_metadata.newsletter"
                    :label="$t('pages.profile.newsletter')"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="profile.phone_number"
                    :label="$t('pages.profile.phone')"
                    mask="phone"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-checkbox
                    v-model="profile.user_metadata.okToText"
                    :label="$t('pages.profile.texts')"
                    :disabled="!profile.phone_number"
                  />
                </v-col>
              </v-row>
              <v-textarea
                v-model="profile.user_metadata.bio"
                :label="$t('pages.profile.bio')"
              />
            </v-col>
            <v-col
              class="text-center"
              cols="12"
              sm="5"
            >
              <v-col>
                <v-col cols="12">
                  <!-- eslint-disable -->
                  <vue-avatar
                    ref="vtr"
                    :border="10"
                    :borderRadius="avatar.radius"
                    :color="[100, 181, 246, 1.0]"
                    :image="profile.picture"
                    :rotation="avatar.rotation"
                    :scale="avatar.zoom"
                    @select-file="avatar.changed = true"
                  />
                  <!-- eslint-enable -->
                  <p class="text-center">
                    ({{ $t('pages.profile.click-to-edit') }})
                  </p>
                </v-col>
                <v-col
                  class="px-3"
                  cols="12"
                >
                  <v-slider
                    v-model="avatar.zoom"
                    class="pr-4"
                    max="3"
                    min="1"
                    :prepend-icon="icons.image"
                    step="0.01"
                    thumb-label="always"
                    thumb-color="secondary"
                    :thumb-size="24"
                    track-color="secondary"
                  />
                  <v-slider
                    v-model="avatar.rotation"
                    class="pr-4"
                    max="360"
                    min="0"
                    :prepend-icon="icons.crop"
                    thumb-label="always"
                    thumb-color="secondary"
                    :thumb-size="24"
                    track-color="secondary"
                  />
                  <v-slider
                    v-model="avatar.radius"
                    class="pr-4"
                    :max="Math.floor(180 / 2)"
                    min="0"
                    :prepend-icon="icons.radius"
                    thumb-label="always"
                    thumb-color="secondary"
                    :thumb-size="24"
                    track-color="secondary"
                  />
                  <v-btn
                    :disabled="!avatarChanged"
                    color="secondary"
                    @click="saveAvatar()"
                  >
                    <v-icon left>
                      {{ icons.upload }}
                    </v-icon>
                    Save Profile Picture
                  </v-btn>
                </v-col>
              </v-col>
            </v-col>
          </v-row>
          <v-card-actions class="primary lighten-2">
            <v-row class="text-center">
              <v-col>
                <v-btn
                  class="primary pink--text text--darken-4"
                  @click="saveProfile"
                >
                  <v-icon left>
                    {{ icons.save }}
                  </v-icon>
                  {{ $t('pages.profile.save') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mdiImageSizeSelectLarge, mdiContentSave, mdiCropRotate, mdiRoundedCorner, mdiCloudUpload } from '@mdi/js'
  import { VueAvatar } from 'vue-avatar-editor-improved'
  import { api } from '@/store/'
  export default {
    name: 'TheProfilePage',
    components: {
      VueAvatar
    },
    data: () => ({
      api,
      avatar: {
        changed: false,
        radius: 0,
        rotation: 0,
        zoom: 1
      },
      icons: {
        image: mdiImageSizeSelectLarge,
        crop: mdiCropRotate,
        radius: mdiRoundedCorner,
        save: mdiContentSave,
        upload: mdiCloudUpload
      },
      profile: {},
      titles: [
        { value: '', text: '' },
        { value: 'Mr.', text: 'Mr.' },
        { value: 'Ms.', text: 'Ms.' },
        { value: 'Mx.', text: 'Mx.' },
        { value: 'Dr.', text: 'Dr.' }
      ]
    }),
    computed: {
      avatarChanged () {
        return (
          this.avatar.radius !== 0 ||
          this.avatar.rotation !== 0 ||
          this.avatar.zoom !== 1 ||
          this.avatar.changed
        )
      },
      profileDiff () {
        return true
      }
    },
    mounted () {
      const { User } = this.$FeathersVuex.api
      const user = new User(this.$store.state.auth.user)
      this.profile = user.clone()
      console.log(this.profile)
    },
    methods: {
      async saveAvatar () {
        const pic = this.$refs.vtr.getImageScaled().toDataURL()
        const username = this.profile.email.replace(/@.*$/, '')
        const fn = 'avatars/' + username + '_' + (new Date().getTime()) + '.png'
        console.log(fn)
        try {
          const uploaded = await this.api.service('assets').create({ id: fn, uri: pic })
          this.profile.picture = process.env.VUE_APP_ASSETS_URL + uploaded.id
          this.profile.save()
        } catch (error) {
          // TODO: Figure out how to handle user-facing errors
          console.log('Picture upload failed: ', error)
        }
      },
      saveProfile () {
        this.profile.save()
      }
    }
  }
</script>

<style>
canvas {
  width: 180px;
  height: 180px;
}
</style>
