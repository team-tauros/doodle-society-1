import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

const Styles = styled.div`
.list {
  background-color: CornflowerBlue;
  border: 4px solid silver;
  border-radius: 15px;
  padding: 2vmin 2vmin;
  height: auto;
  width: 34vw;
  float: left;
  clear: left;
  margin-top: 30px;
}
  .test {
    color: blue;
    font-size: 55px
  }

  .rankedDoodle {
    height: "15vh",
    width: "auto",
    margin: "15px",
  }
`;

const Comments = ({ doods }) => {
  // orders all user and user's friends doods by like count
  const orderByLikes = () => {
    const allDoods = [];
    Object.values(doods).forEach(user => {
          user.length === 1 ?
            allDoods.push(user[0]) :
            user.forEach(dood => allDoods.push(dood))
        })
      return allDoods.sort((a, b) => b.count - a.count);
    }

  console.dir(orderByLikes())
  return (
    <Styles>
      <div className="list text-left">
            <h1 className="test" >Top Doodles</h1>
            <ol>
              {doods[1] && (orderByLikes().map((dood, i) => {
              if(i < 10) {
              return (
                <li className="listItem" >
                  <img
                    style={{
                      height: "10vh",
                      width: "auto",
                      marginTop: "5px",
                      borderRadius: "10px",
                    }}
                    className="doodle"
                    src={dood.url}
                    alt=""
                  />
                  <img
                    style={{
                      height: "10vh",
                      width: "auto",
                      marginTop: "5px",
                      borderRadius: "10px",
                    }}
                    className="bg-img"
                    src={dood.original_url}
                    alt=""
                  />
                  {" "}
                  {dood.username}
                  {", likes: "}
                  {dood.count}
                </li>
                )
              } else {
                return null;
              }
            }))}
            </ol>
      </div>
    </Styles>
  )
};

export default Comments;
