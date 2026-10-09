const fields = new Set<() => Promise<void>>();
export function registerSave(save: () => Promise<void>) {
  fields.add(save);
  return () => {
    fields.delete(save);
  };
}
export async function savePendingFields() {
  await Promise.all(Array.from(fields, (save) => save()));
}
