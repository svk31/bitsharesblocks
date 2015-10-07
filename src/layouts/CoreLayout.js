import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HtmlHeaderTags from '../document/HtmlHeaderTags';
import * as actionCreators from '../actions/blockchainActions';
import 'styles/core.scss';

// COMPONENTS
import Header from '../views/Header/Header';

@connect(state => ({
  state: state
}), dispatch => ({
  actionCreators: bindActionCreators(actionCreators, dispatch)
}))
export default class CoreLayout extends React.Component {
  static propTypes = {
    children : React.PropTypes.element,
    actionCreators: React.PropTypes.object
  }

  constructor () {
    super();
  }

  componentWillMount() {
    this.props.actionCreators.subDynGlobal();
  }

  render () {
    return (
      <div className='page-container'>
        <HtmlHeaderTags />
        <Header />
        <div className='view-container'>
          {this.props.children}
        </div>
      </div>
    );
  }
}
