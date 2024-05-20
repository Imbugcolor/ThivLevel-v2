const SocketServer = (socket) => {
  socket.on("disconnect", () => {
    console.log(socket.id)
  });

};

module.exports = SocketServer;