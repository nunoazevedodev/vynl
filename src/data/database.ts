import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { VinylRecord } from '../records/RecordModel'

/**
 * Camada de persistência local (IndexedDB).
 * Toda a aplicação conversa com o "repositório" abaixo, e não com o IndexedDB
 * diretamente — no futuro, uma implementação com sincronização/backend pode
 * substituir esta sem mudar o resto do código.
 */

interface VynlDB extends DBSchema {
  records: { key: string; value: VinylRecord }
  kv: { key: string; value: unknown }
}

export interface Repository {
  getAllRecords(): Promise<VinylRecord[]>
  putRecord(r: VinylRecord): Promise<void>
  putRecords(rs: VinylRecord[]): Promise<void>
  deleteRecord(id: string): Promise<void>
  getValue<T>(key: string): Promise<T | undefined>
  setValue<T>(key: string, value: T): Promise<void>
}

let dbPromise: Promise<IDBPDatabase<VynlDB>> | null = null
const db = () =>
  (dbPromise ??= openDB<VynlDB>('vynl', 1, {
    upgrade(d) {
      d.createObjectStore('records', { keyPath: 'id' })
      d.createObjectStore('kv')
    },
  }))

export const repository: Repository = {
  async getAllRecords() {
    return (await db()).getAll('records')
  },
  async putRecord(r) {
    await (await db()).put('records', r)
  },
  async putRecords(rs) {
    const tx = (await db()).transaction('records', 'readwrite')
    await Promise.all([...rs.map((r) => tx.store.put(r)), tx.done])
  },
  async deleteRecord(id) {
    await (await db()).delete('records', id)
  },
  async getValue<T>(key: string) {
    return (await (await db()).get('kv', key)) as T | undefined
  },
  async setValue<T>(key: string, value: T) {
    await (await db()).put('kv', value, key)
  },
}
