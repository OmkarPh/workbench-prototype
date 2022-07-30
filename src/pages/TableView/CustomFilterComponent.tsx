import React from 'react'

const CustomFilterComponent = () => {
  const optionValues = [
    'abc',
    'opt2',
    'opt3',
    'def',
    'jkl',
  ]
  return (
    <select className='filterComponent'>
      {
        optionValues.map(optionValue => (
          <option value={optionValue}>
            { optionValue }
          </option>
        ))
      }
    </select>
  )
}

export default CustomFilterComponent