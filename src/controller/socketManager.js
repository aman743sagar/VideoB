import { Server, Socket } from "socket.io";



let connection = {}
let message = {}
let timeOnline = {}
export const ConnectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['*'],
            credentials: 'true'
        }
    })

    io.on("connection", (socket) => {
        console.log("some thing is connected");
        socket.on('join-call', (path) => {
            if (connection[path] === undefined) {
                connection[path] = []
            }
            connection[path].push(socket.id)
            timeOnline[socket.id] = new Date()

            for (let a = 0; a < connection[path].length; ++a) {
                io.to(connection[path][a]).emit("user-joined", socket.id, connection[path])
            }
            if (message[path] !== undefined) {
                for (let a = 0; a < message[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", message[path][a]['data'],
                        message[path][a]['sender'], message[path][a]['socket-id-sender'])
                }
            }
        })


        socket.on('signal', (toId, message) => {
            io.to(toId).emit("signal", socket.id, message)
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connection)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            if (found === true) {
                if (message[matchingRoom] === undefined) {
                    message[matchingRoom] = [];
                }
                message[matchingRoom].push({ "sender": sender, "data": data, 'socket-id-sender': socket.id })
                console.log('message',matchingRoom, ':', sender, data);

                connection[matchingRoom].forEach((ele) => {
                    io.to(ele).emit('chat-message', data, sender, socket.id)
                });
            }
        })
        // socket.on("chat-message", (data, sender) => {
        //     // 1. Find the room this socket is part of
        //     let matchingRoom = null;
        //     for (let room in connection) {
        //       if (connection[room].includes(socket.id)) {
        //         matchingRoom = room;
        //         break;
        //       }
        //     }
        //     // 2. If the socket is in a room
        //   message is an object that stores all chat messages by room
        //   You check if a message list for this room already exists
        //   If not, you create an empty one
        //     if (matchingRoom) {
        //       // Make sure the room has a message array
        //       if (!message[matchingRoom]) {
        //         message[matchingRoom] = [];
        //       }
        //       // 3. Save the message
        //       message[matchingRoom].push({
        //         sender: sender,
        //         data: data,
        //         "socket-id-sender": socket.id
        //       });
        //       // 4. Send the message to everyone in the same room
        //       connection[matchingRoom].forEach((socketId) => {
        //         io.to(socketId).emit("chat-message", data, sender, socket.id);
        //       });
        //     }
        //   });

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            var key
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connection)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k;
                        for (let a = 0; a < connection[key].length; ++a) {
                            io.to(connection[key][a]).emit('user-left', socket.id)
                        }
                        var index = connection[key].indexOf(socket.id)
                        connection[key].splice(index, 1)

                        if (connection[key].length === 0) {
                            delete connection[key]
                        }
                    }


                }
            }
        })


        //   socket.on("disconnect", () => {
        //     const disconnectTime = new Date();
        //     const connectedTime = timeOnline[socket.id] || disconnectTime;
        //     const diffTime = Math.abs(connectedTime - disconnectTime);
        //     let userRoom = null;
        //     // Find the room where the user was
        //     for (const room in connection) {
        //       if (connection[room].includes(socket.id)) {
        //         userRoom = room;
        //         break;
        //       }
        //     }
        //     if (userRoom) {
        //       // Notify all users in that room that this user has left
        //       connection[userRoom].forEach((userId) => {
        //         io.to(userId).emit("user-left", socket.id);
        //       });
        //       // Remove the user from the room
        //       connection[userRoom] = connection[userRoom].filter(id => id !== socket.id);
        //       // If the room is now empty, delete it
        //       if (connection[userRoom].length === 0) {
        //         delete connection[userRoom];
        //       }
        //     }
        // Clean up the time tracker
        //     delete timeOnline[socket.id];
        //   });
    })

    return io;
}