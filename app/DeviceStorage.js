import AsyncStorage from '@react-native-async-storage/async-storage';

const deviceStorage = {
  async saveItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log('AsyncStorage Error: ' + error.message);
    }
  },
  async getToken(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      // console.log(value);
      return value != null ? JSON.parse(value) : null;
    } catch (error) {
      console.log('AsyncStorage Error: ' + error.message);
    }
  },

};

export default deviceStorage;
