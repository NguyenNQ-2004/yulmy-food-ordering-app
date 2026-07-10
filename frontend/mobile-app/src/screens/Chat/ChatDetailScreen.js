import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/Header';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

export default function ChatDetailScreen({ route, navigation }) {
  const { chatId, name } = route.params || { name: 'Support Team' };
  const { currentUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef();

  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chats/${chatId}/messages`);
        const data = response.data.data;
        
        const formatted = data.map(msg => ({
          id: msg._id,
          text: msg.content,
          isUser: msg.sender?._id === currentUser?.id,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setMessages(formatted);
      } catch (error) {
        console.error('Fetch messages error:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, currentUser]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatId) return;

    const textToSend = inputText.trim();
    setInputText(''); // Optimistic clear

    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      await api.post(`/chats/${chatId}/messages`, { content: textToSend });
    } catch (error) {
      console.error('Send message error:', error.message);
      // Could remove the optimistic message here on failure
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={name}
        subtitle="Typically replies in 5 minutes"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll} 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={RED} />
            </View>
          ) : (
            <>
              <View style={styles.timestampContainer}>
                <Text style={styles.timestampText}>TODAY</Text>
              </View>

              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageRow, 
                    msg.isUser ? styles.userRow : styles.receivedRow
                  ]}
                >
                  {!msg.isUser && (
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{name[0]}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      msg.isUser ? styles.userBubble : styles.receivedBubble
                    ]}
                  >
                    <Text style={[styles.messageText, msg.isUser ? styles.userText : styles.receivedText]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  keyboardContainer: {
    flex: 1,
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timestampText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8f6f6c',
    backgroundColor: '#ffe9e6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    letterSpacing: 0.5,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  receivedRow: {
    alignSelf: 'flex-start',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fe7676',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarMiniText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '750',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: RED,
    borderBottomRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: CARD_BG,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#f0e5e3',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userText: {
    color: '#fff',
  },
  receivedText: {
    color: TEXT_COLOR,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0e5e3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  attachBtn: {
    padding: 8,
  },
  attachIcon: {
    fontSize: 20,
    color: '#8f6f6c',
  },
  input: {
    flex: 1,
    backgroundColor: '#ffe9e6',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    fontSize: 14,
    color: TEXT_COLOR,
    marginHorizontal: 10,
  },
  sendBtn: {
    backgroundColor: RED,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
