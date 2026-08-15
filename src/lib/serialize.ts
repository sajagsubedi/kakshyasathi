import type { Document, Types } from 'mongoose';

type Doc = Document & { _id: Types.ObjectId };

export function toId(doc: Doc | null | undefined): string | undefined {
  return doc?._id?.toString();
}

export function serializeDoc<T extends Doc>(
  doc: T | null | undefined,
): (Omit<T, keyof Document> & { id: string }) | null {
  if (!doc) return null;
  const obj = doc.toObject();
  return { ...obj, id: doc._id.toString() } as Omit<T, keyof Document> & {
    id: string;
  };
}

export function serializeDocs<T extends Doc>(
  docs: T[],
): (Omit<T, keyof Document> & { id: string })[] {
  return docs.map((doc) => serializeDoc(doc)!);
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]!;
}
