import path from 'path';

module.exports = {
    client: 'sqlite3',
    connection: {
        //__dirname retorna o caminho do arquivo que ta sendo executado
        filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite')
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true
};