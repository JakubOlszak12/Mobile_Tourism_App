import {StyleSheet, Text, View, Image, Button, Pressable, FlatList, Dimensions, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import {useIsFocused} from '@react-navigation/native';
import {useHeaderHeight} from '@react-navigation/elements';
import {BarIndicator} from 'react-native-indicators';
export default function Main({navigation}) {
  const [userData, setUserData] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isPost, setIsPost] = useState(false);
  const [lastPost, setLastPost] = useState('');
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();
  const [isNotifications, setIsNotifications] = useState(false);


  const Logout = () => {
    Alert.alert(
        'Uwaga',
        'Potwierdź wylogowanie!',
        [
          {text: 'Cofnij'},
          {text: 'OK', onPress: async () => {
            AsyncStorage.removeItem('token');
            setUserData({
              token: '',
              username: '',
            });
          },
          },
        ],
    );
  };

  const getNotifications = async () => {
    // w razie jakby nie działał axios -> 192.168.0.10 <- zmieniasz na swoje IP - trzeba będzie to zautomatyzować ??
    const token = userData.token;
    axios.get(configData.SERVER_URL+'user/getNotifications', {
      headers: {'token': token}})
        .then((response) => {
          console.log(response.data.length);
          if (response.data.length != 0) setIsNotifications(true);
          else setIsNotifications(false);
        })
        .catch((err) => {
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const deletePost = async (postId) => {
    Alert.alert(
        'Uwaga',
        'Potwierdź usunięcie postu!',
        [
          {text: 'Cofnij'},
          {text: 'OK', onPress: async () => {
            setIsLoading(true);
            const token = userData.token;
            axios.delete(configData.SERVER_URL + 'post/deletePost/' + postId, {headers: {'token': token}})
                .then(() => {
                  setIsLoading(false);
                  navigation.replace('Main', null, null, 1);
                })
                .catch((err) => {
                  setIsLoading(false);
                  console.log(err.response.data.message);
                  alert(err.response.data.message);
                });
          },
          },
        ],
    );
  };


  const getPosts = async () => {
    setIsLoading(true);
    // w razie jakby nie działał axios -> 192.168.0.10 <- zmieniasz na swoje IP - trzeba będzie to zautomatyzować ??
    const token = userData.token;
    if (isPost == false) {
      axios.get(configData.SERVER_URL+'post/getPosts/x', {
        headers: {'token': token}})
          .then((response) => {
            setIsLoading(false);
            setPosts(response.data);
            if (response.data.length != 0) {
              setIsPost(true);
              setLastPost(response.data[response.data.length-1].postId);
            }
          })
          .catch((err) => {
            setIsLoading(false);
            console.log(err.response.data.message);
            alert(err.response.data.message);
          });
    } else {
      axios.get(configData.SERVER_URL+'post/getPosts/' + lastPost, {
        headers: {'token': token}})
          .then((response) => {
            setIsLoading(false);
            if (response.data.length == 0) {
              setIsPost(false);
            } else {
              setPosts([...posts, ...response.data]);
              setLastPost(response.data[response.data.length-1].postId);
            }
            // console.log(users);
          })
          .catch((err) => {
            setIsLoading(false);
            console.log('to: ', err.response.data.message);
            alert(err.response.data.message);
          });
    }
  };

  const Item = ({imageName, text, type, username, avatar, postId}) => {
    return (
      <View style={{paddingTop: 10, borderBottomWidth: 1, borderBottomColor: 'gray'}}>
        <View style={styles.users}>
          <View style={{flexDirection: 'row'}}>
            {username==userData.username && type=='post' ?
          <View style={{flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0.8}}>
            <Image style={styles.avatar} source = {avatar ? {uri: avatar} : require('../assets/testUserPhoto.png')}/>
            <Text style={styles.searchresTopic}>{username}</Text>
            <View style={{flexDirection: 'row', flexGrow: 1, justifyContent: 'flex-end'}}>
              <View>
                <TouchableOpacity title="Delete" color={'#002f52'} onPress={() => deletePost(postId)}>
                  <Image source = {require('../assets/delete-icon.png')} style={styles.imageFunc}/>
                </TouchableOpacity>
              </View>
              <View style={{marginLeft: 10}}>
                <TouchableOpacity style={{marginLeft: '3%'}} title="Edit" color={'#002f52'} onPress={() => navigation.navigate('EditPost', {postId: postId})}>
                  <Image source = {require('../assets/edit-square-icon.png')} style={styles.imageFunc}/>
                </TouchableOpacity>
              </View>
            </View>
          </View> :
          <Pressable onPress={() => navigation.navigate('UserProfile', {username: username})}>
            <View style={{flexDirection: 'row'}}>
              <Image style={styles.avatar} source = {avatar ? {uri: avatar} : require('../assets/testUserPhoto.png')}/>
              <Text style={styles.searchresTopic}>{username}</Text>
            </View>
          </Pressable>}
          </View>
          {type == 'achievement' ? <Text style={styles.searchres}> Zdobywa osiągnięcie - {text}</Text> : <Text style={styles.searchres}>{text}</Text>}
          <View style={styles.inf} >
            {imageName && <Image style={styles.avatarPost} source = {{uri: imageName}}/>}
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({item})=>(
    <Item imageName={item.imageName} text={item.text} type={item.type} username={item.username} avatar={item.avatar} postId={item.postId}/>
  );

  useEffect(() => {
    getPosts();
    getNotifications();
    console.log(isNotifications);
    {isNotifications == true ?
          navigation.setOptions({
            headerRight: () => (
              <View style={{flexDirection: 'row'}}>
                <View>
                  <TouchableOpacity title="Szukaj" color={'#002f52'} onPress={() => navigation.navigate('Search')}>
                    <Image source = {require('../assets/search-icon.png')} style={styles.imageNt} tintColor="white"/>
                  </TouchableOpacity>
                </View>
                <View style={{marginLeft: 10}}>
                  <TouchableOpacity style={{marginLeft: '3%'}} title="Powiadomienia" color={'#002f52'} onPress={() => navigation.navigate('Notification')}>
                    <Image source = {require('../assets/notification-incoming-icon.png')} style={styles.imageNt} tintColor="white"/>
                  </TouchableOpacity>
                </View>
                <View style={{marginLeft: 10}}>
                  <TouchableOpacity style={{marginLeft: '3%'}} title="Ustawienia" color={'#002f52'} onPress={Logout}>
                    <Image source = {require('../assets/sign-out-icon.png')} style={styles.imageNt} tintColor="white"/>
                  </TouchableOpacity>
                </View>
              </View>
            ),
          }) :
          navigation.setOptions({
            headerRight: () => (
              <View style={{flexDirection: 'row'}}>
                <View>
                  <TouchableOpacity title="Szukaj" color={'#002f52'} onPress={() => navigation.navigate('Search')}>
                    <Image source = {require('../assets/search-icon.png')} style={styles.imageNt} tintColor="white"/>
                  </TouchableOpacity>
                </View>
                <View style={{marginLeft: 10}}>
                  <TouchableOpacity style={{marginLeft: '3%'}} title="Powiadomienia" color={'#002f52'} onPress={() => navigation.navigate('Notification')}>
                    <Image source = {require('../assets/notification-bell-icon.png')} style={styles.imageNt} tintColor="white"/>
                  </TouchableOpacity>
                </View>
                <View style={{marginLeft: 10}}>
                  <TouchableOpacity style={{marginLeft: '3%'}} title="Ustawienia" color={'#002f52'} onPress={Logout}>
                    <Image source = {require('../assets/sign-out-icon.png')} style={styles.imageNt} tintColor="white"/>
                  </TouchableOpacity>
                </View>
              </View>
            ),
          });
    }
  }, [isFocused, isNotifications]);

  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          {posts.length == 0 ?
            <View>
              <View style={styles.userStats}>
                <View style={styles.form}>
                  <Button title="Dodaj Post" onPress={() => navigation.navigate('AddPost')}></Button>
                </View>
              </View>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                {isLoading == true ? <BarIndicator style={{marginTop: 50}} count={5} color='#002f52'/> : <>
                  <Text style={styles.label}>Brak postów</Text>
                  <Text style={styles.searchres}>Dodaj nowy post lub obserwuj innych użytkowników!</Text></>}
              </View>
            </View> :
           <View style={styles.inner}>
             <View style={styles.userStats}>
               <View style={styles.form}>
                 <Button title="Dodaj Post" onPress={() => navigation.navigate('AddPost')}></Button>
               </View>
             </View>
             <Text style={styles.results}>Aktualności</Text>
             {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
              <>
                <FlatList style={styles.flatlist} data={posts} renderItem={renderItem} ></FlatList>
                {isPost && <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#3292de'}}><Pressable title="Pokaż więcej wyników" onPress={getPosts}><Text style={styles.endbutton}>POKAŻ WIĘCEJ WYNIKÓW</Text></Pressable></View>}
                {!isPost && <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}><Text style={styles.end}>Koniec</Text></View>}
              </>}
           </View>
          }

        </SafeAreaView>

        <View style={styles.bottomBar}>
          <View style={styles.button}>
            <Pressable title="Główna" color={'#002f52'}>
              <Image source = {require('../assets/homepage-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Główna</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Trasy" color={'#002f52'} onPress={() => navigation.navigate('Trails')}>
              <Image source = {require('../assets/hiking-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Trasy</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Pogoda" color={'#002f52'} onPress={() => navigation.navigate('Weather')}>
              <Image source = {require('../assets/day-cloudy-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Pogoda</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Profil" color={'#002f52'} onPress={() => navigation.navigate('Profile')}>
              <Image source = {require('../assets/user-profile-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Profil</Text>
            </Pressable>
          </View>
        </View>
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
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'gray',
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
    marginLeft: 20,
    marginBottom: 30,
  },
  imageNt: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
