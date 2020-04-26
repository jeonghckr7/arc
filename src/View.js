import React from 'react';

// 프로필에서 사용 할 데이터
const viewData = {
  1: {
    name: '김민준',
    description:
      'Frontend Engineer @ Laftel Inc. 재밌는 것만 골라서 하는 개발자'
  },
  2: {
    name: '홍길동',
    description: '전래동화의 주인공'
  }
};

const View = ({ match }) => {
  // 파라미터를 받아올 땐 match 안에 들어있는 params 값을 참조합니다.
  const { no } = match.params;
  const view = viewData[no];
  if (!view) {
    return <div>존재하지 않는 유저입니다.</div>;
  }
  return (
    <div>
      <h3>
        {no}({view.name})
      </h3>
      <p>{view.description}</p>
    </div>
  );
};

export default View;