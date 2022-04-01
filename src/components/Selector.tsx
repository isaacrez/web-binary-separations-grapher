import React from 'react'

function Selector(props: {label: string, options: any[], setValue: any, value: any}) {
  const options = props.options.map(v => <option value={v} key={v}>{v}</option>)
  const onChange = (e: any) => props.setValue(e.target.value)

  return (
    <div className="select-wrapper">
      <p>{props.label}:</p>
      <div className="select">
        <select value={props.value} onChange={onChange}>
          {options}
        </select>
      </div>
    </div>
  )
}

export default Selector;
