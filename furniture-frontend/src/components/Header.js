import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { GoHeart } from "react-icons/go";
import { IoBagHandleOutline } from "react-icons/io5";
import { AiOutlineSearch } from "react-icons/ai";
import logo1 from '../assets/logo1.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Dropdown = ({ isOpen, toggleDropdown, loggedIn, handleLogout }) => (
    <div className="dropdown-container">
        <div className="dropbtn" onClick={toggleDropdown}>
            <CgProfile size={20} />
            <span className="icon-label">PROFILE</span>
        </div>
        {isOpen && (
            <div className="dropdown-content">
                {loggedIn ? (
                    <>
                        <Link to="/profile" className="dropdown-item">
                            <CgProfile size={20} />
                            Profile View
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item">
                            <CgProfile size={20} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="dropdown-item">
                            <CgProfile size={20} />
                            Login
                        </Link>
                        <Link to="/signup" className="dropdown-item">
                            <CgProfile size={20} />
                            Signup
                        </Link>
                    </>
                )}
            </div>
        )}
    </div>
);

const Header = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    useEffect(() => {
        const isLoggedIn = !!localStorage.getItem('authToken');
        setLoggedIn(isLoggedIn);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setLoggedIn(false);
        toast.success("Logging out...");
        setTimeout(() => navigate('/login'), 2000);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery) return;
    
        // Redirect to search results page with the query
        navigate(`/search?query=${searchQuery}`);
    };

    return (
        <>
            <header className="header-container navbar navbar-expand-lg navbar-light">
                <div className="container d-flex align-items-center justify-content-between">
                    <div className="navbar-brand">
                        <Link to="/" className="logo-link">
                            <img src={logo1} alt="Company Logo" className="logo" />
                        </Link>
                    </div>

                    <nav className="navbar-nav mx-auto">
                        <ul className="nav d-flex align-items-center">
                            <li className="nav-item">
                                <Link to="/products" id="furniture" className="nav-link">DISCOVER</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/lighting" className="nav-link">LIGHTING</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/decoration" className="nav-link">DECORATION</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/furniture" className="nav-link">FURNITURE</Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="d-flex align-items-center">
                        <form className="search-bar" onSubmit={handleSearch}>
                            <AiOutlineSearch size={20} className="search-icon" />
                            <input
                                id="searchBox"
                                type="text"
                                className="search-input"
                                placeholder="Search for products, brands and more"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        <ul className="navbar-nav ml-auto d-flex align-items-center">
                            <li className="nav-item text-center">
                                <Dropdown
                                    isOpen={isDropdownOpen}
                                    toggleDropdown={toggleDropdown}
                                    loggedIn={loggedIn}
                                    handleLogout={handleLogout}
                                />
                            </li>
                            <li className="nav-item text-center">
                                <Link to="/wishlist" className="nav-link">
                                    <GoHeart size={20} />
                                    <span className="icon-label">Wishlist</span>
                                </Link>
                            </li>
                            <li className="nav-item text-center">
                                <Link to="/cart" className="nav-link">
                                    <IoBagHandleOutline size={20} />
                                    <span className="icon-label">Bag</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* Render search results */}
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((product) => (
                            <Link key={product._id} to={`/product/${product._id}`} className="search-result-item">
                                <p>{product.name}</p>
                                <p>${product.price}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </header>
            <ToastContainer />
        </>
    );
};

export default Header;
