import React from 'react'

function Selector(props: {options: any[], setValue: any, value: any}) {
  const options = props.options.map(v => <option value={v} key={v}>{v}</option>)
  const onChange = (e: any) => props.setValue(e.target.value)

  return (
    <div className="select">
      <select value={props.value} onChange={onChange}>
        {options}
      </select>
    </div>
  )
}

export default Selector;
