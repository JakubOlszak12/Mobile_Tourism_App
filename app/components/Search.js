import {StyleSheet, Text, View, Image, TextInput, Pressable, FlatList, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useState} from 'react';
//  import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import {BarIndicator} from 'react-native-indicators';
import {useHeaderHeight} from '@react-navigation/elements';
export default function Search({navigation}) {
  const [userData] = useAuth();
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isList, setIsList] = useState(false);
  const [LastUsername, setLastUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const headerHeight = useHeaderHeight();
  const [help, setHelp] = useState('');

  const submit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (username==undefined || username=='') {
      setIsLoading(false);
      alert('Wpisz nazwę użytkownika!');
    } else {
      let temp = true;
      if (username != currentUsername && isList==true) {
        temp = false;
      }
      setHelp(temp);
      const token = userData.token;
      if (isList == false || temp == false) {
        axios.get(configData.SERVER_URL+'user/finduser/' + username + '/' + username, {
          headers: {'token': token}})
            .then((response) => {
              setIsLoading(false);
              setUsers(response.data);
              if (response.data.length != 0) {
                setIsList(true);
                setCurrentUsername(username);
                setLastUsername(response.data[response.data.length-1].username);
              } else {

              }
            })
            .catch((err) => {
              setIsLoading(false);
              console.log(err.response.data.message);
              alert(err.response.data.message);
            });
      } else {
        axios.get(configData.SERVER_URL+'user/finduser/' + username + '/' + LastUsername, {
          headers: {'token': token}})
            .then((response) => {
              setIsLoading(false);
              if (response.data.length == 0) {
                setIsList(false);
              } else {
                let data = response.data;
                  if(users.some(e => e.username === data[0].username)){
                    data.splice(data.indexOf(element));
                  }
                setUsers([...users, ...data]);
                setLastUsername(response.data[response.data.length-1].username);
                
              }
            })
            .catch((err) => {
              setIsLoading(false);
              console.log(err.response.data.message);
              alert(err.response.data.message);
            });
      }
    }
  };

  const Item = ({avatar, username, followers, follows}) => {
    return (
      <>
        {
        userData.username == username ?
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <View style={styles.users}>
            <Image style={styles.avatar} source = {avatar ? {uri: avatar} : require('../assets/testUserPhoto.png')}/>
            <View style={styles.inf} >
              <Text style={styles.searchresTopic}>{username}</Text>
              <Text style={styles.searchres}> Obserwujący: {followers}</Text>
              <Text style={styles.searchres}> Obserwuje: {follows}</Text>
            </View>
          </View>
        </Pressable> :
      <Pressable onPress={() => navigation.navigate('UserProfile', {username: username})}>
        <View style={styles.users}>
          <Image style={styles.avatar} source = {avatar ? {uri: avatar} : require('../assets/testUserPhoto.png')}/>
          <View style={styles.inf} >
            <Text style={styles.searchresTopic}>{username}</Text>
            <Text style={styles.searchres}> Obserwujący: {followers}</Text>
            <Text style={styles.searchres}> Obserwuje: {follows}</Text>
          </View>
        </View>
      </Pressable>}
      </>
    );
  };

  const renderItem = ({item})=>(
    <Item avatar={item.avatar} username={item.username} followers={item.followers} follows={item.follows}/>
  );

  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          <View>
            <View style={styles.userStats}>
              <View style={styles.form}>
                <Text style={styles.label}>Nazwa użytkownika</Text>
                <TextInput defaultValue={username} style={styles.input} onChangeText={(v) => setUsername(v)}></TextInput>
              </View>
              <View style={styles.button}>
                <Pressable title="Szukaj" color={'#002f52'} onPress={submit}>
                  <Image source = {require('../assets/search-icon.png')} style={styles.image} tintColor="#002f52" onPress={submit}/>
                  <Text style={styles.text}>Szukaj</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View style={styles.inner}>
            <Text style={styles.results}> Wyniki wyszukiwania: </Text>
            {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
              <>
                <FlatList style={styles.flatlist} data={users} renderItem={renderItem} ></FlatList>
                {isList && help && <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#3292de'}}><Pressable title="Pokaż więcej wyników" onPress={submit}><Text style={styles.endbutton}>POKAŻ WIĘCEJ WYNIKÓW</Text></Pressable></View>}</>}
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
    width: '100%',
    height: '75%',
  },
  searchres: {
    color: 'gray',
  },
  inner: {
    padding: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  endbutton: {
    fontSize: 12,
    letterSpacing: 0.25,
    color: 'white',
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
    height: 50,
  },
  text: {
    fontSize: 12,
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
  },
  users: {
    marginLeft: 20,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
});
