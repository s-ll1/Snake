// 将整个蛇移动的区域划分为30行30列宽高为20px的小格子
var sw = 20, //一个方块的宽
    sh = 20, //高
    tr = 30, //行
    td = 30; //列

var snake = null; //全局变量 蛇的实例
var food = null; //全局变量 食物的实例
var game = null; //全局变量 游戏的实例

    // 方块构造函数：下面参数x y分别表示方块的坐标位置，classname表示不同的样式（蛇头 身体 食物等）
function Square(x,y,classname){
  //正常像素表示下的坐标   想表示成
  // 0,0                  0,0
  // 20,0                 1,0
  // 40,0                 2,0

  this.x = x*sw; //传入时坐标按右边形式传入，但需要转换成左边形式
  this.y = y*sh;
  this.class = classname;

  this.viewContent = document.createElement('div'); //方块对应的Dom元素 document.createElement表示创建一个div对象
  this.viewContent.className = this.class;
  this.parent = document.getElementById('snakeWrap'); //方块的父级 document.getElementById('snakeWrap')用于获取页面中ID为snakeWrap的元素
}
Square.prototype.create=function(){ //创建方块DOM，并添加到页面里
  this.viewContent.style.position='absolute';
  this.viewContent.style.width=sw + 'px';
  this.viewContent.style.height=sh + 'px';
  this.viewContent.style.left=this.x + 'px';
  this.viewContent.style.top=this.y + 'px';

  this.parent.appendChild(this.viewContent); //将方块添加到页面里面（向html中插入元素对象）

};
Square.prototype.remove=function(){ //删除不用的方块
  this.parent.removeChild(this.viewContent);
};

//蛇
function Snake(){
  this.head = null; //存储蛇头信息
  this.tail = null; //存储蛇尾的信息
  this.pos = []; //存储蛇身上的每一个方块的位置（二维数组 里面存储的是每个位置的坐标如[0][0]）
  
  this.directionNum = { //一个对象，存储蛇走的方向（需要知道按得是上下左右哪个键）
    left:{ //表示蛇往左走 x-1 y不动
      x:-1,
      y:0,
      rotate:180 //调整蛇头的方向（默认是向右的）
    },
    right:{
      x:1,
      y:0,
      rotate:0
    },
    up:{
      x:0,
      y:-1,
      rotate:-90
    },
    down:{
      x:0,
      y:1,
      rotate:90
    }

  }
}

Snake.prototype.init=function(){ //init用来初始化
  // 创建蛇头
  var snakeHead = new Square(2,0,'snakeHead'); //蛇头默认位置在左上角初始位置
  snakeHead.create(); //蛇头实例直接调用原型的create方法
  this.head = snakeHead; //存储蛇头信息
  this.pos.push([2,0]) ; //把蛇头的位置存起来

  // 创建蛇身体1
  var snakeBody1 = new Square(1,0,'snakeBody');
  snakeBody1.create();
  this.pos.push([1,0]) ; //把蛇身体1的位置存起来

  // 创建蛇身体2
  var snakeBody2 = new Square(0,0,'snakeBody');
  snakeBody2.create();
  this.tail=snakeBody2; //body2充当蛇尾
  this.pos.push([0,0]) ; //把蛇身体2的位置存起来

  // 形成链表关系
  snakeHead.last=null; //蛇头的右边没有东西(last为null)
  snakeHead.next=snakeBody1; //蛇头左边为body1

  snakeBody1.last=snakeHead;
  snakeBody1.next=snakeBody2;

  snakeBody2.last=snakeBody1;
  snakeBody2.next=null;

  // 通过给蛇添加一条属性，用来表示蛇走的方向（初始时）
  this.direction = this.directionNum.right; //默认蛇往右边走

};

// 给蛇添加一个方法，用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事情
Snake.prototype.getNextPos=function(){
  // 原理：
  // var nextPos=[
  //   this.head.c/sw+?
  //   this.head.y/sh+?
  //   ?表示方向信息
  // ]

  var nextPos=[
      this.head.x/sw+this.direction.x,
      this.head.y/sh+this.direction.y  
    ]
    //console.log(nextPos);

    // 下个点是自己，撞到自己游戏结束（因为已经用Pos存储了身体的坐标，则用下个点与之前存起来的这些位置作比较，若有一样的坐标则撞到，否则继续走
    var selfCollied=false; //用来标记是否撞到自己 默认不是
    this.pos.forEach(function(value){ //forEach用来遍历数组(value为数组中现存的某项值)
      if(value[0]==nextPos[0] && value[1]==nextPos[1]){
        //注意引用类型判等是需要值和引用地址都相等才等  所以上面分别比较两个数据
        selfCollied=true; //相等 则撞上自己
      }
    });
    if(selfCollied){
      console.log('撞到自己了555...');
      this.strategies.die.call(this);


      return; //进入此条件后后面代码不再执行
    }

    // 下个点是墙，游戏结束
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 || nextPos[1]>tr-1){
      console.log('撞到墙了555...');

      this.strategies.die.call(this);

      return; //进入此条件后后面代码不再执行

    }

    // 下个点是食物，吃掉
    //this.strategies.eat();
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
      console.log('撞到食物了，吃掉！');
      this.strategies.eat.call(this);
      return ;
    }

    // 下个点什么也没有，走(以上三种情况都不满足就是什么也没有)
    this.strategies.move.call(this); //this指向实例对象 如果不用call的话this指向strategies，取不到蛇头  
};

