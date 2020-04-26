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
        {/*<ClientsDisplay/>*/}
    </div>
  );
};

function NoIdBoard(id, no, newPostKey) {
  const idboard = id.id;
  const noidboard = id.no;
  const keyidboard = id.newPostKey;
  console.log("idboard: " + idboard+ "noidboard: " + noidboard + "newPostKey" + keyidboard);
/*  async function fetchIdData() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    try {
      const result = await axios.get(cors_api_url + 'https://gall.dcinside.com/board/view/?id=' + idboard + '&no=' + noidboard +'&exception_mode=recommend');
    
      const html = result.data;
      var pattern2 = /<div style=[\s\S]*?([^<]+?)<\/div><\/div>/i;

      var wr_content = pattern2.exec(html);
      wr_content = wr_content[0].replace('<div style="overflow:hidden;">', ''); 
      wr_content = wr_content.replace('</div></div>', '');
      console.log(wr_content);
      
      var $ = cheerio.load(html);
      var wr_subject = $("span.title_subject").text();
      var mb_id = $("span.nickname").eq(0).text();
      console.log(wr_subject+" id: " + mb_id);
      var postData = {
        wr_subject: wr_subject,
        mb_id: mb_id,
        wr_content: wr_content
      };
      const postsRef = db.ref("board");
      postsRef.child(keyidboard).update(postData)
    }
    catch {

    }
  }
  fetchIdData();
  return (
    <div>
    </div>
  );
*/
}

function IdBoard(id) {
  const idboard = id.id;
  console.log("IdBoard boardid: " + idboard);


  async function fetchIdData(id, noidboard, keyidboard) {
    console.log("idboard: " + idboard+ "noidboard: " + noidboard + "newPostKey" + keyidboard);
      // eslint-disable-next-line react-hooks/rules-of-hooks
/*    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    try {
      const result = await axios.get(cors_api_url + 'https://gall.dcinside.com/board/view/?id=' + idboard + '&no=' + noidboard +'&exception_mode=recommend');
    
      const html = result.data;
      var pattern2 = /<div style=[\s\S]*?([^<]+?)<\/div><\/div>/i;

      var wr_content = pattern2.exec(html);
      wr_content = wr_content[0].replace('<div style="overflow:hidden;">', ''); 
      wr_content = wr_content.replace('</div></div>', '');
      console.log(wr_content);
      
      var $ = cheerio.load(html);
      var wr_subject = $("span.title_subject").text();
      var mb_id = $("span.nickname").eq(0).text();
      console.log(wr_subject+" id: " + mb_id);
      var postData = {
        wr_subject: wr_subject,
        mb_id: mb_id,
        wr_content: wr_content
      };
      const postsRef = db.ref("board");
      postsRef.child(keyidboard).update(postData)
    }
    catch {

    }

  */
     return "noiddata"
  }


    async function fetchData() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
      try {
        const result = await axios.get(cors_api_url + 'https://gall.dcinside.com/board/lists/?id=' + idboard + '&exception_mode=recommend');
      
        const html = result.data;
        const $ = cheerio.load(html);
        var results = $('table.gall_list').find('tr.us-post')
        
        results.each(function (i, result) {
          var gall_no = $(result).children('td.gall_num').text().trim();
          var gall_writer = $(result).children('td.gall_writer').text().trim();
          var gall_date = $(result).children('td.gall_date').text().trim();

//            console.log("gall_no:" + gall_no);
          //console.log("gall_writer:" + gall_writer);
          //console.log("gall_date:" + gall_date);
          
          const postsRef = db.ref("board_");
          postsRef.orderByChild("/wr_11").equalTo(gall_no).limitToLast(1).once("value", function(snapshot) {
            if (snapshot.exists()) {
              snapshot.forEach(function(snapshot) {
                if (snapshot.val().gall_id === idboard) {  
                  console.log("똑같은 데이타가 있어요 ~ gall_no:" + gall_no + " wr_11: " + snapshot.val().wr_11);
                } else {
                  var newPostKey = postsRef.push().key;
                  console.log("똑같은 데이타가 없네요" + newPostKey)
                }
              })
            } else {
              var newPostKey = postsRef.push().key;
              postsRef.push()
              .set({
                gall_id: idboard,
                wr_11: gall_no,
                wr_12: Date.now(),
                wr_datetime: Date.now(),
              })
              .then(() => {
                console.log("newPostKey: " + newPostKey);
                //NoIdBoard(idboard, gall_no, newPostKey)
              })
              .catch((error) => {
                console.log(error);
              });
              //var newPostKey = postsRef.push().key;
            }
          });
        });
      }
      catch {

      }
    }

    const postsRef = db.ref("board");
    postsRef.orderByChild("/wr_12").limitToLast(1).once("value", function(snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            //console.log(childSnapshot.val()+" "+childData.wr_12)
            let secondsElapsed = moment().diff(childData.wr_12, 'seconds');
              if (secondsElapsed > 1) {
                console.log(secondsElapsed+ " 초가 지났습니다.")
                fetchData();
              }
        })
      } else {
        console.log("데이타가 없습니다.")
        fetchData();
      }
    }); 

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