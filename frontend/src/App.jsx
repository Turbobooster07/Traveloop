import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlanTrip from './pages/PlanTrip';
import BuildItinerary from './pages/BuildItinerary';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import Community from './pages/Community';
import TripListing from './pages/TripListing';
import SearchActivities from './pages/SearchActivities';
import DayWiseItinerary from './pages/DayWiseItinerary';
import TripNotes from './pages/TripNotes';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/build-itinerary" element={<BuildItinerary />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<EditProfile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/my-trips" element={<TripListing />} />
        <Route path="/search" element={<SearchActivities />} />
        <Route path="/day-itinerary" element={<DayWiseItinerary />} />
        <Route path="/notes" element={<TripNotes />} />
      </Routes>
    </Router>
  );
}

export default App;
