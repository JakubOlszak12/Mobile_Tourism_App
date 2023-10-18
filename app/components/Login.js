import {StyleSheet, Text, View, Image, TextInput, Button, KeyboardAvoidingView, SafeAreaView, ScrollView, Pressable} from 'react-native';
import axios from 'axios';
import React, {useState} from 'react';
import deviceStorage from '../DeviceStorage';
import {useAuth} from '../AuthContext';
import configData from '../config_file.json';
import {BarIndicator} from 'react-native-indicators';
import {useHeaderHeight} from '@react-navigation/elements';
export default function Login({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  // eslint-disable-next-line no-unused-vars
  const [_, setUserData] = useAuth();
  const submit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    axios.post(configData.SERVER_URL+'user/login', {email, password})
        .then((response) => {
          deviceStorage.saveItem('token', response.data.token);
          setUserData({
            token: response.data.token,
            username: response.data.user.username,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          alert(err.response.data.message);
        });
  };
  return (
    <>
      <KeyboardAvoidingView keyboardVerticalOffset={headerHeight} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            {isLoading == true ? <BarIndicator count={5} color='#002f52'/> :
          <ScrollView>
            <Image source = {require('../assets/logo.png')} style={styles.image}/>
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} onChangeText={(v) => setEmail(v)}></TextInput>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Hasło</Text>
              <TextInput style={styles.input} secureTextEntry={true} onChangeText={(v) => setPassword(v)}></TextInput>
              <View style={{alignItems: 'flex-end'}}><Pressable onPress={() => navigation.navigate('PasswordReset')}><Text style={{color: '#faa933', fontSize: 14}}>Nie pamiętasz hasła?</Text></Pressable></View>
            </View>
          </ScrollView>}
            <View style={styles.button}>
              <Button onPress={submit} color='#faa933' title='Zaloguj się' />
            </View>
            <Button
              color='#faa933'
              title="Nie masz jeszcze konta? Zarejestruj się!"
              onPress={() =>
                navigation.navigate('Register')
              }
            />
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
  containerLoading: {
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  inner: {
    padding: 0,
    flex: 1,
    justifyContent: 'flex-end',
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
    height: 30,
    backgroundColor: '#002f52',
  },
  bottomBarText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  logo: {
    justifyContent: 'flex-start',
    height: '90%',
  },
  image: {
    width: null,
    resizeMode: 'contain',
    height: 220,
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
    margin: 10,
  },
});
