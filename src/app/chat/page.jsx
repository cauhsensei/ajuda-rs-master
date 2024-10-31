'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, MagnifyingGlassIcon, UserCircleIcon, PhotoIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid';
import { db, auth } from '@/firebase/firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/Header';

const ChatListPage = () => {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});

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
    if (currentUser) {
      const chatQuery = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));
      const unsubscribeChats = onSnapshot(chatQuery, (snapshot) => {
        const chatsData = [];
        snapshot.forEach((doc) => chatsData.push({ id: doc.id, ...doc.data() }));
        setChats(chatsData);
      });

      return () => unsubscribeChats();
    }
  }, [currentUser]);

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

  const handleChatClick = (chat) => {
    setUnreadMessages((prev) => ({ ...prev, [chat.id]: 0 })); 
    router.push(`/chat/${chat.id}`);
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
      <div className="w-full md:w-1/3 bg-gray-200 border-0 border-gray-300 flex flex-col">
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
                <p className={`text-gray-600 ${unreadCount > 0 ? 'font-bold' : ''}`}>{lastMessageText}</p>
                {unreadCount > 0 && (
                  <span className="text-red-600 text-xs">{unreadCount} {unreadCount > 1 ? 'novas mensagens' : 'nova mensagem'}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <ChatBubbleLeftRightIcon className="h-40 w-40 text-gray-400" />
        <p className="text-gray-500 text-lg">Selecione um chat para começar a conversar</p>
      </div>
    </div>
    </>
  );
};

export default ChatListPage;
