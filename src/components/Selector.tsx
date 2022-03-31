import React from 'react'

function Selector(props) {
  /*
  REQUIRED:
   options:   List of potential values
   setValue:  Value setter
   value:     Value set
  */
  const options = props.options.map(v => <option value={v} key={v}>{v}</option>)
  const onChange = e => props.setValue(e.target.value)

  return (
    <div>
      <select value={props.value} onChange={onChange}>
        {options}
      </select>
    </div>
  )
}

export default Selector;
