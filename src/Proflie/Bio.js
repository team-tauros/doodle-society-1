import React, { useState, useEffect} from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'

const Bio = ({ user, allowEditBio }) => {
    const [bio, setBio] = useState('');
    const [loadBio, setLoad] = useState(false);
    const [editBio, setEditBio] = useState(false);
    //  get a user's bio
    const getBio = () => axios.get(`/api/bios/${user.id}`)
      .then((result) => {
        setBio(result.data);
        setLoad(true);  //  set load to true now that bio is loaded
      })
      .catch(err => console.error(err)); 
    //  add a user bio
    const addBio = () => {
        //  post bio to server
        axios.post('api/bios', {
            "user_id": user.id,
            "bio": document.getElementById('bio').value
          })
          .then(() => {
            setEditBio(false); // set edit bio to false to hide text box
            getBio(); //  refresh bio
          })
          .catch(err => console.error(err));
    }
    //  when component receives a new user prop, set load to false and get user bio
    useEffect(() => {
        setLoad(false);
        getBio();
    }, [user]);

    return (
    <div className="Bio-box" style={{"color": "#FF2372"}}>
      {!loadBio && <img src={process.env.PUBLIC_URL + '/spinner.gif'} /> || bio}
    {loadBio && allowEditBio && !editBio && <p><Button variant="primary" onClick={() => setEditBio(!editBio)}>{Boolean(bio) && 'Edit Bio' || 'Add Bio'}</Button></p>}
    {editBio && 
    <div>
    <p><textarea className ="Bio-input" input type="text" id="bio" maxlength="200" /></p>
    <p><Button variant="primary" onClick={addBio}>Save</Button>{' '}</p>
    </div>
    }
    </div>
    )

}

export default Bio;
