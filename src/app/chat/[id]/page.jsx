'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, PaperClipIcon, PaperAirplaneIcon, MagnifyingGlassIcon, UserCircleIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/20/solid';
import ImagePreviewDialog from '@/components/ImagePreviewDialog';
import ImageExpandDialog from '@/components/ImageExpandDialog';
import { db, storage } from '@/firebase/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, limit, updateDoc, arrayRemove, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import Header from '@/components/Header';

const ChatPage = () => {
  const router = useRouter();
  const { id: chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagesToSend, setImagesToSend] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showWarning, setShowWarning] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const chatQuery = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));
      const unsubscribeChats = onSnapshot(chatQuery, (snapshot) => {
        const chatsData = [];
        snapshot.forEach((doc) => chatsData.push({ id: doc.id, ...doc.data() }));
        setChats(chatsData);
        if (chatId) {
          const chat = chatsData.find((chat) => chat.id === chatId);
          setActiveChat(chat);
        }
      });

      return () => unsubscribeChats();
    }
  }, [chatId, currentUser]);

  useEffect(() => {
    const fetchChatUsers = async (chatList) => {
      const users = {};
      await Promise.all(chatList.map(async (chat) => {
        const otherUserId = chat.members.find((member) => member !== currentUser.uid);
        if (otherUserId && !users[otherUserId]) {
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            users[otherUserId] = userSnap.data();
          }
        }
      }));
      setChatUsers(users);
    };

    if (chats.length > 0) {
      fetchChatUsers(chats);
    }
  }, [chats, currentUser]);

  useEffect(() => {
    const fetchLastMessages = async (chatList) => {
      const messages = {};
      const unread = {};
      await Promise.all(chatList.map(async (chat) => {
        const messagesQuery = query(collection(db, 'chats', chat.id, 'messages'), orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(messagesQuery);
        querySnapshot.forEach((doc) => {
          messages[chat.id] = doc.data();
        });

        // Fetch unread messages count
        const unreadMessagesQuery = query(collection(db, 'chats', chat.id, 'messages'), where('unreadBy', 'array-contains', currentUser.uid));
        const unreadSnapshot = await getDocs(unreadMessagesQuery);
        unread[chat.id] = unreadSnapshot.size;
      }));
      setLastMessages(messages);
      setUnreadMessages(unread);
    };

    if (chats.length > 0) {
      fetchLastMessages(chats);
    }
  }, [chats, currentUser]);

  useEffect(() => {
    if (activeChat) {
      const messagesQuery = query(collection(db, 'chats', activeChat.id, 'messages'), orderBy('createdAt'));
      const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = [];
        snapshot.forEach((doc) => messagesData.push({ id: doc.id, ...doc.data() }));
        setMessages(messagesData);

        // Mark messages as read
        snapshot.forEach((doc) => {
          if (doc.data().unreadBy?.includes(currentUser.uid)) {
            updateDoc(doc.ref, {
              unreadBy: arrayRemove(currentUser.uid),
            });
          }
        });
      });

      return () => unsubscribeMessages();
    }
  }, [activeChat, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatClick = (chat) => {
    setActiveChat(chat);
    router.push(`/chat/${chat.id}`);
  };

  const handleBackClick = () => {
    setActiveChat(null);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      const messageData = {
        text: newMessage,
        sender: currentUser.uid,
        createdAt: serverTimestamp(),
        unreadBy: activeChat.members.filter(member => member !== currentUser.uid),
      };
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), messageData);
      setNewMessage('');
    }
  };

  const handleSendImages = async (images) => {
    const imageUploadPromises = images.map(async (image) => {
      const imageRef = ref(storage, `chatImages/${Date.now()}_${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      return await getDownloadURL(snapshot.ref);
    });

    const imageUrls = await Promise.all(imageUploadPromises);

    const messageData = {
      images: imageUrls,
      sender: currentUser.uid,
      createdAt: serverTimestamp(),
      unreadBy: activeChat.members.filter(member => member !== currentUser.uid),
    };

    await addDoc(collection(db, 'chats', activeChat.id, 'messages'), messageData);
    setImagesToSend([]);
  };

  const handleImageClick = (image) => {
    setExpandedImage(image);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherUserId = chat.members.find((member) => member !== currentUser.uid);
    const otherUser = chatUsers[otherUserId];
    return otherUser && otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <div className={`w-full md:w-1/3 bg-gray-200 border-0 border-gray-300 flex flex-col ${activeChat && isMobileView ? 'hidden' : 'block'}`}>
          <div className="relative m-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Procurar..."
              className="w-full p-2 pl-10 border-0 rounded-md text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredChats.map((chat) => {
            const otherUserId = chat.members.find((member) => member !== currentUser.uid);
            const otherUser = chatUsers[otherUserId];
            const lastMessage = lastMessages[chat.id];
            const unreadCount = unreadMessages[chat.id];
            const lastMessageText = lastMessage?.images ? (
              <>
                <PhotoIcon className="h-5 w-5 text-gray-500 inline-block mr-1" />
                <span>Foto</span>
              </>
            ) : (
              lastMessage?.text || 'Sem mensagens'
            );

            return (
              <div
                key={chat.id}
                className={`flex items-center p-4 border-b border-gray-300 cursor-pointer hover:bg-gray-100 ${unreadCount > 0 ? 'font-bold' : ''}`}
                onClick={() => handleChatClick(chat)}
              >
                {otherUser?.profileImage ? (
                  <img src={otherUser.profileImage} alt={otherUser.fullName || 'Chat'} className="w-12 h-12 rounded-full mr-4" />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-gray-400 mr-4" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{otherUser?.fullName || 'Chat'}</h3>
                  <p className="text-gray-600">{lastMessageText}</p>
                  {unreadCount > 0 && (
                    <span className="text-red-600">{unreadCount} nova{unreadCount > 1 ? 's' : ''} mensagem{unreadCount > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={`flex-1 flex flex-col ${!activeChat && isMobileView ? 'hidden' : 'block'}`}>
          {activeChat ? (
            <>
              <div className="flex items-center p-4 border-b border-gray-300">
                {isMobileView && (
                  <button onClick={handleBackClick} className="text-blue-500 text-lg flex items-center space-x-1 mr-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                    <span>Voltar</span>
                  </button>
                )}
                {chatUsers[activeChat.members.find((member) => member !== currentUser.uid)]?.profileImage ? (
                  <img src={chatUsers[activeChat.members.find((member) => member !== currentUser.uid)]?.profileImage} alt={chatUsers[activeChat.members.find((member) => member !== currentUser.uid)]?.fullName || 'Chat'} className="w-12 h-12 rounded-full mr-4" />
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-gray-400 mr-4" />
                )}
                <h3 className="text-lg font-semibold">{chatUsers[activeChat.members.find((member) => member !== currentUser.uid)]?.fullName || 'Chat'}</h3>
              </div>
              {showWarning && (
                <div className="bg-yellow-100 p-6 rounded-md m-6 flex items-start justify-between">
                  <div>
                    <p className="text-yellow-700">
                      Cuidado com quem você está falando. Mesmo com as precauções do site, podem existir pessoas mal intencionadas se aproveitando para receber doações no lugar de quem realmente precisa. Em caso de cobranças ou falsos pedidos de doação, nos envie uma <a className='font-bold underline' href="/meu-painel">denúncia</a>.
                    </p>
                  </div>
                  <button onClick={() => setShowWarning(false)} className="text-yellow-700 ml-4">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === currentUser.uid ? 'justify-end' : 'justify-start'} px-2`}
                  >
                    <div
                      className={`relative max-w-xs p-4 my-1 rounded-xl ${message.sender === currentUser.uid ? 'bg-red-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'} `}
                    >
                      {message.text && (
                        <p className="text-sm">{message.text}</p>
                      )}
                      {message.images && message.images.length === 1 && (
                        <div className="group relative my-2.5 cursor-pointer" onClick={() => handleImageClick(message.images[0])}>
                          <img src={message.images[0]} alt="" className="rounded-lg object-cover w-full h-64" />
                        </div>
                      )}
                      {message.images && message.images.length > 1 && (
                        <div className="grid gap-4 grid-cols-2 my-2.5">
                          {message.images.map((image, index) => (
                            <div key={index} className="group relative cursor-pointer" onClick={() => handleImageClick(image)}>
                              <img src={image} alt="" className="rounded-lg object-cover w-full h-32" />
                            </div>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-300 flex items-center space-x-2">
                <button
                  className="p-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <PaperClipIcon className="w-6 h-6 text-gray-500" />
                </button>
                <input
                  type="text"
                  placeholder="Digite sua mensagem"
                  className="flex-grow p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-red-600"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="p-2 ml-2 bg-red-600 text-white rounded-full"
                  onClick={handleSendMessage}
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </>
          ) : (
            isMobileView && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Selecione um chat para começar a conversar</p>
              </div>
            )
          )}
        </div>

        <ImagePreviewDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSend={handleSendImages}
        />

        <ImageExpandDialog
          isOpen={!!expandedImage}
          onClose={() => setExpandedImage(null)}
          image={expandedImage}
        />
      </div>
    </>
  );
};

export default ChatPage;
