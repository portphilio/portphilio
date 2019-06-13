<template>
  <v-list>
    <v-list-item
      v-for="note in notes"
      :key="note._id"
      class="todo-item"
    >
      <v-list-item-avatar>
        <v-icon
          :color="note.done ? 'success' : 'grey lighten-2'"
          @click="toggleNoteDone(note._id)"
        >
          {{ note.done ? icons.complete : icons.incomplete }}
        </v-icon>
      </v-list-item-avatar>
      <v-list-item-content
        :class="note.done ? 'todo--complete': 'todo--incomplete'"
      >
        <v-text-field
          :value="note.note"
          :disabled="note.done"
          @blur="editNote(note._id)"
          @keyup.enter="editNote(note._id)"
        />
      </v-list-item-content>
      <v-list-item-action>
        <v-btn
          icon
          class="todo--delete-button"
          @click="deleteNote(note._id)"
        >
          <v-icon color="error">
            {{ icons.delete }}
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-text-field
          v-model="newNote"
          :hint="$t('components.to-do-list.new-note-hint')"
          :label="$t('components.to-do-list.new-note')"
          @blur="addNote()"
          @keyup.enter="addNote()"
        />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
  import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiClose } from '@mdi/js'
  export default {
    name: 'ToDoList',
    props: {
      items: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        icons: {
          incomplete: mdiCheckboxBlankCircleOutline,
          complete: mdiCheckboxMarkedCircleOutline,
          delete: mdiClose
        },
        newNote: '',
        notes: []
      }
    },
    watch: {
      items (newNotes) {
        this.notes = newNotes
      }
    },
    methods: {
      addNote () {
        const note = this.newNote && this.newNote.trim()
        if (!note) return
        this.notes.push({ _id: this.notes.length, note, done: false })
        this.newNote = ''
        this.$emit('changed', this.notes)
      },
      editNote (noteId) {
        const index = this.notes.findIndex(n => n._id === noteId)
        delete this.notes[index].editable
        this.$emit('changed', this.notes)
      },
      deleteNote (noteId) {
        // remove the note to be deleted, then re-index the list
        const index = this.notes.findIndex(n => n._id === noteId)
        this.notes.splice(index, 1)
        this.notes = this.notes.map((n, i) => {
          if (Number.isInteger(+n._id)) {
            n._id = i
          }
          return n
        })
        this.$emit('changed', this.notes)
      },
      toggleNoteDone (noteId) {
        const index = this.notes.findIndex(n => n._id === noteId)
        this.notes[index].done = !this.notes[index].done
        this.$emit('changed', this.notes)
      }
    }
  }
</script>

<style lang="sass">
.todo--complete
  text-decoration: line-through #777

.todo--incomplete
  text-decoration: none

.todo-item
  .todo--delete-button
    opacity: 0

.todo-item:hover
  .todo--delete-button
    opacity: 1
</style>
