import React from 'react'
import "../components/scss/footer.scss"

export const Header = () => {
  return (
    <div className='Header'>
      <h1>{"{GadiWala}"}</h1>
    </div>
  )
}

export const Footer = () => {
  return (
    <div className='Footer'>
      
      <a href="https://www.instagram.com/sridhant_07z/" target="_blank" rel="noopener noreferrer">
        <h1>{'{SRIDHANT}'}</h1>
      </a>

      <p>Made with sincerity and 🩷 </p>
    </div>
  )
}

export const Warning = () => {
    return(
        <div className="warn">
            <p>Note : If you feel the prices are mismatched just re-calculate AI model can make mistakes too</p>
        </div>
    )
}

export const Slide = ({ onSlide }) => {
  return (
    <div className="slide">
      <button onClick={onSlide}>⌯⌲</button>
    </div>
  );
};



