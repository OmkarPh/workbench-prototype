import { LicenseAttributes } from './license';
/*
 #
 # Copyright (c) 2018 nexB Inc. and others. All rights reserved.
 # https://nexb.com and https://github.com/nexB/scancode-workbench/
 # The ScanCode Workbench software is licensed under the Apache License version 2.0.
 # ScanCode is a trademark of nexB Inc.
 #
 # You may not use this software except in compliance with the License.
 # You may obtain a copy of the License at: http://apache.org/licenses/LICENSE-2.0
 # Unless required by applicable law or agreed to in writing, software distributed
 # under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 # CONDITIONS OF ANY KIND, either express or implied. See the License for the
 # specific language governing permissions and limitations under the License.
 #
 */

import { Model, ModelStatic, Sequelize } from 'sequelize';

import headerModel from './header';
import fileModel, { FileAttributes } from './file';
import licenseModel from './license';
import licenseExpressionModel, { LicenseExpressionAttributes, OptionalLicenseExpressionAttributes } from './licenseExpression';
import licensePolicyModel, { LicensePolicyAttributes } from './licensePolicy';
import copyrightModel, { CopyrightAttributes } from './copyright';
import packageModel, { PackageAttributes } from './package';
import emailModel, { EmailAttributes } from './email';
import urlModel, { UrlAttributes } from './url';
import flatFileModel from './flatFile';
import scanErrorModel, { ScanErrorAttributes } from './scanError';

// let Header;
// let File;
// let License;
// let Copyright;
// let Package;
// let Email;
// let Url;
// let Scan;

export interface DatabaseStructure{
  Header: any,
  File: ModelStatic<Model<FileAttributes>>,
  License: ModelStatic<Model<LicenseAttributes>>,
  LicenseExpression: ModelStatic<Model<LicenseExpressionAttributes, OptionalLicenseExpressionAttributes>>,
  LicensePolicy: ModelStatic<Model<LicensePolicyAttributes>>,
  Copyright: ModelStatic<Model<CopyrightAttributes>>,
  Package: ModelStatic<Model<PackageAttributes>>,
  Email: ModelStatic<Model<EmailAttributes>>,
  Url: ModelStatic<Model<UrlAttributes>>,
  ScanError: ModelStatic<Model<ScanErrorAttributes>>,

  // TODO
  FlatFile: ModelStatic<Model<any>>,

  fileIncludes: any[],
}

export function newDatabase(sequelize: Sequelize): DatabaseStructure {
  // Define the models
  const result = {
    Header: headerModel(sequelize),
    File: fileModel(sequelize),
    License: licenseModel(sequelize),
    LicenseExpression: licenseExpressionModel(sequelize),
    LicensePolicy: licensePolicyModel(sequelize),
    Copyright: copyrightModel(sequelize),
    Package: packageModel(sequelize),
    Email: emailModel(sequelize),
    Url: urlModel(sequelize),
    ScanError: scanErrorModel(sequelize),
    FlatFile: flatFileModel(sequelize),
  };

  console.log("Result .header done");  

  // Define the relations
  result.Header.hasMany(result.File);
  result.File.hasMany(result.License);
  result.File.hasMany(result.LicenseExpression);
  result.File.hasMany(result.LicensePolicy);
  result.File.hasMany(result.Copyright);
  result.File.hasMany(result.Package);
  result.File.hasMany(result.Email);
  result.File.hasMany(result.Url);
  result.File.hasMany(result.ScanError);

  // Include Array for queries
  const fileIncludes = [
    { model: result.License, separate: true },
    { model: result.LicenseExpression, separate: true },
    { model: result.LicensePolicy, separate: true },
    { model: result.Copyright, separate: true },
    { model: result.Package, separate: true },
    { model: result.Email, separate: true },
    { model: result.Url, separate: true },
    { model: result.ScanError, separate: true },
  ];

  return {
    ...result,
    fileIncludes
  };
}