import {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BarIndicator} from 'react-native-indicators';
import axios from 'axios';
const AuthContext = createContext(null);
import configData from './config_file.json';
export const useAuth = () => {
  // console.log("useauth");
  // console.log(useContext(AuthContext));
  return useContext(AuthContext);
};

const AuthProvider = ({children}) => {
  // const [user, setUser] = useState(null);

  const [userData, setUserData] = useState({
    token: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const isGood = async () => {
      setIsLoading(true);
      // w razie jakby nie działał axios -> 192.168.0.10 <- zmieniasz na swoje IP - trzeba będzie to zautomatyzować ??
      try {
        let token = await AsyncStorage.getItem('token');
        console.log(token);
        if (token === null) {
          await AsyncStorage.setItem('token', '');
          token = '';
        }
        const tokenResponse = await axios.post(configData.SERVER_URL+'user/tokenValid', null, {headers: {'token': token}});
        console.log(tokenResponse.data);
        if (tokenResponse.data) {
          const userResponse = await axios.get(configData.SERVER_URL+'user/', {headers: {'token': token}});
          setIsLoading(false);
          setUserData({
            token,
            username: userResponse.data.username,
          });
        } else {
          console.log('Removed');
          setIsLoading(false);
          AsyncStorage.removeItem('token');
          setUserData({
            token: '',
            username: '',
          });
        }
        // console.log(value);
      } catch (error) {
        setIsLoading(false);
        console.log('Error logged: ' + error);
      }
    };
    isGood();
  }, []);

  return (
    <>
      {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
        <AuthContext.Provider value={[userData, setUserData]}>
          {children}
        </AuthContext.Provider>
      }
    </>
  );
};
export default AuthProvider;
