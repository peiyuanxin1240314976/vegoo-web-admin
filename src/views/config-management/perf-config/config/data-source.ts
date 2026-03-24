type UseMock = boolean

export const PerfConfigApiSource: Record<string, UseMock> = {
  perfTable: true,
  perfCreate: true,
  perfUpdate: true,
  perfPublish: true,
  perfArchive: true,
  perfExport: true
}
