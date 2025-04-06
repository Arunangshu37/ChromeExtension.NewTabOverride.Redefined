import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogViewComponent } from './dialog-view.component';
import { AppModule } from '../../../app/app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogTypes } from '../../models/dialog-types.enum';
import { DialogData } from '../../models/dialog-data.model';

describe('DialogViewComponent', () => {
  let component: DialogViewComponent;
  let fixture: ComponentFixture<DialogViewComponent>;
  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<DialogViewComponent>>;
  let mockMatDialogData: DialogData;
  beforeEach(async () => {
    mockMatDialogRef = jasmine.createSpyObj(MatDialogRef<DialogViewComponent>, ['close']);
    mockMatDialogData = {
      dialogType: DialogTypes.Confirmation,
      dialogTitle: 'Delete quick note',
      dialogText: 'Are you sure you want to delete this quick note?',
      dialogActionRecord: {
        positiveConfirmation: 'Yes',
        negativeConfirmation: 'No'
      }
    }
    await TestBed.configureTestingModule({
      imports: [
        AppModule
      ],
      providers: [
        {provide: MatDialogRef, useValue: mockMatDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: mockMatDialogData },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('confirmAndCloseDialog', () => {
    it('should call close method of MatDialogRef', () => {

      component.confirmAndCloseDialog(true);

      expect(mockMatDialogRef.close).toHaveBeenCalledOnceWith(true);
    });
  })
});
