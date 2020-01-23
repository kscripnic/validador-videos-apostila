const API_URL = 'http://desenv.ordomederi.com/API_Homologacao/MsCross.svc/';
const API_URL_VIDEOS = 'V2/Materiais/Apostilas/Videos/Listar';
const API_URL_APOSTILA = 'json/Materiais/ApostilaOriginal/IdEntidade/';

const MATRICULA = 267711;
const APP_VERSION = "5.2.2";
const IDAPLICACAO = 17;
const IDAPOSTILA = 22508;

const axios = require('axios').default;
var HTMLParser = require('node-html-parser');

async function getVideos(URLAPI, URLVideos, Matricula, APPVersion, IDAplicacao, IdsVideos) {
    try {
        const ret = await axios.post(URLAPI + URLVideos, {
            AppVersion: APPVersion,
            IdAplicacao: IDAplicacao,
            Matricula: Matricula,
            IdsVideos: IdsVideos
        });

        return ret.data['Retorno'];
    } catch (error) {
        throw error;
    }
}

async function getApostila(URLAPI, URLApostila, Matricula, APPVersion, IDAplicacao, IDApostila) {
    try {
        const ret = await axios.get(URLAPI + URLApostila + IDApostila, {
            appVersion: APPVersion,
            idAplicacao: IDAplicacao,
            matricula: Matricula
        })

        return ret.data['Retorno']['Conteudo'];
    } catch (error) {
        throw error;
    }
}

function getKeysVideos(conteudo) {
    try {
        let videosCodigos = [];
        const root = HTMLParser.parse(conteudo);
        let elements = root.querySelectorAll('.videomiolo');
        elements.forEach(el => {
            let codigoSplit = (el.attributes.href.slice(0, -4)).split('=');
            let codigo = codigoSplit[codigoSplit.length - 1];
            videosCodigos.push(codigo);
        })
        return videosCodigos;
    } catch (error) {
        throw error;
    }
}

async function validateVideos(listVideos) {
    try {
        listVideos.forEach(async video => {
            console.log('Verificando chave: ' + video['KeyVideo']);

            const videoURL = video['Url'];
            if (validateVideoURLEmpty(videoURL)) {
                const isValidPermissions = await validateVideoPermissions(videoURL);
                if (!isValidPermissions) {
                    console.log('Video sem permissão: ' + video['KeyVideo'])
                }
            } else {
                console.log('URL vazia para o video: ' + video['KeyVideo'])
            }

            
        });
    } catch (error) {
        throw error;
    }
}

function validateVideoURLEmpty(videoURL) {
    if (videoURL == '' || videoURL == undefined) {
        return false;
    }

    return true;
}

async function validateVideoPermissions(url) {

    try {
        const ret = await axios.get(url, {
            responseType: 'arraybuffer'
        })

        return ret.status == 200;
    } catch (error) {
        throw error;
    }


}

async function init() {
    console.log('Carregando apostila...');
    const apostila = await getApostila(API_URL, API_URL_APOSTILA, MATRICULA, APP_VERSION, IDAPLICACAO, IDAPOSTILA);
    console.log('Processando videos...');
    const videosKeys = getKeysVideos(apostila);
    console.log('Carregando videos...');
    const videos = await getVideos(API_URL, API_URL_VIDEOS, MATRICULA, APP_VERSION, IDAPLICACAO, videosKeys);
    console.log('Validando videos...');
    await validateVideos(videos);
    console.log('Verificação concluida!');
}

init();