import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './styles.css';
import logo from '../../assets/logo.svg';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';
import Dropzone from '../../components/Dropzone';

interface Item {
    id: number;
    title: string;
    image_url: string;
};

interface IBGEUFResponse {
    sigla: string;
};

interface IBGECityResponse {
    nome: string;
};

const CreatePoint = () => {
    //Sempre que se cria estado para array ou objeto, é necessario informar o tipo da variavel
    //que vai ser armazenada, use interface
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [initialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    //Salva o estado da UF selecionada
    const [selectedUf, setSelectedUf] = useState('0');
    //Salva o estado da cidade selecionada
    const [selectedCity, setSelectedCity] = useState('0');
    //Salva a localização
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    //Salva os items selecionados
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();
    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            console.log(position.coords);

            setInicialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios
            .get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);

                setUfs(ufInitials);
            });
    }, []);

    useEffect(() => {
        //Carregar as cidades sempre que a UF mudar
        if (selectedUf === '0') {
            return;
        }

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);

                setCities(cityNames);
            });        
    }, [selectedUf]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    };

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    };

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    };

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        //Use o spread operator ("...") para aproveitar os dados que já estão inseridos no useState
        setFormData({ ...formData, [name]: value });
    };

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

    //Use o preventDefault para evitar que a página seja recarregada apos o submit
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        //Dados do formulario
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        //Junção dos dados para envio
        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if (selectedFile) {
            data.append('image', selectedFile);
        };

        /* const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }; */

        //Envia os dados, não é necessario a URL completa pois o objeto api já tem a URL base
        //O await garente que o codigo só vai prosseguir após os dados serem enviados
        await api.post('points', data);

        alert('Ponto de coleta criado!');

        //O History armazena o historico de navegação
        //O history serve para redirecionar o usuário para outra página, nesse caso, o home
        history.push('/');
    };

    return (
        <div id="page-create-point">
            <header>
               <img src={ logo } alt="Ecoleta"/>
               <Link to="/">
                   <FiArrowLeft />
                    Voltar para home
               </Link>
            </header>

            <form onSubmit={ handleSubmit }>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={ setSelectedFile } />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={ handleInputChange }/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={ handleInputChange }/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={ handleInputChange }/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={ initialPosition } zoom={15} onClick={ handleMapClick }>
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Marker position={ selectedPosition } />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={ selectedUf } onChange={ handleSelectedUf }>
                                <option value="0">Selectione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={ uf } value={ uf }>{ uf }</option>
                                ))};
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={ selectedCity } onChange={ handleSelectedCity }>
                                <option value="0">Selectione uma cidade</option>
                                {cities.map(city => (
                                    <option key={ city } value={ city }>{ city }</option>
                                ))};
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            //A funcão no className serve para verificar se um item já foi selecionado, includes retorna true ou false. Caso seja true, é utilizada
                            //uma classe css chamada selected, se for false a classe continua vazia
                            <li key={ item.id } onClick={() => handleSelectItem(item.id) } className={ selectedItems.includes(item.id) ? 'selected' : '' }>
                                <img src={ item.image_url } alt={ item.title } />
                                <span>{ item.title }</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;