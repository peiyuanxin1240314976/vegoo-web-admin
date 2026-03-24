type UseMock = boolean

export const OrderImportApiSource: Record<string, UseMock> = {
  importTable: true,
  importSummary: true,
  submitImport: true,
  pauseImport: true,
  cancelImport: true,
  importReport: true,
  exportReport: true
}
