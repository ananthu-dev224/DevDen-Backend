import { UserRepository } from "../repository/userRepository";

const userRepo = new UserRepository();

const socketConfig = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("user connected :", socket.id);


    // Listen for typing events
    socket.on("typing", (data: any) => {
      socket.to(data.conversationId).emit("typing", data.userId);
    });

    socket.on("stopTyping", (data: any) => {
      socket.to(data.conversationId).emit("stopTyping", data.userId);
    });

    socket.on("sendMessage", async (data: any) => {
      console.log("Message received:", data);
      io.to(data.conversationId).emit("message", data); // Emit the message to the specific conversation's room
    });

    // Handle joining a conversation room
    socket.on("joinConversation", async (data:{conversationId: string, userId: any}) => {
      const { userId, conversationId } = data;
      console.log(`User ${socket.id} and Id ${userId} joined conversation ${conversationId}`);
      socket.userId = userId;
      await userRepo.findOneAndUpdate(
        { _id: userId },
        { chatStatus : 'Online' }
      );
      socket.join(conversationId);
    });

    // Handle leaving a conversation room
    socket.on("leaveConversation", async (data:{conversationId: string, userId: any}) => {
      const { userId, conversationId } = data;
      socket.leave(conversationId);
      if(userId){
        await userRepo.findOneAndUpdate(
          { _id: userId },
          { chatStatus : 'Offline', lastSeen: new Date() }
        );
      }
      console.log(`User ${socket.id} and Id ${userId} left conversation ${conversationId}`);
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if(userId){
        await userRepo.findOneAndUpdate(
          { _id: userId },
          { chatStatus : 'Offline', lastSeen: new Date() }
        );
      }
      console.log("User disconnected", socket.id);
    });
  });
};


export default socketConfig;