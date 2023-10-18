
import {StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Register from './components/Register';
import Login from './components/Login';
import Main from './components/Main';
import Map from './components/Map';
import Trails from './components/Trails';
import Weather from './components/Weather';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Search from './components/Search';
import AuthProvider, {useAuth} from './AuthContext';
import UserProfile from './components/UserProfile';
import {LogBox} from 'react-native';
import Chat from './components/Chat';
import TrailView from './components/TrailView';
import AddPost from './components/AddPost';
import EditPost from './components/EditPost';
import UserAchievement from './components/UserAchievement';
import Achievement from './components/Achievement';
import Follow from './components/Follow';
import Follower from './components/Follower';
import Notification from './components/Notification';
import TrailEdit from './components/TrailEdit';
import PasswordReset from './components/PasswordReset';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();
const Stack = createNativeStackNavigator();

const Navigator = () => {
  const [user] = useAuth();
  console.log('User:');
  console.log(user.token);

  if (user.token == '' || user.token == undefined) {
    return (
      <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: '#002f52'}}}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: 'Logowanie',
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 25,
            },
          }}/>
        <Stack.Screen
          name="Register"
          component={Register}
          options={{
            title: 'Rejestracja',
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 25,
            },
          }}/>
        <Stack.Screen
          name="PasswordReset"
          component={PasswordReset}
          options={{
            title: 'Przypomnienie hasła',
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 25,
            },
          }}/>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: '#002f52'}}}>
      <Stack.Screen
        name="Main"
        component={Main}
        options={({navigation}) => ({
          title: 'Główna',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
          headerRight: () => (
            <View style={{flexDirection: 'row'}}>
              <View>
                <TouchableOpacity title="Szukaj" color={'#002f52'} onPress={() => navigation.navigate('Search')}>
                  <Image source = {require('./assets/search-icon.png')} style={styles.image} tintColor="white"/>
                </TouchableOpacity>
              </View>
              <View style={{marginLeft: 10}}>
                <TouchableOpacity style={{marginLeft: '3%'}} title="Powiadomienia" color={'#002f52'} onPress={() => navigation.navigate('Notification')}>
                  <Image source = {require('./assets/notification-bell-icon.png')} style={styles.image} tintColor="white"/>
                </TouchableOpacity>
              </View>
              <View style={{marginLeft: 10}}>
                <TouchableOpacity style={{marginLeft: '3%'}} title="Ustawienia" color={'#002f52'}>
                  <Image source = {require('./assets/sign-out-icon.png')} style={styles.image} tintColor="white"/>
                </TouchableOpacity>
              </View>
            </View>
          ),
        })}/>

      <Stack.Screen
        name="Trails"
        component={Trails}
        options={({navigation}) => ({
          headerBackVisible: false,
          title: 'Trasy',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
          headerRight: () => (
            <Pressable title="Szukaj" color={'#002f52'} onPress={() => navigation.navigate('Map')}>
              <Image source = {require('./assets/map-icon.png')} style={styles.image} tintColor="white"/>
              <Text style={styles.text}>Mapa</Text>
            </Pressable>
          ),
        })}/>

      <Stack.Screen
        name="Map"
        component={Map}
        options={{
          title: 'Mapa',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="TrailEdit"
        component={TrailEdit}
        options={{
          title: 'Edycja trasy',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>


      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          title: 'Powiadomienia',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="Weather"
        component={Weather}
        options={{
          headerBackVisible: false,
          title: 'Pogoda',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: 'Edycja Profilu',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="EditPost"
        component={EditPost}
        options={{
          title: 'Edycja postu',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="TrailView"
        component={TrailView}
        options={{
          title: 'Podgląd trasy',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={{
          title: 'Dodaj post',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={({navigation}) => ({
          headerBackVisible: false,
          title: 'Profil',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
          headerRight: () => (
            <Button
              onPress={() => navigation.navigate('EditProfile')}
              title="Edytuj"
            />
          ),
        })}/>

      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          title: 'Wyszukaj użytkownika',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          title: 'Czat',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>

      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          title: 'Profil użytkownika',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>
      <Stack.Screen
        name="UserAchievement"
        component={UserAchievement}
        options={{
          title: 'Zdobyte osiągnięcia',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>
      <Stack.Screen
        name="Achievement"
        component={Achievement}
        options={{
          title: 'Osiągnięcia',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>
      <Stack.Screen
        name="Follow"
        component={Follow}
        options={{
          title: 'Obserwacje',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>
      <Stack.Screen
        name="Follower"
        component={Follower}
        options={{
          title: 'Obserwujący',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 25,
          },
        }}/>
    </Stack.Navigator>
  );
};

export default function App({navigation}) {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  image: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
});
