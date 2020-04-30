import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const TopTen = ({ doods, getDoods }) => {
  const [ allDoodsInDB, setAllDoodsInDB ] = useState(null);
  const [ stillLoading, setStillLoading ] = useState(true);
  const [ isLoaded, setIsLoaded ] = useState(false);

  // retrieves all usernames from DB
  const getAllUsers = () => axios.get(`/api/users`);

  // get all doods from DB
  const getAllDoodsFromDB = () => {
    getAllUsers()
      .then((res) => {
        return Promise.all(res.data.map(user => getDoods(user)))
          .then((allDoods) => {
            // console.log(allDoods);
            setAllDoodsInDB(allDoods)
            setIsLoaded(true)
          })
      })
      .catch(err => err);
  }

  // orders all user and user's friends doods by like count
  const orderByLikes = () => {
    const allDoods = [];
    // Object.values(allDoodsInDB).forEach(user => {
    allDoodsInDB.forEach(user => {
          user.data.length === 1 ?
            allDoods.push(user.data[0]) :
            user.data.forEach(dood => allDoods.push(dood))
        })
      return allDoods.sort((a, b) => b.count - a.count);
    }

  useEffect(() => {
    getAllDoodsFromDB()
  })

  const renderList = () => (
    <Styles>
      <div className="list text-left">
            <h1 className="test" >Top Doodles</h1>
            <ol>
              {allDoodsInDB[0] && (orderByLikes().map((dood, i) => {
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

  return isLoaded ? renderList() : null;
};

export default TopTen;
