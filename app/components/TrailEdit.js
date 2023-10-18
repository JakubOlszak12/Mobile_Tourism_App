import {StyleSheet, Text, View, Image, Pressable, Alert, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useRef, useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import MapView from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import {useHeaderHeight} from '@react-navigation/elements';
import {BarIndicator} from 'react-native-indicators';
export default function TrailEdit({route, navigation}) {
  const [userData] = useAuth();
  const [mapType, setMapType] = useState(true);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [elevationDestination, setElevationDestination] = useState();
  const [elevation, setElevation] = useState();
  const [duration, setDuration] = useState();
  const [distance, setDistance] = useState();
  const [originName, setOriginName] = useState();
  const [destinationName, setDestinationName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const headerHeight = useHeaderHeight();
  const [fullRouteName, setFullRouteName] = useState();
  const mapRef = useRef(null);
  const originRef = useRef();
  const destinationRef = useRef();
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
          setOriginName(response.data.originName);
          setDestinationName(response.data.destinationName);
          
          setFullRouteName(response.data.fullRouteName);
          const findPosition = {
            latitude: response.data.destination.latitude,
            longitude: response.data.destination.longitude,
            latitudeDelta: 0.11,
            longitudeDelta: 0.11,
          };
          mapRef.current.animateToRegion(findPosition, 3*1000);
           originRef.current?.setAddressText(response.data.originName);
           destinationRef.current?.setAddressText(
             response.data.destinationName
           );
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };


  const getCurrentPosition = async () => {
    setIsLoading(true);
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setIsLoading(false);
      setErrorMsg('Odmówiono pozwolenia na dostęp do lokalizacji');
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

  const submit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const token = userData.token;
    const fullRouteName = originName + ' - ' + destinationName;
    axios.put(configData.SERVER_URL+'routes/editRoute/' + route.params.routeId, {destinationName, originName,fullRouteName, origin, destination, elevation, duration, distance, elevationDestination}, {headers: {'token': token}})
        .then((response) =>{
          setIsLoading(false);
          alert(response.data);
          navigation.navigate('Trails');
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const getElevationsFromApi = async () => {
    setIsLoading(true);
    axios.get('https://api.opentopodata.org/v1/eudem25m?locations=' + origin.latitude + ',' + origin.longitude + '|' + destination.latitude + ',' + destination.longitude)
        .then((response) => {
          setElevationDestination(response.data.results[1].elevation);
          setIsLoading(false);
          setElevation(parseFloat(parseFloat(response.data.results[1].elevation - response.data.results[0].elevation).toFixed(2)));
        })
        .catch((err) => {
          setIsLoading(false);
          alert('Brak dostępu do API - brak informacji o przewyższeniu');
        });
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
      if (originName != null || originName != undefined || destinationName != null || destinationName != undefined) {
        Alert.alert(
            'Szczegóły trasy\n' + originName + ' - ' + destinationName,
            'Długość trasy: ' + distance + ' km\n' + 'Czas trasy: ' + duration + ' min\n' + 'Przewyższenie trasy: ' + elevation + ' m\n',
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
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            <MapView
              ref={mapRef}
              style={styles.map}
              mapType={mapType == true ? "terrain" : "hybrid"}
              initialRegion={{
                latitude: 49.249374156651484,
                longitude: 19.927711165075294,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {origin && <Marker coordinate={origin} />}
              {destination && <Marker coordinate={destination} />}
              {location && (
                <Marker
                  icon={require("../assets/location-pin-icon.png")}
                  coordinate={location}
                />
              )}
              <MapViewDirections
                origin={origin}
                strokeWeight={7}
                destination={destination}
                apikey={configData.API_KEY}
                mode="WALKING"
                strokeWidth={6}
                strokeColor="#FF0000"
                onReady={(result) => {
                  getElevationsFromApi();
                  setDistance(
                    parseFloat(parseFloat(result.distance).toFixed(2))
                  );
                  setDuration(
                    parseFloat(parseFloat(result.duration).toFixed(0))
                  );
                }}
              />
            </MapView>
          </View>
          <View style={styles.searchCon}>
            <GooglePlacesAutocomplete
              styles={{ textInput: styles.inputSearch }}
              ref={originRef}
              placeholder="Początek"
              fetchDetails={true}
              onPress={(data, details = null) => {
                const position = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                };
                setOrigin(position);
                setOriginName(details.name);
                const findPosition = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                };
                mapRef.current.animateToRegion(findPosition, 3 * 1000);
              }}
              query={{
                key: configData.API_KEY,
                language: "en",
                location: "49.232493, 19.958662",
                radius: "17000", // 17 km
                strictbounds: true,
              }}
            />
            <GooglePlacesAutocomplete
              styles={{ textInput: styles.inputSearch }}
              ref={destinationRef}
              placeholder="Cel"
              fetchDetails={true}
              onPress={(data, details = null) => {
                const position = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                };
                setDestination(position);
                setDestinationName(details.name);
                const findPosition = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                };
                mapRef.current.animateToRegion(findPosition, 3 * 1000);
              }}
              query={{
                key: configData.API_KEY,
                language: "en",
                location: "49.232493, 19.958662",
                radius: "17000", // 17 km
                strictbounds: true,
              }}
            />
          </View>
        </SafeAreaView>
        {isLoading == true ? (
          <View style={styles.bottomBar}>
            <BarIndicator count={5} color="#fff" />
          </View>
        ) : (
          <View style={styles.bottomBar}>
            <View style={styles.button}>
              <Pressable
                title="Pozycja"
                color={"#002f52"}
                onPress={getCurrentPosition}
              >
                <Image
                  source={require("../assets/user-map-location-icon.png")}
                  style={styles.image}
                  tintColor="white"
                />
                <Text style={styles.text}>Lokalizacja</Text>
              </Pressable>
            </View>
            <View style={styles.button}>
              <Pressable
                title="Typ mapy"
                color={"#002f52"}
                onPress={SwitchTypeMap}
              >
                <Image
                  source={require("../assets/exchange-refresh-icon.png")}
                  style={styles.image}
                  tintColor="white"
                />
                <Text style={styles.text}>Typ mapy</Text>
              </Pressable>
            </View>
            <View style={styles.button}>
              <Pressable title="Edytuj" color={"#002f52"} onPress={submit}>
                <Image
                  source={require("../assets/add-plus-icon.png")}
                  style={styles.image}
                  tintColor="white"
                />
                <Text style={styles.text}>Edytuj</Text>
              </Pressable>
            </View>
            <View style={styles.button}>
              <Pressable
                title="Szczegóły trasy"
                color={"#002f52"}
                onPress={TrailDetails}
              >
                <Image
                  source={require("../assets/information-mark-circle-outline-icon.png")}
                  style={styles.image}
                  tintColor="white"
                />
                <Text style={styles.text}>Szczegóły trasy</Text>
              </Pressable>
            </View>
          </View>
        )}
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
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    marginLeft: '5%',
    marginRight: '5%',
    marginTop: 20,
  },
  inputSearch: {
    borderColor: '#888',
    borderWidth: 1,
  },
  center: {

  },
  inner: {
    padding: 0,
    flex: 1,
    justifyContent: 'flex-end',
  },
  map: {
    width: '100%',
    height: '100%',
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
});
