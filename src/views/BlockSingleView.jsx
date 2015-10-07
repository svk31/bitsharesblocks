import React       from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/blockchainActions';
import { bindActionCreators } from 'redux';
import { Pager, PageItem } from 'react-bootstrap';

// We define mapStateToProps where we'd normally use the @connect
// decorator so the data requirements are clear upfront, but then
// export the decorated component after the main class definition so
// the component can be tested w/ and w/o being connected.
// See: http://rackt.github.io/redux/docs/recipes/WritingTests.html
// const mapStateToProps = (state) => ({
//   counter : state.counter
// });
@connect(state => ({
  blockchain: state.blockchain
}), dispatch => ({
  actionCreators: bindActionCreators(actionCreators, dispatch)
}))
export default class BlocksView extends React.Component {
  static propTypes = {
    dispatch : React.PropTypes.func,
    actionCreators: React.PropTypes.object,
    blockchain  : React.PropTypes.object,
    params  : React.PropTypes.object,
    history  : React.PropTypes.object
  }

  constructor () {
    super();
  }

  componentWillMount() {
    this._fetchBlock(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.height !== this.props.params.height) {
      this._fetchBlock(nextProps);
    }
  }

  _fetchBlock(props) {
    console.log('props:', props);
    if (!props.blockchain.blocks.get(props.params.height)) {
      props.actionCreators.fetchBlock(props.params.height);
    }
  }

  _goTo(height) {
    this.props.history.pushState(null, '/block/' + height);
  }

  render () {
    let {blockchain, params} = this.props;
    let block = blockchain.blocks.get(params.height);

    if (!block) {
      return (
        <div className='container text-center'>
          <h1>Block View</h1>
        </div>
      );
    }

    return (
      <div className='container text-center'>
        <h1>Block View</h1>
        <div>#{params.height}</div>
        <div>#{block.previous}</div>
        <Pager>
          {block.id > 1 ? <PageItem onClick={this._goTo.bind(this, block.id - 1)} previous>&larr; Previous Block</PageItem> : null}
          <PageItem onClick={this._goTo.bind(this, block.id + 1)} next>Next Block &rarr;</PageItem>
        </Pager>
      </div>
    );
  }
}
