import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, tap } from 'rxjs';
import { assigned } from '../shared/utils';
import { QuickNote, QuickNoteSaveStates } from './models/quick-notes.models';
import { LocalStorageTransactionService } from './services/local-storage-transaction.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Angular app';
  public quickNoteSaveStates = QuickNoteSaveStates;
  public isSaving = QuickNoteSaveStates.None;
  public quickNoteInput = new FormControl('');
  public searchQueryInput = new FormControl('');
  public readonly isPrevButtonDisabled = computed(() => this.currentIndex() <= 0);
  public readonly isNextButtonDisabled = computed(() => ((this.currentIndex() + 1) > this.totalQuickNotes()));
  public readonly displayQuickNotePositionText = signal('000/000');
  public readonly currentIndex = signal(-1);
  public readonly totalQuickNotes = signal(-1);
  public readonly idOfSelectedQuickNote = signal(0);
  public readonly quickNotesClone = signal<QuickNote[]>([]);

  private readonly localStorageTransactionService = inject(LocalStorageTransactionService);

  public ngOnInit(): void {
    this.localStorageTransactionService.initializeLocalStorage();
    this.initializeQuickNoteValueChangeAction();
    this.initializeSearchQueryValueChangeAction();

    this.setDefaultQuickNoteData();
  }

  public navigateThroughQuickNotes(indexToGo: number) {
    const { index, quickNote, count} = this.localStorageTransactionService.getQuickNoteBasedOnIndexWithTotalCount(
      indexToGo,
      this.quickNotesClone().length !== 0 ? this.quickNotesClone() : undefined
    );
    if(quickNote) {
      this.setQuickNoteData(quickNote.id, index, quickNote.note, count)
    }
    if(indexToGo === count) {
      this.setQuickNoteData(0, indexToGo, '')
    }
  }

  private setQuickNoteData(quickNoteId: number, index: number, note: string, count?: number) {
    this.idOfSelectedQuickNote.set(quickNoteId);
    this.currentIndex.set(index);
    this.quickNoteInput.setValue(note, {emitEvent: false});
    if(count) {
      this.totalQuickNotes.set(count);
    }
    this.displayQuickNotePositionText.set(`${this.currentIndex()+1}/${this.totalQuickNotes()}`);
  }

  private initializeQuickNoteValueChangeAction() {
    this.quickNoteInput.valueChanges.pipe(
      tap(() => {
        this.isSaving = QuickNoteSaveStates.Saving;
      }),
      debounceTime(900),
      filter((value) => {
        if(!assigned(value)) {
          this.isSaving = QuickNoteSaveStates.None;
          return false;
        }
        return true;
      })
    ).subscribe((value) => {
      const {index, quickNote, count} = this.localStorageTransactionService.saveQuickNote(new QuickNote(value as string, this.idOfSelectedQuickNote()));
      this.isSaving =  QuickNoteSaveStates.Saved;

      this.setQuickNoteData(quickNote.id as number, index, quickNote.note, count);
    });
  }

  private initializeSearchQueryValueChangeAction() {
    this.searchQueryInput.valueChanges.pipe(
      debounceTime(1000),
      filter((value) => {
        const isValueAssigned = assigned(value);
        if(!isValueAssigned) {
          this.quickNotesClone.set([]);
          this.setDefaultQuickNoteData();
        }
        return isValueAssigned;
      })
    ).subscribe((value) => {
      const { quickNotes } = this.localStorageTransactionService.getDataFromLocalStorage()
      const searchedQuickNotes = quickNotes.filter((quickNote) => quickNote.note.toLowerCase().indexOf((value as string ).toLowerCase()) !== -1)
      this.quickNotesClone.set(searchedQuickNotes);
      if(this.quickNotesClone().length !== 0) {
        this.setQuickNoteData(this.quickNotesClone()[0].id, 0, this.quickNotesClone()[0].note, this.quickNotesClone().length);
      }
    });
  }

  private setDefaultQuickNoteData() {
    const { index, quickNote, count } = this.localStorageTransactionService.getQuickNoteBasedOnIndexWithTotalCount();
    if(quickNote) {
      this.setQuickNoteData(quickNote.id, index, quickNote.note, count);
      this.displayQuickNotePositionText.set(`${this.currentIndex()+1}/${this.totalQuickNotes()}`);
    }
  }
}
