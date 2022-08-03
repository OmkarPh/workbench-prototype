import { ColDef } from 'ag-grid-community';

import {
  ListCellRenderer,
  UrlListCellRenderer,
  EmailListCellRenderer,
} from './CustomCellComponents/';
import CustomFilterComponent from './CustomFilterComponent';


enum CustomComponentKeys {
  ListCellRenderer = 'ListCellRenderer',
  UrlListCellRenderer = 'UrlListCellRenderer',
  EmailListCellRenderer = 'EmailListCellRenderer',
}

export const frameworkComponents = {
  [CustomComponentKeys.ListCellRenderer] : ListCellRenderer,
  [CustomComponentKeys.UrlListCellRenderer]: UrlListCellRenderer,
  [CustomComponentKeys.EmailListCellRenderer]: EmailListCellRenderer,
};


interface COLUMNS_LIST {
  // Required to update select options by field string
  [key: string]: ColDef,

  // Rest for IDE intellisense in column groups

  path: ColDef,
  type: ColDef,
  name: ColDef,
  extension: ColDef,
  size: ColDef,
  programming_language: ColDef,
  mime_type: ColDef,
  file_type: ColDef,
  
  copyright_statements: ColDef,
  copyright_holders: ColDef,
  copyright_authors: ColDef,
  copyright_start_line: ColDef,
  copyright_end_line: ColDef,

  license_policy: ColDef,
  license_expressions: ColDef,
  license_key: ColDef,
  license_score: ColDef,
  license_short_name: ColDef,
  license_category: ColDef,
  license_owner: ColDef,
  // license_homepage_url: ColDef,
  // license_text_url: ColDef,
  // license_reference_url: ColDef,
  license_spdx_key: ColDef,
  license_start_line: ColDef,
  license_end_line: ColDef,

  email: ColDef,
  url: ColDef,

  packages_type: ColDef,
  packages_name: ColDef,
  packages_version: ColDef,
  packages_license_expression: ColDef,
  packages_primary_language: ColDef,
  // packages_homepage_url: ColDef,
  // packages_download_url: ColDef,
  packages_purl: ColDef,

  scan_error: ColDef,
}

export const ALL_COLUMNS: COLUMNS_LIST = {
  path: {
    // id: "path",
    field: "path",
    headerName: "Path",
    minWidth: 100,
    width: 370,
    // wrapText: true,
  },
  type: {
    // id: "type",
    field: "type",
    headerName: "Type",
    width: 120,
  },
  name: {
    // id: "name",
    field: "name",
    headerName: "Name",
    minWidth: 250,
  },
  extension: {
    // id: "extension",
    field: "extension",
    headerName: "File extension",
    wrapHeaderText: true,
    width: 125,
    floatingFilter: true,
    filterParams: { options: [".txt", ".c", ".cpp"] },
    floatingFilterComponent: CustomFilterComponent,
  },
  size: {
    // id: "size",
    field: "size",
    headerName: "File Size",
    width: 125,
  },
  programming_language: {
    // id: "programming_language",
    field: "programming_language",
    headerName: "Programming Language",
    width: 150,
    wrapHeaderText: true,
  },
  mime_type: {
    // id: "mime_type",
    field: "mime_type",
    headerName: "Mime Type",
    width: 170,
  },
  file_type: {
    // id: "file_type",
    field: "file_type",
    headerName: "File Type",
  },


  copyright_statements: {
    field: 'copyright_statements',
    headerName: 'Copyright Statements',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
    width: 310,
  },
  copyright_holders: {
    field: 'copyright_holders',
    headerName: 'Copyright Holder',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  copyright_authors: {
    field: 'copyright_authors',
    headerName: 'Copyright Author',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  copyright_start_line: {
    field: 'copyright_start_line',
    headerName: 'Copyright Start Line',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  copyright_end_line: {
    field: 'copyright_end_line',
    headerName: 'Copyright End Line',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },


  license_policy: {
    field: 'license_policy',
    headerName: 'License Policy',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_expressions: {
    field: 'license_expressions',
    headerName: 'License Expression',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_key: {
    field: 'license_key',
    headerName: 'License Key',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_score: {
    field: 'license_score',
    headerName: 'License Score',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_short_name: {
    field: 'license_short_name',
    headerName: 'License Short Name',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_category: {
    field: 'license_category',
    headerName: 'License Category',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_owner: {
    field: 'license_owner',
    headerName: 'License Owner',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  // license_homepage_url: {
  //   field: 'license_homepage_url',
  //   headerName: 'License Homepage URL',
  // },
  // license_text_url: {
  //   field: 'license_text_url',
  //   headerName: 'License Text URL',
  // },
  // license_reference_url: {
  //   field: 'license_reference_url',
  //   headerName: 'License Reference URL',
  // },
  license_spdx_key: {
    field: 'license_spdx_key',
    headerName: 'SPDX License Key',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_start_line: {
    field: 'license_start_line',
    headerName: 'License Start Line',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  license_end_line: {
    field: 'license_end_line',
    headerName: 'License End Line',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },


  email: {
    field: 'email',
    headerName: 'Email',
    cellRenderer: CustomComponentKeys.EmailListCellRenderer,
  },
  url: {
    field: 'url',
    headerName: 'URL',
    cellRenderer: CustomComponentKeys.UrlListCellRenderer,
  },


  packages_type: {
    field: 'packages_type',
    headerName: 'Package Type',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  packages_name: {
    field: 'packages_name',
    headerName: 'Package Name',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  packages_version: {
    field: 'packages_version',
    headerName: 'Package Version',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  packages_license_expression: {
    field: 'packages_license_expression',
    headerName: 'Package License Expression',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  packages_primary_language: {
    field: 'packages_primary_language',
    headerName: 'Package Primary Language',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  // packages_homepage_url: {
  //   field: 'packages_homepage_url',
  //   headerName: 'Package Homepage URL',
  // },
  // packages_download_url: {
  //   field: 'packages_download_url',
  //   headerName: 'Package Download URL',
  // },
  packages_purl: {
    field: 'packages_purl',
    headerName: 'Package URL',
    cellRenderer: CustomComponentKeys.ListCellRenderer,
  },
  scan_error: {
    // id: "scan_error",
    field: "scan_error",
    headerName: "Scan Error",
    width: 150,
  },
};

const FILE_COLUMN_GROUP: ColDef[] = [
  ALL_COLUMNS.type,
  ALL_COLUMNS.name,
  ALL_COLUMNS.extension,
  ALL_COLUMNS.size,
  ALL_COLUMNS.programming_language,
  ALL_COLUMNS.mime_type,
  ALL_COLUMNS.file_type,
];

const COPYRIGHT_COLUMN_GROUP: ColDef[] = [
  ALL_COLUMNS.copyright_statements,
  ALL_COLUMNS.copyright_holders,
  ALL_COLUMNS.copyright_authors,
  ALL_COLUMNS.copyright_start_line,
  ALL_COLUMNS.copyright_end_line,
];


const LICENSE_COLUMN_GROUP: ColDef[] = [
  ALL_COLUMNS.license_policy,
  ALL_COLUMNS.license_expressions,
  ALL_COLUMNS.license_key,
  ALL_COLUMNS.license_score,
  ALL_COLUMNS.license_short_name,
  ALL_COLUMNS.license_category,
  ALL_COLUMNS.license_owner,
  // ALL_COLUMNS.license_homepage_url,
  // ALL_COLUMNS.license_text_url,
  // ALL_COLUMNS.license_reference_url,
  ALL_COLUMNS.license_spdx_key,
  ALL_COLUMNS.license_start_line,
  ALL_COLUMNS.license_end_line,
];

const ORIGIN_COLUMN_GROUP: ColDef[] = [
  ALL_COLUMNS.copyright_statements,
  ALL_COLUMNS.license_short_name,
  ALL_COLUMNS.license_policy,
  ALL_COLUMNS.license_category,
  ALL_COLUMNS.email,
  ALL_COLUMNS.url,
  ALL_COLUMNS.mime_type,
  ALL_COLUMNS.file_type,
  ALL_COLUMNS.programming_language,
];

const PACKAGE_COLUMN_GROUP: ColDef[] = [
  ALL_COLUMNS.packages_type,
  ALL_COLUMNS.packages_name,
  ALL_COLUMNS.packages_version,
  ALL_COLUMNS.packages_license_expression,
  ALL_COLUMNS.packages_primary_language,
  // ALL_COLUMNS.packages_homepage_url,
  // ALL_COLUMNS.packages_download_url,
  ALL_COLUMNS.packages_purl,
];



const DEFAULT_COLUMN_GROUP: ColDef[] = [
  ALL_COLUMNS.path,
  ...FILE_COLUMN_GROUP,
  ALL_COLUMNS.scan_error,
];


export const COLUMN_GROUPS = {
  DEFAULT: DEFAULT_COLUMN_GROUP,

  COPYRIGHT: COPYRIGHT_COLUMN_GROUP,
  FILE: FILE_COLUMN_GROUP,
  LICENSE: LICENSE_COLUMN_GROUP,
  ORIGIN: ORIGIN_COLUMN_GROUP,
  PACKAGE: PACKAGE_COLUMN_GROUP,

  ALL: [
    ...COPYRIGHT_COLUMN_GROUP,
    ...FILE_COLUMN_GROUP,
    ...LICENSE_COLUMN_GROUP,
    ...ORIGIN_COLUMN_GROUP,
    ...PACKAGE_COLUMN_GROUP,
    ALL_COLUMNS.scan_error,
  ],

  NONE: [] as ColDef[],
}