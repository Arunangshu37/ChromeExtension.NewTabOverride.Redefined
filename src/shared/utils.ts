/* eslint-disable  @typescript-eslint/no-explicit-any */
export const assigned = (value: string | any) => {
  return !(value === undefined || value === null || value == '')
}
