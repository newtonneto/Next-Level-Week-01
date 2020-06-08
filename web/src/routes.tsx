import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const Routes = () => {
    return (
        //Com o exact a rota só é acessada caso o endereço no navegador seja exatamente igual
        //ao informado no path da rota
        <BrowserRouter>
            <Route component={ Home } path="/" exact />
            <Route component={ CreatePoint } path="/create-point" />
        </BrowserRouter>
    );
};

export default Routes;