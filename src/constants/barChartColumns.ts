interface Column {
  title: string,
  key: string,
  data?: string,
  visible?: boolean,
  bar_chart_class?: string,
}

export const LOCATION_COLUMN: Column[] = [
  {
    title: 'Path',
    key: 'path',
  }
];

export const COPYRIGHT_COLUMNS: Column[] = [
  {
    title: 'Copyright Statement',
    key: 'copyright_statements',
    bar_chart_class: 'bar-chart-copyrights',
  },
  {
    title: 'Copyright Holder',
    key: 'copyright_holders',
    bar_chart_class: 'bar-chart-copyrights',
  },
  {
    title: 'Copyright Author',
    key: 'copyright_authors',
    bar_chart_class: 'bar-chart-copyrights',
  },
];

export const LICENSE_COLUMNS: Column[] = [
  {
    data: 'license_expressions[<hr/>]',
    title: 'License Expression',
    key: 'license_expressions',
    bar_chart_class: 'bar-chart-licenses',
  },
  {
    data: 'license_key[<hr/>]',
    title: 'License Key',
    key: 'license_key',
    bar_chart_class: 'bar-chart-licenses',
  },
  {
    data: 'license_score[<hr/>]',
    title: 'License Score',
    key: 'license_score',
    bar_chart_class: 'bar-chart-licenses',
  },
  {
    data: 'license_short_name[<hr/>]',
    title: 'License Short Name',
    key: 'license_short_name',
    bar_chart_class: 'bar-chart-licenses',
  },
  {
    data: 'license_category[<hr/>]',
    title: 'License Category',
    key: 'license_category',
    bar_chart_class: 'bar-chart-licenses',
  },
  {
    data: 'license_owner[<hr/>]',
    title: 'License Owner',
    key: 'license_owner',
    bar_chart_class: 'bar-chart-licenses',
  },
  {
    data: 'license_spdx_key[<hr/>]',
    title: 'SPDX License Key',
    key: 'license_spdx_key',
    bar_chart_class: 'bar-chart-licenses',
  },
];

export const EMAIL_COLUMNS: Column[] = [
  {
    title: 'Email',
    key: 'email',
    bar_chart_class: 'bar-chart-emails',
  },
];

export const URL_COLUMNS: Column[] = [
  {
    title: 'URL',
    key: 'url',
  },
];

export const FILE_COLUMNS: Column[] = [
  {
    data: 'type',
    title: 'Type',
    key: 'type',
    bar_chart_class: 'bar-chart-file-infos',
    'visible': true
  },
  {
    data: 'extension',
    title: 'File Extension',
    key: 'extension',
    bar_chart_class: 'bar-chart-file-infos',
    'visible': true
  },
  {
    data: 'file_type',
    title: 'File Type',
    key: 'file_type',
    bar_chart_class: 'bar-chart-file-infos',
    'visible': true
  },
  {
    data: 'programming_language',
    title: 'Language',
    key: 'programming_language',
    bar_chart_class: 'bar-chart-file-infos',
    'visible': true
  },
  {
    data: 'is_binary',
    title: 'Binary',
    key: 'is_binary',
    bar_chart_class: 'bar-chart-file-infos',
  },
  {
    data: 'is_text',
    title: 'Text File',
    key: 'is_text',
    bar_chart_class: 'bar-chart-file-infos',
  },
  {
    data: 'is_archive',
    title: 'Archive File',
    key: 'is_archive',
    bar_chart_class: 'bar-chart-file-infos',
  },
  {
    data: 'is_media',
    title: 'Media File',
    key: 'is_media',
    bar_chart_class: 'bar-chart-file-infos',
  },
  {
    data: 'is_source',
    title: 'Source File',
    key: 'is_source',
    bar_chart_class: 'bar-chart-file-infos',
  },
  {
    data: 'is_script',
    title: 'Script File',
    key: 'is_script',
    bar_chart_class: 'bar-chart-file-infos',
  },
  {
    data: 'scan_errors',
    title: 'Scan Error',
    key: 'scan_errors',
    bar_chart_class: 'bar-chart-file-infos',
    'visible': true
  }
];

export const PACKAGE_COLUMNS: Column[] = [
  {
    data: 'package_data_type',
    title: 'Package Type',
    key: 'package_data_type',
    bar_chart_class: 'bar-chart-package-infos',
  },
  {
    data: 'package_data_name',
    title: 'Package Name',
    key: 'package_data_name',
    bar_chart_class: 'bar-chart-package-infos',
  },
  {
    data: 'package_data_primary_language',
    title: 'Package Primary Language',
    key: 'package_data_primary_language',
    bar_chart_class: 'bar-chart-package-infos',
  },
];

interface BAR_CHART_GROUP {
  label: string,
  key: string,
  cols: Column[],
}

export const BAR_CHART_COLUMNS: {[key: string]: BAR_CHART_GROUP} = {
  Copyright: {
    label: "Copyright columns",
    key: 'copyright_columns',
    cols: COPYRIGHT_COLUMNS
  },
  License : {
    label: "License columns",
    key: 'license_columns',
    cols: LICENSE_COLUMNS
  },
  Email: {
    label: "Email columns",
    key: 'email_columns',
    cols: EMAIL_COLUMNS
  },
  Url: {
    label: "URL columns",
    key: 'url_columns',
    cols: URL_COLUMNS
  },
  File: {
    label: "File columns",
    key: 'file_columns',
    cols: FILE_COLUMNS
  },
  Package: {
    label: "Package columns",
    key: 'package_columns',
    cols: PACKAGE_COLUMNS
  },
}


export const FILEINFO_COLUMN_NAMES = 
[
'name',
'extension',
'size',
'type',
'mime_type', 
'file_type',
'programming_language'
];

export const ORIGIN_COLUMN_NAMES = [
  'copyright_statements',
  'license_short_name',
  'license_policy',
  'license_category',
  'email',
  'url',
  'mime_type',
  'file_type',
  'programming_language'
];

export const LICENSE_COLUMN_NAMES = 
[
  'license_policy',
  'license_expressions',
  'license_key',
  'license_score',
  'license_short_name', 
  'license_category',
  'license_owner',
  'license_spdx_key',
  'license_start_line',
  'license_end_line'
];

export const PACKAGE_COLUMN_NAMES = 
[
  'package_data_type',
  'package_data_name',
  'package_data_version',
  'package_data_license_expression',
  'package_data_primary_language',
  'package_data_purl'
];