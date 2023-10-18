import {StyleSheet, Text, View, Image, Pressable, FlatList, Dimensions, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import {BarIndicator} from 'react-native-indicators';
import configData from '../config_file.json';
import {useIsFocused} from '@react-navigation/native';
import {useHeaderHeight} from '@react-navigation/elements';
export default function Notification({navigation}) {
  const [userData] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();

  const getNotifications = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL+'user/getNotifications', {
      headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          setPosts(response.data);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const deleteNotification = async (index) => {
    const token = userData.token;
    axios.delete(configData.SERVER_URL + 'user/deleteNotification/' + index, {headers: {'token': token}})
        .catch((err) => {
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const Item = ({text, type, username, index}) => {
    return (
      <View style={styles.users}>
        {type == 'message' ?
          <Pressable onPress={() => {
            deleteNotification(index); navigation.navigate('Chat', {username: username});
          }}>
            <View style={{flexDirection: 'row', backgroundColor: '#002f52'}}>
              <Image style={styles.avatar} tintColor="red" source = {require('../assets/exclamation-icon.png')}/>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0.8, alignItems: 'center'}}>
                <Text style={styles.searchress}>{text}</Text>
              </View>
            </View>
          </Pressable> :
            null}
        {type == 'follow' ?
          <Pressable onPress={() => {
            deleteNotification(index); navigation.navigate('UserProfile', {username: username});
          }}>
            <View style={{flexDirection: 'row', backgroundColor: '#002f52'}}>
              <Image style={styles.avatar} tintColor="red" source = {require('../assets/exclamation-icon.png')}/>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0.8, alignItems: 'center'}}>
                <Text style={styles.searchress}>{text}</Text>
              </View>
            </View>
          </Pressable> :
            null}
        {type == 'achievement' ?
          <Pressable onPress={() => {
            deleteNotification(index); navigation.navigate('UserAchievement', {username: username});
          }}>
            <View style={{flexDirection: 'row', backgroundColor: '#002f52'}}>
              <Image style={styles.avatar} tintColor="red" source = {require('../assets/exclamation-icon.png')}/>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0.8, alignItems: 'center'}}>
                <Text style={styles.searchress}>{text}</Text>
              </View>
            </View>
          </Pressable> :
            null}
      </View>
    );
  };

  const renderItem = ({item, index})=>(
    <Item type={item.type} text={item.text} username={item.ref} index={index}/>
  );

  useEffect(() => {
    getNotifications();
  }, [isFocused]);

  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
          <SafeAreaView style={styles.container}>
            {posts.length == 0 ?
            <View>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.label}>Brak powiadomień</Text>
              </View>
            </View> :
           <View style={styles.inner}>
             <Text style={styles.results}>Powiadomienia</Text>
             <FlatList style={styles.flatlist} data={posts} renderItem={renderItem} ></FlatList>
           </View>
            }
          </SafeAreaView>}
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
  lottie: {
    width: 150,
    height: 150,
  },
  inner: {
    padding: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  avatarPost: {
    width: '90%',
    height: 200,
  },
  imageFunc: {
    width: 20,
    height: 20,
  },
  flatlist: {
    width: Dimensions.get('window').width - 20,
  },
  searchres: {
    color: 'gray',
    marginLeft: '5%',
  },
  searchress: {
    color: 'gray',
    marginLeft: '3%',
  },
  searchresTopic: {
    color: 'gray',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: '1%',
  },
  inf: {
    marginLeft: 20,
    flexDirection: 'row',
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
    width: null,
    resizeMode: 'contain',
    height: 33,
  },
  form: {
    padding: 20,
  },
  input: {
    height: 40,
    backgroundColor: '#002f52',
    border: 1,
    borderRadius: 10,
    fontSize: 18,
    color: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
    width: 260,
  },
  label: {
    color: '#faa933',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '25%',
    // paddingBottom: 5,
    height: 50,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  end: {
    fontSize: 12,
    letterSpacing: 0.25,
    color: 'gray',
  },
  endbutton: {
    fontSize: 12,
    letterSpacing: 0.25,
    color: 'white',
  },
  userStats: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  users: {
    marginBottom: 10,
  },
});
