import { Link, NavLink } from 'react-router-dom';
import './chatList.css';
import { useQuery } from '@tanstack/react-query';
import { RiChatNewLine } from "react-icons/ri";
import { CiSquareChevLeft, CiSquareChevRight } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { LuPhone } from "react-icons/lu";
import { useState } from 'react';


const ChatList = () => {

  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  const { isPending, error, data } = useQuery({
    queryKey: ['userChats'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) =>
        res.json(),
      ),
  });

  const result = [...(data ?? [])].reverse();

  return (
    <div className={`chatList ${isOpen ? "expanded" : "collapsed"}`}>

      {/* Add a toggle button */}
      <button className='toggleBtn' onClick={toggleSidebar}>
        {isOpen ? <CiSquareChevLeft /> : <CiSquareChevRight />}
      </button>

      <span className='title'>
        {isOpen && "DASHBOARD"}
      </span>
      <Link to="/dashboard">
        <span className='icon'><RiChatNewLine /></span>
        {isOpen && "New Chat"}
      </Link>
      <Link to="/">
        <span className='icon'><IoSearch /></span>
        {isOpen && "Explore"}
      </Link>
      <Link to="/">
        <span className='icon'><LuPhone /></span>
        {isOpen && "Contact"}
      </Link>

      <hr />
      {isOpen && <><span className='title'>
        RECENT CHATS
      </span>
        <div className="list">
          {isPending
            ? "Loading..."
            : error
              ? "Something went wrong!"
              : result?.map((chat) => (
                <NavLink
                  to={`/dashboard/chats/${chat._id}`}
                  key={chat._id}
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }>
                  <span>{chat.title}</span>
                </NavLink>
              ))}
        </div>
      
      <hr /></>
      }
      {isOpen && (
        <div className="upgrade">
          <img src="/logo.png" alt="" />
          <div className="texts">
            <span>Upgrade to Premium</span>
            <span>Unlock all features</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;