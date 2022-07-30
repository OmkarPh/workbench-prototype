import { ColDef } from 'ag-grid-community';

export const PATH_COLUMN: ColDef = {
  // id: "path",
  field: "path",
  headerName: "Path",
  minWidth: 200,
  width: 350,
  // wrapText: true,
  // cellRenderer: ...
}

export const FILE_COLUMN_GROUP: ColDef[] = [
  PATH_COLUMN,
  {
    // id: "type",
    field: "type",
    headerName: "Type",
    width: 100,
  },
  {
    // id: "name",
    field: "name",
    headerName: "Name",
    minWidth: 250,
  },
  {
    // id: "extension",
    field: "extension",
    headerName: "File extension",
    wrapHeaderText: true,
    width: 125,
  },
  {
    // id: "size",
    field: "size",
    headerName: "File Size",
    width: 125,
  },
  {
    // id: "programming_language",
    field: "programming_language",
    headerName: "Programming Language",
    width: 150,
    wrapHeaderText: true,
  },
  {
    // id: "mime_type",
    field: "mime_type",
    headerName: "Mime Type",
    width: 170,
  },
  {
    // id: "file_type",
    field: "file_type",
    headerName: "File Type",
  },
]

export const ORIGIN_COLUMN_GROUP: ColDef[] = [
  PATH_COLUMN,

]

export const COPYRIGHT_COLUMN_GROUP: ColDef[] = [
  PATH_COLUMN,
  {
    field: 'copyright_statements',
    headerName: 'Copyright Statement',
  },
  {
    field: 'copyright_holders',
    headerName: 'Copyright Holder',
  },
  {
    field: 'copyright_authors',
    headerName: 'Copyright Author',
  },
  {
    field: 'copyright_start_line',
    headerName: 'Copyright Start Line',
  },
  {
    field: 'copyright_end_line',
    headerName: 'Copyright End Line',
  }
]

export const LICENSE_COLUMN_GROUP: ColDef[] = [
  PATH_COLUMN,
  {
    field: 'license_policy',
    headerName: 'License Policy',
  },
  {
    field: 'license_expressions',
    headerName: 'License Expression',
  },
  {
    field: 'license_key',
    headerName: 'License Key',
  },
  {
    field: 'license_score',
    headerName: 'License Score',
  },
  {
    field: 'license_short_name',
    headerName: 'License Short Name',
  },
  {
    field: 'license_category',
    headerName: 'License Category',
  },
  {
    field: 'license_owner',
    headerName: 'License Owner',
  },
  // {
  //   field: 'license_homepage_url',
  //   headerName: 'License Homepage URL',
  // },
  // {
  //   field: 'license_text_url',
  //   headerName: 'License Text URL',
  // },
  // {
  //   field: 'license_reference_url',
  //   headerName: 'License Reference URL',
  // },
  {
    field: 'license_spdx_key',
    headerName: 'SPDX License Key',
  },
  {
    field: 'license_start_line',
    headerName: 'License Start Line',
  },
  {
    field: 'license_end_line',
    headerName: 'License End Line',
  },
]

export const PACKAGE_COLUMN_GROUP: ColDef[] = [
  PATH_COLUMN,
  {
    field: 'packages_type',
    headerName: 'Package Type',
  },
  {
    field: 'packages_name',
    headerName: 'Package Name',
  },
  {
    field: 'packages_version',
    headerName: 'Package Version',
  },
  {
    field: 'packages_license_expression',
    headerName: 'Package License Expression',
  },
  {
    field: 'packages_primary_language',
    headerName: 'Package Primary Language',
  },
  // {
  //   field: 'packages_homepage_url',
  //   headerName: 'Package Homepage URL',
  // },
  // {
  //   field: 'packages_download_url',
  //   headerName: 'Package Download URL',
  // },
  {
    field: 'packages_purl',
    headerName: 'Package URL',
  },
]

// export const _COLUMN_GROUP: ColDef[] = [
  
// ]



export const DEFAULT_COLUMN_GROUP: ColDef[] = [
  ...FILE_COLUMN_GROUP,
  {
    // id: "scan_error",
    field: "scan_error",
    headerName: "Scan Error",
    width: 150,
  },
];
