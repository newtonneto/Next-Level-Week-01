import React from 'react';
import { StatusBar } from 'react-native';
import { AppLoading } from 'expo';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';
import Routes from './src/routes';

export default function App() {
  //Carrega as fontes antes do resto do app
  const [ fontsLoaded ] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  });

  //Exibe um icone de loading enquanto as fontes carregam
  if (!fontsLoaded) {
    return <AppLoading />
  }

  return (
    //backgroundColor e translucent só funcionam no Android
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent/>
      <Routes />
    </>
  );
};