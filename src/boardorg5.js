import React, { useState, useEffect } from 'react';
import { Link, Route, useLocation } from 'react-router-dom';
import View from './View';
import { st, sdb, db, firebaseApp } from './firebase';
import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import queryString from 'query-string';

const Board = ({ match, history }) => {
  const {id} = match.params;
  const location = useLocation();

  console.log(queryString.parse(location.search));

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
        {/*<ClientsDisplay id={id}/>*/}
        {window.location.search.substring(1)}
    </div>
  );
};

function NoIdBoard(id, no, newPostKey) {
  const idboard = id;
  const noidboard = no;
  const keyidboard = newPostKey;

  const postsRef = sdb.collection("board");

  //alert("idboard: " + id+ "noidboard: " + no + "newPostKey" + newPostKey);
  
    // eslint-disable-next-line react-hooks/rules-of-hooks
    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    axios.get(cors_api_url + 'https://gall.dcinside.com/board/view/?id=' + idboard + '&no=' + noidboard +'&exception_mode=recommend')
    .then(function(iresult) {
      const html = iresult.data;
      var pattern2 = /<div style=[\s\S]*?([^<]+?)<\/div>/i;
      var wr_content = pattern2.exec(html);
      wr_content = wr_content[0].replace('<div style="overflow:hidden;">', ''); 
      wr_content = wr_content.replace('</div></div>', '');
      alert(wr_content);
      console.log(wr_content);
      var $ = cheerio.load(html);
      var wr_subject = $("span.title_subject").text();
      var mb_id = $("span.nickname").eq(0).text();
      
      //alert(mb_id + wr_subject);
      //console.log(wr_subject+" id: " + mb_id);
      //var postData = {
      //  wr_subject: wr_subject,
      //  mb_id: mb_id,
      //  wr_content: wr_content,
      //  wr_datetime: Date.now(),
      //  uid: newPostKey
      //};
      //postsRef.child(keyidboard).update(postData)
      
    }).catch(function (error) {
      console.error("error status는? "+ error.response.status);
      postsRef.child(newPostKey).remove()
        .then(() => {
          console.log("remove key-> " + newPostKey);
        })
    });
  return (
    <div>
    </div>
  );
}

function IdBoard(id) {
  const idboard = id.id;
  console.log("IdBoard boardid: " + idboard);

  const postsRef = sdb.collection("board").doc(idboard);
  const [inputs, setInputs] = useState(0);
    async function fetchData() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
      
      await axios.get(cors_api_url + 'https://gall.dcinside.com/board/lists/?id=' + idboard + '&exception_mode=recommend')
      .then(function(result) {
        console.log("axios 돌려요")
        const html = result.data;
        const $ = cheerio.load(html);

        var counteach = 0;

        var results = $('table.gall_list').find('tr.us-post')
        results.each(function (i, result) {
          var gall_no = $(result).children('td.gall_num').text().trim();
         
          console.log("conteach: " + counteach)
          console.log(idboard + " "+ gall_no);

            postsRef.where('wr_11', '==', gall_no).limit(1).get()
            .then((snapshot) => {
              console.log(snapshot.data().gall_no);
              if (snapshot.exists) {
                snapshot.forEach(snapshot => {  
                  process.stdout.write("똑같은 데이타가 있어요 ~ gall_no:" + gall_no + " wr_11: " + snapshot.data().wr_11);
                })
              } else {
                postsRef.set({
                  gall_id: idboard,
                  wr_11: gall_no,
                  wr_12: Date.now(),
                  wr_datetime: '',
                  wr_subject: '',
                  mb_id: '',
                  wr_content: '',
                  uid: ''
                })
                .then(function(snap) {
                  if (counteach > 0) { 
                    return; 
                  }
                  console.log("snap.data() new id: " + snap.id);
                  console.log("counteach " + counteach);
                  counteach++;
                })
                .catch((error) => {
                  console.log(error);
                });
                //var newPostKey = postsRef.push().key;
              }
            });
        });
      }).catch(function (error) {
        console.error("error status는? "+ error.response.status);
      });
    
    }
    
    const postsdcRef = sdb.collection("boarddc").doc(idboard);
    postsdcRef.orderBy("datetime", "desc").limit(1).get()
    .then(doc => {
      if (doc.exists) {
        doc.forEach(function(childSnapshot) {
          var childData = childSnapshot.data();
          //console.log(childSnapshot.val()+" "+childData.wr_12)
          let secondsElapsed = moment().diff(childData.datetime, 'seconds');
          console.log(secondsElapsed+ " 초가 지났습니다.")
          if (secondsElapsed > 10) {
            fetchData();
            postsdcRef.set({
              gall_id: idboard,
              datetime: Date.now(),
            })
              .then(snap => { 
                console.log("conn newPost id: " + childSnapshot.id); 
                postsdcRef.doc(childSnapshot.id).delete()
                .then(() => {
                  console.log("delete id-> " + childSnapshot.id);
                })
              })
              .catch((error) => { console.log(error);
            });
          } else { console.log("아직 시간이 안지났네요?");}
        })
      } else {
        console.log("conn 데이타가 없습니다.")
        
      }
    }); 
    return (
      <div>
      </div>
    );
}

function ClientsDisplay(id) {
    
  const [clients, setClients] = useState([])

  useEffect(() => {
    const idboard = id.id;
  
    const postsRef = sdb.ref("board");
      
      const handleChildAdded = (snapshot) => {
          const client = snapshot.val()
          client.key = snapshot.key
          setClients(clients => [...clients, client]);
          //console.log("child_added-> "+client.key + " " + snapshot.key +" "+snapshot.val().msg);
      }
      const handleChildRemoved = snapshot => {
          setClients(clients => clients.filter(client => client.key !== snapshot.key));
          console.log("removed tasks(msg.key): " + snapshot.key);
      };
      postsRef.orderByChild("wr_datetime").limitToLast(20).on("child_added", handleChildAdded)
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
              <tr key={index}>
                <td>{iddata.key}</td><td>{iddata.wr_12}</td><td>{moment(iddata.wr_datetime).format('LTS')}</td>  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}

export default Board;