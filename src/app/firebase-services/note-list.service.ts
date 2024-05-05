import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  collectionData,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];
  firestore: Firestore = inject(Firestore);

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrashList();
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  async updeteNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getClearJson(note)).catch((err) => {
        console.error(err);
      });
    }
  }

  getClearJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {
    let getNotesOrTrash: any;
    if (colId == 'notes') {
      getNotesOrTrash = this.getNotesRef();
    } else if (colId == 'trash') {
      getNotesOrTrash = this.getTrashRef();
    }
    await addDoc(getNotesOrTrash, item)
      .catch((err) => {
        console.error(err);
      })
      .then((docRef) => {
        console.log('Document written with  ID: ', docRef?.id);
      });
  }

  setNoteObject(obj: any, id: string) {
    return {
      id: id || '',
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    const q = query(this.getNotesRef(),/*orderBy('title'),*/ limit(100));
    return onSnapshot(q , (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q , (list) => {
      this.normalMarkedNotes = [];
      list.forEach((element) => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
      //Andere variante
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New Note: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified Note: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed Note: ", change.doc.data());
        }
      });
    });
  }

  ngonDestroy() {
    //this.items.unsubscribe();
    this.unsubNotes();
    this.unsubTrash();
    this.unsubMarkedNotes();
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
