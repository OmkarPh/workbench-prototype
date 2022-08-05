/*
 #
 # Copyright (c) 2017 - 2019 nexB Inc. and others. All rights reserved.
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

import * as $ from 'jquery'
import { DataTypes, FindOptions, Model, Sequelize, Transaction, TransactionOptions } from 'sequelize';
import fs from 'fs';
import path from 'path';
// import sqlite3 from 'sqlite3';
// import Database from 'better-sqlite3';
// import { Database, Options, ColumnDefinition } from 'better-sqlite3';
import JSONStream from 'JSONStream';
import { DatabaseStructure, newDatabase } from './models/database';
import {parentPath} from './models/databaseUtils';
import { DebugLogger } from '../utils/logger';
import { FileAttributes } from './models/file';
import { DataNode } from 'rc-tree/lib/interface';
import { flattenFile } from './models/flatFile';

// const b3 = window.require('better-sqlite3');
// console.log("Sqlite3", sqlite3);
// console.log("b3 required", b3);
// console.log("b3 import",BetterSqlite3);


/**
 * Manages the database created from a ScanCode JSON input.
 * The database contains tables for both flattened and unflattened data
 *
 * The config will load an existing database or will create a new, empty
 * database if none exists. For a new database, the data is loaded from a JSON
 * file by calling addFromJson(jsonFileName).
 *
 * @param config
 * @param config.dbName
 * @param config.dbUser
 * @param config.dbPassword
 * @param config.dbStorage
 */

interface WorkbenchDbConfig {
  dbName: string,
  dbStorage: string,
  dbUser?: string,
  dbPassword?: string,
}
// TODO
// function sortChildren(node: Model<FileAttributes, FileAttributes>){
function sortChildren(node: any){
  if(!node.children || !node.children.length)
    return;
  node.children.sort((a: any, b: any) => {
    if(a.type === b.type)
      return 0;
    if(a.type === 'file')
      return 1;
    return -1;
  });
  node.children.forEach(sortChildren);
}

export class WorkbenchDB {
  sequelize: Sequelize;
  db: DatabaseStructure;
  sync:  Promise<DatabaseStructure>;
  
  constructor(config: WorkbenchDbConfig) {
    // Constructor returns an object which effectively represents a connection
    // to the db arguments (name of db, username for db, pw for that user)
    const name = (config && config.dbName) ? config.dbName : 'tmp';
    const user = (config && config.dbUser) ? config.dbUser : null;
    const password = (config && config.dbPassword) ? config.dbPassword : null;
    const storage = (config && config.dbStorage) ? config.dbStorage : ':memory:';

    console.log("DB details", {
      name, user, password, storage,
    });
    // console.log("Dialect module :", sqlite3);

    this.sequelize = new Sequelize(name, user, password, {
      dialect: 'sqlite',
      // dialectModule: { Database },
      // dialectOptions: {
      //   sqlite3: Database,
      // },
      // dialectModule: BetterSqlite3,
      // dialectOptions: {
      //   sqlite3: BetterSqlite3,
      // },
      // dialectModule: sqlite3,
      // dialectOptions: {
      //   sqlite3
      // },
      storage: storage,
      logging: false
    });
    console.log("sequelize done", this.sequelize.config);
    
    this.db = newDatabase(this.sequelize);
    console.log("db done");
    

    // A promise that will return when the db and tables have been created
    const temp = this.sequelize.sync().then(() => {
      console.log("this sync ready",);
      return this.db
    });

    this.sync = temp;
  }

  // Get ScanCode Workbench app information
  getWorkbenchInfo() {
    return this.sync.then((db) => db.Header.findOne({
      attributes: [
        'workbench_notice',
        'workbench_version'
      ]
    }));
  }

  // Get ScanCode Toolkit information
  getScanCodeInfo() {
    return this.sync.then((db) => db.Header.findOne({
      attributes: [
        'scancode_notice',
        'scancode_version',
        'scancode_options'
      ]
    }));
  }

  getFileCount() {
    return this.sync
      .then((db) => db.Header.findOne({attributes: ['files_count']}))
      .then((count) => count ? count.getDataValue('files_count') : 0);
  }


  // Uses the files table to do a findOne query
  findOne(query: FindOptions) {
    query = $.extend(query, { include: this.db.fileIncludes });
    return this.sync.then((db) => db.File.findOne(query));
  }

  // Uses the files table to do a findAll query
  findAll(query: FindOptions) {
    query = $.extend(query, { include: this.db.fileIncludes });
    return this.sync.then((db) => db.File.findAll(query));
  }


