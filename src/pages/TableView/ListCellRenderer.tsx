import React, { useMemo } from 'react'

interface ListCellRendererProps {
  value: string,
}

const ListCellRenderer = (props: ListCellRendererProps) => {
  //   console.log(params.value, typeof params.value);
  //   let parsedValue: string[][] = [];
  //   try {
  //     console.log(parsedValue);
  //     parsedValue = JSON.parse(params.value);
  //     return parsedValue.map((statement: string[]) => statement.join('<br/>')).join('\n');
  //   } catch (err) {
  //     console.log("Err formatting value:", err);
  //     return "";
  //   }
  // }

  const parsedValue: string[][] = useMemo(() => JSON.parse(props.value), [props.value]);
  console.log(parsedValue);
  
  return (
    <>
      {
        parsedValue.map(subValues => (
          <>
            {
              subValues.map(value => (
                <>
                  { value } <br/>
                </>
              ))
            }
            <br/>
          </>
        ))
      }
      <br/>
    </>
  )
}

export default ListCellRenderer