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

function AxNoIdBoard(id, no, docid) {
  console.log("axnoidboard id : " + id + " no: " + no + " docid " + docid);
}

function IdBoard(id) {
  const idboard = id.id;
  console.log("IdBoard boardid: " + idboard);

  const postsRef = sdb.collection('board').doc(idboard).collection('data');
  
  const [inputs, setInputs] = useState(0);
    async function fetchData() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
      
      await axios.get(cors_api_url + 'https://gall.dcinside.com/board/lists/?id=' + idboard + '&exception_mode=recommend')
      .then(function(result) {
        console.log("axios")
        const html = result.data;
        const $ = cheerio.load(html);

        var counteach = 0;
        var results = $('table.gall_list').find('tr.us-post')
        results.each(function (i, result) {
          var gall_no = $(result).children('td.gall_num').text().trim();
         

            postsRef.where('wr_11', '==', gall_no).limit(1).get()
            .then((snapshot) => {
              console.log(idboard + " "+ gall_no);
              if (snapshot.empty) {
                if (counteach > 0) { return; }
                  counteach++;
                  console.log("conteach: " + counteach)

                  postsRef.add({
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
                    console.log("snap.data() new id: " + snap.id);
                    AxNoIdBoard(idboard,gall_no,snap.id);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              } else {
                snapshot.forEach(doc => {
                  console.log("똑같은게 있네요?" + doc.id, '=>',  doc.data());
                });
              }
            })
            .catch(function (error) {
              if (error.response) {
              }
            });
        });
      }).catch(function (error) {
        if (error.response) {
          //console.log(error.response.data);
          console.log(error.response.status);
          //console.log(error.response.headers);
        }
      });
    
    }
    




    const postsdcRef = sdb.collection('boarddc');
    //fetchData();;
    
    postsdcRef.orderBy("datetime", "desc").limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) {
        postsdcRef.add({
          gall_id: idboard,
          datetime: Date.now(),
        })
      } else {
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          var docData = doc.data();
          let secondsElapsed = moment().diff(docData.datetime, 'seconds');
          console.log(secondsElapsed+ " 초가 지났습니다.")
          if (secondsElapsed > 1) {
            fetchData();
            postsdcRef.add({
              gall_id: idboard,
              datetime: Date.now(),
            })
            .then(snap => { 
              console.log("conn newPost id: " + snap.id); 
              postsdcRef.doc(doc.id).delete()
              .then(() => {
                console.log("delete id-> " + doc.id);
              })
            })
            .catch((error) => { console.log(error);
            });
          }
        });
      }
    });



    const [axclients, setaxClients] = useState([])
    //useEffect(() => {
    //  const posts = postsRef.orderBy("wr_12", "desc").limit(1).onSnapshot(snap => {
        
    //    snap.forEach(doc => {
    //        setaxClients(axclients => [...axclients, doc.data()]);
    //    });
    //  });

    //  return () => posts()
      
    //},[]);

    return (
      <div>

        <table>
          <tbody>
            {console.log("ax render")}
            {axclients.reverse().map((axiddata, index) => ( 
              <tr key={index}>
                <td>{axiddata.id}</td><td>datetime:{axiddata.wr_12}</td><td>{moment(axiddata.wr_12).format('h:mm:ss')}</td><td>wr_11:{axiddata.wr_11}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    );
}

function fetchImg() {
  var cors_api_host = 'cors-anywhere.herokuapp.com';
  var cors_api_url = 'https://' + cors_api_host + '/';
  // eslint-disable-next-line react-hooks/rules-of-hooks
  //var url = cors_api_url + 'https://www.google.de/images/srpr/logo11w.png'; 
  var imgurl = encodeURIComponent('https://write.dcinside.com/viewimage.php?id=comic_new2&id=2eb2dd2fe6ed36a379ed&no=24b0d769e1d32ca73fed80fa11d02831b68b1d4bae6818fe3ec5b78ec7914d10f293b02ddb3723d91f780faab718643662e12a710ae020dbf3b2fd182d33c78b9d5dfca5199e7a67');
  var url = cors_api_url + 'http://3.208.68.247/flask/?url=' + imgurl; 

  axios({
    url: url,
    method: 'GET',
    responseType: 'blob',     
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
      'Access-Control-Allow-Headers': 'x-requested-with, x-requested-by',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36'
              },
  }).then((response) => {
    const blob = new Blob([response.data])
    const bloburl = window.URL.createObjectURL(blob);
    console.log("bloburl " + bloburl)
    console.log(response.data.created_at);
    console.log('Date created: ', response.data.created_at);
    const contentDisposition = response.headers['content-disposition']; // 파일 이름
    
    const contentLength = response.headers['content-length']; // 파일 이름
    
    if (contentDisposition) {
      const [ fileNameMatch ] = contentDisposition.split(';').filter(str => str.includes('filename'));
      if (fileNameMatch)
        var splitfilename = fileNameMatch.split('=');
        splitfilename = splitfilename[1].split('.');
        splitfilename = splitfilename[0] +"_"+ contentLength+"."+splitfilename[1];
        
        setFilename(splitfilename)

        setSrc(bloburl); // after component is mount, src will change
        st.ref("img/+"").child(splitfilename).put(response.data).then(function(snapshot) {
        //  console.log('Uploaded a blob or file!');
        //});
    }
    /*
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
    */
  });
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