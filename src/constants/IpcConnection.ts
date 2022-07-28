export const OPEN_DIALOG = {
  JSON: 'open-json-file',
  SQLITE: 'open-sqlite-file',
}

export const IMPORT_REPLY = {
  JSON: 'import-json-reply',
  SQLITE: 'import-sqlite-reply',
}

export interface JSON_IMPORT_REPLY_FORMAT {
  jsonFilePath: string;
  sqliteFilePath: string;
}
export interface SQLITE_IMPORT_REPLY_FORMAT {
  sqliteFilePath: string;
}