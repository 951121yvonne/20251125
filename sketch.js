// 定義角色物件
let player;

// 定義角色狀態常量
const STATE = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  // ATTACK 和 RUN 雖然未實作動畫，但保留在狀態中
  RUN: 'RUN',
  ATTACK: 'ATTACK'
};

// 載入圖片的變數
let idleSpriteSheet;
let walkSpriteSheet;

// 定義動畫設定
const animationData = {
  // IDLE 動畫設定 (6 張圖, 889x176)
  IDLE: {
    path: '2/IDLE/all.png',
    frameWidth: Math.floor(889 / 6), // 889 / 6 = 148.16... 取整數 148
    frameHeight: 176,
    frameCount: 6,
    frameDelay: 8 // 每 8 幀換一張圖，控制動畫速度
  },
  // WALK 動畫設定 (8 張圖, 1251x184)
  WALK: {
    path: '2/WALK/ALL.png',
    frameWidth: Math.floor(1251 / 8), // 1251 / 8 = 156.375... 取整數 156
    frameHeight: 184,
    frameCount: 8,
    frameDelay: 6 // 更快一點的動畫速度
  }
};

/**
 * 預載入圖片資源
 */
function preload() {
  // 載入 IDLE 圖片精靈
  idleSpriteSheet = loadImage(animationData.IDLE.path);
  // 載入 WALK 圖片精靈
  walkSpriteSheet = loadImage(animationData.WALK.path);
}

/**
 * 設定程式初始化
 */
function setup() {
  // 產生一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化角色物件
  // 初始位置設定在視窗的中左邊 (約寬度的 1/4 處)
  player = new Player(windowWidth / 4, windowHeight * 0.7); 
}

/**
 * 繪圖迴圈
 */
function draw() {
  // 畫布背景顏色為灰色 (RGB: 128, 128, 128)
  background(128); 
  
  // 處理角色輸入
  handleInput();
  
  // 更新和繪製角色
  player.update();
  player.display();
}

/**
 * 處理鍵盤輸入
 */
function handleInput() {
  // 預設將狀態設為 IDLE (當沒有按鍵按下時)
  player.setState(STATE.IDLE);
  player.setVelocity(0);
  
  // 按下鍵盤 'D' 鍵 (或 'd')
  if (keyIsDown(68)) { // D 鍵的 keyCode 是 68
    player.setState(STATE.WALK);
    // 設定角色向右移動的速度
    player.setVelocity(3); // 設定移動速度，可自行調整
  }
  
  // 可以在此處添加其他按鍵邏輯 (例如 A 鍵向左移動)
  // if (keyIsDown(65)) { ... }
}

/**
 * 當視窗大小改變時，重新調整畫布大小
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 也可以在這裡調整角色位置，使其保持相對位置不變
  player.x = windowWidth / 4; 
}


// --- Player 類別定義 ---

class Player {
  constructor(x, y) {
    this.x = x;          // 角色 x 座標
    this.y = y;          // 角色 y 座標
    this.velocity = 0;   // 角色水平移動速度
    this.scale = 1;    // 角色放大倍率 (使角色看起來更大)
    this.currentState = STATE.IDLE; // 初始狀態
    this.currentFrame = 0; // 目前動畫幀
    this.frameCounter = 0; // 幀計數器，用於控制換幀速度
    this.facing = 1;     // 角色朝向: 1 為右, -1 為左 (目前只實作向右)
  }

  /**
   * 設定角色狀態
   */
  setState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      // 切換狀態時，重設動畫幀和計數器
      this.currentFrame = 0;
      this.frameCounter = 0;
    }
  }

  /**
   * 設定角色移動速度
   */
  setVelocity(vel) {
    this.velocity = vel;
  }

  /**
   * 更新角色狀態和位置
   */
  update() {
    // 根據速度更新 x 座標 (實現移動)
    this.x += this.velocity;
    
    // 限制角色不要跑出畫面外
    this.x = constrain(this.x, 0, width - (animationData.IDLE.frameWidth * this.scale));
    
    // 動畫幀更新邏輯
    this.frameCounter++;
    
    let currentAnimData;
    let spriteSheet;

    switch (this.currentState) {
      case STATE.IDLE:
        currentAnimData = animationData.IDLE;
        spriteSheet = idleSpriteSheet;
        break;
      case STATE.WALK:
        currentAnimData = animationData.WALK;
        spriteSheet = walkSpriteSheet;
        break;
      default:
        return; // 沒有匹配的狀態則不執行動畫更新
    }
    
    // 根據 frameDelay 換幀
    if (this.frameCounter >= currentAnimData.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % currentAnimData.frameCount;
      this.frameCounter = 0; // 重設計數器
    }
  }

  /**
   * 繪製角色
   */
  display() {
    let currentAnimData;
    let spriteSheet;

    switch (this.currentState) {
      case STATE.IDLE:
        currentAnimData = animationData.IDLE;
        spriteSheet = idleSpriteSheet;
        break;
      case STATE.WALK:
        currentAnimData = animationData.WALK;
        spriteSheet = walkSpriteSheet;
        break;
      default:
        return;
    }
    
    // 計算來源圖片精靈上的裁剪座標
    const srcX = this.currentFrame * currentAnimData.frameWidth;
    const srcY = 0;
    const srcW = currentAnimData.frameWidth;
    const srcH = currentAnimData.frameHeight;
    
    // 繪製目標的寬高 (考慮縮放)
    const destW = srcW * this.scale;
    const destH = srcH * this.scale;
    
    // 使用 push/pop 隔離座標變換
    push();
    
    // 進行水平翻轉以實現朝向
    translate(this.x, this.y);
    scale(this.facing * this.scale, this.scale);
    
    // 繪製圖片精靈的單一幀
    // 參數: (圖片, 目的x, 目的y, 目的寬, 目的高, 來源x, 來源y, 來源寬, 來源高)
    // 由於我們使用了 translate/scale，目的 x/y 設為 0, 0
    image(
      spriteSheet, 
      0, 
      0, 
      srcW, 
      srcH, 
      srcX, 
      srcY, 
      srcW, 
      srcH
    );
    
    pop();
  }
}

// 提示: 
// 1. 如果您的 WALK 圖片 ALL.png 的所有圖片的寬高是 1251x184，則單張圖的寬度是 1251/8 = 156.375，程式碼中取了整數 156。
// 2. 由於 IDLE 和 WALK 的圖片精靈高度不同 (176 vs 184)，我使用了縮放比例 $this.scale$ 來讓它們在畫面上的大小大致一致。
// 3. 初始 $y$ 座標設定在 $windowHeight * 0.7$ 處，如果圖片很高的話，可能需要調整。