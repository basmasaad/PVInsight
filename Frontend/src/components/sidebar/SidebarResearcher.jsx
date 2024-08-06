import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/SettingsSystemDaydreamOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {

    //console.log(localStorage.getItem('username'))
    //console.log(localStorage.getItem('token'))
    //console.log(localStorage.getItem('roles'))

    // Clear authentication-related data from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
  
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/researcher" style={{ textDecoration: "none" }}>
          <span className="logo">Researcher</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <Link to="/researcher" style={{ textDecoration: "none" }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </Link>

          
          <p className="title">USEFUL</p>
          
          <li>
            <NotificationsNoneIcon className="icon" />
            <span>Notifications</span>
          </li>
         
          
          <p className="title">USER</p>
          <li>
            <AccountCircleOutlinedIcon className="icon" />
            <span>Profile</span>
          </li>
            <li onClick={handleLogout}>
              <ExitToAppIcon className="icon" />
              <span>Logout</span>
            </li>
            <p className="title">LISTS</p>
          <Link to="/researcher/Contactez-nous" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Contactez-nous</span>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
