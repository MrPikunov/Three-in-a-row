document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const gridSize = 8;
    const elementImages = [ // Предполагаем, что это пути к вашим изображениям
        'url("/img/Fomih_n.jpg")',
        'url("/img/Fomih_or.jpg")',
        'url("/img/Fomih_bl.jpg")',
        'url("/img/Fomih_gr.jpg")',
        'url("/img/Fomih_pink.jpg")',
    ];

    let selectedItem = null;
    let score = 0;
    let currentLevel = 1;

    let levelType = 'classic'; // Другой вариант 'special'
    let levelNumber = 1;
    let gameOver = false;
    let levelCompleted = false;

    function updateScore(points) {
        score += points;
        scoreElement.textContent = `Счёт: ${score}`;
        checkLevelCompletion();
    }

    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function initGame() {
        gameContainer.innerHTML = ''; // Очищаем игровое поле
        gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;
        for (let i = 0; i < gridSize * gridSize; i++) {
            const item = document.createElement('div');
            item.classList.add('game-item');
            item.style.backgroundImage = getRandomElement(elementImages); // Используем картинки
            item.style.backgroundSize = 'cover'; // Убедитесь, что изображения корректно отображаются
            item.dataset.index = i;
            item.addEventListener('click', () => selectItem(item, i));
            gameContainer.appendChild(item);
        }
        setTimeout(checkForCombos, 100); // Проверяем начальные комбинации
    }




    // Допустим, эта функция вызывается, когда игрок формирует комбинацию
    function onCombinationRemoved(numberOfElementsRemoved) {
        const basePointsPerElement = 10; // Очки за каждый элемент
        let comboPoints = 0;

        // Рассчитываем количество очков в зависимости от количества удаленных элементов
        if (numberOfElementsRemoved >= 3) {
            comboPoints = basePointsPerElement * (numberOfElementsRemoved - 2);
        }

        updateScore(comboPoints); // Обновляем счёт на основе количества удаленных элементов
    }


    function checkLevelCompletion() {
        // Пример условия перехода на следующий уровень
        if (score >= 1000 * currentLevel) {
            currentLevel++;
            alert(`Уровень ${currentLevel}!`);
            // Здесь могут быть действия по инициализации нового уровня
        }
    }

    function initLevel(levelNum) {
        levelNumber = levelNum;
        levelType = determineLevelType(levelNumber);
        initGameField();
        if (levelType === 'special') {
            startAddingElements();
        }
    }

    function determineLevelType(levelNumber) {
        // Простая логика для определения типа уровня, может быть расширена
        return levelNumber % 2 === 0 ? 'special' : 'classic';
    }

    function startAddingElements() {
        const addElementsInterval = setInterval(() => {
            if (gameOver || levelCompleted) {
                clearInterval(addElementsInterval);
            } else {
                addNewElements();
            }
        }, 1000); // Например, добавляем новые элементы каждую секунду
    }

    function addNewElements() {
        // Логика для добавления новых элементов в верхнюю строку игрового поля
        // Это может включать в себя сдвиг всех текущих элементов вниз и добавление новых сверху
    }

    function checkLevelCompletion() {
        // Проверьте условия завершения для текущего типа уровня
        // Это может включать проверку, пусто ли игровое поле для классических уровней
        // Или, например, достиг ли игрок определенного количества очков для специальных уровней
    }



    function selectItem(item, index) {
        if (selectedItem) {
            trySwap(selectedItem.index, index);
            deselectItems();
            setTimeout(checkForCombos, 100); // Даем время на визуальное отображение перед проверкой комбинаций
        } else {
            item.classList.add('selected');
            selectedItem = { item, index };
        }
    }

    function deselectItems() {
        if (selectedItem) {
            selectedItem.item.classList.remove('selected');
            selectedItem = null;
        }
    }


    function trySwap(index1, index2) {
        const diff = Math.abs(index1 - index2);
        if (diff === 1 || diff === gridSize) {
            // Временно меняем элементы местами
            swapElements(index1, index2);

            // Проверяем, приведёт ли обмен к формированию комбинации
            if (!hasCombo()) {
                // Если комбинации нет, возвращаем элементы на место
                swapElements(index1, index2);
            } else {
                // Если комбинация есть, проводим дальнейшие действия
                setTimeout(checkForCombos, 100);
            }
        }
    }

    function hasCombo() {
        // Проверяем наличие комбинаций на всём поле
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (checkHorizontal(i, j).length >= 3 || checkVertical(i, j).length >= 3) {
                    return true;
                }
            }
        }
        return false;
    }


    function swapElements(index1, index2) {
        const tempBackground = gameContainer.children[index1].style.backgroundImage;
        gameContainer.children[index1].style.backgroundImage = gameContainer.children[index2].style.backgroundImage;
        gameContainer.children[index2].style.backgroundImage = tempBackground;
    }

    function checkForCombos() {
        let combos = new Set();

        // Проверка горизонтальных комбинаций
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize - 2; j++) {
                let match = checkHorizontal(i, j);
                if (match.length >= 3) {
                    match.forEach(index => combos.add(index));
                    j += match.length - 1; // Пропускаем проверенные элементы
                }
            }
        }

        // Проверка вертикальных комбинаций
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize - 2; j++) {
                let match = checkVertical(j, i);
                if (match.length >= 3) {
                    match.forEach(index => combos.add(index));
                    j += match.length - 1; // Пропускаем проверенные элементы
                }
            }
        }

        if (combos.size > 0) {
            removeCombos([...combos]);
            setTimeout(() => {
                fillGaps();
                setTimeout(checkForCombos, 500); // Повторная проверка после заполнения
            }, 500);
        }
    }

    function checkHorizontal(row, col) {
        let match = [row * gridSize + col];
        let type = gameContainer.children[row * gridSize + col].style.backgroundImage;
        for (let i = col + 1; i < gridSize; i++) {
            if (gameContainer.children[row * gridSize + i].style.backgroundImage === type) {
                match.push(row * gridSize + i);
            } else {
                break;
            }
        }
        return match.length >= 3 ? match : [];
    }

    function checkVertical(row, col) {
        let match = [row * gridSize + col];
        let type = gameContainer.children[row * gridSize + col].style.backgroundImage;
        for (let i = row + 1; i < gridSize; i++) {
            if (gameContainer.children[i * gridSize + col].style.backgroundImage === type) {
                match.push(i * gridSize + col);
            } else {
                break;
            }
        }
        return match.length >= 3 ? match : [];
    }

    function removeCombos(combos) {
        combos.forEach(index => {
            gameContainer.children[index].style.backgroundImage = ''; // Удаление элемента
        });

        onCombinationRemoved(combos.length); // Вызываем функцию для обновления счёта
    }

    function fillGaps() {
        for (let col = 0; col < gridSize; col++) {
            for (let row = gridSize - 1; row >= 0; row--) {
                if (gameContainer.children[row * gridSize + col].style.backgroundImage === '') {
                    // Ищем первый непустой элемент выше и перемещаем его вниз
                    for (let k = row - 1; k >= 0; k--) {
                        if (gameContainer.children[k * gridSize + col].style.backgroundImage !== '') {
                            gameContainer.children[row * gridSize + col].style.backgroundImage = gameContainer.children[k * gridSize + col].style.backgroundImage;
                            gameContainer.children[k * gridSize + col].style.backgroundImage = '';
                            break;
                        }
                    }
                }
            }
        }
        // Добавляем новые элементы на верхние пустые места
        for (let col = 0; col < gridSize; col++) {
            for (let row = 0; row < gridSize; row++) {
                if (gameContainer.children[row * gridSize + col].style.backgroundImage === '') {
                    gameContainer.children[row * gridSize + col].style.backgroundImage = getRandomElement(elementImages); // Заменяем elements на elementImages
                }
            }
        }
    }

    initGame();
});