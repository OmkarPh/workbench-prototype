import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { IFloatingFilterParams, TextFilterModel } from 'ag-grid-community';

export interface CustomParams extends IFloatingFilterParams {
  suppressFilterButton: boolean;
  color: string;
}

const CustomFilterComponent = forwardRef((props: CustomParams, ref) => {
  const { parentFilterInstance, filterParams } = props;

  const optionValues: string[] = filterParams.colDef.filterParams?.options || [];

  const selectRef = useRef<HTMLSelectElement | null>(null);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      onParentModelChanged(parentModel: TextFilterModel){
        if(!selectRef.current)
          return;
          
        // When the filter is empty we will receive a null value here
        if (!parentModel) {
          selectRef.current.value = optionValues[0];
        } else {
          selectRef.current.value = parentModel.filter;
        }
      }
    }
  });

  function selectionChanged(value: string){
    if (value === optionValues[0]) {
      parentFilterInstance(instance => {
        instance.onFloatingFilterChanged('equals', null);
      });
      return;
    }
    parentFilterInstance(instance => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }

  return (
    <select
      ref={selectRef}
      className='filterComponent'
      defaultValue={optionValues[0]}
      onChange={e => selectionChanged(e.target.value)}
    >
      {
        optionValues.map(optionValue => (
          <option value={optionValue} key={optionValue}>
            { optionValue }
          </option>
        ))
      }
    </select>
  )
});

export default CustomFilterComponent;