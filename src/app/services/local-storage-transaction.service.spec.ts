import { TestBed } from '@angular/core/testing';

import { LocalStorageTransactionService } from './local-storage-transaction.service';
import { appName } from '../../shared/constants';
import { defaultRage, QuickNote, Rage } from '../models/quick-notes.models';

describe('LocalStorageTransactionService', () => {
  let service: LocalStorageTransactionService;
  const testDefaultRage: Rage = {
    quickNotes: [],
    appName: appName,
    theme: 'dark',
    selectedQuickNoteId: 0
  }
  beforeEach(() => {
    TestBed.configureTestingModule({

    });
    service = TestBed.inject(LocalStorageTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeLocalStorage', () => {
    it('should initialize default state of the app', () => {

      const setItem = spyOn(window.localStorage, 'setItem');
      spyOn(window.localStorage, 'getItem').withArgs(appName).and.returnValue(null);

      service.initializeLocalStorage();

      expect(setItem).toHaveBeenCalledOnceWith(appName, JSON.stringify(defaultRage));
    });

    it('should not re-initialize default state of the app when the state is already defined containing data', () => {
      spyOn(window.localStorage, 'getItem').withArgs(appName).and.returnValue(JSON.stringify(testDefaultRage));
      const setItem = spyOn(window.localStorage, 'setItem')

      service.initializeLocalStorage();

      expect(setItem).toHaveBeenCalledTimes(0);
    });
  });

  describe('getQuickNoteBasedOnIndexWithTotalCount', () => {
    it('should return quickNote when index is mentioned', () => {
      const { setItemMethodSpy, testId, data } = getSetUp()

      service.getQuickNoteBasedOnIndexWithTotalCount(1);
      data.selectedQuickNoteId = testId;

      expect(setItemMethodSpy).toHaveBeenCalledOnceWith(appName, JSON.stringify(data));
    });

    it('should return quickNote based on index and quickNotes look up array passed', () => {
      const { setItemMethodSpy, testId, data } = getSetUp()

      service.getQuickNoteBasedOnIndexWithTotalCount(1, data.quickNotes as QuickNote[]);
      data.selectedQuickNoteId = testId;

      expect(setItemMethodSpy).toHaveBeenCalledOnceWith(appName, JSON.stringify(data));
    });

    it('should return default selected quickNote when no index is passed.', () => {
      const { setItemMethodSpy, data } = getSetUp(new Date().getTime())

      service.getQuickNoteBasedOnIndexWithTotalCount();

      expect(setItemMethodSpy).toHaveBeenCalledOnceWith(appName, JSON.stringify(data));
    });

    const getSetUp = (testQuickNoteId = 0) => {
      const setItemMethodSpy = spyOn(window.localStorage, 'setItem');
      const testId = testQuickNoteId || new Date().getTime();
      const data = {
        appName: 'test app name',
        quickNotes: [
          {
            id: new Date().getTime(),
            note: 'Test note 0',
            state: 'active'
          },
          {
            id: testId,
            note: 'Test note 1',
            state: 'active'
          },
          {
            id: new Date().getTime(),
            note: 'Test note 2',
            state: 'archived'
          },
        ],
        selectedQuickNoteId: testQuickNoteId
      };
      spyOn(window.localStorage, 'getItem').withArgs(appName).and.returnValue(JSON.stringify(data));

      return { setItemMethodSpy, testId, data }
    }
  });

  describe('saveQuickNote', () => {
    it('should save quick note', () => {
      jasmine.clock().install();
      const baseTime = new Date().getTime();
      const setItemMethodSpy = spyOn(window.localStorage, 'setItem');

      const mockData = {
        appName: appName,
        quickNotes: [],
        selectedQuickNoteId: 0
      };
      const actualDataToGetSaved = {
        ...mockData, quickNotes: [
          {
            id: baseTime,
            note: 'Test note'
          }
        ],
        selectedQuickNoteId: baseTime
      };

      spyOn(window.localStorage, 'getItem').and.returnValue(JSON.stringify(mockData))
      service.saveQuickNote(new QuickNote('Test note', 0));

      expect(setItemMethodSpy).toHaveBeenCalledOnceWith(appName, JSON.stringify(actualDataToGetSaved));
    });

    it('should update quick note', () => {
      const testId = new Date().getTime();
      const setItemMethodSpy = spyOn(window.localStorage, 'setItem');
      const mockData = {
        appName: appName,
        quickNotes: [
          {
            id: testId,
            note: 'Test note'
          }
        ],
        selectedQuickNoteId: testId
      };

      const actualDataToGetSaved = {
        ...mockData, quickNotes: [
          {
            id: testId,
            note: 'Test note updated'
          }
        ]
      };
      spyOn(window.localStorage, 'getItem').and.returnValue(JSON.stringify(mockData))

      service.saveQuickNote(new QuickNote('Test note updated', testId));

      expect(setItemMethodSpy).toHaveBeenCalledOnceWith(appName, JSON.stringify(actualDataToGetSaved));
    });
  });
});
