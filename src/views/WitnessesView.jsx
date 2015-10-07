import React       from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/witnessActions';
import { bindActionCreators } from 'redux';
import {Table} from 'react-bootstrap';
import {Link} from 'react-router';
import format from '../utils/format';

@connect(state => ({
  accounts: state.accounts,
  dynGlobalObject: state.blockchain.dynGlobalObject
}), dispatch => ({
  actionCreators: bindActionCreators(actionCreators, dispatch)
}))
export class WitnessesView extends React.Component {
  static propTypes = {
    dispatch : React.PropTypes.func,
    actionCreators: React.PropTypes.object,
    accounts  : React.PropTypes.object,
    dynGlobalObject  : React.PropTypes.object
  }

  constructor () {
    super();
    this.state = {
      sortBy: 'total_votes',
      inverseSort: false
    };
  }

  componentWillMount() {
    this.props.actionCreators.fetchWitnesses();
    this.props.actionCreators.subWitness();
  }

  componentWillUnmount() {
    this.props.actionCreators.unSubWitness();
  }

  _setSort(field) {
    this.setState({
      sortBy: field,
      inverseSort: field === this.state.sortBy ? !this.state.inverseSort : this.state.inverseSort
    });
  }

  render () {
    let {accounts, dynGlobalObject} = this.props;
    let {sortBy, inverseSort} = this.state;

    let rows = null;
    // let witnesses = [];
    if (accounts && accounts.witnesses) {
      let witnessArray = [...accounts.witnesses].sort((a, b) => {
        return parseInt(b[1].total_votes, 10) - parseInt(a[1].total_votes, 10);
      });

      witnessArray.forEach((witness, idx) => {
        witness[1].rank = idx + 1;
        witness[1].pay = witness[1].balance.amount;

        if (dynGlobalObject.witness === witness[0]) {
          witness[1].isCurrent = true;
        } else {
          witness[1].isCurrent = false;
        }
      });

      rows = witnessArray
      .sort((a, b) => {
        switch (sortBy) {

        case 'name':
          break;

        default:
          return !inverseSort ? parseInt(b[1][sortBy], 10) - parseInt(a[1][sortBy], 10) : parseInt(a[1][sortBy], 10) - parseInt(b[1][sortBy], 10);
        }
      })
      .map(witness => {
        let className = witness[1].isCurrent ? 'success' : null;
        return (
          <tr key={witness[1].name} className={className}>
            <td>{witness[1].rank}</td>
            <td><Link to={'/witness/' + witness[1].name}>{witness[1].name}</Link></td>
            <td>{format.number(witness[1].last_aslot, 0)}</td>
            <td>{format.number(witness[1].last_conf, 0)}</td>
            <td>{format.number(witness[1].total_missed, 0)}</td>
            <td>{format.number(witness[1].total_votes / 100000, 0)} CORE</td>
            <td>{format.number(witness[1].balance.amount / 100000, 0)} CORE</td>
            <td>{witness[1].isCurrent ? 'Yes' : 'No'}</td>
          </tr>
        );
      });
    }

    return (
      <div className='container text-center'>
        <Table responsive striped condensed hover>
          <thead>
            <tr>
              <th onClick={this._setSort.bind(this, 'rank')}>Rank</th>
              <th>Name</th>
              <th onClick={this._setSort.bind(this, 'last_aslot')}>Last slot</th>
              <th onClick={this._setSort.bind(this, 'last_conf')}>Last confirmed block</th>
              <th onClick={this._setSort.bind(this, 'total_missed')}>Total missed</th>
              <th onClick={this._setSort.bind(this, 'total_votes')}>Votes</th>
              <th onClick={this._setSort.bind(this, 'pay')}>Pay</th>
              <th>Current</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>

        </Table>
      </div>
    );
  }
}

export default WitnessesView;
