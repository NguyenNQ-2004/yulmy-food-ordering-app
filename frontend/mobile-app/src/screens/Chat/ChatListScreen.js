import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

import Header from '../../components/Header';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

export default function ChatListScreen({ navigation }) {
  const { currentUser } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/chats');
      const data = response.data.data;
      
      const formatted = data.map(chat => {
        // Determine the other participant based on current user role
        const isOwner = currentUser?.role === 'restaurant_owner';
        const otherUser = isOwner ? chat.customer : chat.owner;
        
        return {
          id: chat._id,
          name: otherUser?.fullName || 'User',
          message: chat.lastMessage || 'No messages yet.',
          time: new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0, // Unread tracking not implemented yet
          avatarColor: '#fe7676'
        };
      });
      
      setChats(formatted);
    } catch (error) {
      console.error('Fetch chats error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [currentUser])
  );
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Customer Inbox"
        onBack={() => navigation.navigate('OwnerDashboard')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => navigation.navigate('ChatDetail', { chatId: chat.id, name: chat.name })}
            >
              {/* Avatar Circle */}
              <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
                <Text style={styles.avatarText}>
                  {chat.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>

              {/* Content info */}
              <View style={styles.chatDetails}>
                <View style={styles.chatHeader}>
                  <Text style={styles.customerName}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                <View style={styles.chatBody}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat.message}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No conversations yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  scrollContent: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '750',
    color: TEXT_COLOR,
  },
  chatTime: {
    fontSize: 11,
    color: '#8f6f6c',
  },
  chatBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 13,
    color: '#8f6f6c',
    flex: 1,
    marginRight: 12,
  },
  unreadBadge: {
    backgroundColor: RED,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8f6f6c',
  },
});
