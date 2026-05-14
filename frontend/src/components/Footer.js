import React from "react";
import './Footer.css';
import Facebook from '../Images/Facebook.png'
import Instagram from '../Images/Instagram.png'
import Twitter from '../Images/Twitter.png'

const Footer = () => {

    return (
        <>
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="footer-col">
            <h4>company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Services</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Get Help</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Refunds</a></li>
              <li><a href="#">Order Status</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Online Shop</h4>
            <ul>
              <li><a href="#">Future Products</a></li>
              <li><a href="#">Products</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>follow us</h4>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"><img src={Facebook} alt=""></img></i></a>
              <a href="#"><i className="fab fa-twitter"><img src={Instagram} alt=""></img></i></a>
              <a href="#"><i className="fab fa-instagram"><img src={Twitter} alt=""></img></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
        </>
    )
}

export default Footer;