// LIBRARY
import React from 'react';
import { Link } from 'react-router';
import { Navbar, Nav, CollapsibleNav} from 'react-bootstrap';

// if (process.env.BROWSER) {
//   require('./_N.scss');
// }

export default class Header extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Navbar brand={<ul style={{listStyle: 'none', paddingTop: '10px'}}><li><Link to='/'><img src='assets/images/branding/bitsharesbocks-weblogo-medium.png' /></Link></li></ul>}>
          <CollapsibleNav eventKey={0} >
          <Nav navbar>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/blocks'>Blocks</Link></li>
            <li><Link to='/witnesses'>Witnesses</Link></li>
          </Nav>
          </CollapsibleNav>
        </Navbar>
    );
  }
}

Header.prototype.displayName = 'Header';
