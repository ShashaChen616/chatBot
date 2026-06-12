import { Outlet, useNavigate } from 'react-router-dom';
import './dashboardLayout.css';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import ChatList from '../../components/chatList/ChatList';

const DashboardLayout = () => {


  const {isSignedIn, isLoaded} = useAuth();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);
  if (!isLoaded) return "Loading...";

  return (
    <div className="dashboardLayout">
      <div className="menu"><ChatList/></div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout;