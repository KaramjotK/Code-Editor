import React, {useState, useRef, useEffect} from 'react';
import  toast  from 'react-hot-toast';
import Client from '../components/Client';
import ACTIONS from '../Actions';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const EditorPage = () => {
    
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const {roomId} = useParams(); // useParams returns all parameters -- here we are getting room id from the url

    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket(); // initsocket() immediately connects client to server
            console.log(socketRef.current)
            socketRef.current.on('connect_error', handleerrors);
            socketRef.current.on('connect_failed', (err) => handleerrors(err));

            function handleerrors(err) {
                console.log('socket error', err);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');  //redirect to homepage 
            }

            console.log(roomId);

            socketRef.current.emit(ACTIONS.JOIN, { // join is to find room id
                roomId,
                username: location.state?.username,
            });
            
             // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    console.log('SOMEONE JOINED');
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    console.log('clients after join: ', clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                     });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    console.log('clients: ', clients);
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                    console.log('clients after left: ', clients);

                }
            );

            socketRef.current.on(
                ACTIONS.ERROR,
                () => console.log('error')
            );

            
            
        };
        
        init();
        return () => {
            setTimeout(() => {
                //socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
            }, 2000);
        }
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    //redirect to homepage if username not found
    if (!location.state) {
        return <Navigate to="/" />;
    }

    return <div className="mainWrap">

                <div className="aside">
                    
                    <div className="asideInner">
                        <div className="logo">
                            <img 
                                className="logoImage" 
                                src="/code-sync.png" 
                                alt="logo"
                            />
                        </div>
                        <h3>Connected</h3>
                        <div className="clientsList">
                            {
                               
                                clients.map((client) => (
                                    <Client 
                                        key={client.socketId} 
                                        username={client.username} 
                                    />
                                ))
                            }

                        </div>
                    </div>
                    
                    <button className="btn copyBtn" onClick={copyRoomId}>Copy Room ID</button>
                    <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
                </div>
 
                <div className="editorWrap">
                        <Editor 
                            socketRef={socketRef} 
                            roomId={roomId} 
                            onCodeChange={(code) =>{
                                codeRef.current = code;
                            }}
                        />
                </div>

         </div>
}

export default EditorPage