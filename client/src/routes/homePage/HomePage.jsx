import { Link } from 'react-router-dom';
import './homePage.css';
import { TypeAnimation } from 'react-type-animation';
//import { useState } from 'react';

const HomePage = () => {

  //const [typingStatus, setTypingStatus] = useState('human1');

  // const test = async () => {
  //   await fetch("http://localhost:3000/api/test", {
  //     credentials: "include",
  //   });
  // };

  return (
    <div className="homePage">
      <img src="/orbital.png" alt='' className='orbital' />
      <div className='left'>
        <h1>Mimi Chatbot</h1>
        <h2>Your AI Assistant
          <br />₍^. .^₎⟆
        </h2>
        <h3>Experience the future of AI-powered assistance</h3>
        <h3>
          <Link to="/dashboard">Get Started</Link>
          {/* <button onClick={test}>TEST BACKEND AUTH</button> */}
        </h3>
      </div>
      <div className='right'>
        <div className='imgContainer'>
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="" className='bot' />
          <div className="chat">
            {/* <img src={typingStatus === "human1" ? "/human1.jpeg" : typingStatus === "human2" ? "/human2.jpeg" : "/bot.png"} alt="" /> */}
            <img src={"/logo2.png"} alt="" />
            <TypeAnimation
              sequence={[
                'Meow~',
                2000, () => {
                },
                'Meow Meow~',
                2000, () => {
                },
                'Meow Meow Meow~',
                2000, () => {
                },
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </div>
        </div>
      </div>
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to='/'>Terms of Service</Link>
          <span>|</span>
          <Link to='/'>Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage;