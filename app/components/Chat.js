import {StyleSheet, Text, View, Image, TextInput, FlatList, Dimensions, KeyboardAvoidingView, SafeAreaView, TouchableOpacity} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect, useRef} from 'react';
import {useHeaderHeight} from '@react-navigation/elements';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import {BarIndicator} from 'react-native-indicators';
export default function Chat({route, navigation}) {
  const [userData] = useAuth();
  const [text, setText] = useState('');
  const [messagesHistory, setMessagesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const listRef = useRef(null);

  const getUserMessagesFromParam = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL+'user/readMessages/' + route.params.username, {
      headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          setMessagesHistory(response.data);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };
  const sendMessage = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (text.length > 255) {
      alert('Wiadomość jest za długa!');
      setIsLoading(false);
    } else {
      const token = userData.token;
      axios.post(configData.SERVER_URL+'user/sendNewMessage/' + route.params.username, {text}, {
        headers: {'token': token}})
          .then((response) => {
            setIsLoading(false);
            getUserMessagesFromParam();
            setText('');
          })
          .catch((err) => {
            setIsLoading(false);
            console.log(err.response.data.message);
            alert(err.response.data.message);
          });
    }
  };

  const Item = ({text, isMine}) => {
    return (
      <>
        { isMine == 1 ?
        <View style={styles.users}>
          <Text style={styles.searchres}>{text}</Text>
        </View> :
        <View style={styles.usersNeg}>
          <Text style={styles.searchresNeg}>{text}</Text>
        </View>
        }
      </>
    );
  };

  const renderItem = ({item})=>(
    <Item text={item.text} isMine={item.isMine}/>
  );

  useEffect(() => {
    getUserMessagesFromParam();
  }, []);
  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            <Text style={styles.results}> Wiadomości z {route.params.username}</Text>
            {isLoading == true ? <BarIndicator count={5} color='#002f52'/> : <><FlatList ref={listRef} onContentSizeChange={() => listRef.current.scrollToEnd() } onLayout={() => listRef.current.scrollToEnd() } style={styles.flatlist} data={messagesHistory} renderItem={renderItem} ></FlatList></>}
          </View>
          <View style={styles.userStats}>
            <View style={styles.form}>
              <TextInput defaultValue={text} style={styles.input} onChangeText={(v) => setText(v)}></TextInput>
            </View>
            <View style={styles.button}>
              <TouchableOpacity title="wyslij" onPress={sendMessage}>
                <Image source = {require('../assets/mail-send-icon.png')} style={styles.image}/>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-end',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  flatlist: {
    width: Dimensions.get('window').width - 50,
    height: Dimensions.get('window').height - 170,
  },
  searchres: {
    color: '#fff',
  },
  searchresNeg: {
    color: '#fff',
  },
  searchresTopic: {
    color: '#faa933',
    fontSize: 25,
  },
  inf: {
    marginLeft: 20,
  },
  topBar: {
    paddingLeft: 10,
    height: 40,
    backgroundColor: '#002f52',
  },
  topBarText: {
    fontSize: 25,
    color: '#fff',
  },
  bottomBar: {
    height: 60,
    backgroundColor: '#002f52',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  results: {
    fontSize: 20,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'gray',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: 'gray',
  },
  logo: {

  },
  image: {
    width: 44,
    height: 32,
  },
  form: {

    flex: 1,
    justifyContent: 'flex-end',
  },
  input: {
    height: 60,
    backgroundColor: '#002f52',
    border: 1,
    borderRadius: 10,
    fontSize: 18,
    color: '#fff',
    padding: 20,
    width: '96%',
  },
  label: {
    color: '#faa933',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    // paddingBottom: 5,
  },
  text: {
    fontSize: 35,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: '#002f52',
  },
  end: {
    fontSize: 12,
    letterSpacing: 0.25,
    color: 'gray',
  },
  userStats: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    margin: '4%',
  },
  users: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginLeft: 40,
    marginBottom: 10,
    flexDirection: 'row',
    backgroundColor: '#002f52',
    padding: 10,
    borderRadius: 10,
  },
  usersNeg: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: 40,
    marginBottom: 10,
    flexDirection: 'row',
    backgroundColor: '#522719',
    padding: 10,
    borderRadius: 10,
  },
});
