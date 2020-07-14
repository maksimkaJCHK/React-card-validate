import React from 'react';

export default function Input(props)  {
  let { title, bInput, params: { alarm, isAlarm, value, name }, iClass='row', cInputVal } = props;

  let changeInputVal = (e) => {
    cInputVal(e, name);
  };

  let blurInputVal = () => {
    bInput(name);
  }

  return (
    <div className={ iClass }>
      <label>{ title }</label>
      <input type='text' name = { name } value = { value } onChange = { changeInputVal } className= { alarm && isAlarm ? 'alarmInput' : null } onFocus = { changeInputVal } onBlur = { blurInputVal } />
      { alarm && isAlarm ? <div className='alarm'>{ alarm }</div> : null}
    </div>
  )
}