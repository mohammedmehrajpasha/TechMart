const Chat = require('../models/Chat');
const { createLogger } = require('../utils/logger');

const logger = createLogger('socketService');

class SocketService {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map();
    this.adminSockets = new Map();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      logger.info(`New connection: ${socket.id}`);

      socket.on('register_user', this.handleUserRegistration(socket));
      socket.on('register_admin', this.handleAdminRegistration(socket));
      socket.on('initiate_chat', this.handleChatInitiation(socket));
      socket.on('send_message', this.handleMessage(socket));
      socket.on('typing', this.handleTyping(socket));
      socket.on('admin_join_chat', this.handleAdminJoin(socket));
      socket.on('disconnect', this.handleDisconnect(socket));
    });
  }

  handleUserRegistration(socket) {
    return async (userData) => {
      try {
        this.activeUsers.set(userData.userId, socket.id);
        socket.userId = userData.userId;
        socket.userType = 'customer';
      } catch (error) {
        logger.error('User registration error:', error);
        socket.emit('error', { message: 'Registration failed' });
      }
    };
  }

  handleAdminRegistration(socket) {
    return async (adminData) => {
      try {
        this.adminSockets.set(adminData.adminId, socket.id);
        socket.adminId = adminData.adminId;
        socket.userType = 'admin';
        
        // Get all waiting chats
        const waitingChats = await Chat.find({ status: 'waiting' })
          .populate('customer', 'name email')
          .select('customer subject priority startedAt');
        
        socket.emit('waiting_chats', waitingChats);
      } catch (error) {
        logger.error('Admin registration error:', error);
        socket.emit('error', { message: 'Registration failed' });
      }
    };
  }

  handleChatInitiation(socket) {
    return async (chatData) => {
      try {
        const newChat = await Chat.create({
          customer: socket.userId,
          subject: chatData.subject,
          priority: chatData.priority
        });

        const populatedChat = await Chat.findById(newChat._id)
          .populate('customer', 'name email');

        socket.join(`chat:${newChat._id}`);
        
        // Notify all online admins
        this.adminSockets.forEach((adminSocketId) => {
          this.io.to(adminSocketId).emit('new_chat_request', populatedChat);
        });

        socket.emit('chat_initiated', populatedChat);
      } catch (error) {
        logger.error('Chat initiation error:', error);
        socket.emit('error', { message: 'Failed to start chat' });
      }
    };
  }

  handleMessage(socket) {
    return async (messageData) => {
      try {
        const { chatId, content, attachments } = messageData;
        
        const chat = await Chat.findById(chatId);
        if (!chat) {
          throw new Error('Chat not found');
        }

        const message = {
          sender: socket.userType === 'customer' ? socket.userId : socket.adminId,
          senderModel: socket.userType === 'customer' ? 'User' : 'Admin',
          content,
          attachments
        };

        chat.messages.push(message);
        await chat.save();

        this.io.to(`chat:${chatId}`).emit('new_message', {
          chatId,
          message
        });
      } catch (error) {
        logger.error('Message handling error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    };
  }

  handleTyping(socket) {
    return (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit('typing_status', {
        chatId,
        userId: socket.userType === 'customer' ? socket.userId : socket.adminId,
        isTyping
      });
    };
  }

  handleAdminJoin(socket) {
    return async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          throw new Error('Chat not found');
        }

        chat.admin = socket.adminId;
        chat.status = 'active';
        await chat.save();

        socket.join(`chat:${chatId}`);
        
        this.io.to(`chat:${chatId}`).emit('admin_joined', {
          chatId,
          adminId: socket.adminId
        });
      } catch (error) {
        logger.error('Admin join error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    };
  }

  handleDisconnect(socket) {
    return () => {
      if (socket.userType === 'customer') {
        this.activeUsers.delete(socket.userId);
      } else if (socket.userType === 'admin') {
        this.adminSockets.delete(socket.adminId);
      }
      logger.info(`Disconnected: ${socket.id}`);
    };
  }
}

module.exports = SocketService; 