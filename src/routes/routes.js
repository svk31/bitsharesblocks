import { Route }     from 'react-router';
import React         from 'react';
import CoreLayout    from 'layouts/CoreLayout';
import HomeView      from 'views/Home/HomeView';
import BlocksView    from 'views/BlocksView';
import BlockSingleView    from 'views/BlockSingleView';
import WitnessesView from 'views/WitnessesView';

export default (
  <Route component={CoreLayout}>
    <Route name='home' path='/' component={HomeView} />
    <Route name='blocks' path='/blocks' component={BlocksView} />
    <Route name='block' path='/block/:height' component={BlockSingleView} />
    <Route name='witnesses' path='/witnesses' component={WitnessesView} />
  </Route>
);
