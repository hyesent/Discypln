import Dexie from 'dexie'

// ============================================================
//  INDEXEDDB SETUP
// ============================================================

const db = new Dexie('DiscyplnDB')

db.version(1).stores({
  files: '++id, name, type, size, createdAt, entryId, entryType'
})

// ============================================================
//  FILE CRUD OPERATIONS
// ============================================================

// Save a file to IndexedDB
export const saveFile = async (file, entryId = null, entryType = null) => {
  const id = await db.files.add({
    name: file.name,
    type: file.type,
    size: file.size,
    data: file,
    createdAt: new Date().toISOString(),
    entryId,
    entryType
  })
  return id
}

// Get a single file by ID
export const getFile = async (id) => {
  return await db.files.get(id)
}

// Get all files for a specific entry (note/task/journal)
export const getFilesByEntry = async (entryId) => {
  return await db.files.where('entryId').equals(entryId).toArray()
}

// Delete a single file
export const deleteFile = async (id) => {
  await db.files.delete(id)
}

// Delete all files for a specific entry
export const deleteFilesByEntry = async (entryId) => {
  const files = await getFilesByEntry(entryId)
  if (files.length > 0) {
    await db.files.bulkDelete(files.map(f => f.id))
  }
  return files.length
}

// Get all files (for export)
export const getAllFiles = async () => {
  return await db.files.toArray()
}

// Get total size of all stored files
export const getTotalSize = async () => {
  const files = await db.files.toArray()
  return files.reduce((sum, f) => sum + f.size, 0)
}

// Get a blob URL for rendering (remember to revoke!)
export const getFileUrl = (file) => {
  return URL.createObjectURL(file.data)
}

// Delete all files (clear storage)
export const clearAllFiles = async () => {
  await db.files.clear()
}

// Get file count
export const getFileCount = async () => {
  return await db.files.count()
}

export default db