import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { LocalStorageTransactionService } from './services/local-storage-transaction.service';
import { QuickNote, QuickNoteSaveStates } from './models/quick-notes.models';
import { timeToWaitForNextKeyStrokeInMilliseconds } from '../shared/constants';

describe('AppComponent', () => {
  let localStorageTransactionServiceMock: jasmine.SpyObj<LocalStorageTransactionService>;
  beforeEach(async () => {
    localStorageTransactionServiceMock = jasmine.createSpyObj<LocalStorageTransactionService>('LocalStorageTransactionService', [
      'initializeLocalStorage',
      'getQuickNoteBasedOnIndexWithTotalCount',
      'saveQuickNote',
      'getDataFromLocalStorage',
    ]);
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AppModule,
      ],
      providers: [
        {
          provide: LocalStorageTransactionService, useValue: localStorageTransactionServiceMock
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should quickNoteInput value change save quick note after 900milliseconds'`, fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const testVal = 'Test quick note';
    const idOfQuickNote = new Date().getTime();
    const app = fixture.componentInstance;
    localStorageTransactionServiceMock.initializeLocalStorage.and.callThrough();
    localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount.and.returnValue({
      count: 0,
      index: 0,
      quickNote: null
    })
    localStorageTransactionServiceMock.saveQuickNote.withArgs(new QuickNote(testVal, 0)).and.returnValue({
      count: 1,
      quickNote: {
        id: idOfQuickNote,
        note: testVal,
      },
      index: 0
    });

    app.ngOnInit();
    app.quickNoteInput.setValue(testVal);

    expect(app.isSaving).toEqual(QuickNoteSaveStates.Saving);

    fixture.detectChanges();
    tick(timeToWaitForNextKeyStrokeInMilliseconds);
    fixture.detectChanges();

    expect(app.isSaving).toEqual(QuickNoteSaveStates.Saved);
    expect(app.currentIndex()).toEqual(0);
    expect(app.totalQuickNotes()).toEqual(1);
    expect(app.idOfSelectedQuickNote()).toEqual(idOfQuickNote);
    expect(app.displayQuickNotePositionText()).toEqual('1/1');
  }));

  it(`should searchQueryInput value change search quick notes based on value in 900 milliseconds'`, fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const testVal = 'Test quick note';
    const idOfQuickNote = new Date().getTime();
    const randomQuickNote : QuickNote= {
      id: new Date().getTime(),
      note: 'T35T Quick note'
    };
    // this is the last selected quick not we would get here.
    localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount.and.returnValue({
      count: 2,
      index: 1,
      quickNote: randomQuickNote
    });
    const app = fixture.componentInstance;
    localStorageTransactionServiceMock.getDataFromLocalStorage.and.returnValue({
      appName: '',
      quickNotes: [
        {
          id: idOfQuickNote,
          note: testVal,
        },
        randomQuickNote,
      ],
      selectedQuickNoteId: idOfQuickNote,
      theme: 'light'
    })


    app.ngOnInit();
    app.searchQueryInput.setValue('Test');
    fixture.detectChanges();
    tick(timeToWaitForNextKeyStrokeInMilliseconds);
    fixture.detectChanges();


    expect(app.currentIndex()).toEqual(0);
    expect(app.totalQuickNotes()).toEqual(1);
    expect(app.idOfSelectedQuickNote()).toEqual(idOfQuickNote);
    expect(app.displayQuickNotePositionText()).toEqual('1/1');
  }));

  it('should reset the quick notes list and count when the search field is made empty', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount.withArgs().and.returnValue({
      count: 3,
      index: 1,
      quickNote : {
        id: new Date().getTime(),
        note: 'Test val'
      }
    });

    app.ngOnInit();
    app.searchQueryInput.setValue('');

    fixture.detectChanges();
    tick(timeToWaitForNextKeyStrokeInMilliseconds);
    fixture.detectChanges();

    expect(app.quickNotesClone().length).toEqual(0);
    expect(app.displayQuickNotePositionText()).toEqual('2/3');
  }));

  it('should quick note not get saved when quickNoteInput is left blank', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount.and.returnValue({
      index: 2,
      count: 3,
      quickNote: {
        id: new Date().getTime(),
        note: 'Test fun'
      }
    })

    app.ngOnInit();

    app.quickNoteInput.setValue('');

    tick(900);

    expect(app.displayQuickNotePositionText()).toEqual('3/3');
    expect(app.isSaving).toEqual(QuickNoteSaveStates.None);

  }));

  describe('navigateThroughQuickNotes', () => {
    it('should set next quickNote in the text area when no predefined list is passed', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const testVal = 'test note';
      localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount.withArgs(1, undefined).and.returnValue({
        count: 2,
        index: 1,
        quickNote: {
          id: new Date().getTime(),
          note: testVal
        }
      });

      app.navigateThroughQuickNotes(1);

      expect(app.quickNoteInput.value).toEqual(testVal);
      expect(app.currentIndex()).toEqual(1);
    });

    it('should set next quickNote in the text area when a predefined list is passed', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const testVal = 'test note';
      app.quickNotesClone.set([
        {
          id: new Date().getTime(),
          note: testVal
        },
        {
          id: new Date().getTime(),
          note: 'test some other value'
        }
      ]);
      localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount
        .withArgs(2, app.quickNotesClone())
        .and
        .returnValue({
          count: 0,
          quickNote: null,
          index: 1
        });

      app.navigateThroughQuickNotes(2);

      expect(localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount).toHaveBeenCalledWith(2, app.quickNotesClone());
    });

    it('should set id of quickNote to 0 when the index to load is exceeding the total count of the quickNotes', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const testVal = 'test note';
      localStorageTransactionServiceMock.getQuickNoteBasedOnIndexWithTotalCount.withArgs(3, undefined).and.returnValue({
        count: 3,
        index: 2,
        quickNote: {
          id: new Date().getTime(),
          note: testVal
        }
      });

      app.navigateThroughQuickNotes(3);

      expect(app.quickNoteInput.value).toEqual('');
      expect(app.idOfSelectedQuickNote()).toEqual(0);
    });
  });

});
