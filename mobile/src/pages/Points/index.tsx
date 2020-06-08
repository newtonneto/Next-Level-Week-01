import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Svg, { SvgUri } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface Point {
    id: number;
    name: string;
    image: string;
    image_url: string;
    latitude: number;
    longitude: number;
}

interface Params {
    uf: string;
    city: string;
}

const Points = () => {
    //Para armazenar um vetor em um estado é necessário informar o formato do vetor, para isso use interface
    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params as Params;

    useEffect(() => {
        async function loadPosition() {
            //A variavel status vai armazenar a resposta do usuario para o pedido de permição de uso de localização
            const { status } = await Location.requestPermissionsAsync();

            //Se o usuário não permitir o uso da localização o sistema deve exibir uma mensagem
            if (status !== 'granted') {
            //O primeiro parametro é o titulo e o segundo a descrição
            Alert.alert('Oooops..', 'Precisamos de sua permissão para obter a localização')
            //O return é para sair da função e não executar o resto do codigo
            return;
        }

        //Consegue a localização do usuário
        const location = await Location.getCurrentPositionAsync();

        const { latitude, longitude } = location.coords;

        setInitialPosition([
            latitude,
            longitude
        ]);
    };

      loadPosition();
    }, []);

    useEffect(() => {
        //O then serve pra aguardar a resposta
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data);
        });
    //selectedItems chama a função novamente sempre que um novo item é marcado
    }, [selectedItems]);

    function handleNavigateBack() {
        //O metodo goBack() serve para voltar para a tela anterior
        navigation.goBack();
    };

    function handleNavigateToDetail(id: number) {
        //Tudo que estiver no objeto será passado como parametro pra proxima rota
        navigation.navigate('Detail', { point_id: id });
    }

    function handleSelectItem(id: number) {
        //Verifica se o item já está selecionado, o findIndex retorna -1 se o elemento não for encontrado no array,
        //e 0 ou maior caso seja encontrado
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            //Contem todos os items, com exceção do que eu quero remover, ou seja, um elemento previamente selecionado
            //que deve ter sua seleção removida
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems);
        }
        else {
            //Use o spread operator ("...") para aproveitar os dados que já estão inseridos no useState
            setSelectedItems([ ...selectedItems, id ]);
        };
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={ styles.container } >
                <TouchableOpacity onPress={ handleNavigateBack } >
                    <Icon name="arrow-left" size={ 20 } color="#34CB79" />
                </TouchableOpacity>

                <Text style={ styles.title }>Bem vindo.</Text>
                <Text style={ styles.description }>Encontre no mapa um ponto de coleta.</Text>

                <View style={ styles.mapContainer }>
                    {/*O codigo do MapView só será executado após o initialPossition[0] ser diverente de 0  */}
                    { initialPosition[0] !== 0 && (
                        //initialRegion define as coordenadas iniciais de exibição do mapa
                        //Enquanto o sistema não conseguir a localização do usuario, deve ser exibido um sinal de loading
                        <MapView 
                            style={ styles.map }
                            initialRegion={{ 
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014
                            }}
                        >
                            { points.map(point => (
                            //*Sempre que a função recebe parametro é necessario transformar em arrow function
                                <Marker
                                    key={ String(point.id) }
                                    style={ styles.mapMarker }
                                    onPress={ () => handleNavigateToDetail(point.id) }
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude
                                    }}
                                >
                                    <View style={ styles.mapMarkerContainer }>
                                        <Image style={ styles.mapMarkerImage } source={{ uri: point.image_url }} />   
                                        <Text style={ styles.mapMarkerTitle } >{ point.name }</Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}
                </View>
            </View>

            <View style={ styles.itemsContainer }>
                {/* ScrollView permite a função scroll em elementos de uma view, horizontal faz o scroll funcionar em sentido horizontal */}
                <ScrollView horizontal showsHorizontalScrollIndicator={ false } contentContainerStyle={{ paddingHorizontal: 20 }} >
                    {/*Para haver o retorno é preciso colocar o () após o => */}
                    { items.map(item => (
                        //No ReactNative o o atributo de key precisa ser uma String
                        <TouchableOpacity
                            key={ String(item.id) }
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            onPress={ () => handleSelectItem(item.id) }
                            activeOpacity={ 0.6 }
                        >
                            <SvgUri width={ 42 } height={ 42 } uri={ item.image_url } />
                            <Text style={ styles.itemTitle }>{ item.title }</Text>
                        </TouchableOpacity>
                    )) }
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20,
    },
  
    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },
  
    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },
  
    map: {
        width: '100%',
        height: '100%',
    },
  
    mapMarker: {
        width: 90,
        height: 80, 
    },
  
    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },
  
    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },
  
    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },
  
    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
    },
  
    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },
  
    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;