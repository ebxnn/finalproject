import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // or `next/router` for Next.js

const useAuth = () => {
  const history = useHistory();

  useEffect(() => {
    // Check if the user is authenticated (token exists in localStorage/sessionStorage)
    const token = localStorage.getItem('authToken'); // or use sessionStorage
    if (!token) {
      // If no token found, redirect to the login page
      history.push('/login'); // Replace with the route to your login page
    }
  }, [history]);
};

export default useAuth;
