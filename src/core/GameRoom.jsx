import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Client } from 'colyseus.js';
import useMounted from './useMounted';

const GameRoom = () => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const speed = 5;

  const colorsHexArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',]

  const mounted = useMounted();

  const connectServer = useCallback(async () => {
      const client = new Client('ws://49.232.111.243:2567'); // 替换为服务器地址
      const room = await client.joinOrCreate('my_room');
      setRoom(room);   
  }, [mounted]);

  useEffect(() => {
    connectServer();
  }, [connectServer]);

  useEffect(() => {
    if (!room) return;
    room.state.players.onAdd((player, key) =>  {
      console.log(player, "has been added at", key);
      // add your player entity to the game world!
      const newPlayer= {
        sessionId: key,
        x: player.x,
        y: player.y,
        z: player.z,
      };
      player.onChange(() => {
        //update player pos
        setPlayers((prevPlayers) => {
          const updatedPlayers = prevPlayers.map((p) => {
            if (p.sessionId === key) {
              return {
                ...p,
                x: player.x,
                y: player.y,
                z: player.z,
              };
            }
            return p;
          });
          return updatedPlayers;
        });
      });
      
      setPlayers([...players, newPlayer ]);
    });
    room.state.players.onRemove((player, key)=>{
      setPlayers(players.filter((p) => p.sessionId !== key));
    });
  }, [room]);

  const handleKeyDown = (event) => {
    // 发送玩家输入到服务器
    if (room){
      switch (event.key) {
        case 'ArrowUp':
          room.send('move', { x: 0, y: - speed ,z:0 });
          break;
        case 'ArrowDown':
          room.send('move', { x: 0,y: speed, z:0});
          break;
        case 'ArrowLeft':
          room.send('move', { x: -speed , y: 0 , z:0});
          break;
        case 'ArrowRight':
          room.send('move', { x: speed, y: 0, z:0 });
          break;
        default:
          break;
      }
    }
  };

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
              width: '20px',
              height: '20px',
              background: colorsHexArray[index % players.length],
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default GameRoom;
