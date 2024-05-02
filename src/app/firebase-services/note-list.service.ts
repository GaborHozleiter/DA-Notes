import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, doc, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {

    trashNotes: Note[] = [];
    normalNotes: Note[] = [];
    firestore: Firestore = inject(Firestore);
    
    


    unsubTrash;
    unsubNotes;
    

    constructor() { 
      this.unsubNotes = this.subNotesList();
      this.unsubTrash = this.subTrashList();
     
    }

    

    setNoteObject(obj:any, id:string){
      return {
        id: id || "",
        type: obj.type || "note",
        title: obj.title || "",
        content: obj.content || "",
        marked: obj.marked || false,
      }
    }

    subTrashList(){
      return onSnapshot(this.getTrashRef(), (list) => {
        this.trashNotes = [];
        list.forEach(element => {
          this.trashNotes.push(this.setNoteObject(element.data(), element.id));
        });
      });
    }

    subNotesList(){
      return onSnapshot(this.getNotesRef(), (list) => {
        this.normalNotes = [];
        list.forEach(element => {
          this.normalNotes.push(this.setNoteObject(element.data(), element.id));
        });
      });
    }

    ngonDestroy(){
      //this.items.unsubscribe();
      this.unsubNotes();
      this.unsubTrash();
    }

    getNotesRef(){
      return collection(this.firestore, 'notes');
    }

    getTrashRef(){
      return collection(this.firestore, 'trash');
    }

    getSingleDocRef(colId:string, docId:string){
      return doc(collection(this.firestore, colId), docId);
    }

}
