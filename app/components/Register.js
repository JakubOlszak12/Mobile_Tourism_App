import {StyleSheet, Text, View, Image, TextInput, Button, KeyboardAvoidingView, SafeAreaView, ScrollView} from 'react-native';
import axios from 'axios';
import React, {useState} from 'react';
import configData from '../config_file.json';
import {useHeaderHeight} from '@react-navigation/elements';
import {BarIndicator} from 'react-native-indicators';
export default function Register({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const submit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    axios.post(configData.SERVER_URL+'user/register', {email, password, passwordCheck, username})
        .then((response) => {
          setIsLoading(false);
          alert(response.data);
          setEmail('');
          setPassword('');
          setPasswordCheck('');
          setUsername('');
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
              <TextInput value={email} style={styles.input} onChangeText={(v) => setEmail(v)}></TextInput>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Hasło</Text>
              <TextInput value={password} style={styles.input} secureTextEntry={true} onChangeText={(v) => setPassword(v)}></TextInput>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Powtórz hasło</Text>
              <TextInput value={passwordCheck} style={styles.input} secureTextEntry={true} onChangeText={(v) => setPasswordCheck(v)}></TextInput>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Nazwa użytkownika</Text>
              <TextInput value={username} style={styles.input} onChangeText={(v) => setUsername(v)}></TextInput>
            </View>
          </ScrollView>}
            <View style={styles.button}>
              <Button onPress={submit} color='#faa933' title='Zarejestruj się' />
            </View>
            <Button
              color='#faa933'
              title="Masz już konto? Zaloguj się!"
              onPress={() =>
                navigation.navigate('Login')
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

  },
  image: {
    width: null,
    resizeMode: 'contain',
    height: 220,
    marginBottom: -30,
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
    marginBottom: -15,
  },
  label: {
    color: '#faa933',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -10,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  error: {
    color: 'red',
    fontSize: 15,
    paddingLeft: 20,
    marginBottom: -15,
  },
});
