import { appName } from "../../shared/constants";

export enum QuickNoteSaveStates {
  None,
  Saving,
  Saved,
  Failed
}

export class QuickNote {
  constructor(
  public note: string,
  public id = 0, // date in milliseconds -> can act as date of creation.
  ) {}
}

export type Theme = 'dark' | 'light';

export interface Rage {
  quickNotes: QuickNote[],
  appName: string,
  theme: Theme,
  selectedQuickNoteId: number,
}

export const defaultRage: Rage = {
  quickNotes: [],
  appName: appName,
  theme: 'light',
  selectedQuickNoteId: 0
}
