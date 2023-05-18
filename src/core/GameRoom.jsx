import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from 'colyseus.js';
import useMounted from './useMounted';

const GameRoom = () => {
  const [room, setRoom] = useState(null);
  const [state, setState] = useState();
  const [message, setMessage] = useState('');
  const speed = 5;

  const myDivRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom on component update
    scrollToBottom();
  }, [state]);

  const scrollToBottom = () => {
    myDivRef.current.scrollTop = myDivRef.current.scrollHeight;
  };

  // Example: Add new content after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Add your logic to add new content here

      // Scroll to the bottom after adding new content
      scrollToBottom();
    }, 1000);

    return () => clearTimeout(timer);
  }, [/* dependencies */]);

  const colorsHexArray = ['#FF6633', '#FFB399', '#FF33FF', '#c599ff', '#00B3E6',
  '#FF6633', '#FFB399', '#FF33FF', '#c599ff', '#00B3E6']

  const mounted = useMounted();

  const connectServer = useCallback(async () => {
      const client = new Client('ws://49.232.111.243:2567'); // 替换为服务器地址
      const room = await client.joinOrCreate('my_room');
      room.onStateChange((state) => {
        setState(state);
      });
      setRoom(room);   
  }, [mounted]);

  useEffect(() => {
    connectServer();
  }, []);

  useEffect(() => {
    if (!room) return;
    room.state.players.onAdd((player, key) =>  {
      console.log(player, "has been added at", key);
    });

    room.state.players.onRemove((player, key)=>{
      console.log(player, "has been left at", key);
    });
  }, [room]);

  const handleKeyDown = (event) => {
    // 发送玩家输入到服务器
    const maxPosition = 400;
    const width =20;
    const player = room.state.players.get(room.sessionId);
    if (room && room.sessionId) {
  
      switch (event.key) {
        case 'ArrowUp':
          room.send('move', { x: player.x, y: Math.max(player.y - speed, 0), z: 0, sessionId: room.sessionId });
          break;
        case 'ArrowDown':
          room.send('move', { x: player.x, y: Math.min(player.y + speed, maxPosition - width), z: 0, sessionId: room.sessionId });
          break;
        case 'ArrowLeft':
          room.send('move', { x: Math.max(player.x - speed, 0), y: player.y, z: 0, sessionId: room.sessionId });
          break;
        case 'ArrowRight':
          room.send('move', { x: Math.min(player.x + speed, maxPosition - width), y: player.y, z: 0, sessionId: room.sessionId });
          break;
        default:
          break;
      }
    }
  };

  var players = [];
  if(state) {
    room.state.players.forEach((player) => {
      // Process each player
      console.log(player.sessionId);
      // Other operations
      players.push(player);
    })
  }

  var messages = [];
  if(state) {
    room.state.messages.forEach((message) => {
      // Process each player
      console.log(message);
      // Other operations
      messages.push(message.senderId+ ":" + message.content);
    })
  }

  const onMessgeChange = (event) => {
    setMessage(event.target.value);
  }

  const onClickSend = () => {
    if (room && room.sessionId) {
      room.send('message', { content: message, sessionId: room.sessionId });
      setMessage('');
    }
  }


  return (
    <div tabIndex="0" onKeyDown={handleKeyDown}>
      <h2>Game Room</h2>
      <div style={{ width: '400px', height: '400px', border: '1px solid black', position: 'relative' }}>
             {players.length > 0 && players.map((player, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: player.y,
                  left: player.x,
                  zIndex: player.zIndex,
                  width: '20px',
                  height: '20px',
                  background: colorsHexArray[index % colorsHexArray.length],
                }}
              ></div>
            ))}
      </div>
      <div>
     
        <h2>Chat</h2>
        <div ref={myDivRef} style={{
          overflow: 'auto', width: '300px', height: '200px',
          border: '1px solid black'
        }}>
          {messages.length > 0 && messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
        <div>
          <input type="text" onChange={onMessgeChange} value={message}/>
        </div>
        <button onClick={onClickSend}>send</button>
      </div>
    </div>
  );
};

export default GameRoom;
