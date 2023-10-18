import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  Pressable,
} from "react-native";
import axios from "axios";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../AuthContext";
import { BarIndicator } from "react-native-indicators";
import configData from "../config_file.json";
export default function AddPost({ navigation }) {
  const [userData] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [photoShow, setPhotoShow] = useState(null);
  const [text, setText] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      setPhotoShow(result.uri);
    }
  };

  const submit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const token = userData.token;
    const postObject = new FormData();
    let filename = "";

    if (image != null) {
      const localUri = image;
      filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      postObject.append("image", { uri: localUri, name: filename, type });
    }
    postObject.append("text", text);
    postObject.append("imageName", filename);
    axios
      .post(configData.SERVER_URL + "post/addPost", postObject, {
        headers: { token: token, "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setIsLoading(false);
        navigation.navigate("Main");
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response.data.message === undefined) {
          alert("UPS");
        } else alert(err.response.data.message);
      });
  };
  return (
    <>
      <View style={styles.container}>
        {isLoading == true ? (
          <BarIndicator count={5} color="#002f52" />
        ) : (
          <View>
            <View style={styles.imageContainer}>
              <Text style={styles.label}>Zdjęcie do postu</Text>
            </View>
            <Pressable title="Profil" color={"#002f52"} onPress={pickImage}>
              {!photoShow && (
                <View>
                  <Image
                    source={require("../assets/sync-image-photo-icon.png")}
                    style={{
                      height: 200,
                      width: "90%",
                      resizeMode: "contain",
                      marginLeft: "5%",
                      marginTop: "2%",
                    }}
                    tintColor="#002f52"
                  />
                </View>
              )}
              {photoShow && (
                <View>
                  <Image
                    source={{ uri: photoShow }}
                    style={{
                      height: 200,
                      width: "90%",
                      resizeMode: "contain",
                      marginLeft: "5%",
                      marginTop: "2%",
                    }}
                  />
                </View>
              )}
            </Pressable>

            <View>
              <View style={styles.form}>
                <Text style={styles.label}>Opis</Text>
                <TextInput
                  multiline={true}
                  numberOfLines={4}
                  defaultValue={text}
                  style={styles.input}
                  onChangeText={(v) => setText(v)}
                ></TextInput>
              </View>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View style={styles.button}>
                  <Button onPress={submit} color="#faa933" title="Dodaj post" />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
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
  lottie: {
    width: 150,
    height: 150,
  },
  topBar: {
    paddingLeft: 10,
    height: 40,
    backgroundColor: "#002f52",
  },
  topBarText: {
    fontSize: 25,
    color: "#fff",
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
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  image: {
    width: null,
    resizeMode: "contain",
    height: 20,
  },
  form: {
    padding: 20,
  },
  input: {
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
    width: "40%",
    // paddingBottom: 5,
    height: 50,
  },
  text: {
    fontSize: 12,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: "white",
  },
});
