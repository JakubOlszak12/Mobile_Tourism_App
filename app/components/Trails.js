import {StyleSheet, Text, View, Image, Pressable, FlatList, Dimensions, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import {useIsFocused} from '@react-navigation/native';
import {useHeaderHeight} from '@react-navigation/elements';
import {BarIndicator} from 'react-native-indicators';
export default function Trails({navigation}) {
  const [userData] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [trails, setTrails] = useState([]);
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();

  const getTrails = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL+'routes/getRoutes', {
      headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          setTrails(response.data);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };


  const Item = ({duration, elevation, distance, fullRouteName, routeId}) => {
    return (
      <Pressable onPress={() => navigation.navigate('TrailView', {routeId: routeId})}>
        <View style={styles.users}>
          <Image style={styles.avatar} source = {require('../assets/challenge-icon.png')}/>
          <View style={styles.inf} >
            <Text style={styles.searchresTopic}>{fullRouteName == undefined ? 'Nazwa Trasy' : fullRouteName}</Text>
            <Text style={styles.searchres}> Czas: {duration} min</Text>
            <Text style={styles.searchres}> Przewyższenie: {elevation} m</Text>
            <Text style={styles.searchres}> Dystans: {distance} km</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderItem = ({item})=>(
    <Item duration={item.duration} elevation={item.elevation} distance={item.distance} fullRouteName={item.fullRouteName} routeId={item.routeId}/>
  );

  useEffect(() => {
    getTrails();
  }, [isFocused]);
  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          {trails.length == 0 ?
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.label}>Brak zapisanych tras</Text>
              <Text style={styles.searchres}> Dodaj nową trasę!</Text>
            </View> :
          <View style={styles.inner}>
            <Text style={styles.results}> Zapisane trasy </Text>
            {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :<>
              <FlatList style={styles.flatlist} data={trails} renderItem={renderItem} ></FlatList></>}
          </View>
          }
        </SafeAreaView>
        <View style={styles.bottomBar}>
          <View style={styles.button}>
            <Pressable title="Główna" color={'#002f52'} onPress={() => navigation.navigate('Main')}>
              <Image source = {require('../assets/homepage-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Główna</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Trasy" color={'#002f52'}>
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  inner: {
    padding: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  flatlist: {
    width: Dimensions.get('window').width,
  },
  searchres: {
    color: 'gray',
  },
  searchresTopic: {
    color: '#faa933',
    fontSize: 15,
    width: "70%"
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