  // Uses findAll to return JSTree format from the File Table
  findAllJSTree() {
    const fileQuery: FindOptions<FileAttributes> = {
      attributes: ['id', 'path', 'parent', 'name', 'type']
    };
    return this.sync
      .then((db) => db.File.findAll(fileQuery))
      .then((files) => {
        const result = this.listToTreeData(files);
        return result;
      });
    

    // // When determining type for each file is important
    // type GenericModelValues = { fileId: DataTypes.IntegerDataType};
    // function prepareIdSet(values: Model<GenericModelValues, GenericModelValues>[]){
    //   const resultMapping = new Set<number>();
    //   values.forEach(value => resultMapping.add(Number(value.getDataValue('fileId'))));
    //   return resultMapping;
    // }
    // const pkgPromise = this.db.Package
    //   .findAll({attributes: ['fileId']})
    //   .then(prepareIdSet);
    // const approvedPromise = this.db.LicensePolicy
    //   .findAll({where: {label: 'Approved License'}, attributes: ['fileId']})
    //   .then(prepareIdSet);
    // const prohibitedPromise = this.db.LicensePolicy
    //   .findAll({where: {label: 'Prohibited License'}, attributes: ['fileId']})
    //   .then(prepareIdSet);
    // const recommendedPromise = this.db.LicensePolicy
    //   .findAll({where: {label: 'Recommended License'}, attributes: ['fileId']})
    //   .then(prepareIdSet);
    // const restrictedPromise = this.db.LicensePolicy
    //   .findAll({where: {label: 'Restricted License'}, attributes: ['fileId']})
    //   .then(prepareIdSet);

    // return Promise.all(
    //   [pkgPromise, approvedPromise, prohibitedPromise, recommendedPromise, restrictedPromise]
    // )
    //   .then(() => this.sync
    //   .then((db) => db.File.findAll(fileQuery))
    //   .then((files) => {
    //     const result = this.listToTreeData(files);
    //     console.log("pathtest", result);
    //     return result;
    //   }));
  }
  

  listToTreeData(fileList: Model<FileAttributes, FileAttributes>[]) {
    const pathToIndexMap = new Map<string, number>();
    const roots: Model<FileAttributes, FileAttributes>[] = [];

    fileList.forEach((file, i) => {
      // initialize the map
      pathToIndexMap.set(file.getDataValue('path'), Number(file.getDataValue('id')));

      // TODO
      const fileNode = file as any as DataNode;
  
      // initialize the children
      fileNode.key = file.getDataValue('path');
      // file.key = file.getDataValue('path');
      fileNode.children = [];
      fileNode.title = path.basename(file.getDataValue('path'));
      // if(Math.random() < 0.5)
      //   (fileNode as any).type =  "package";
    })
    
    fileList.forEach((file, i) => {
      const parentPath = file.getDataValue('parent').toString({});
      if (Number(file.getDataValue('id')) !== 0) {
        if(pathToIndexMap.has(parentPath)){

          // TODO
          // if you have dangling branches check that map[node.parentId] exists
          (fileList[pathToIndexMap.get(parentPath)] as any as DataNode)
            .children.push(file as unknown as DataNode);
        }
      } else {
        roots.push(file);
      }
    });

    roots.forEach(sortChildren);
    
    // console.log("pathtest Prepared tree", roots);
    return roots;
  }

  // TODO-Residue: Remove this
  determineJSTreeType(file: Model<FileAttributes, FileAttributes>, promises: Set<number>[]) {
    let type = '';

    const packages = promises[0] || new Set();
    const approvedPolicies = promises[1] || new Set();
    const prohibitedPolicies = promises[2] || new Set();
    const recommendedPolicies = promises[3] || new Set();
    const restrictedPolicies = promises[4] || new Set();

    const fileID = Number(file.getDataValue('id').toString({}));
    const fileType = file.getDataValue('type').toString({});

    if (packages.has(fileID)) {
      if (fileType === 'file') {
        type = 'packageFile';
      } else if (fileType === 'directory') {
        type = 'packageDir'; 
      }
    } else if (approvedPolicies.has(fileID)) {
      type = 'approvedLicense';
    } else if (prohibitedPolicies.has(fileID)) {
      type = 'prohibitedLicense';
    } else if (recommendedPolicies.has(fileID)) {
      type = 'recommendedLicense';
    } else if (restrictedPolicies.has(fileID)) {
      type = 'restrictedLicense';
    } else {
      type = fileType;
    }
    
    return type;
  }

