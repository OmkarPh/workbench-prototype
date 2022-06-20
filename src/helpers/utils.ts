import { shell } from "electron";
import * as $ from 'jquery';
import { DataType, DataTypes, StringDataType } from "sequelize/types";


/** Overrides original event and opens URL in default browser */
export function _openInDefaultBrowser(evt) {
  evt.preventDefault();
  shell.openExternal(evt.target.href);
}

/** Create anchor tag for URLs and opens in default browser */
export function anchorTag(href) {
  if (href) {
    return `<a href="${href}" onclick="Utils._openInDefaultBrowser(event)">${href}</a>`;
  }
  return '';
}

/**
 * Map each row to the given attribute value, and sanitize invalid values.
 *
 * This method is needed for two reasons:
 * 1) It converts null data (this includes empty arrays) to 'No Value Detected'
 * 2) It grabs the particular attribute from the value which represents a row
 *    in the database
 */
export function getAttributeValues(values, attribute) {
  const validatedValues = [];
  let attributeValue = null;
    
  for (let i = 0; i < values.length; i++) {
    attributeValue = values[i][attribute];
    const fileType = values[i].type;
    
    // dedupe entries to prevent overcounting files. See https://github.com/nexB/scancode-workbench/issues/285
    if (Array.isArray(attributeValue)) {
      attributeValue = Array.from(new Set(attributeValue));
    }  

    if (!Array.isArray(attributeValue) || attributeValue.length === 0) {
      attributeValue = [attributeValue];
    }

    for (let j = 0; j < attributeValue.length; j++) {
      const val = attributeValue[j];
      if (!Utils.isValid(val) && attribute === 'packages_type' && fileType === 'directory') {
        continue;
      }
      validatedValues.push(
        Utils.isValid(val) ?
          val : 'No Value Detected');
    }
  }
  return validatedValues;
}

export function isValid(value) {
  if (Array.isArray(value)) {
    return value.length > 0 &&
              value.every((element) => Utils.isValid(element));
  } else {
    return value !== null;
  }
}

/**
 * Opens a dialog to choose a file to open.
 *
 * @returns Promise with the name of the file to open.
 */
export function showOpenDialog(dialog, config) {
  return new Promise((resolve) => {
    dialog.showOpenDialog(config, (fileNames) => {
      resolve(fileNames || fileNames[0]);
    });
  });
}

/**
 * Opens a dialog to choose a file to save to.
 *
 * @returns Promise with the name of the file to save to.
 */
export function showSaveDialog(dialog, config) {
  return new Promise((resolve) => {
    dialog.showSaveDialog(config, (newFileName) => {
      resolve(newFileName);
    });
  });
}

export function limitChartData(data: [string | DataTypes.StringDataType, number][], limit: number) {
  // TODO: Use partitioning (like in quicksort) to find top "limit"
  // more efficiently.
  // Sort data by count
  return data.sort((a,b) => (a[1] > b[1]) ? 1 : -1)
    .map((dataPair, i) => {
      if (data.length - i >= limit) {
        return ['other', dataPair[1]];
      } else {
        return dataPair;
      }
    });
}

// Formats data for c3: [[key1, count1], [key2, count2], ...]
export function formatChartData(names: (string | DataTypes.StringDataType)[]) {
  // Sum the total number of times the name appears
  const count = new Map<string | StringDataType, number>();

  $.each(names, (i, name) => {
    count.set(name, (count.get(name) || 0) + 1);
  });

  console.log(Array.from(count.entries()));

  return Array.from(count.entries());
}