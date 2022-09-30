// 应用fastclick消除用户点击事件的卡顿
window.addEventListener('load', function() {
    FastClick.attach(document.body);
  }, false);


// 定义常量
const rows = 20; // 行数
const cols = 20; // 列数
const size = 40; // 格子大小
const mainScene = document.querySelector(".love_eat_snake"); // 画布

// 定义有效按键
const validKeys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown",
                    "w", "a", "s", "d",
                    "r"];

const gamePanel = []; // 格子信息存储
// 初始化格子信息
for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
        var class_info = (i == 10 && j == 10)? "grid food": "grid";
        gamePanel.push(`<div data-v="${i}-${j}" class="${class_info}" style="width:${size}px;height:${size}px"></div>`);
    }
}

// 定义变量
var key = null; // 初始化按键信息（也可以认为是当前方向，如果不改变就一直移动）
var tick = null; // 定时器的id
var speed = 10; // 默认速度为居中
var canDo = true;


const updateDir = (dir) => {
    if(canDo){
        canDo = false;
        key = dir;
    }
};

// 更新贪吃蛇的位置信息
const updateSnake = (snake) => {
    document.querySelectorAll('.body').forEach(item => item.classList.remove("body"));
    document.querySelectorAll('.head').forEach(item => item.classList.remove("head"));

    let item = snake[0];
    document.querySelector(`[data-v="${item.join('-')}"]`).classList.add("head");
    for(let i = 1; i < snake.length; i++){
        item = snake[i];
        document.querySelector(`[data-v="${item.join('-')}"]`).classList.add("body");
    }
};

//随机生成下一个食物
const foodGenerator = () => {
    let x = Math.floor(Math.random() * rows);
    let y = Math.floor(Math.random() * cols);
    let pos = document.querySelector(`[data-v="${x}-${y}"]`);
    if(pos.className.indexOf("body") >= 0 || pos.className.indexOf("head") >= 0){
        foodGenerator();
    }else{
        pos.classList.add("food");
    }
};

// 其实只调用一次，没必要写个方法，然鹅，太长了，所以写在方法里，方便开发时折叠
// 主要定义所有的事件监听
const initControl = () => {
    // 给移动端用户做保障，有触控的选项
    document.querySelector('#up').addEventListener("click", () => {
        if(key != "down"){
            updateDir("up");
        }
    })
    document.querySelector('#down').addEventListener("click", () => {
        if(key != "up"){
            updateDir("down");
        }
    })
    document.querySelector('#left').addEventListener("click", () => {
        if(key != "right"){
            updateDir("left");
        }
    })
    document.querySelector('#right').addEventListener("click", () => {
        if(key != "left"){
            updateDir("right");
        }
    })
    document.querySelector("#restart").addEventListener("click", () => {
        if(tick){
            clearInterval(tick);
        }
        gameStart();
    })

    document.querySelector("#speedConfirm").addEventListener("click", () => {
        let input = document.getElementById("speedInput");
        if(input.value != ""){
            inputNumber = parseInt(input.value);
            if(inputNumber >= 1 && inputNumber <= 20){
                input.value = "";
                speed = inputNumber;
                alert("设置成功");
                if(tick){
                    clearInterval(tick);
                }
                gameStart();
            }else{
                input.value = "";
                alert("请输入1-20之间的数字");
            }
        }else{
            speed = 10;
            alert("请输入你想要的速度，不然默认是居中速度");
        }
    })

    // 键盘监听器，按键记录
    document.addEventListener("keydown", e => {
        if(validKeys.includes(e.key)){
            switch(e.key){
                // 为了避免玩家没有方向键 wasd也可以使用来玩
                case "w":
                case "ArrowUp":
                    // 反向操作是不行的，下面三个操作同样如此
                    if(key != "down"){
                        updateDir("up");
                    }
                    break
                case "a":
                case "ArrowLeft":
                    if(key != "right"){
                        updateDir("left");
                    }
                    break;
                case "s":
                case "ArrowDown":
                    if(key != "up"){
                        updateDir("down");
                    }
                    break;
                case "d":
                case "ArrowRight":
                    if(key != "left"){
                        updateDir("right");
                    }
                    break;
                case "r":
                    if(tick){
                        clearInterval(tick);
                    }
                    gameStart();
                    break;
            }
        }
    });
};

// 开始游戏前的流程
const onPageInit = () => {
    initControl();
    gameStart();
};

const gameStart = () => {
    // 贪吃蛇初始化
    const snake = [[1, 1]]; // 储存的是蛇的信息，从头开始往下罗列全部身体
    // 重新赋值
    key = null;
    canDo = true;

    // 绘制画布
    mainScene.innerHTML = gamePanel.join('');
    mainScene.style.width = `${cols * size}px`;

    // 游戏开始先初始化贪吃蛇
    updateSnake(snake);

    // 定时器，每500毫秒执行一次
    tick = setInterval(() => {
        const curPos = JSON.parse(JSON.stringify(snake));
        if(key){
            switch(key){
                case "up":
                    snake[0][0] -= 1;
                    break;
                case "left":
                    snake[0][1] -= 1;
                    break;
                case "down":
                    snake[0][0] += 1;
                    break;
                case "right":
                    snake[0][1] += 1;
                    break;
            }
        }

        const curHead = document.querySelector(`[data-v="${snake[0].join('-')}"]`);
        if(!curHead){
            clearInterval(tick);
            alert("游戏结束");
        }else{
            if(curHead.className.indexOf("body") >= 0){
                clearInterval(tick);
                alert("游戏结束");
            }else{
                if(curHead.className.indexOf("food") >= 0){
                    curHead.classList.remove("food");
                    foodGenerator();
                    snake.push([0, 0]);
                    for(let i = 0; i < curPos.length; i++){
                        snake[i + 1] = curPos[i];
                    }
                }else{
                    for(let i = 1; i < curPos.length; i++){
                        snake[i] = curPos[i - 1];
                    }
                }
                updateSnake(snake);
            }
        }
        canDo = true;
    }, 2000/speed);
};

onPageInit();
