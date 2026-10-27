import { Platform } from "react-native";

import type { PickedDocument } from "@/src/types/api";

/**
 * Appends a picked document to a multipart/form-data body.
 *
 * On native, React Native's FormData accepts a `{ uri, name, type }` object
 * and streams the file from disk. On web, the DOM FormData needs the real
 * `File` object returned by the document picker.
 */
export function appendDocument(
  form: FormData,
  field: string,
  doc: PickedDocument
) {
  if (Platform.OS === "web") {
    if (doc.file) {
      form.append(field, doc.file, doc.fileName);
      return;
    }
    // No File object available: send the URI so the field is not lost.
    form.append(field, doc.uri);
    return;
  }

  // React Native's FormData takes `{ uri, name, type }` where the DOM
  // typings only allow string | Blob, hence the cast.
  const append = form.append as unknown as (
    name: string,
    value: unknown
  ) => void;
  append(field, {
    uri: doc.uri,
    name: doc.fileName,
    type: doc.mimeType ?? "application/octet-stream",
  });
}

export async function appendAudio(
  form: FormData,
  field: string,
  uri: string,
  fileName: string,
  mimeType: string
) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    form.append(field, blob, fileName);
    return;
  }

  const append = form.append as unknown as (
    name: string,
    value: unknown
  ) => void;
  append(field, { uri, name: fileName, type: mimeType });
}
