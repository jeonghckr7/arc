import React, { useState, useEffect } from 'react';
import { Link, Route, useLocation } from 'react-router-dom';
import View from './View';
import { db, firebaseApp } from './firebase';
import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

const Board = ({ match, history }) => {
  const {id} = match.params;

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
        const result = await axios.get(cors_api_url + 'https://gall.dcinside.com/board/lists/?id=' + idboard + '&exception_mode=recommend');
        const html = result.data;
        const $ = cheerio.load(html);
        var results = $('table.gall_list').find('tr.us-post')
        
        results.each(function (i, result) {
          var gall_no = $(result).children('td.gall_num').text().trim();
          var gall_writer = $(result).children('td.gall_writer').text().trim();
          var gall_date = $(result).children('td.gall_date').text().trim();

          console.log("gall_no:" + gall_no);
          console.log("gall_writer:" + gall_writer);
          console.log("gall_date:" + gall_date);
          
          console.log("db.Timestamp:" + Date.now());
          const postsRef = db.ref("board");
          postsRef.orderByChild("wr_11").equalTo(gall_no).on("child_added", function(snapshot) {
            if (snapshot.val().gall_id === idboard){
              console.log("exists!", snapshot.val());
            } else {
                postsRef.push({
                  gall_id: idboard,
                  wr_11: gall_no,
                  wr_datetime: Date.now(),
                });              
                console.log("push!", snapshot.val());
            }
          });
        });
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
      postsRef.limitToLast(20).on("child_added", handleChildAdded)
      postsRef.on("child_removed", handleChildRemoved)      
      return () => {
        postsRef.off('child_added', handleChildAdded)
        postsRef.off("child_removed", handleChildRemoved)  
      }
  }, [])

  return (
      <div>
        <table>
          {console.log("dongname render")}
          {clients.reverse().map(iddata => ( 
            <tr>
              <td>{iddata.key}</td><td>{iddata.wr_11}</td><td>{moment(iddata.wr_datetime).format('LTS')}</td>  
            </tr>
          ))}
          </table>
      </div>
  );
}

export default Board;