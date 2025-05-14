import React, { useState } from 'react'

function Popup() {
  const [include, setInclude] = useState(``);
  
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
  return (
    <div className='min-h-screen min-w-screen'>
      <form onSubmit={handleSubmitInc}>
        <input  type="text" onChange={(e)=>{setInclude(e.target.value)}} placeholder='include'/>
        <button type='submit'>filter</button>
      </form>
    </div>
  )
}

export default Popup