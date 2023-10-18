import {StyleSheet, Text, View, Image, Pressable, Alert, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useRef, useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {BarIndicator} from 'react-native-indicators';
import * as Location from 'expo-location';
import {useHeaderHeight} from '@react-navigation/elements';

export default function TrailView({route, navigation}) {
  const [userData] = useAuth();
  const [mapType, setMapType] = useState(true);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [elevation, setElevation] = useState();
  const [duration, setDuration] = useState();
  const [distance, setDistance] = useState();
  const [fullRouteName, setFullRouteName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const headerHeight = useHeaderHeight();
  const mapRef = useRef(null);


  const getCurrentPosition = async () => {
    setIsLoading(true);
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Odmówiono pozwolenia na dostęp do lokalizacji');
      setIsLoading(false);
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    const position ={
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setLocation(position);
    setIsLoading(false);
  };

  const getInfoTrail = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL + 'routes/getRouteInfo/' + route.params.routeId, {headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          setOrigin(response.data.origin);
          setDestination(response.data.destination);
          setDuration(response.data.duration);
          setElevation(response.data.elevation);
          setDistance(response.data.distance);
          setFullRouteName(response.data.fullRouteName);
          const findPosition = {
            latitude: response.data.destination.latitude,
            longitude: response.data.destination.longitude,
            latitudeDelta: 0.11,
            longitudeDelta: 0.11,
          };
          mapRef.current.animateToRegion(findPosition, 3*1000);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const deleteTrail = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.delete(configData.SERVER_URL + 'routes/deleteRoute/' + route.params.routeId, {headers: {'token': token}})
        .then(() => {
          setIsLoading(false);
          navigation.navigate('Trails');
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const finishTrail = async () => {
    setIsLoading(true);
    getCurrentPosition();
    const token = userData.token;
    axios.post(configData.SERVER_URL + 'routes/finishRoute/' + route.params.routeId, {'longitude': location.longitude, 'latitude': location.latitude}, {headers: {'token': token}})
        .then(() => {
          setIsLoading(false);
          navigation.navigate('Trails');
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const deleteTrailConfirm = async () => {
    Alert.alert(
        'Uwaga',
        'Potwierdź usunięcie trasy!',
        [
          {text: 'Cofnij'},
          {text: 'OK', onPress: () => deleteTrail()},
        ],
    );
  };

  const finishTrailConfirm = async () => {
    Alert.alert(
        'Uwaga',
        'Zatwierdź ukończenie trasy!',
        [
          {text: 'Cofnij'},
          {text: 'OK', onPress: () => finishTrail()},
        ],
    );
  };

  const TrailDetails = async () => {
    if (origin == null || origin == undefined || origin == '' || destination == null || destination == undefined || destination == '') {
      Alert.alert(
          'Brak początku lub końca trasy!',
          'Wyszukaj na mapie punkt początkowy oraz punkt końcowy.',
          [
            {text: 'OK'},
          ]);
    } else {
      Alert.alert(
          'Szczegóły trasy\n' + fullRouteName,
          'Długość trasy: ' + distance + ' km\n' + 'Czas trasy: ' + duration + ' min\n' + 'Przewyższenie trasy: ' + elevation + ' m\n',
          [
            {text: 'OK'},
          ]);
    }
  };

  const SwitchTypeMap = async () => {
    setMapType(!mapType);
  };
  useEffect(() => {
    getInfoTrail();
  }, []);
  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            <MapView
              ref={mapRef}
              style={styles.map}
              mapType={mapType == true ? 'terrain' : 'hybrid'}
              initialRegion={{
                latitude: 49.249374156651484,
                longitude: 19.927711165075294,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,

              }}>
              {origin && <Marker coordinate = {origin}/>}
              {destination && <Marker coordinate = {destination}/>}
              {location && <Marker icon = {require('../assets/location-pin-icon.png')} coordinate = {location}/>}
              <MapViewDirections
                origin={origin}
                strokeWeight={7}
                destination={destination}
                apikey={configData.API_KEY}
                mode='WALKING'
                strokeWidth={6}
                strokeColor="#FF0000"
              />
            </MapView>
            <View style={styles.searchCon}>
              <View style={styles.buttonB}>
                {isLoading == true ? <BarIndicator count={3} color='#fff'/> :
          <Pressable title="Pozycja" color={'#002f52'} onPress={finishTrailConfirm}>
            <Image source = {require('../assets/black-flag-icon.png')} style={styles.imageB} tintColor="white"/>
            <Text style={styles.textB}>Zakończ</Text>
          </Pressable>}
              </View>
              <View style={styles.buttonB}>
                {isLoading == true ? <BarIndicator count={3} color='#fff'/> :
          <Pressable title="Pozycja" color={'#002f52'} onPress={deleteTrailConfirm}>
            <Image source = {require('../assets/delete-icon.png')} style={styles.imageB} tintColor="white"/>
            <Text style={styles.textB}>Usuń</Text>
          </Pressable>}
              </View>
            </View>
          </View>
        </SafeAreaView>
        {isLoading == true ? <View style={styles.bottomBar}><BarIndicator count={5} color='#fff'/></View> :
        <View style={styles.bottomBar}>
          <View style={styles.button}>
            <Pressable title="Pozycja" color={'#002f52'} onPress={getCurrentPosition}>
              <Image source = {require('../assets/user-map-location-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Lokalizacja</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Typ mapy" color={'#002f52'} onPress={SwitchTypeMap}>
              <Image source = {require('../assets/exchange-refresh-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Typ mapy</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Dodaj" color={'#002f52'} onPress={()=> navigation.navigate('TrailEdit', {routeId: route.params.routeId})}>
              <Image source = {require('../assets/edit-location-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Edytuj</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Szczegóły trasy" color={'#002f52'} onPress={TrailDetails}>
              <Image source = {require('../assets/information-mark-circle-outline-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Szczegóły trasy</Text>
            </Pressable>
          </View>
        </View>}
      </KeyboardAvoidingView>

    </>
  );
}
const styles = StyleSheet.create({
  lottie: {
    width: 150,
    height: 150,
  },
  searchCon: {
    position: 'absolute',
    width: '90%',
    padding: 8,
    borderRadius: 8,
    marginRight: '5%',
    marginTop: 20,
  },
  inputSearch: {
    borderColor: '#888',
    borderWidth: 1,
  },
  center: {

  },
  map: {
    width: '100%',
    height: '100%',
  },
  inner: {
    padding: 0,
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
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
  logo: {

  },
  image: {
    width: null,
    resizeMode: 'contain',
    height: 33,
  },
  imageB: {
    width: null,
    resizeMode: 'contain',
    height: 20,
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
  buttonB: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '16%',
    height: 50,
    marginBottom: 20,
    backgroundColor: '#002f52',
    shadowColor: 'black',
    shadowOffset: {width: 5, height: 5},
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 7,
    borderRadius: 100,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  textB: {
    fontSize: 10,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
});
