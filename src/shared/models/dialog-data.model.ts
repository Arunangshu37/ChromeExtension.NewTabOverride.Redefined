import { DialogTypes } from "./dialog-types.enum";

export class DialogData {
  constructor(public dialogType: DialogTypes, public dialogTitle: string, public dialogText?: string, public dialogActionRecord?: Record<string, string >) {}
}
