import {StyleSheet, Text, View, Image, TextInput, Button, Pressable, SafeAreaView, KeyboardAvoidingView, ScrollView} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../AuthContext';
import * as ImagePicker from 'expo-image-picker';
import configData from '../config_file.json';
import {BarIndicator} from 'react-native-indicators';
import {useHeaderHeight} from '@react-navigation/elements';
export default function EditProfile({navigation}) {
  const [userData] = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordCheck, setNewPasswordCheck] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [image, setImage] = useState(null);
  const [photoShow, setPhotoShow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      setPhotoShow(result.uri);
    }
  };

  const getUserData = async () => {
    setIsLoading(true);
    const token = userData.token;
    axios.get(configData.SERVER_URL+'user/editData', {
      headers: {'token': token}})
        .then((response) => {
          setIsLoading(false);
          setUsername(response.data.username);
          setDescription(response.data.description);
          setEmail(response.data.email);
          setPhotoShow(response.data.avatar);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
        });
  };

  useEffect(() => {
    getUserData();
  }, []);


  const submit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const token = userData.token;
    const postObject = new FormData();
    let filename = '';

    if (image != null) {
      const localUri = image;
      filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      postObject.append('image', {uri: localUri, name: filename, type});
    }
    postObject.append('email', email);
    postObject.append('newPassword', newPassword);
    postObject.append('newPasswordCheck', newPasswordCheck);
    postObject.append('username', username);
    postObject.append('currentPassword', currentPassword);
    postObject.append('description', description);
    postObject.append('imagename', filename);
    axios.patch(configData.SERVER_URL+'user/edit', postObject, {headers: {'token': token, 'Content-Type': 'multipart/form-data'}})
        .then(() => {
          setIsLoading(false);
          navigation.navigate('Profile');
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.response.data.message);
          if (err.response.data.message === undefined) {
            alert(err.response.data.replace(/<[^>]*>?/gm, ''));
          } else alert(err.response.data.message);
        });
  };

  return (
    <>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            {isLoading == true ? (
              <BarIndicator count={5} color="#002f52" />
            ) : (
              <ScrollView>
                <View style={styles.userData}>
                  <View style={styles.button}>
                    <Text style={styles.label}>Avatar</Text>
                    <Pressable
                      title="Profil"
                      color={"#002f52"}
                      onPress={pickImage}
                    >
                      {!photoShow && (
                        <Image
                          source={require("../assets/sync-image-photo-icon.png")}
                          style={styles.imageM}
                          tintColor="#002f52"
                        />
                      )}
                      {photoShow && (
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: photoShow }}
                            style={styles.avatar}
                          />
                        </View>
                      )}
                    </Pressable>
                  </View>
                </View>
                <View style={styles.form}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    defaultValue={email}
                    style={styles.input}
                    onChangeText={(v) => setEmail(v)}
                  ></TextInput>
                </View>
                <View style={styles.form}>
                  <Text style={styles.label}>Nazwa użytkownika</Text>
                  <TextInput
                    defaultValue={username}
                    style={styles.input}
                    onChangeText={(v) => setUsername(v)}
                  ></TextInput>
                </View>
                <View style={styles.form}>
                  <Text style={styles.label}>Opis</Text>
                  <TextInput
                    defaultValue={description}
                    style={styles.input}
                    onChangeText={(v) => setDescription(v)}
                  ></TextInput>
                </View>
                <View style={styles.form}>
                  <Text style={styles.label}>Nowe hasło</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={(v) => setNewPassword(v)}
                  ></TextInput>
                </View>
                <View style={styles.form}>
                  <Text style={styles.label}>Powtórz nowe hasło</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={(v) => setNewPasswordCheck(v)}
                  ></TextInput>
                </View>
                <View style={styles.form}>
                  <Text style={styles.label}>Stare hasło</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={(v) => setCurrentPassword(v)}
                  ></TextInput>
                </View>
              </ScrollView>
            )}

            <View style={styles.search}>
              <Button
                onPress={submit}
                color="#faa933"
                title="Zatwierdź dane"
                disabled={currentPassword == undefined || currentPassword == ""}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  containerLoading: {
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "center",
  },
  lottie: {
    width: 150,
    height: 150,
  },
  topBar: {
    paddingLeft: 10,
    height: 40,
    backgroundColor: "#002f52",
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "flex-end",
  },
  topBarText: {
    fontSize: 25,
    color: "#fff",
  },
  imageContainer: {
    padding: 20,
  },
  bottomBar: {
    height: 60,
    backgroundColor: "#002f52",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBarText: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
  },
  logo: {},
  image: {
    width: null,
    resizeMode: "contain",
    height: 33,
  },
  imageM: {
    width: 40,
    resizeMode: "contain",
    height: 33,
  },
  avatar: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "black",
  },
  form: {
    padding: 10,
  },
  input: {
    height: 40,
    backgroundColor: "#002f52",
    border: 1,
    borderRadius: 10,
    fontSize: 18,
    color: "#fff",
    paddingLeft: 20,
    paddingRight: 20,
  },
  label: {
    color: "#faa933",
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: "25%",
    // paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: "white",
  },
  username: {
    fontSize: 45,
    color: "#faa933",
    fontWeight: "bold",
  },
  userData: {
    justifyContent: "center",
    alignItems: "center",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
  },
  topic: {
    color: "#b5b09b",
    fontWeight: "bold",
  },
  topicStat: {
    color: "#b5b09b",
    fontWeight: "bold",
    marginLeft: 70,
    marginRight: 70,
  },
  topicStat1: {
    color: "#b5b09b",
    fontWeight: "bold",
    marginLeft: 65,
    marginRight: 85,
  },
  desc: {
    margin: 20,
    marginTop: 5,
    borderWidth: 2,
    borderColor: "#b5b09b",
    borderStyle: "solid",
    borderRadius: 10,
    padding: 10,
    textAlign: "justify",
  },
});
