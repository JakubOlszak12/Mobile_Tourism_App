import {StyleSheet, Text, View, Image, Pressable, FlatList, Dimensions, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import {BarIndicator} from 'react-native-indicators';
import configData from '../config_file.json';
import {useIsFocused} from '@react-navigation/native';
import {useHeaderHeight} from '@react-navigation/elements';
export default function Follower({navigation, route}) {
  const [userData] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();


  const getPosts = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL+'user/followers/' + route.params.username, {
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
  const Item = ({username, follows, followers, avatar}) => {
    return (
      <Pressable onPress={() => navigation.navigate('UserProfile', {username: username})}>
        <View style={styles.users}>
          <View style={{flexDirection: 'row'}}>
            <Image style={styles.avatar} source = {avatar ? {uri: avatar} : require('../assets/testUserPhoto.png')}/>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0.8}}>
              <Text style={styles.searchresTopic}>{username}</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.searchres}> Obserwujący: {followers}</Text>
            <Text style={styles.searchres}> Obserwuje: {follows}</Text></View>
        </View>
      </Pressable>
    );
  };

  const renderItem = ({item})=>(
    <Item username={item.username} followers={item.followers} follows={item.follows} avatar={item.avatar}/>
  );

  useEffect(() => {
    getPosts();
  }, [isFocused]);

  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
          <SafeAreaView style={styles.container}>
            {posts.length == 0 ?
            <View>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.label}>Brak obserwujących</Text>
              </View>
            </View> :
           <View style={styles.inner}>
             <Text style={styles.results}>Osoby obserwujące</Text>
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
    width: 30,
    height: 30,
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
    marginLeft: 10,
    marginBottom: 10,
  },
});
