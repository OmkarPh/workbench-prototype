export const OPEN_ERROR_DIALOG_CHANNEL = "open-error-dialog";
export interface ErrorInfo {
  title: string;
  message: string;
}

export const OPEN_DIALOG_CHANNEL = {
  JSON: 'open-json-file',
  SQLITE: 'open-sqlite-file',
}

export const IMPORT_REPLY_CHANNEL = {
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