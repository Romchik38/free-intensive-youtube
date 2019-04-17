'use strict';

const switcher = document.querySelector('#cbx'),   //Кнопка ночного режима
    more = document.querySelector('.more'),       //Кнопка загрузить еще
    modal = document.querySelector('.modal'),
    videos = document.querySelectorAll('.videos__item'),  //Видеоролики
    videosWrapper = document.querySelector('.videos__wrapper'), //Содержит видеоролики
    searchInput = document.querySelector('.search > input');  //Поле поиска

let player;     //Плеер который будет подтягиваться с ютуба
let night = false;  //Для ночного режима

//Открытие и закрытие меню
function bindSlideToggle(trigger, boxBody, content, openClass) {
    let button = {
        element: document.querySelector(trigger),
        active: false,
    };
    const box = document.querySelector(boxBody),
        boxContent = document.querySelector(content);
    button.element.addEventListener('click', () => {
        if (button.active === false) {      //Если меню закрыто
            button.active = true;
            box.style.height = boxContent.clientHeight + 'px';   //Меняется высота меню с 0 на высоту контента внутри него
            box.classList.add(openClass)    //Активные класс для меню
        } else {
            button.active = false;
            box.style.height = 0 + 'px';   //Меняется высота меню с 0 на высоту контента внутри него
            box.classList.remove(openClass);    // удаление Активные класс для меню
        }
    })
}

bindSlideToggle('.hamburger', '[data-slide="nav"]', '.header__menu', 'slide-active');

//Переключение ночного режима
function switchMode() {
    if (night === false) nightColor('#fff', true, 'add', 'logo/youtube_night.svg');
    else nightColor('#000', false, 'remove', 'logo/youtube.svg');
}

switcher.addEventListener('change', switchMode);  // для ночного режима
//Функция смены режима день/ночь
const nightColor = (color, background, cl, logo) => {
    night = background; //фон
    document.querySelectorAll('.hamburger > line').forEach(item => item.style.stroke = color);  //цвет полосок меню
    document.body.classList[cl]('night');   // удаление или добавление класса
    document.querySelectorAll('.videos__item-descr').forEach(item => item.style.color = color);  //цвет надписей
    document.querySelectorAll('.videos__item-views').forEach(item => item.style.color = color);  //видимость просмотров
    document.querySelector('.header__item-descr').style.color = color; // цвет надписи Night mode
    document.querySelector('.logo > img').src = logo;  // цвет логотипа
}

