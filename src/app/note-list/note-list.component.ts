import { Component } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { NoteListService } from '../firebase-services/note-list.service'

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  noteList: Note[] = [];
  favFilter: "all" | "fav" = "all";
  status: "notes" | "trash" = "notes";
  trashListActive = false;

  constructor(private noteService: NoteListService) {
    
  }

  getList(): Note[]{
    if (!this.trashListActive) {
      return this.noteService.normalNotes;
    } else {
      return this.noteService.trashNotes; 
    }
  }

  changeFavFilter(filter: "all" | "fav") {
    this.favFilter = filter;
    
  }

  changeTrashStatus() {
    this.trashListActive = true;
    if (this.status == "trash") {
      this.status = "notes";
      this.trashListActive = false;
    } else {
      this.status = "trash";
      this.favFilter = "all";
      this.trashListActive = true;
    }
  }

}