// 处理撞墙后要做的事
Snake.prototype.strategies = { //给原型身上添加属性
  move:function(format){ //format参数用来决定要不要删除最后一个方块蛇尾（吃食物就不用删），当穿了这个参数后就表示要做的动作为吃
    // console.log('move')
    // move实现的原理：每次创建一个新的蛇头，蛇头后创建一个新的身体，再把原来的蛇尾去掉
    
    // 创建一个新身体（在旧蛇头的位置）
    var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
    // 更新链表的关系
    //newBody.next = snakeBody1; 这个body1不在这个作用域范围内，拿不到，但是可以通过之前创建的链表关系来找到
    newBody.next = this.head.next; //this.head.next为原来的body1
    this.head.next.last = newBody;
    newBody.last = null; //因为旧蛇头要被删掉 因此在创建新的蛇头之前newBody的右边为null

    this.head.remove(); //把旧的蛇头从原来的位置删除
    newBody.create(); //创建一个新的蛇的身体

    // 创建一个新的蛇头（蛇头下一个要走到的点）
    var newHead = new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
    // 更新链表关系（与新蛇头的）
    newHead.last = null;
    newHead.next = newBody;
    newBody.last = newHead;
    // 创建新蛇头的时候就改变蛇头为对应的方向/////////////////////////
    newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
    newHead.create();

    // 更新蛇身上每一个方块的坐标(因为新创建出来的身体在原来头的位置，因此只需要将新的头部位置存进数组)
    // splice方法既可以删又可以插入数组元素
    this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
    this.head = newHead; //更新蛇头
    
    if(!format){ //如果format的值为false，表示需要删除
      this.tail.remove();
      this.tail=this.tail.last; //更新蛇尾

      this.pos.pop(); //pop用来删除数组最后一个元素
    }

  },
  eat:function(){
    this.strategies.move.call(this,true); //true表示给format传的实参
    createFood();
    game.score+=10; //吃掉一个食物加十分（game是全局变量 可以直接调用）
    console.log('eat')
  },
  die:function(){
    game.over();
    console.log('die')
  }
}
snake = new Snake();
// snake.init();
//snake.getNextPos();

// 创建食物
function createFood(){
  // 食物方块的随机坐标（不能为蛇的身体与墙上的坐标）
  var x=null,
      y=null;
  
  var include = true; //循环跳出的条件，true表示食物的坐标在蛇的身上（需要继续循环），false表示食物的坐标不在蛇身上（不用再循环）
  while(include){
    x=Math.round(Math.random()*(td-1)); //Math.random()函数返回一个浮点数,  伪随机数在范围从0到小于1
    y=Math.round(Math.random()*(tr-1));

    snake.pos.forEach(function(value){
      if(x!=value[0] && y!=value[1]){
        include = false;
      }

    });  

  }

  // 生成食物
  food = new Square(x,y,'food');
  food.pos=[x,y]; //存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比

  var foodDom = document.querySelector('.food'); //获取食物节点（设计模式单例模式也可实现但需要先学完
  if(foodDom){
    foodDom.style.left=x*sw+'px';
    foodDom.style.top=y*sh+'px';
  }else{
    food.create();
  }

}
// createFood();

// 创建游戏逻辑
function Game(){
  this.timer = null;
  this.score = 0;
}
Game.prototype.init = function(){
  snake.init();
  //snake.getNextPos();
  createFood();

  document.onkeydown=function(ev){
    if(ev.which == 37 && snake.direction != snake.directionNum.right){ //which已被弃用（37表示left）
      snake.direction = snake.directionNum.left; 
    }else if(ev.which == 38 && snake.direction != snake.directionNum.down){
      snake.direction = snake.directionNum.up; 
    }else if(ev.which == 39 && snake.direction != snake.directionNum.left){
      snake.direction = snake.directionNum.right; 
    }else if(ev.which == 40 && snake.direction != snake.directionNum.up){
      snake.direction = snake.directionNum.down; 
    }
  }
  this.start();
}

Game.prototype.start=function(){ //开始游戏
  this.timer=setInterval(function(){ //开启一个定位器
    snake.getNextPos(); //获取下一个点

  },180); //180ms（蛇动的速度）

}
Game.prototype.pause=function(){ //游戏暂停
  clearInterval(this.timer); //清掉计时器

}
Game.prototype.over=function(){ //游戏结束
  clearInterval(this.timer);
  if(this.score == 0){
    alert('哦豁，没开始就结束了呢，0分小可爱');
  }else if(this.score >=10 && this.score <=100){
    alert('您的得分为：'+this.score+ ',继续加油哦！');

  }else{
    alert('您的得分为：' +this.score+ '，很棒哦！');
  }
  // var score = document.getElementsByClassName('score');
  // score.innerHTML='this.score';
  // var scoreBtn = document.querySelector('.scoreBtn');
  // scoreBtn.style.display = 'block';
  
  //游戏结束后再点击应该回到最初始的状态
  var snakeWrap = document.getElementById('snakeWrap');
  snakeWrap.innerHTML = '';

  snake = new Snake(); //重新初始化，就可以清空上局残留页面
  game = new Game();

  var startBtn = document.querySelector('.startBtn');
  startBtn.style.display = 'block';
}

// 开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
  startBtn.parentNode.style.display='none'; //点击开始按钮后该按钮消失
  game.init();
};

// 点击游戏区域游戏暂停出现暂停按钮
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function(){
  game.pause();
  pauseBtn.parentNode.style.display = 'block'; //点击游戏暂停 出现暂停按钮
}

pauseBtn.onclick=function(){ //给暂停按钮添加一个点击事件 点击游戏继续
  game.start();
  pauseBtn.parentNode.style.display = 'none';   
}