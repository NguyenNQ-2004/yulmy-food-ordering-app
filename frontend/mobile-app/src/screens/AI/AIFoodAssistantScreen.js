import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import Header from '../../components/Header';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

export default function AIFoodAssistantScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Good evening. I'm your Epicurean culinary guide. How can I elevate your dining experience tonight?",
      isUser: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const suggestionChips = [
    'Suggest a healthy lunch',
    'Spicy dinner options',
    'Vegan desserts near me'
  ];

  const handleChipPress = (chipText) => {
    sendMessage(chipText);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const sendMessage = async (text) => {
    const userMsg = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await api.post('/ai/recommend', { prompt: text });
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: response.data.data.response,
        isUser: false,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Error:', error.message);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again.",
        isUser: false,
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="AI Assistant"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View key={msg.id} style={styles.messageWrapper}>
              {/* Message row */}
              <View style={[styles.messageRow, msg.isUser ? styles.userRow : styles.aiRow]}>
                {!msg.isUser && (
                  <View style={styles.aiIconContainer}>
                    <Text style={styles.aiIconText}>✨</Text>
                  </View>
                )}

                <View style={[styles.bubble, msg.isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, msg.isUser ? styles.userText : styles.aiText]}>
                    {msg.text}
                  </Text>
                </View>
              </View>

              {/* Suggestions chips right after welcome message */}
              {index === 0 && messages.length === 1 && (
                <View style={styles.chipsContainer}>
                  {suggestionChips.map((chip, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.chip}
                      onPress={() => handleChipPress(chip)}
                    >
                      <Text style={styles.chipText}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.aiIconContainer}>
                <Text style={styles.aiIconText}>✨</Text>
              </View>
              <View style={styles.typingBubble} testID="ai-typing-indicator">
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
              </View>
            </View>
          )}
          
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Input Area */}
        <View style={styles.inputContainerOuter}>
          <TouchableOpacity style={styles.micBtn} onPress={() => Alert.alert('Voice Input', 'Mic recording placeholder')}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addIcon}>＋</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ask Epicurean for culinary guidance..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendIcon}>➔</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiRow: {
    alignSelf: 'flex-start',
  },
  aiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff0ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e4beb9',
  },
  aiIconText: {
    fontSize: 18,
    color: RED,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  userBubble: {
    backgroundColor: RED,
    borderBottomRightRadius: 2,
    marginLeft: 8,
  },
  aiBubble: {
    backgroundColor: CARD_BG,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#f0e5e3',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: TEXT_COLOR,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 44,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4beb9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    color: '#8f6f6c',
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    overflow: 'hidden',
    marginLeft: 44,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImageContainer: {
    height: 140,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: RED,
    fontSize: 11,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  cardInfo: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  cardRest: {
    fontSize: 11,
    color: '#8f6f6c',
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: RED,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  tagBadge: {
    backgroundColor: '#fff0ee',
    borderWidth: 0.5,
    borderColor: '#e4beb9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: RED,
    letterSpacing: 0.5,
  },
  orderBtn: {
    backgroundColor: RED,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  orderBtnArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '750',
  },
  typingBubble: {
    backgroundColor: CARD_BG,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8f6f6c',
    opacity: 0.4,
  },
  inputContainerOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  micBtn: {
    alignSelf: 'flex-end',
    backgroundColor: RED,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  micIcon: {
    fontSize: 18,
    color: '#fff',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#e4beb9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addBtn: {
    padding: 6,
  },
  addIcon: {
    fontSize: 18,
    color: '#8f6f6c',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: TEXT_COLOR,
    paddingHorizontal: 8,
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