//После нажатия кнопки Заргузить. Отображение видеороликов на странице
function showItems(result) {
    const cards = [];  // массив карточек видео. для модального окна и не только
    result.items.forEach(item => {
        let card = document.createElement('a');
        card.classList.add('videos__item', 'videos__item-active'); // videos__item-active - opacity = 0 и смещение на 50;
        card.setAttribute('data-url', item.id.videoId);  //установка атрибута  
        //card.setAttribute('data-url', item.contentDetails.videoId);  //установка атрибута  
        card.innerHTML = `
        <img src="${item.snippet.thumbnails.high.url}" alt="thumb">
        <div class="videos__item-descr">
            ${item.snippet.title}
        </div>
        <div class="videos__item-views">
        </div>
        `;
        //Для количества просмотров
        let adress = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${item.id.videoId}&key=AIzaSyBoGpH_AqA84HM2HiAbtgVHFuTeYZtCvWE`;
        getviewCount(adress, setCount, card); //Получение и простановка промостров
        videosWrapper.appendChild(card);    //Добавление карточки видео на страницу
        cards.push(card);   //для дабавления клика
        //Это нужно для того, чтобы картинки появились плавно со сдвигом
        setTimeout(() => {
            card.classList.remove('videos__item-active');   //после удаления этого класса opacity = 1 ;
        }, 10);

        if (night === true) {//Если ночной режим
            card.querySelector('.videos__item-descr').style.color = '#fff';
            card.querySelector('.videos__item-views').style.color = '#fff';
        }
    })
    sliceTitle('.videos__item-descr', 70);  //Обрезание тайтлов
    bindModal(cards);
}

//Запрос к ютубу
function start() {
    gapi.client.init({
        'apiKey': 'AIzaSyBoGpH_AqA84HM2HiAbtgVHFuTeYZtCvWE',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    }).then(function () {
        return gapi.client.youtube.playlistItems.list({
            'part': 'snippet, contentDetails',
            'maxResults': '6',
            'playlistId': 'OLAK5uy_nGFCp61_o2JwDanjC0VlKWVQCDOnnTNz4',
        });
    }).then(function (response) {
        showItems(response.result);
    }).catch(e => console.log(e))
}

more.addEventListener('click', () => {
    more.remove();
    gapi.load('client', start);
})

function sliceTitle(cl, num) {
    document.querySelectorAll(cl).forEach(item => {
        item.textContent = item.textContent.trim();     //удаление пробелов в тайтле
        if (item.textContent.length <= num) return;
        else item.textContent = item.textContent.slice(0, num) + '...';
    });
}

//Модальное окно
modal.showModal = function (show) {
    this.style.display = show;
}
function bindModal(cards) {         //устновка клика на видео
    cards.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();        //отмена стандартного поведения клика на ссылку
            const id = item.getAttribute('data-url');
            loadVideo(id);  //Загрузка нужного видео в модальное окно при клике
            modal.showModal('block');
        });
    });
}
bindModal(videos);
//Для закрытия
modal.addEventListener('click', (e) => {
    if (!e.target.classList.contains('modal__body')) {
        modal.showModal('none');
        player.stopVideo();     //Остановка плеера 
    }
});
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
        modal.showModal('none');
        player.stopVideo();     //Остановка плеера 
    }
})
//Для ютуба
function createVideo() {
    // 2. This code loads the IFrame Player API code asynchronously.
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    //Создание экземпляра плеера
    let interval = setInterval(() => {
        if (YT) {
            player = new YT.Player('frame', {   //первый аргумент - это существующий тег, который будет заменен на плеер.
                height: '100%',
                width: '100%',
                videoId: 'M7lc1UVf-VE',
            });
            clearTimeout(interval);
        }
    }, 50);
};
createVideo();
//Загрузка нужного видео в модальное окно
function loadVideo(id) {
    player.loadVideoById({ 'videoId': id.toString() });
}
//получить колво просмотров 
const getviewCount = async (url, callback, card) => {
    const result = await fetch(url)
        .then(response => response.json())
        .then(json => callback(json, card));
}
//Простановка просмотров на карточках
function setCount(youtubeItem, card) {
    const div = card.querySelector('.videos__item-views');
    div.textContent = `Просмотров: ${youtubeItem.items[0].statistics.viewCount}`;
}
//Поиск
function search(target) {
    gapi.client.init({
        'apiKey': 'AIzaSyBoGpH_AqA84HM2HiAbtgVHFuTeYZtCvWE',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    }).then(function () {
        return gapi.client.youtube.search.list({
            'maxResults': '10',  //колво результатов
            'part': 'snippet',  //какую часть данных хотим получить.
            'q': `${target}`,    //Запрос
            'type': '',
        });
    }).then(function (response) {
        while(videosWrapper.firstChild) {
            videosWrapper.removeChild(videosWrapper.firstChild) //Удаление видеороликов
        };
        showItems(response.result); //Отображение новых роликов
    });
}

function getDataForSearch() {
    return search(searchInput.value);
}

document.querySelector('.search').addEventListener('submit', (e) => {
    e.preventDefault(); //Отмена стандартного поведения - перезагрузки страницы
    if (searchInput.value.length > 0) {
        gapi.load('client', getDataForSearch);  //Передача данных для поиска
        searchInput.value = '';
    };
})