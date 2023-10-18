import {StyleSheet, Text, View, Image, Pressable} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';

import {BarIndicator} from 'react-native-indicators';

export default function UserProfile({route, navigation}) {
  const [userData] = useAuth();
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [followers, setFollowers] = useState();
  const [follows, setFollows] = useState();
  const [achievements, setAchievements] = useState();
  const [finished_routes, setFinished_routes] = useState();
  const [avatar, setAvatar] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowed, setIsFollowed] = useState();
  const followUser = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const token = userData.token;
    axios.get(configData.SERVER_URL+'user/follow/' + username, {
      headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          if (isFollowed==1) setIsFollowed(0);
          else if (isFollowed==0) setIsFollowed(1);
          alert(response.data);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };
  const getUserData = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL+'userinfo/' + route.params.username, {
      headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          setUsername(response.data.username);
          setDescription(response.data.description);
          setFollowers(response.data.followers);
          setFollows(response.data.follows);
          setAchievements(response.data.achievements);
          setFinished_routes(response.data.finished_routes);
          setAvatar(response.data.avatar);
          setIsFollowed(response.data.isFollowed);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <>
      {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
      <View style={styles.container}>
        <View style={styles.userData}>
          <Image source = {avatar ? {uri: avatar} : require('../assets/testUserPhoto.png')} style={styles.avatar}/>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.topic}>Opis</Text>
          <Text style={styles.desc}>{(description != '' && description != undefined) ? description : 'Brak opisu użytkownika.'}</Text>
          <View style={styles.funcs}>
            <View style={styles.button}>
              {isFollowed==0 ?
                  <Pressable title="Obserwuj" color={'#002f52'} onPress={followUser}>
                    <Image source = {require('../assets/heart-thin-icon.png')} style={styles.image}/>
                    <Text style={styles.text}>Obserwuj</Text>
                  </Pressable> :
                  <Pressable title="Obserwuj" color={'#002f52'} onPress={followUser}>
                    <Image source = {require('../assets/heart-icon.png')} style={styles.image}/>
                    <Text style={styles.text}>Przestań</Text>
                  </Pressable>
              }
            </View>
            <View style={styles.button}>
              <Pressable onPress={() => navigation.navigate('Chat', {username: username})} title="Napisz" color={'#002f52'}>
                <Image source = {require('../assets/text-message-icon.png')} style={styles.image} />
                <Text style={styles.text}>Napisz</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View>
          <View style={styles.userStats}>
            <Pressable onPress={() => navigation.navigate('UserAchievement', {username: username})}><Text style={styles.topicStat}>Osiągnięcia: {achievements}</Text></Pressable>
            <Text style={styles.topicStat}>Ukończone trasy: {finished_routes}</Text>
          </View>
        </View>
        <View style={styles.userStats}>
          <Pressable onPress={() => navigation.navigate('Follow', {username: username})}><Text style={styles.topicStat1}>Obserwowani: {follows}</Text></Pressable>
          <Pressable onPress={() => navigation.navigate('Follower', {username: username})}><Text style={styles.topicStat1}>Obserwacje: {followers}</Text></Pressable>
        </View>

        <View style={styles.bottomBar}>
        </View>
      </View>
      }
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  funcs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: null,
    resizeMode: 'contain',
    height: 33,
  },
  avatar: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 100,
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
    height: 50,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  username: {
    fontSize: 45,
    color: '#faa933',
    fontWeight: 'bold',
  },
  userData: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  topic: {
    color: '#b5b09b',
    fontWeight: 'bold',
  },
  topicStat: {
    color: '#b5b09b',
    fontWeight: 'bold',
    marginLeft: 70,
    marginRight: 70,
  },
  topicStat1: {
    color: '#b5b09b',
    fontWeight: 'bold',
    marginLeft: 65,
    marginRight: 85,
  },
  desc: {
    margin: 20,
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#b5b09b',
    borderStyle: 'solid',
    borderRadius: 10,
    padding: 10,
    textAlign: 'justify',
  },
});
