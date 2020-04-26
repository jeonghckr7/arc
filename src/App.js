import React from 'react';
import { HashRouter, Route, Switch, Link } from 'react-router-dom';
import Home from './Home';
import Board from './board';

const App = () => {
  return (
    <HashRouter>
    <div>
      <ul>
        <li>
          <Link to="/">홈</Link> {/* Link로 새로 고침안된다 */}
        </li>
        <li>
          <Link to={{
            pathname: "/board/ib_new1",
            id: "ib_new1"
          }}
            >인터넷방송</Link>
        </li>
      </ul>
      <hr />
    	<Switch>
        <Route path="/" exact={true} component={Home} /> {/* exact / 일때만 표시* */}
        <Route path="/board/:id" component={Board} />
      </Switch>
    </div>
    </HashRouter>
  );
};

export default App;