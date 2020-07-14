import React from 'react';
import './modal.scss';

export default function Modal(props) {
  return (
    <div className="modal">{ props.title }</div>
  )
}