import React, { useState, useEffect } from 'react';
import { Link, Route, useLocation } from 'react-router-dom';
import View from './View';
import { db, firebaseApp } from './firebase';
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

        {/*<IdBoard id={id}/>*/}
        <ClientsDisplay id={id}/>
        {window.location.search.substring(1)}
    </div>
  );
};

function NoIdBoard(id, no, newPostKey) {
  const idboard = id;
  const noidboard = no;
  const keyidboard = newPostKey;

  const postsRef = db.ref("board/" + idboard);

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

  const postsRef = db.ref("board/"+idboard);
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
          var gall_writer = $(result).children('td.gall_writer').text().trim();
          var gall_date = $(result).children('td.gall_date').text().trim();

//            console.log("gall_no:" + gall_no);
          //console.log("gall_writer:" + gall_writer);
          //console.log("gall_date:" + gall_date);
          console.log("conteach: " + counteach)
          if (counteach > 0) { return; }
    
            postsRef.orderByChild("wr_11").equalTo(gall_no).limitToLast(1).once("value", function(snapshot) {
              if (snapshot.exists()) {
                snapshot.forEach(function(snapshot) {  
                  process.stdout.write("똑같은 데이타가 있어요 ~ gall_no:" + gall_no + " wr_11: " + snapshot.val().wr_11);
                })
              } else {
                postsRef.push({
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
                  const newPostKey = snap.key;
                  console.log("newPostKey: " + newPostKey);
                  
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

    const postsdcRef = db.ref("boarddc/"+idboard);
    postsdcRef.orderByChild("datetime").limitToLast(1).once("value", function(snapshot) {
    
    //postsRef.orderByChild("wr_12").limitToLast(1).once("value", function(snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          //console.log(childSnapshot.val()+" "+childData.wr_12)
          let secondsElapsed = moment().diff(childData.datetime, 'seconds');
          if (secondsElapsed > 10) {
            console.log(secondsElapsed+ " 초가 지났습니다.")
            //fetchData();
            postsdcRef.push({
              gall_id: idboard,
              datetime: Date.now(),
            })
              .then(function(snap) { 
                console.log("conn newPostKey: " + childSnapshot.key); 
                postsdcRef.child(childSnapshot.key).remove()
                .then(() => {
                  console.log("remove key-> " + childSnapshot.key);
                })
              })
              .catch((error) => { console.log(error);
            });
          } else { console.log("아직 시간이 안지났네요?");}
        })
      } else {
        console.log("conn 데이타가 없습니다.")
        //fetchData();
        postsdcRef.push({
          gall_id: idboard,
          datetime: Date.now(),
        })
          .then(function(snap) { console.log("conn"); })
          .catch((error) => { console.log(error);
        });
      }
    }); 

    const [axclients, setaxClients] = useState([])
    useEffect(() => {
      const handleChildAxAdded = (snapshot) => {
        var axclient = snapshot.val()
        var ax_datetime = snapshot.val().wr_datetime
        axclient.key = snapshot.key
        console.log("child_added-> "+axclient.key + " " + snapshot.key +" "+snapshot.val().wr_12);
        if (snapshot.exists()) {
          if (ax_datetime) {
          } else {
            setaxClients(axclients => [...axclients, axclient]);
            //alert(postData);
            //postsRef.child(axclient.key).update(postData);
            NoIdBoard(axclient.gall_id, axclient.wr_11, snapshot.key)
          }
        }
      }
      postsRef.orderByChild("wr_datetime").limitToLast(1).on("child_added", handleChildAxAdded)
            
      return () => {
        postsRef.off('child_added', handleChildAxAdded)
        //setaxClients("");
      }; 
    }, [])

    return (
      <div>
        <table>
          <tbody>
            {console.log("ax render")}
            {axclients.reverse().map((axiddata, index) => ( 
              <tr key={index}>
                <td>{axiddata.key}</td><td>datetime:{axiddata.wr_datetime}</td><td>{moment(axiddata.wr_12).format('h:mm:ss')}</td><td>wr_11:{axiddata.wr_11}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr></hr>
      </div>
    );
}

function ClientsDisplay(id) {
    
  const [clients, setClients] = useState([])

  useEffect(() => {
    const idboard = id.id;
  
    const postsRef = db.ref("board/"+idboard);
      
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
      postsRef.orderByChild("wr_datetime").limitToLast(20).once("child_added", handleChildAdded)
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