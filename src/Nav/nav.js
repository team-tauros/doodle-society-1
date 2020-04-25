/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import styled from 'styled-components';
import { GoogleLogout } from 'react-google-login';

const Styles = styled.div`
  .navbar {
    background-color: #08e8de;
  }
  a,
  .navbar-brand,
  .navbar-nav .nav-link {
    color: #000;
    &:hover {
      color: white;
    }
  }
`;
const NavigationBar = ({
  user, setUser, setFriends, setDoods, getAllDoods,
}) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <Styles>
    <Navbar expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Item>
            <Link className="navlink" to="/home" onClick={getAllDoods}>Home</Link>
          </Nav.Item>
          <Nav.Item>
            <Link
              className="navlink"
              to={{
                pathname: '/profile',
                user,
              }}
            >
              Profile
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link className="navlink" to="/photogallery">Upload</Link>
          </Nav.Item>
          {/* <Nav.Item>
              {user.id !== null ? <Link className="navlink" to="/search">Search</Link> : null}
            </Nav.Item> */}
          {user.id
            && (
            <Nav.Item>
              <GoogleLogout
                clientId="847322546124-r3jf05c1p89vlk3g6jbrbsv0632mh4go.apps.googleusercontent.com"
                render={(renderProps) => <Link className="navlink" to="/" onClick={renderProps.onClick}>Logout</Link>}
                onLogoutSuccess={() => {
                  setUser({ id: null });
                  setFriends([]);
                  setDoods({});
                }}
              />
            </Nav.Item>
            )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  </Styles>
);

export default NavigationBar;
