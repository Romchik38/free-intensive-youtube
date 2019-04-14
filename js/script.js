'use strict';

const switcher = document.querySelector('#cbx'),   //Кнопка ночного режима
    more = document.querySelector('.more'),       //Кнопка загрузить еще
    modal = document.querySelector('.modal'),
    videos = document.querySelectorAll('.videos__item');  //Видеоролики

let player;     //Плеер который будет подтягиваться с ютуба

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
            console.log(box);
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

let night = false;

switcher.addEventListener('change', switchMode);

const nightColor = (color, background, cl, logo) => {
    night = background; //фон
    document.querySelectorAll('.hamburger > line').forEach(item => item.style.stroke = color);  //цвет полосок меню
    document.body.classList[cl]('night');   // удаление или добавление класса
    document.querySelectorAll('.videos__item-descr').forEach(item => item.style.color = color);  //цвет надписей
    document.querySelectorAll('.videos__item-views').forEach(item => item.style.color = color);  //видимость просмотров
    document.querySelector('.header__item-descr').style.color = color; // цвет надписи Night mode
    document.querySelector('.logo > img').src = logo;  // цвет логотипа
}
//Подгрузка видео 
const data = [
    ['img/thumb_3.webp', 'img/thumb_4.webp', 'img/thumb_5.webp'],
    ['              #3 Верстка на flexbox CSS | Блок преимущества и галерея | Марафон верстки | Артем Исламов',
        '#2 Установка spikmi и работа с ветками на Github | Марафон вёрстки Урок 2',
        '#1 Верстка реального заказа landing Page | Марафон вёрстки | Артём Исламов'],
    ['3,6 тыс. просмотров', '4,2 тыс. просмотров', '28 тыс. просмотров'],
    ['X9SmcY3lM-U', '7BvHoh0BrMw', 'mC8JW_aG2EM']
];
more.addEventListener('click', () => {
    const videosWrapper = document.querySelector('.videos__wrapper');
    const cards = [];
    more.remove();
    for (let i = 0; i < data[0].length; i++) {
        let card = document.createElement('a');
        card.classList.add('videos__item', 'videos__item-active'); // videos__item-active - opacity = 0 и смещение на 50;
        card.setAttribute('data-url', data[3][i]);  //установка атрибута  
        card.innerHTML = `
        <img src="${data[0][i]}" alt="thumb">
        <div class="videos__item-descr">
            ${data[1][i]}
        </div>
        <div class="videos__item-views">
            ${data[2][i]}
        </div>
        `;
        videosWrapper.appendChild(card);
        cards.push(card);   //для дабавления клика
        //Это нужно для того, чтобы картинки появились плавно со сдвигом
        setTimeout(() => {
            card.classList.remove('videos__item-active');   //после удаления этого класса opacity = 1 ;
        }, 10);

    }
    sliceTitle('.videos__item-descr', 70);
    bindModal(cards);
})

function sliceTitle(cl, num) {
    document.querySelectorAll(cl).forEach(item => {
        item.textContent = item.textContent.trim();     //удаление пробелов в тайтле
        if (item.textContent.length <= num) return;
        else {
            item.textContent = item.textContent.slice(0, num) + '...';
        }
    });
}
sliceTitle('.videos__item-descr', 70);

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
//Для ютуба
function createVideo() {
    // 2. This code loads the IFrame Player API code asynchronously.
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    //Создание экземпляра плеера
    setTimeout(() => {
        player = new YT.Player('frame', {   //первый аргумент - это существующий тег, который будет заменен на плеер.
            height: '100%',
            width: '100%',
            videoId: 'M7lc1UVf-VE',
        });
        console.log(YT);
    }, 1300);
};
createVideo();
//Загрузка нужного видео в модальное окно
function loadVideo(id) {
    player.loadVideoById({'videoId': id.toString()});
}



