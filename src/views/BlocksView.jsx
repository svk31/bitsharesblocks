import React       from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/blockchainActions';
import { bindActionCreators } from 'redux';
import {Table} from 'react-bootstrap';
import moment from 'moment';
import {Link} from 'react-router';

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
    blockchain  : React.PropTypes.object
  }

  constructor () {
    super();
  }

  componentWillMount() {
    this.props.actionCreators.fetchBlocks();
    this.props.actionCreators.subHeadBlock();
  }

  componentWillUnmount() {
    this.props.actionCreators.unsubHeadBlock();
  }

  render () {
    // console.log('blocks', this.props);
    return (
      <div className='container text-center'>
        <h1>Blocks View</h1>
        <Table responsive striped condensed hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Witness id</th>
              <th># of transactions</th>
            </tr>
          </thead>
          <tbody>
            {this.props.blockchain.latestBlocks.map(block => {
              return (
                <tr key={block.id}>
                  <td><Link to={'/block/' + block.id}>{block.id}</Link></td>
                  <td>{moment(block.timestamp).format('h:mm:ss')}</td>
                  <td>{block.witness_name}</td>
                  <td>{block.trxCount}</td>
                </tr>
              );
            })}
          </tbody>

        </Table>
      </div>
    );
  }
}
