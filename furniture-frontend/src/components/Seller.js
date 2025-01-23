import React from 'react';
import './SellerDashboard.css';

const Seller = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-menu">
          <a href="/" className="active">Overview</a>
          <a href="/">Sales</a>
          <a href="/stocks">Stock</a>
          <a href="/">Settings</a>
          <a href="/">Sign out</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Overview</h1>
        </header>

        <div className="dashboard-cards">
          <div className="card">
            <h3>Revenue</h3>
            <p>R2,558,683.25</p>
          </div>
          <div className="card">
            <h3>Units sold</h3>
            <p>2322</p>
          </div>
          <div className="card">
            <h3>Average order value</h3>
            <p>R1,101.93</p>
          </div>
          <div className="card">
            <h3>Returns</h3>
            <p>60</p>
          </div>
        </div>

        <div className="dashboard-details">
          <div className="revenue-chart">
            <h2>Revenue</h2>
            {/* Placeholder for chart */}
            <div className="chart-placeholder">[Chart Placeholder]</div>
          </div>
          
          <div className="low-stock">
            <h2>Low Stock</h2>
            <p>Products that require replenishments</p>
            <div className="low-stock-details">
              <p>Require Orders: <span>21 products</span></p>
              <p>Out Of Stock: <span>3 products</span></p>
              <button>Details</button>
            </div>
          </div>
        </div>

        <div className="additional-info">
          <div className="top-products">
            <h2>Top Products</h2>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Revenue</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jack & Jason's Pancakes & Waffles</td>
                  <td>R334,030</td>
                  <td>134</td>
                </tr>
                <tr>
                  <td>Betty Crocker</td>
                  <td>R293,250</td>
                  <td>174</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="recent-sales">
            <h2>Recent Sales</h2>
            <ul>
              <li>
                <span>1h ago</span> <span>Eggs and ham</span>
              </li>
              <li>
                <span>3h ago</span> <span>Dr. Oetker</span>
              </li>
              <li>
                <span>4h ago</span> <span>Jiffy mix</span>
              </li>
              <li>
                <span>Today at 15:39</span> <span>Martha White</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seller;
