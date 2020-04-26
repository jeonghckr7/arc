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

function getimgdownurl(aximgsrcs) {
  return new Promise(( resolve, reject )=>{
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var furl = cors_api_url + 'http://3.208.68.247/flask?url=';
    console.table(aximgsrcs);
    axios.get(furl + encodeURIComponent(aximgsrcs.imgscr), {
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
      //console.log(response.data.created_at);
      //console.log('Date created: ', response.data.created_at);
      const contentDisposition = response.headers['content-disposition']; // 파일 이름
      
      const contentLength = response.headers['content-length']; // 파일 이름
      
      if (contentDisposition) {
        const [ fileNameMatch ] = contentDisposition.split(';').filter(str => str.includes('filename'));
        if (fileNameMatch) {
          var splitfilename = fileNameMatch.split('=');
          splitfilename = splitfilename[1].split('.');
          splitfilename = aximgsrcs.ogsname+"_"+ contentLength+"."+splitfilename[1];
          console.log("contentLength: " +contentLength+ " splitfilename: " +  splitfilename);
           
          var streffile = st.ref("").child(splitfilename);
          streffile.getDownloadURL().then(onResolve, onReject);

          function onResolve(foundURL) {
              console.log("파일이 이미 있네요?" + foundURL);
              resolve({resimgsrcs: aximgsrcs.imgs, getdurl: foundURL});
          }

          function onReject(error) {
              console.log("파일이 없네요?" + error.code);
              streffile.put(response.data)
              .then(snap => {
                streffile.getDownloadURL().then(onResolve, onReject);
                function onResolve(foundURL) {
                    console.log("파일이 이제 있네요?" + foundURL);
                    resolve({resimgsrcs: aximgsrcs.imgs, getdurl: foundURL});
                }
                //st.ref().child("1.jpeg").put(response.data).then(function(snapshot) {
              });  
          }
        }
      }
      
    })
  })
}

async function NoIdBoard(id, no, docid) {
  const postsRef = sdb.collection('board').doc(id).collection('data');
  
  //alert("idboard: " + id+ "noidboard: " + no + "newPostKey" + newPostKey);
  
    // eslint-disable-next-line react-hooks/rules-of-hooks
    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    axios.get(cors_api_url + 'https://gall.dcinside.com/board/view/?id=' + id + '&no=' + no +'&exception_mode=recommend')
    .then(function(iresult) {
      const html = iresult.data;
      
      var patternorg = /원본[\s\S]*?([^<]+?)<\/div>/i;
      var orgs = patternorg.exec(html);
      var reg_orgs = /<a href="[^>]*>([^<]*)<\/a>/g;
      var imgorgs; 
      const ogs = [];
      while((imgorgs = reg_orgs.exec(orgs)) !== null) {
        var imgorgs_array = imgorgs[1].split('.');
        var imgorgsor = imgorgs_array[0];
        ogs.push(imgorgsor);
        console.log("imgorgsor" + imgorgsor);
      }
      var pattern2 = /<div style=[\s\S]*?([^<]+?)<\/div>/i;

      var wr_content = pattern2.exec(html);
      wr_content = wr_content[0].replace('<div style="overflow:hidden;">', ''); 
      wr_content = wr_content.replace('</div>', '');

      console.log(wr_content);
      
      //var reg_imgsrc = /<img.*?src="(.*?)"/g;
      var reg_imgsrc = /img src="\S+(?:dcimg)\S+"/g;

      var imgsrcs;
      var $ = cheerio.load(html);

      var opimage = $("meta[property='og:image']").attr("content");
      var opimage_array = opimage.split('&');
      console.log("array " + opimage_array[0]);
      
      var wr_subject = $("span.title_subject").text();
      var mb_id = $("span.nickname").eq(0).text();

      const igs = [];
      var wcount = 0;

      while((imgsrcs = reg_imgsrc.exec(wr_content)) !== null) {
        var imgsrcs_org = imgsrcs[0].split('"');
        imgsrcs_org = imgsrcs_org[1];
        var imgsrcs_array = imgsrcs_org.split('&');
        var imgsrcsr = opimage_array[0] + "&" + imgsrcs_array[1];
        //igs.push(imgsrcsr);
        igs.push({imgs:imgsrcs_org ,imgscr: imgsrcsr, ogsname: ogs[wcount]});
        wcount++;
      }
      console.table(igs);
      
      const igspromises = igs.map(aximgsrcs => 
        getimgdownurl(aximgsrcs)
      );
      
      Promise.all(igspromises)
      .then(values => {
        values.forEach(function (value) {
          console.table(value);
          wr_content = wr_content.replace(value.resimgsrcs,value.getdurl);
        });

        var postData = {
          wr_subject: wr_subject,
          mb_id: mb_id,
          wr_content: wr_content,
          wr_datetime: Date.now(),
          uid: docid
        };
        postsRef.doc(docid).update(postData)
        .then(() => {
          console.log("updated id!: "+docid);
        });
      });
    }).catch(function (error) {
      if (error.response) {
        console.error("404 에러냐? "+ error.response.status);
        postsRef.doc(docid).remove()
        .then(() => {
          console.log("remove id-> " + docid);
        })
      }
    });
  return (
    <div>
    </div>
  );
}

function IdBoard(id) {
  const idboard = id.id;
  console.log("IdBoard boardid: " + idboard);

  const postsRef = sdb.collection('board').doc(idboard).collection('data');
  
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
            postsRef.where('wr_1', '==', gall_no).limit(1).get()
            .then((snapshot) => {
              console.log(idboard + " "+ gall_no);
              if (snapshot.empty) {
                if (counteach > 0) { return; }
                  counteach++;
                  console.log("conteach: " + counteach)

                  postsRef.add({
                    gall_id: idboard,
                    wr_1: gall_no,
                    wr_2: Date.now(),
                    wr_datetime: '',
                    wr_subject: '',
                    mb_id: '',
                    wr_content: '',
                    uid: ''
                  })
                  .then(function(snap) {
                    console.log("snap.data() new id: " + snap.id);
                    NoIdBoard(idboard,gall_no,snap.id);
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
            postsdcRef.add({
              gall_id: idboard,
              datetime: Date.now(),
            })
            .then(snap => { 
              console.log("conn newPost id: " + snap.id); 
              postsdcRef.doc(doc.id).delete()
              .then(() => {
                console.log("delete id-> " + doc.id);
                fetchData();
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
    //  const posts = postsRef.orderBy("wr_2", "desc").limit(1).onSnapshot(snap => {
        
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
                <td>{axiddata.id}</td><td>datetime:{axiddata.wr_2}</td><td>{moment(axiddata.wr_2).format('h:mm:ss')}</td><td>wr_1:{axiddata.wr_1}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
                <td>{iddata.key}</td><td>{iddata.wr_2}</td><td>{moment(iddata.wr_datetime).format('LTS')}</td>  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}

export default Board;