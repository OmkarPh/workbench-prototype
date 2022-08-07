import React, { useMemo } from 'react'

interface ListCellRendererProps {
  value: string,
}

const ListCellRenderer = (props: ListCellRendererProps) => {

  const parsedValue: string[][] | string[] | string = useMemo(() => {
    try {
      const parsed = JSON.parse(props.value)
      return parsed
    } catch(err) {
      console.log("Err parsing list cell");
      return props.value
    }
  }, [props.value]);
  

  if(!parsedValue)
    return props.value;
  
  if(!Array.isArray(parsedValue))
    return props.value;

  return (
    <>
      {
        parsedValue.map ?
        parsedValue.map((subValues, i) => (
          <span key={i}>
            {
              Array.isArray(subValues) ?
              subValues.map((value, j) => (
                <span key={j}>
                  { value } <br/>
                </span>
              ))
              : subValues
            }
            <br/>
          </span>
        ))
        : props.value
      }
      <br/>
    </>
  )
}

export default ListCellRenderer