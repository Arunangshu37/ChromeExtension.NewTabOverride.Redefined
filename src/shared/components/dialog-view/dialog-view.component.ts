import { Component, inject, model } from '@angular/core';
import { DialogTypes } from '../../models/dialog-types.enum';
import { DialogData } from '../../models/dialog-data.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-view',
  standalone: false,
  templateUrl: './dialog-view.component.html',
  styleUrl: './dialog-view.component.scss'
})
export class DialogViewComponent {
  public readonly dialogData: DialogData = inject(MAT_DIALOG_DATA);
  public readonly dialogTypes = DialogTypes;
  public dialogRef = inject(MatDialogRef<DialogViewComponent>);

  public confirmAndCloseDialog(confirmation: boolean) {
    this.dialogRef.close(confirmation);
  }
}
