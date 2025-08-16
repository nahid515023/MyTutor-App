"use client"
import React, { useState } from 'react';
import { Search, MoreVertical, MessageSquare, Paperclip, Smile, Send, Check, CheckCheck, ArrowLeft } from 'lucide-react';

const WhatsAppClone = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Sample data
  const chats = [
    {
      id: 1,
      name: 'John Doe',
      avatar: 'JD',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '12:30 PM',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      avatar: 'SW',
      lastMessage: 'Sure, let\'s meet tomorrow',
      timestamp: '11:45 AM',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Team Group',
      avatar: 'TG',
      lastMessage: 'Meeting at 3 PM',
      timestamp: 'Yesterday',
      unread: 5,
      online: false
    },
    {
      id: 4,
      name: 'Mike Johnson',
      avatar: 'MJ',
      lastMessage: 'Thanks for the help!',
      timestamp: 'Yesterday',
      unread: 0,
      online: true
    },
    {
      id: 5,
      name: 'Emma Davis',
      avatar: 'ED',
      lastMessage: 'See you soon 😊',
      timestamp: 'Monday',
      unread: 1,
      online: false
    }
  ];

  const messages = {
    1: [
      { id: 1, text: 'Hi there!', sent: false, time: '10:00 AM', date: 'Today' },
      { id: 2, text: 'Hello! How can I help you?', sent: true, time: '10:02 AM', date: 'Today' },
      { id: 3, text: 'I wanted to discuss the project', sent: false, time: '10:05 AM', date: 'Today' },
      { id: 4, text: 'Sure, what about it?', sent: true, time: '10:06 AM', date: 'Today' },
      { id: 5, text: 'Hey! How are you doing?', sent: false, time: '12:30 PM', date: 'Today', read: true }
    ],
    2: [
      { id: 1, text: 'Meeting tomorrow?', sent: true, time: '11:30 AM', date: 'Today' },
      { id: 2, text: 'Sure, let\'s meet tomorrow', sent: false, time: '11:45 AM', date: 'Today' }
    ],
    3: [
      { id: 1, text: 'Team meeting scheduled', sent: false, time: '2:00 PM', date: 'Yesterday' },
      { id: 2, text: 'Meeting at 3 PM', sent: false, time: '2:30 PM', date: 'Yesterday' }
    ]
  };

  const currentChat = chats.find(chat => chat.id === selectedChat);
  const currentMessages = messages[selectedChat] || [];

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-full md:w-96' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col ${!showSidebar ? 'hidden md:hidden' : ''}`}>
        {/* Sidebar Header */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
              U
            </div>
            <span className="font-medium text-gray-700 hidden sm:block">Your Name</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <MessageSquare size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                if (window.innerWidth < 768) setShowSidebar(false);
              }}
              className={`flex items-center px-3 py-3 hover:bg-gray-50 cursor-pointer transition-all ${
                selectedChat === chat.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  chat.id % 2 === 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'
                }`}>
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 ml-3 border-b border-gray-100 pb-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate pr-2">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!showSidebar ? 'w-full' : 'hidden md:flex'}`}>
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentChat.id % 2 === 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'
                }`}>
                  {currentChat.avatar}
                </div>
                <div>
                  <h2 className="font-medium text-gray-900">{currentChat.name}</h2>
                  <p className="text-xs text-gray-500">
                    {currentChat.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <Search size={20} />
                </button>
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-4">
              {currentMessages.map((msg, index) => (
                <div key={msg.id}>
                  {(index === 0 || currentMessages[index - 1].date !== msg.date) && (
                    <div className="flex items-center justify-center my-4">
                      <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                        {msg.date}
                      </span>
                    </div>
                  )}
                  <div className={`flex mb-2 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        msg.sent
                          ? 'bg-green-100 text-gray-800 rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-gray-500">{msg.time}</span>
                        {msg.sent && (
                          msg.read ? 
                          <CheckCheck size={14} className="text-blue-500" /> : 
                          <Check size={14} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <Smile size={24} />
                </button>
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <Paperclip size={24} />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message"
                  className="flex-1 px-4 py-2 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-all transform hover:scale-105 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageSquare size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600">WhatsApp Web Clone</h3>
              <p className="text-sm text-gray-500 mt-2">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppClone;