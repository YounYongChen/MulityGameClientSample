import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Client } from 'colyseus.js';
import useMounted from './useMounted';

const GameRoom = () => {
  const [room, setRoom] = useState(null);
  const [state, setState] = useState();
  const speed = 5;

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
    if (room && room.sessionId) {
      let x = 0;
      let y = 0;
      let z = 0;
  
      switch (event.key) {
        case 'ArrowUp':
          y = -speed;
          break;
        case 'ArrowDown':
          y = speed;
          break;
        case 'ArrowLeft':
          x = -speed;
          break;
        case 'ArrowRight':
          x = speed;
          break;
        default:
          break;
      }
  
      room.send('move', { x, y, z, sessionId: room.sessionId });
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
    </div>
  );
};

export default GameRoom;
