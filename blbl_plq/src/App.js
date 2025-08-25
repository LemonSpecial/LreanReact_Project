import './App.css';
import { use, useEffect, useRef, useState } from 'react';
import _, { get, set } from 'lodash';
import classNames from 'classnames';
import {v4 as uuidv4} from 'uuid';
import dayjs from 'dayjs';
import axios from 'axios';

const list = [];

const user = {
  uid: '1314520',
  avatar: '/images/A.jpg',
  uname: '上官清逸'
};

const tabs = [
  {type:'hot', name: '热门'},
  {type:'new', name: '最新'}
];


//网络请求（自定义Hook）
function useGetList(){
  const [commentList, setCommentList] = useState([])
  useEffect(() => {
    async function getList(){
      const res = await axios.get('http://114.66.61.10:3004/list');
      setCommentList(res.data); 
    }
    getList();
  },[])
  return {commentList,setCommentList};
}

//评论Item
function Item({item , onDel}){
  return (
    <div className='reply-item'>
            {/*头像*/}
            <div className='reply-item-avatar'>
              <div className='bili-avatar'>
                <img className='bili-avatar-img' alt='' src={item.user.avatar}/>
              </div>
            </div>

            <div className='content-wrap'>
              {/*用户名*/}
              <div className='user-info'>
                <div className='user-name'>{item.user.uname}</div>
              </div>
              {/*评论内容*/}
              <div className='root-reply'>
                <span className='reply-content'>{item.content}</span>
              </div>
              {/*评论时间*/}
              <span className='reply-time'>{item.ctime}</span>
              {/*评论数量*/}
              <span className='reply-count'>点赞数:{item.like}</span>
              {user.uid === item.user.uid &&
              <span className='delete-btn' onClick={()=> onDel(item.rpid)}>删除</span>}
            </div>
          </div>
  );
}

const App = () => {
  
  const {commentList,setCommentList} = useGetList();

  const handleDel = (rpid) => {
  axios.delete(`http://114.66.61.10:3004/list/${rpid}`)
    .then(() => {
      setCommentList(commentList.filter(item => item.rpid !== rpid));
    })
    .catch(error => {
      console.error('删除评论失败:', error);
    });
}

  const [type,setType] = useState('hot');
  const handleTabChange = (type) => {
    setType(type);
    if(type === 'hot') {
      setCommentList(_.orderBy(commentList, ['like'], ['desc']));
    } else {
      setCommentList(_.orderBy(commentList, ['ctime'], ['desc']));
    }
  }

  const [content,setContent] = useState('');
  const inputRef = useRef(null);
  const btnRef = useRef(null);
  const handlPuslish = () => {
    if (!content.trim()) return;

    const newComment = {
    rpid: uuidv4(),
    user: {
      uid: '1314520',
      uname: '上官清逸',
      avatar: user.avatar
    },
    content: content,
    ctime: dayjs().format('YYYY-MM-DD HH:mm'),
    like: 0
  };

   axios.post('http://114.66.61.10:3004/list', newComment)
    .then(response => {
      // 成功后将新评论添加到本地状态
      setCommentList([...commentList, newComment]);
      setContent('');
      inputRef.current.focus();
      btnRef.current.className = 'send-ntext';
    })
    .catch(error => {
      console.error('发布评论失败:', error);
    });
  }

  return (
    <div className="app">
      {/*导航 Tab*/}
      <div className='reply-nav'>
        <ul className='nav-bar'>
          <li className='nav-title'>
            <h2>评论</h2>
            {/*评论数量*/}
            <span className='total-reply'>{commentList.length}</span>
          </li>
          <li className='nav-sort'>
            {tabs.map(item=> 
            <span 
            key={item.type} 
            onClick={()=>handleTabChange(item.type)} 
            className={classNames('nav-item', {navActive: type === item.type})}>
            {item.name}
            </span>)} 
          </li>
        </ul>
      </div>
      
      <div className='reply-wrap'>
        {/*发表评论*/}
        <div className='box-normal'>
          {/*头像*/}
          <div className='reply-box-avatar'>
            <div className='bili-avatar'>
              <img className='bili-avatar-img' alt='' src={user.avatar}/>
            </div>
          </div>
          <div className='reply-box-wrap'>
            {/*评论框*/}
            <textarea className='reply-box-textarea' placeholder='发一条友善的评论' 
                      value={content} onChange={(e)=>{
                          if(e.target.value.length >= 1) {
                            btnRef.current.className = 'send-text';
                            setContent(e.target.value);
                          }
                          else {
                            btnRef.current.className = 'send-ntext';
                            setContent('');
                          }
                        }} ref={inputRef}/>
              <div className='reply-box-send'>
                <div className='send-ntext' onClick={handlPuslish} ref={btnRef}>发布</div>
              </div>
          </div>
        </div>
        {/*评论列表*/}
        <div className='reply-list'>
          {/*评论项*/}
          {commentList.map(item => <Item key={item.rpid} item={item} onDel={handleDel}/>)}
          
          <div className='no-more'>没有更多了</div>

        </div>
      </div>
    </div>
  );
}

export default App;