import React, { useState, useEffect} from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'

const Bio = ({ user, allowEditBio }) => {
    const [bio, setBio] = useState('');
    const [loadBio, setLoad] = useState(false);
    const [editBio, setEditBio] = useState(false);

    const getBio = () => {
        axios.get(`/api/bios/${user.id}`)
      .then((result) => {
          setBio(result.data);
          setLoad(true);
      })
      .catch(err => console.error(err)); 
    }

    const addBio = () => {
        axios.post('api/bios', {
            "user_id": user.id,
            "bio": document.getElementById('bio').value
        })
      .then(() => {
          setEditBio(false);
          getBio();
      })
      .catch(err => console.error(err));
    }

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
