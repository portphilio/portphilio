<template>
  <v-list>
    <v-list-item
      v-for="note in notes"
      :key="note.id"
      class="todo-item"
    >
      <v-list-item-avatar>
        <v-icon
          :color="note.done ? 'success' : 'grey lighten-2'"
          @click="toggleNoteDone(note.id)"
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
          @blur="editNote(note.id)"
          @keyup.enter="editNote(note.id)"
        />
      </v-list-item-content>
      <v-list-item-action>
        <v-btn
          icon
          class="todo--delete-button"
          @click="deleteNote(note.id)"
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
        notes: this.items
      }
    },
    methods: {
      addNote () {
        const note = this.newNote && this.newNote.trim()
        if (!note) return
        this.notes.push({ id: this.notes.length, note, done: false })
        this.newNote = ''
        this.$emit('changed', this.notes)
      },
      editNote (noteId) {
        delete this.notes[noteId].editable
        this.$emit('changed', this.notes)
      },
      deleteNote (noteId) {
        // remove the note to be deleted, then re-index the list
        this.notes.splice(noteId, 1)
        this.notes = this.notes.map((n, i) => { n.id = i; return n })
        this.$emit('changed', this.notes)
      },
      toggleNoteDone (noteId) {
        this.notes[noteId].done = !this.notes[noteId].done
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
