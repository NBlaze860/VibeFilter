import React, { useState } from 'react'

function Popup() {
  const [include, setInclude] = useState(``);
  const [notInclude, setNotInclude] = useState(``);
  const [eitherOr, setEitherOr] = useState(``);
  
  const handleSubmitInc = (e) => {
    e.preventDefault()
    try {
      chrome.runtime.sendMessage({
        inc: include 
      })
    } catch (error) {
      console.log("error in include submit: " + error)
    }
  }
  const handleSubmitNotInc = (e) => {
    e.preventDefault()
    try {
      chrome.runtime.sendMessage({
        notInc: notInclude 
      })
    } catch (error) {
      console.log("error in notInclude submit: " + error)
    }
  }
    const handleSubmitEitherOr = (e) => {
    e.preventDefault()
    try {
      chrome.runtime.sendMessage({
        eitherOr: eitherOr 
      })
    } catch (error) {
      console.log("error in eitherOr submit: " + error);
    }
  }
  return (
    <div className='min-h-screen min-w-screen flex flex-col gap-2'>
      <form onSubmit={handleSubmitInc}>
        <input  type="text" onChange={(e)=>{setInclude(e.target.value)}} placeholder='include'/>
        <button type='submit'>filter</button>
      </form>
      <form onSubmit={handleSubmitNotInc}>
        <input  type="text" onChange={(e)=>{setNotInclude(e.target.value)}} placeholder='do not include'/>
        <button type='submit'>filter</button>
      </form>
      <form onSubmit={handleSubmitEitherOr}>
        <input  type="text" onChange={(e)=>{setEitherOr(e.target.value)}} placeholder='either or'/>
        <button type='submit'>filter</button>
      </form>
    </div>
  )
}

export default Popup