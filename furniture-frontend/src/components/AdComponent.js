import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdComponent.css';
import ad1 from '../assets/ad1.jpeg';
import blackad from '../assets/blackad.jpg';
import bed1 from '../assets/bed1.jpg';
import table from '../assets/table.jpg';

const AdComponent = () => {
    return (
        <div className="ad-carousel-container">
            <Carousel>
                <Carousel.Item>
                    <div className="ad-container" style={{ backgroundImage: `url(${blackad})` }}>
                        <div className="ad-content">
                            <p className="ad-subtitle">NOW ON SALE!</p>
                            <h1 className="ad-title">DESK DECOR</h1>
                            <p className="ad-description">
                                Find the perfect decor for your desk. Explore our extensive and varied range.
                            </p>
                            {/* <button className="ad-button">SHOP NOW</button> */}
                        </div>
                    </div>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="ad-container" style={{ backgroundImage: `url(${bed1})` }}>
                        <div className="ad-content">
                            <p className="ad-subtitle">LIMITED OFFER!</p>
                            <h1 className="ad-title">MODERN LIGHTING</h1>
                            <p className="ad-description">
                                Illuminate your space with our trendy and stylish lighting options.
                            </p>
                            {/* <button className="ad-button">SHOP NOW</button> */}
                        </div>
                    </div>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="ad-container" style={{ backgroundImage: `url(${ad1})`  }}>
                        <div className="ad-content">
                            <p className="ad-subtitle">EXCLUSIVE!</p>
                            <h1 className="ad-title">HOME FURNITURE</h1>
                            <p className="ad-description">
                                Upgrade your home with our exclusive range of furniture.
                            </p>
                            {/* <button className="ad-button">SHOP NOW</button> */}
                        </div>
                    </div>
                </Carousel.Item>
            </Carousel>
        </div>
    );
};

export default AdComponent;
