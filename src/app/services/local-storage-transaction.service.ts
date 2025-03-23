import { Injectable } from '@angular/core';
import { appName } from '../../shared/constants';
import { assigned } from '../../shared/utils';
import { defaultRage, QuickNote, Rage } from '../models/quick-notes.models';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageTransactionService {

  public initializeLocalStorage() {
    const dataFromLocalStorage = localStorage.getItem(appName);
    if(assigned(dataFromLocalStorage))  {
      return;
    }
    localStorage.setItem(appName, JSON.stringify(defaultRage));
  }

  public getQuickNoteBasedOnIndexWithTotalCount(index?: number, quickNotes?: QuickNote[]) : { index: number, quickNote: QuickNote | null, count: number } {
    const data = this.getDataFromLocalStorage();
    const quickNotesToBeSearchedFrom = (assigned(quickNotes) && quickNotes?.length !== 0 ? quickNotes : data.quickNotes) as QuickNote[];
    index = index === undefined ? quickNotesToBeSearchedFrom.findIndex(quickNote => quickNote.id === data.selectedQuickNoteId) : index;
    const quickNote = ((index !== -1) && (index < quickNotesToBeSearchedFrom.length)) ? quickNotesToBeSearchedFrom[index] : null;
    if(quickNote) {
      data.selectedQuickNoteId = quickNote.id;
      localStorage.setItem(appName, JSON.stringify(data));
    }
    const count = quickNotesToBeSearchedFrom.length;
    return {index, quickNote, count };
  }

  public saveQuickNote(quickNote: QuickNote): { index: number, quickNote: QuickNote, count: number} {
    const data = this.getDataFromLocalStorage();
    let dateInMilliseconds = 0;
    if(quickNote.id !== 0) {
      dateInMilliseconds = quickNote.id;
      const quickNoteIndex = data.quickNotes.findIndex(quickNote => quickNote.id === dateInMilliseconds);
      data.quickNotes[quickNoteIndex].note = quickNote.note;
    } else {
      dateInMilliseconds = new Date().getTime();
      data.quickNotes.push({
        id: dateInMilliseconds,
        note: quickNote.note,
      });
    }
    data.selectedQuickNoteId = dateInMilliseconds;
    const stringifiedJson = JSON.stringify(data);
    localStorage.setItem(appName, stringifiedJson);
    const quickNoteIndex = data.quickNotes.findIndex(quickNote => quickNote.id === dateInMilliseconds);
    return {index: quickNoteIndex, quickNote: data.quickNotes[quickNoteIndex], count: data.quickNotes.length };
  }

  public getDataFromLocalStorage(): Rage {
    return JSON.parse(localStorage.getItem(appName) as string) as Rage;
  }
}
