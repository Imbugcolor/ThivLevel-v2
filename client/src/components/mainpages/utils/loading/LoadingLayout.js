import React from 'react'

function LoadingLayout() {
  return (
    <div className="position-fixed w-100 h-100 text-center loading-layout" 
        style={{background: '#0008', color: 'white', top: 0, left: 0, zIndex: 50}}>
        <div className="lds-spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
    </div>
  )
}

export default LoadingLayout