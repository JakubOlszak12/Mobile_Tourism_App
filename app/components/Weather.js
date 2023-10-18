import {StyleSheet, Text, View, Image, Button, Pressable, ScrollView, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import React, {useState} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import { BarIndicator, BallIndicator } from "react-native-indicators";
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {LineChart} from 'react-native-chart-kit';
import {useHeaderHeight} from '@react-navigation/elements';
export default function Weather({navigation}) {
  const [userData] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvalancheLoading, setAvalancheLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [locationName, setLocationName] = useState('');
  const [currentTemperature, setCurrentTemperature] = useState('');
  const [currentWindSpeed, setCurrentWindSpeed] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hour, setHour] = useState([]);
  const [temperatureHour, setTemperatureHour] = useState([]);
  const [weathercode, setWeathercode] = useState('');
  const [weathercodeAll, setWeathercodeAll] = useState([]);
  const [weathercodeDay, setWeathercodeDay] = useState([]);
  const [clickHour, setClickHour] = useState([]);
  const [clickTemp, setClickTemp] = useState();
  const [days, setDays] = useState([]);
  const [weatherCodeDays, setWeatherCodeDays] = useState([]);
  const [MaxDayTemp, setMaxDayTemp] = useState([]);
  const [MaxDayWind, setMaxDayWind] = useState([]);
  const [avalanche, setAvalanche] = useState();
  const headerHeight = useHeaderHeight();

  const getAvalanche = async () => {
    const token = userData.token;
    setAvalancheLoading(true);
    axios.get(configData.SERVER_URL+'avalancheDegree', {
      headers: {'token': token}})
        .then((response) => {
          setAvalanche(response.data);
          setAvalancheLoading(false);
        })
        .catch((err) => {
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };

  const getWeatherFromArr = async (number) => {
    setIsLoading(true);
    const resHour = [];
    const resTemp = [];
    const resCode = [];
    for (let i=0+(number*24); i<24+(number*24); i++) {
      const colHour = hour[i].substring(11);
      resHour.push(colHour);
      const colTemp = temperatureHour[i];
      resTemp.push(colTemp);
      const colCode = weathercodeAll[i];
      resCode.push(colCode);
    }
    setClickHour(resHour);
    setClickTemp(resTemp);
    setWeathercodeDay(resCode);
    setCurrentTime(currentDate);
    setCurrentTemperature(MaxDayTemp[number]);
    setCurrentWindSpeed(MaxDayWind[number]);
    setWeathercode(weatherCodeDays[number]);
    setIsLoading(false);
  };

  const getWeatherFromApi = async () => {
    setIsLoading(true);
    getAvalanche();
    axios.get('https://api.open-meteo.com/v1/forecast?latitude=' + location.latitude + '&longitude=' + location.longitude + '&current_weather=true' + '&hourly=temperature_2m' + ',weathercode' + '&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=Europe%2FBerlin')
        .then((response) => {
          setIsLoading(false);
          const resHour = [];
          const resTemp = [];
          const resCode = [];
          for (let i=0; i<25; i++) {
            const colHour = response.data.hourly.time[i].substring(11);
            resHour.push(colHour);
            const colTemp = response.data.hourly.temperature_2m[i];
            resTemp.push(colTemp);
            const colCode = response.data.hourly.weathercode[i];
            resCode.push(colCode);
          }
          setCurrentTemperature(response.data.current_weather.temperature);
          setCurrentWindSpeed(response.data.current_weather.windspeed);
          setCurrentTime(response.data.current_weather.time);
          setWeathercode(response.data.current_weather.weathercode);
          setHour(response.data.hourly.time);
          setTemperatureHour(response.data.hourly.temperature_2m);
          setWeathercodeAll(response.data.hourly.weathercode);
          setDays(response.data.daily.time);
          setCurrentDate(response.data.current_weather.time.substring(0, 10));
          setWeatherCodeDays(response.data.daily.weathercode);
          setMaxDayTemp(response.data.daily.temperature_2m_max);
          setMaxDayWind(response.data.daily.windspeed_10m_max);
          setClickHour(resHour);
          setClickTemp(resTemp);
          setWeathercodeDay(resCode);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data);
          alert('Brak dostępu do API - brak informacji o pogodzie');
        });
  };

  return (
    <>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <View style={{ height: 120, backgroundColor: "#b9ddff" }}></View>
          {isLoading == true ? (
            <BarIndicator count={5} color="#002f52" />
          ) : (
            <View style={styles.inner}>
              <View>
                {currentTemperature && currentWindSpeed && currentTime && (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        width: "100%",
                      }}
                    >
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          width: "30%",
                        }}
                      >
                        <Text style={styles.textP}>{locationName}</Text>
                        <Text style={styles.end}>{currentTime}</Text>
                      </View>
                      <View style={{ justifyContent: "center", width: "30%" }}>
                        {weathercode == 0 ? (
                          <Image
                            source={require("../assets/sun-warm-icon.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                        {weathercode == 1 ||
                        weathercode == 2 ||
                        weathercode == 3 ? (
                          <Image
                            source={require("../assets/day-cloudy-iconv2.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                        {weathercode == 45 || weathercode == 48 ? (
                          <Image
                            source={require("../assets/cloud-fog-icon.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                        {weathercode == 51 ||
                        weathercode == 53 ||
                        weathercode == 55 ||
                        weathercode == 56 ||
                        weathercode == 57 ||
                        weathercode == 61 ||
                        weathercode == 63 ||
                        weathercode == 65 ||
                        weathercode == 66 ||
                        weathercode == 67 ? (
                          <Image
                            source={require("../assets/cloud-rain-icon.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                        {weathercode == 80 ||
                        weathercode == 81 ||
                        weathercode == 82 ? (
                          <Image
                            source={require("../assets/day-cloud-rain-icon.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                        {weathercode == 71 ||
                        weathercode == 73 ||
                        weathercode == 75 ||
                        weathercode == 77 ||
                        weathercode == 85 ||
                        weathercode == 86 ? (
                          <Image
                            source={require("../assets/cloud-snow-icon.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                        {weathercode == 95 ||
                        weathercode == 96 ||
                        weathercode == 99 ? (
                          <Image
                            source={require("../assets/cloud-rain-lightning-icon.png")}
                            style={styles.imageW}
                            tintColor="#002f52"
                          />
                        ) : null}
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          width: "30%",
                        }}
                      >
                        <Text style={styles.end}>Stopień lawinowy</Text>
                        {isAvalancheLoading ? (
                          <BallIndicator count={10} color="#002f52" size={15} />
                        ) : (
                          <Text style={styles.end}>{avalanche}</Text>
                        )}
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        width: "100%",
                        marginTop: 40,
                      }}
                    >
                      <View style={{ justifyContent: "center", width: "30%" }}>
                        <Image
                          source={require("../assets/wind-icon.png")}
                          style={styles.imageW}
                        />
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            marginTop: 10,
                          }}
                        >
                          <Text style={styles.textP}>
                            {currentWindSpeed} km/h
                          </Text>
                        </View>
                      </View>
                      <View style={{ justifyContent: "center", width: "30%" }}>
                        {currentTemperature > 0 && currentTemperature < 30 ? (
                          <Image
                            source={require("../assets/medium-temperature-icon.png")}
                            style={styles.imageW}
                          />
                        ) : null}
                        {currentTemperature <= 0 ? (
                          <Image
                            source={require("../assets/low-temperature-icon.png")}
                            style={styles.imageW}
                          />
                        ) : null}
                        {currentTemperature >= 30 ? (
                          <Image
                            source={require("../assets/high-temperature-icon.png")}
                            style={styles.imageW}
                          />
                        ) : null}
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            marginTop: 10,
                          }}
                        >
                          <Text style={styles.textP}>
                            {currentTemperature} °C
                          </Text>
                        </View>
                      </View>
                    </View>
                    {clickHour && clickTemp && (
                      <View style={{ width: "100%", marginTop: 10 }}>
                        <Text style={styles.end}>Temperatura</Text>
                        <ScrollView
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                        >
                          <LineChart
                            data={{
                              labels: clickHour,
                              datasets: [
                                {
                                  data: clickTemp,
                                },
                              ],
                            }}
                            width={1000}
                            height={160}
                            yAxisSuffix="°C"
                            renderDotContent={({ x, y, index }) => {
                              return (
                                <View key={index}>
                                  {y < 30 ? (
                                    <View
                                      style={{
                                        height: 50,
                                        width: 50,
                                        position: "absolute",
                                        top: y + 10,
                                        left: x - 25,
                                        alignItems: "center",
                                      }}
                                    >
                                      <View>
                                        {weathercodeDay[index] == 0 ? (
                                          <Image
                                            source={require("../assets/sun-warm-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 1 ||
                                        weathercodeDay[index] == 2 ||
                                        weathercodeDay[index] == 3 ? (
                                          <Image
                                            source={require("../assets/day-cloudy-iconv2.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 45 ||
                                        weathercodeDay[index] == 48 ? (
                                          <Image
                                            source={require("../assets/cloud-fog-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 51 ||
                                        weathercodeDay[index] == 53 ||
                                        weathercodeDay[index] == 55 ||
                                        weathercodeDay[index] == 56 ||
                                        weathercodeDay[index] == 57 ||
                                        weathercodeDay[index] == 61 ||
                                        weathercodeDay[index] == 63 ||
                                        weathercodeDay[index] == 65 ||
                                        weathercodeDay[index] == 66 ||
                                        weathercodeDay[index] == 67 ? (
                                          <Image
                                            source={require("../assets/cloud-rain-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 80 ||
                                        weathercodeDay[index] == 81 ||
                                        weathercodeDay[index] == 82 ? (
                                          <Image
                                            source={require("../assets/day-cloud-rain-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 71 ||
                                        weathercodeDay[index] == 73 ||
                                        weathercodeDay[index] == 75 ||
                                        weathercodeDay[index] == 77 ||
                                        weathercodeDay[index] == 85 ||
                                        weathercodeDay[index] == 86 ? (
                                          <Image
                                            source={require("../assets/cloud-snow-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 95 ||
                                        weathercodeDay[index] == 96 ||
                                        weathercodeDay[index] == 99 ? (
                                          <Image
                                            source={require("../assets/cloud-rain-lightning-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        <Text style={{ fontSize: 10 }}>
                                          {clickTemp[index]}
                                        </Text>
                                      </View>
                                    </View>
                                  ) : (
                                    <View
                                      style={{
                                        height: 50,
                                        width: 50,
                                        position: "absolute",
                                        top: y - 36,
                                        left: x - 25,
                                        alignItems: "center",
                                      }}
                                    >
                                      <View>
                                        {weathercodeDay[index] == 0 ? (
                                          <Image
                                            source={require("../assets/sun-warm-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 1 ||
                                        weathercodeDay[index] == 2 ||
                                        weathercodeDay[index] == 3 ? (
                                          <Image
                                            source={require("../assets/day-cloudy-iconv2.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 45 ||
                                        weathercodeDay[index] == 48 ? (
                                          <Image
                                            source={require("../assets/cloud-fog-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 51 ||
                                        weathercodeDay[index] == 53 ||
                                        weathercodeDay[index] == 55 ||
                                        weathercodeDay[index] == 56 ||
                                        weathercodeDay[index] == 57 ||
                                        weathercodeDay[index] == 61 ||
                                        weathercodeDay[index] == 63 ||
                                        weathercodeDay[index] == 65 ||
                                        weathercodeDay[index] == 66 ||
                                        weathercodeDay[index] == 67 ? (
                                          <Image
                                            source={require("../assets/cloud-rain-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 80 ||
                                        weathercodeDay[index] == 81 ||
                                        weathercodeDay[index] == 82 ? (
                                          <Image
                                            source={require("../assets/day-cloud-rain-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 71 ||
                                        weathercodeDay[index] == 73 ||
                                        weathercodeDay[index] == 75 ||
                                        weathercodeDay[index] == 77 ||
                                        weathercodeDay[index] == 85 ||
                                        weathercodeDay[index] == 86 ? (
                                          <Image
                                            source={require("../assets/cloud-snow-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        {weathercodeDay[index] == 95 ||
                                        weathercodeDay[index] == 96 ||
                                        weathercodeDay[index] == 99 ? (
                                          <Image
                                            source={require("../assets/cloud-rain-lightning-icon.png")}
                                            style={styles.imageM}
                                            tintColor="#0363ab"
                                          />
                                        ) : null}
                                        <Text style={{ fontSize: 10 }}>
                                          {clickTemp[index]}
                                        </Text>
                                      </View>
                                    </View>
                                  )}
                                </View>
                              );
                            }}
                            chartConfig={{
                              backgroundColor: "#fff",
                              backgroundGradientFrom: "#fff",
                              backgroundGradientTo: "#fff",
                              decimalPlaces: 1, // optional, defaults to 2dp
                              color: (opacity = 1) =>
                                `rgba(171, 118, 39, ${opacity})`,
                              labelColor: (opacity = 1) =>
                                `rgba(0, 0, 0, ${opacity})`,
                              style: {
                                borderRadius: 16,
                              },
                              propsForDots: {
                                r: "3",
                                strokeWidth: "3",
                                stroke: "black",
                              },
                            }}
                            bezier
                            style={{
                              marginVertical: 8,
                              borderRadius: 16,
                            }}
                          />
                        </ScrollView>
                      </View>
                    )}
                    {days.length != 0 ? (
                      <ScrollView>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            width: "100%",
                            borderTopWidth: 1,
                          }}
                        >
                          {days.map((item, index) => {
                            return (
                              <View key={item} width="100%" alignItems="center">
                                {currentDate == item ? (
                                  <View
                                    width={40}
                                    height="100%"
                                    style={{
                                      backgroundColor: "#3249de",
                                      shadowColor: "black",
                                      shadowOffset: { width: 4, height: 4 },
                                      shadowOpacity: 0.5,
                                      shadowRadius: 4,
                                      elevation: 1,
                                      borderBottomRightRadius: 6,
                                      borderBottomLeftRadius: 6,
                                    }}
                                  >
                                    <Pressable>
                                      <Text>{item}</Text>
                                    </Pressable>
                                  </View>
                                ) : (
                                  <View
                                    width={40}
                                    height="100%"
                                    style={{
                                      backgroundColor: "#3292de",
                                      shadowColor: "black",
                                      shadowOffset: { width: 4, height: 4 },
                                      shadowOpacity: 0.5,
                                      shadowRadius: 4,
                                      elevation: 1,
                                      borderBottomRightRadius: 6,
                                      borderBottomLeftRadius: 6,
                                    }}
                                  >
                                    <Pressable
                                      onPress={() => {
                                        getWeatherFromArr(index);
                                        setCurrentDate(item);
                                      }}
                                    >
                                      <Text>{item}</Text>
                                    </Pressable>
                                  </View>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      </ScrollView>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          )}
        </SafeAreaView>
        <View style={styles.searchCon}>
          <GooglePlacesAutocomplete
            styles={{ textInput: styles.inputSearch }}
            placeholder="Wpisz nazwę miejsca"
            fetchDetails={true}
            onPress={(data, details = null) => {
              const position = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              setLocation(position);
              setLocationName(details.name);
            }}
            query={{
              key: "AIzaSyCboFgxLuCo7QNSi0v92444FSeZyHflGk4",
              language: "en",
              location: "49.232493, 19.958662",
              radius: "17000", // 17 km
              strictbounds: true,
            }}
          />
          <Button
            title="Pogoda"
            onPress={getWeatherFromApi}
            disabled={!location}
          ></Button>
        </View>
        <View style={styles.bottomBar}>
          <View style={styles.button}>
            <Pressable
              title="Główna"
              color={"#002f52"}
              onPress={() => navigation.navigate("Main")}
            >
              <Image
                source={require("../assets/homepage-icon.png")}
                style={styles.image}
                tintColor="white"
              />
              <Text style={styles.text}>Główna</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable
              title="Trasy"
              color={"#002f52"}
              onPress={() => navigation.navigate("Trails")}
            >
              <Image
                source={require("../assets/hiking-icon.png")}
                style={styles.image}
                tintColor="white"
              />
              <Text style={styles.text}>Trasy</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable title="Pogoda" color={"#002f52"}>
              <Image
                source={require("../assets/day-cloudy-icon.png")}
                style={styles.image}
                tintColor="white"
              />
              <Text style={styles.text}>Pogoda</Text>
            </Pressable>
          </View>
          <View style={styles.button}>
            <Pressable
              title="Profil"
              color={"#002f52"}
              onPress={() => navigation.navigate("Profile")}
            >
              <Image
                source={require("../assets/user-profile-icon.png")}
                style={styles.image}
                tintColor="white"
              />
              <Text style={styles.text}>Profil</Text>
            </Pressable>
          </View>
        </View>
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
    marginTop: 8,
  },
  inputSearch: {
    borderColor: '#888',
    borderWidth: 1,
  },
  center: {

  },
  map: {
    width: '100%',
    height: '92%',
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
  imageW: {
    width: null,
    resizeMode: 'contain',
    height: 55,
  },
  imageM: {
    width: 20,
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
    // paddingBottom: 5,
    height: 50,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  textP: {
    fontSize: 20,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'gray',
    fontWeight: 'bold',
  },
  end: {
    fontSize: 12,
    letterSpacing: 0.25,
    color: 'gray',
  },
  inner: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-around',
  },
});
