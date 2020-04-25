/* eslint-disable max-lines-per-function */
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Button, Comment, Form, Segment, List } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
const moment = require('moment');

const Comments = ({user, dood }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [showComments, setShowComments ] = useState(3);
    const [fetchComments, setFetch] = useState();
    
    const getComments = () => axios.get(`/api/comments/${dood.id}`)
        .then(results => setComments(results.data))
        .catch(err => console.error(err))

    useEffect(() => {
        if (fetchComments) {
            clearInterval(fetchComments);
        }
        getComments();
        setFetch(setInterval(getComments, 5000));
    }, []);
    

    const addComments = () => {
        if (!comment) {
            return;
        }
        axios.post('/api/comments', {"doodle_id": dood.id,
            comment,
            "user_id": user.id})
        .then(() => {
            if (comments.length > 2) {
                setShowComments(comments.length + 1);
            }
            
            return getComments();   
        })
        .catch(err => console.error(err));
    }

    return (
        <Comment.Group>
            <List>
                {Boolean(comments.length) && <b>Comments ({comments.length})</b>}
                <hr></hr>
            </List>
            {Boolean(showComments) && Boolean(comments.length) && 
            <div className ="hideComments" onClick={() => setShowComments(0)}>hide comments</div>}
            <Segment.Group piled style={{"overflow": 'auto',
                "maxHeight": 550}}>
            {comments.slice(0, showComments).map(comment => <Comment>
                <Comment.Avatar src={comment[0].avatar}/>
                <Comment.Content>
                <Link className="userName" to={{"pathname": '/profile',
                    "user": comment[1]}}> {comment.name}
                    <Comment.Author as="a"><b>{comment[0].username}</b></Comment.Author> 
                    </Link>
                    <Comment.Metadata>
                    <div><font className="createdAt">{moment(comment[0].created_at).startOf('minute')
                    .fromNow()}</font></div>
                    </Comment.Metadata>
                    <Comment.Text>{comment[0].comment}</Comment.Text>
                    <Comment.Actions>
                        <Comment.Action></Comment.Action>
                    </Comment.Actions>
                    <hr></hr>
                </Comment.Content>
            </Comment>)
            }
            </Segment.Group>
            {Boolean(comments.length) && comments.length > showComments && <div className="headComment" dividing onClick={() => setShowComments(showComments + comments.length)}>
                 Show More Comments 
            </div>}
            <Form reply>
                <Form.TextArea id="comment" onChange={(e) => {
                    setComment(e.target.value) 
                }}/>
                <Button onClick={() => addComments()} content="Reply" labelPosition="left" primary />
            </Form>
            
        </Comment.Group>
    )
};

export default Comments;
