import React,{useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created a new room!');
    };

    const joinRoom = () => {
        if(!roomId || !username){
            toast.error('ROOM ID & Username is required');
            return;
        }

    // Redirecting if username and room id is there.

    navigate(`/editor/${roomId}` , {
        state: {   //it is an object - to pass from one route to other (home page to editor page)
           username, 
        },
    });

    };

    //On clicking JOIN Button, redirected but with ENTER Key nothing happens, it should also be done.

    const handleInputEnter = (e) => {
        if(e.code === 'Enter') {
            console.log('event', e.code); //it works for every key, we just want enter key.
            joinRoom();
        }
    };


    return <div className="homePageWrapper">
        <div className="formWrapper">
                <img
                    className="homePageLogo"
                    src="/code-sync.png"
                    alt="code-sync-logo"
                />
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
                </div>
        </div>
    </div>
}

export default Home