  // Add rows to the flattened files table from a ScanCode json object
  addFromJson(
    jsonFileName: string,
    workbenchVersion: string,
    onProgressUpdate: (progress: number) => void,
  ): Promise<void> {
    if (!jsonFileName) {
      throw new Error('Invalid json file name: ' + jsonFileName);
    }
    // console.log("Adding from json with params", { jsonFileName, workbenchVersion, onProgressUpdate });
    
    const stream = fs.createReadStream(jsonFileName, {encoding: 'utf8'});
    const version = workbenchVersion;
    let headerId: number | null = null;
    let files_count: number | null = null;
    let dirs_count: number | null = null;
    let index = 0;
    let rootPath: string | null = null;
    let hasRootPath = false;
    const batchSize  = 1000;
    let files: any = [];    // TODO
    let progress = 0;
    let promiseChain: Promise<any> = this.sync;

    console.time('Load Database');
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const primaryPromise = this;    // TODO
      stream
        .pipe(JSONStream.parse('files.*'))
        .on('header', (header: any) => {
          if ('headers' in header) {
            // FIXME: This should be smarter
            const header_data = header.headers[0];
            header = {
              header_content: JSON.stringify(header_data, undefined, 2),
              files_count: header_data.extra_data.files_count
            };
          } else {
            header = {
              header_content: JSON.stringify(header, undefined, 2),
              files_count: header.files_count
            };
          }

          $.extend(header, {
            workbench_version: version,
            workbench_notice: 'Exported from ScanCode Workbench and provided on an "AS IS" BASIS, WITHOUT WARRANTIES\\nOR CONDITIONS OF ANY KIND, either express or implied. No content created from\\nScanCode Workbench should be considered or used as legal advice. Consult an Attorney\\nfor any legal advice.\\nScanCode Workbench is a free software analysis application from nexB Inc. and others.\\nVisit https://github.com/nexB/scancode-workbench/ for support and download."'
          });
          
          files_count = header.files_count;
          promiseChain = promiseChain
            .then(() => this.db.Header.create(header))
            .then((header) => headerId = Number(header.getDataValue('id')));
        })
        .on('data', function(file: any) {
          if (!rootPath) {
            rootPath = file.path.split('/')[0];
          }
          if (rootPath === file.path) {
            hasRootPath = true;
          }
          // TODO: When/if scancode reports directories in its header, this needs
          //       to be replaced.
          if (index === 0) {
            dirs_count = file.dirs_count;
          }
          file.id = index++;
          files.push(file);
          if (files.length >= batchSize) {
            // Need to set a new variable before handing to promise
            this.pause();
            // console.log("Batch create started");
            
            promiseChain = promiseChain
              .then(() => primaryPromise._batchCreateFiles(files, headerId))
              .then(() => {
                // console.log("batch create completed");
                
                const currProgress = Math.round(index / (files_count + dirs_count) * 100);
                if (currProgress > progress) {
                  progress = currProgress;
                  onProgressUpdate(progress);

                  console.log('Progress: ' + `${progress}% ` + `(${index}/(${files_count}+${dirs_count}))`);
                }
              })
              .then(() => {
                files = [];
                this.resume();
              })
              .catch((e: any) => reject(e));
          }
        })
        .on('end', () => {
          // Add root directory into data
          // See https://github.com/nexB/scancode-toolkit/issues/543
          promiseChain
            .then(() => {
              if (rootPath && !hasRootPath) {
                files.push({
                  path: rootPath,
                  name: rootPath,
                  type: 'directory',
                  files_count: files_count
                });
              }
            })
            .then(() => this._batchCreateFiles(files, headerId))
            .then(() => {
              console.timeEnd('Load Database');
              resolve();
            }).catch((e: any) => reject(e));
        })
        .on('error', (e: any) => reject(e));
    });
  }

  _batchCreateFiles(files: any, headerId: number) {
    // Add batched files to the DB
    return this._addFlattenedFiles(files)
      .then(() => {
        this._addFiles(files, headerId)
      });
  }

  _addFlattenedFiles(files: any) {
    // Fix for issue #232
    $.each(files, (i, file) => {
      if (file.type === 'directory' && Object.prototype.hasOwnProperty.call(file, 'size_count')) {
        file.size = file.size_count;
      }
    });
    files = $.map(files, (file) => flattenFile(file));
    return this.db.FlatFile.bulkCreate(files, {logging: false});
  }

  _addFiles(files: any, headerId: number) {
    const transactionOptions: TransactionOptions = {
      // logging: () => console.log("logging in _addFiles"),
      autocommit: false,
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
    };
    return this.sequelize.transaction(transactionOptions, (t) => {
      const options = {
        logging: () => DebugLogger("add file", "AddFiles transaction done !"),
        transaction: t
      };
      $.each(files, (i, file) => {
        // Fix for issue #232
        if (file.type === 'directory' && Object.prototype.hasOwnProperty.call(file, 'size_count')) {
          file.size = file.size_count;
        }
        file.parent = parentPath(file.path);
        file.headerId = headerId;
      });
      
      return this.db.File.bulkCreate(files, options)
        .then(() => DebugLogger("file processor", "Processed bulkcreate"))
        
        .then(() => this.db.License.bulkCreate(this._addExtraFields(files, 'licenses'), options))
        .then(() => DebugLogger("license processor", "Processed licenses"))

        .then(() => this.db.LicenseExpression.bulkCreate(this._addExtraFields(files, 'license_expressions'), options))
        .then(() => DebugLogger("license exp processor", "Processed license_exp"))

        .then(() => this.db.LicensePolicy.bulkCreate(this._addExtraFields(files, 'license_policy'), options)) 
        .then(() => DebugLogger("license policy processor", "Processed license_policy"))

        .then(() => this.db.Copyright.bulkCreate(this._addExtraFields(files, 'copyrights'), options))
        .then(() => DebugLogger("copyright processor", "Processed copyrights"))

        .then(() => this.db.Package.bulkCreate(this._addExtraFields(files, 'packages'), options))
        .then(() => DebugLogger("package processor", "Processed packages"))

        .then(() => this.db.Email.bulkCreate(this._addExtraFields(files, 'emails'), options))
        .then(() => DebugLogger("email processor", "Processed emails"))

        .then(() => this.db.Url.bulkCreate(this._addExtraFields(files, 'urls'), options))
        .then(() => DebugLogger("URL processor", "Processed urls"))

        .then(() => this.db.ScanError.bulkCreate(this._addExtraFields(files, 'scan_errors'), options))
        .then(() => DebugLogger("scan error processor", "Processed scan-errors"))

        .then(() => DebugLogger("file processor", "File processing completed !!!"));
    });
  }

  _addExtraFields(files: any, attribute: string) {
    return $.map(files, (file) => {
      if(!file){
        DebugLogger("add file", "invalid file", file);
      }

      if (attribute === 'copyrights') {
        return this._getNewCopyrights(file);
      } else if (attribute === 'license_policy') {
        return this._getLicensePolicy(file);
      }

      const fileAttr = file[attribute] || [];

        
      // console.log("File id", file.id);
      DebugLogger("add file", "Add extra field for attr:", attribute);
      
      return $.map(fileAttr, (value) => {
        if (attribute === 'license_expressions') {
          return {
            license_expression: value,
            fileId: file.id
          };
        } else if (attribute === 'scan_errors') {
          return {
            scan_error: value,
            fileId: file.id
          };
        }
        if(!file || !file.id)
          DebugLogger("add file", "Invalid file/file.id", file);
        value.fileId = file.id;
        return value;
      });
    });
  }

  _getLicensePolicy(file: any) {
    // if ($.isEmptyObject(file.license_policy)) {
    if (!file.license_policy || !Object.keys(file.license_policy).length) {
    // if ($.isEmptyObject(file.license_policy)) {
      return;
    }
    const license_policy = file.license_policy;
    license_policy.fileId = file.id;
    return license_policy;
  }

  _getNewCopyrights(file: any) {
    const statements = file.copyrights;
    const holders = file.holders;
    const authors = file.authors;
    
    const newLines: any[] = [];
    const newStatements: any[] = [];
    if (Array.isArray(statements)) {
      statements.forEach((statement) => {
        const value = statement['value'];
        if (!value) {
          return;
        }
        newStatements.push(value);

        const line = {
          start_line: statement['start_line'],
          end_line: statement['end_line'],
        };
        newLines.push(line);
      });
    }
    
    const newHolders: any = [];
    if (Array.isArray(holders)) {
      holders.forEach((holder) => {
        const value = holder['value'];
        newHolders.push(value);
      });
    }

    const newAuthors: any = [];
    if (Array.isArray(authors)) {
      authors.forEach((author) => {
        const value = author['value'];
        newAuthors.push(value);
      });
    }

    const newCopyrights = [];
    for (let i = 0; i < newStatements.length; i++) {
      const newCopyright = {
        statements: [newStatements[i]],
        holders: [newHolders[i]],
        // FIXME: this probably does not work correctly
        authors: newAuthors || [],
        start_line: newLines[0].start_line,
        end_line: newLines[0].end_line,
        fileId: file.id,
      };

      newCopyrights.push(newCopyright);
    }
    return newCopyrights;
  }
}