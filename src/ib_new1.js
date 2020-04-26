import React from 'react';
import { Link, Route, useLocation } from 'react-router-dom';
import View from './View';

const Ib_new1 = ({ match, history }) => {
  const { id } = match.params;
  return (
    <div>
      <h3>인터넷방송</h3>
      
      <Route path={`${match.path}/:no`} component={View} />

      <ul>
        <li>
          <Link to={`${match.url}/1`}>velopert</Link>
        </li>
        <li>
          <Link to={`${match.url}/2`}>gildong</Link>
          link state로 넘겨준 id 값은 {id}
        </li>
      </ul>

      <Route
        path="/ib_new1"
        exact
        render={() => <div>유저를 선택해주세요.</div>}
      />
    </div>
  );
};

export default Ib_new1;