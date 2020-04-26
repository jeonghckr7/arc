import React, { useState, useEffect } from 'react';
import { Link, Route, useLocation } from 'react-router-dom';
import View from './View';
import { db, firebaseApp } from './firebase';
import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

const Board = ({ match, history }) => {
  const {id} = match.params;
  const postsRef = db.ref("board");
  postsRef.once("value", function(snapshot) {
    if (snapshot.exists()) {

      snapshot.forEach(function(childSnapshot) {
          // key will be "ada" the first time and "alan" the second time
          var key = childSnapshot.key;
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          var chk_12 = Number(moment(childData.wr_12).format('ss'));
          var chk_now = Number(moment(Date.now()).format('ss'));
          var yourDate = new Date();
          console.log("wr_12 :"+chk_12+"wr_12 :"+chk_now);
          let secondsElapsed = moment().diff(childData.wr_12, 'seconds');
          console.log("secondsElapsed - " + secondsElapsed);

      });

    }  
  });

  return (
    <div>
      <h3>인터넷방송</h3>
      
      <Route path={`${match.path}/:no`} component={View} />

      <ul>
        {/*{viewData.map(({ id, name }) => (
          <li key={id}>
            <Link to={`${match.url}/${id}`}>{name}</Link>
          </li>
        ))}
        */}
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

      <IdBoard id={id}/>
      <ClientsDisplay/>

    </div>
  );
};

function IdBoard(id) {
    const idboard = id.id;
    console.log("IdBoard boardid: " + idboard);
    useEffect(() => {
      async function fetchData() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
        const result = await axios.get(cors_api_url + 'https://alltimelegend.net/' + idboard );
        const html = result.data;
        var result = /<div style=[\s\S]*?([^<]+?)<\/div><\/div>/i;
        //results.each(function (i, result) {
        //  var gall_no = $(result).children('div[class="bo_subject"]').text().trim();
        //  console.log(gall_no);
        //});
      }
      fetchData();
    }, [idboard]);
    return (
      <div>
      </div>
    );
}

function ClientsDisplay() {
    
  const [clients, setClients] = useState([])

  useEffect(() => {
    const postsRef = db.ref("board");
      
      const handleChildAdded = (snapshot) => {
          const client = snapshot.val()
          client.key = snapshot.key
          setClients(clients => [...clients, client]);
          console.log("child_added-> "+client.key + " " + snapshot.key +" "+snapshot.val().msg);
      }
      const handleChildRemoved = snapshot => {
          setClients(clients => clients.filter(client => client.key !== snapshot.key));
          console.log("removed tasks(msg.key): " + snapshot.key);
      };
      postsRef.orderByChild("wr_12").limitToLast(40).on("child_added", handleChildAdded)
      postsRef.on("child_removed", handleChildRemoved)      
      return () => {
        postsRef.off('child_added', handleChildAdded)
        postsRef.off("child_removed", handleChildRemoved)  
      }
  }, [])

  return (
      <div>
        <table>
          <tbody>
            {console.log("dongname render")}
            {clients.reverse().map((iddata, index) => (
              <Iddata
              iddata={iddata} key={index}
              />
            ))}
          </tbody>
        </table>
      </div>
  );
}
const Iddata = React.memo(function User({ iddata }) {
  console.log("render msg");

  return (
    <tr>
    <td>{iddata.key}</td><td>{iddata.wr_11}</td><td>{moment(iddata.wr_12).format('ss')}ss{moment(iddata.wr_12).format('ss')}</td><td>{moment(iddata.wr_datetime).format('LTS')}</td>  
    </tr>
  );
});
export default Board;