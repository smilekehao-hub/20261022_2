// ==========================================
// 拖曳題測驗系統 (題目絕對不重複版) - sketch.js
// 主題：模型製作基本技法
// ==========================================

// --- 全域變數宣告 ---
let fullQuestionBank = []; // 儲存完整的 15 題題庫
let quizData = [];         // 每次測驗隨機抽出的 6 條不重複題目
let dropZones = [];        // 上方固定圖示（放置區）物件陣列
let dragItems = [];        // 下方可拖曳文字選項物件陣列
let draggedItem = null;    // 當前正在被拖曳的物件
let submitButton = null;   // 「交卷看成績」按鈕 DOM 元素
let isSubmitted = false;   // 是否已經交卷狀態
let score = 0;             // 測驗得分
let confettiList = [];     // 彩帶特效粒子陣列
let showConfetti = false;  // 是否播放彩帶特效

// --- p5.js 初始化設定 ---
function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 文字對齊方式設定為水平與垂直置中
  textAlign(CENTER, CENTER);

  // 1. 初始化 15 題完整題庫資料
  initFullQuestionBank();

  // 2. 從題庫中隨機抽出 6 題「保證不重複」的題目
  pickRandomQuizData();

  // 3. 建立畫面上方的放置目標區與下方的可拖曳選項
  createQuizElements();

  // 4. 建立居中的交卷 UI 按鈕
  createUI();
}

// --- 初始化 15 題模型基本技法題庫資料 ---
function initFullQuestionBank() {
  fullQuestionBank = [
    { id: 1, title: '打磨技法', type: 'SANDING', desc: '用砂紙把模型表面磨平平', speech: '打磨技法！拿砂紙搓一搓，把粗粗的地方磨平亮晶晶！' },
    { id: 2, title: '無縫填縫', type: 'PUTTY', desc: '補平小縫隙與凹下去的地方', speech: '無縫填縫！像抹奶油一樣把凹下去的小縫隙補起來！' },
    { id: 3, title: '假組組裝', type: 'ASSEMBLY', desc: '先組合看看外型長怎樣', speech: '假組組裝！先合體看看，檢查零件有沒有裝對地方！' },
    { id: 4, title: '噴漆上色', type: 'PAINTING', desc: '用噴筆噴上漂亮的顏料衣服', speech: '噴漆上色！呼叫噴槍，幫模型穿上帥氣又漂亮的新衣服！' },
    { id: 5, title: '膠水黏合', type: 'GLUING', desc: '點上模型膠水把零件黏緊緊', speech: '膠水黏合！點一點神奇膠水，把零件緊緊抱在一起！' },
    { id: 6, title: '湯口切割', type: 'CUTTING', desc: '用剪刀把零件從框框剪下來', speech: '湯口切割！拿斜口剪咔嚓一聲，把零件從框架上剪下來！' },
    { id: 7, title: '水貼紙', type: 'PAINTING', desc: '泡水後貼上標誌圖案裝飾', speech: '水貼紙！泡水一下下，就能把漂亮的隊徽圖案貼上去！' },
    { id: 8, title: '刻線修飾', type: 'CUTTING', desc: '用刻線刀把裝甲縫隙加深', speech: '刻線修飾！拿小雕刻刀輕輕劃，讓模型的裝甲縫隙更清楚！' },
    { id: 9, title: '筆刷補色', type: 'PAINTING', desc: '用細小面相筆塗上小細節', speech: '筆刷補色！拿細細的水彩筆，幫小眼睛與小扣子著色！' },
    { id: 10, title: '滲線入墨', type: 'PAINTING', desc: '點入稀釋顏料讓線條變深', speech: '滲線入墨！點一滴墨水，它會自己順著凹槽跑過去喔！' },
    { id: 11, title: '保護漆', type: 'PAINTING', desc: '噴上消光或亮光保護顏料', speech: '保護漆！就像幫模型穿上透明雨衣，顏料就不會掉囉！' },
    { id: 12, title: '舊化效果', type: 'SANDING', desc: '做些鐵銹泥土像真的一樣', speech: '舊化效果！刷上一些泥土和生鏽的顏色，好像剛打完仗！' },
    { id: 13, title: '刮痕乾刷', type: 'SANDING', desc: '用筆刷微量顏料刷出金屬光', speech: '刮痕乾刷！筆刷沾一點點銀色，刷在邊邊角角看起來超硬！' },
    { id: 14, title: '改造塑膠板', type: 'CUTTING', desc: '用塑膠板自製新的零件部位', speech: '改造塑膠板！拿白色膠板自己剪裁，做出獨一無二的裝備！' },
    { id: 15, title: '電鍍金屬光', type: 'PAINTING', desc: '塗上電鍍顏料像鏡子一樣反光', speech: '電鍍金屬光！閃亮亮像鏡子一樣，可以看到自己的倒影喔！' }
  ];
}

// --- 洗牌演算法 (Fisher-Yates Shuffle) 確保完全隨機且不重複 ---
function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- 從 15 題題庫中抽出 6 題「完全不重複」的題目 ---
function pickRandomQuizData() {
  // 1. 先將完整的 15 題進行完全隨機洗牌
  let shuffledBank = shuffleArray(fullQuestionBank);

  // 2. 取前 6 題作為本次測驗（保證 ID 與內容 100% 不重複）
  quizData = shuffledBank.slice(0, 6);

  // 重置測驗狀態
  isSubmitted = false;
  showConfetti = false;
}

// --- 建立畫布上的元素位置 (全螢幕響應式佈局) ---
function createQuizElements() {
  dropZones = [];
  dragItems = [];

  let margin = 15;
  let cols = windowWidth > 850 ? 6 : (windowWidth > 550 ? 3 : 2);
  let rows = ceil(6 / cols);

  let containerWidth = min(width - 20, 1300);
  let zoneWidth = (containerWidth - (cols + 1) * margin) / cols;
  let zoneHeight = max(145, zoneWidth * 0.9); // 加大高度，確保標題、圖像、吸附框三者完全分離不重疊
  let startX = (width - (cols * zoneWidth + (cols - 1) * margin)) / 2;
  let startY = 70;

  // 1. 建立上方 6 個固定的目標放置區 (顯示抽到的 6 題不重複圖示)
  for (let i = 0; i < quizData.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = startX + col * (zoneWidth + margin) + zoneWidth / 2;
    let y = startY + row * (zoneHeight + margin) + zoneHeight / 2;

    dropZones.push({
      id: quizData[i].id,
      title: quizData[i].title,
      type: quizData[i].type,
      speech: quizData[i].speech,
      x: x,
      y: y,
      w: zoneWidth,
      h: zoneHeight,
      bounceScale: 1.0,
      occupant: null
    });
  }

  // 2. 將抽出的 6 題再次進行打亂，產生下方不重複的拖曳文字選項
  let shuffledItems = shuffleArray(quizData);

  let dragStartY = startY + rows * (zoneHeight + margin) + 20;
  let dragItemWidth = min(zoneWidth * 1.05, 210);
  let dragItemHeight = 55;

  for (let i = 0; i < shuffledItems.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = startX + col * (zoneWidth + margin) + zoneWidth / 2;
    let y = dragStartY + row * (dragItemHeight + 12) + dragItemHeight / 2;

    dragItems.push({
      id: shuffledItems[i].id,
      text: shuffledItems[i].desc,
      x: x,
      y: y,
      homeX: x,        // 記錄原始 X 位置，方便未對準時彈回
      homeY: y,        // 記錄原始 Y 位置，方便未對準時彈回
      w: dragItemWidth,
      h: dragItemHeight,
      isDragging: false,
      targetZone: null
    });
  }
}

// --- 建立 DOM UI 按鈕 (絕對居中於畫面底部) ---
function createUI() {
  if (submitButton) submitButton.remove();

  submitButton = createButton('✨ 點我交卷看成績 ✨');
  
  // 置中 CSS 定位
  submitButton.style('position', 'absolute');
  submitButton.style('bottom', '25px');
  submitButton.style('left', '50%');
  submitButton.style('transform', 'translateX(-50%)');
  
  // 可愛幼兒風格外觀
  submitButton.style('padding', '16px 45px');
  submitButton.style('font-size', '24px');
  submitButton.style('font-weight', 'bold');
  submitButton.style('background-color', '#ff7675');
  submitButton.style('color', '#ffffff');
  submitButton.style('border', '4px solid #ffffff');
  submitButton.style('border-radius', '35px');
  submitButton.style('cursor', 'pointer');
  submitButton.style('box-shadow', '0 8px 20px rgba(0,0,0,0.35)');
  submitButton.style('display', 'none'); // 初期隱藏

  submitButton.mousePressed(handleSubmit);
}

// --- 奶龍語音發聲控制 (Web Speech API) ---
function speakNailong(text) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // 停止目前正在播放的語音

  let utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.pitch = 1.55;  // 提高音調（萌萌高音調奶龍音）
  utterance.rate = 0.88;   // 適合幼兒聆聽的語速

  let voices = window.speechSynthesis.getVoices();
  let twVoice = voices.find(v => v.lang.includes('zh-TW') || v.lang.includes('zh'));
  if (twVoice) utterance.voice = twVoice;

  window.speechSynthesis.speak(utterance);
}

// --- p5.js 主繪製迴圈 ---
function draw() {
  background(24, 32, 54);

  drawHeader();
  drawDropZones();
  drawDragItems();
  checkAllPlaced();

  if (isSubmitted) {
    drawScoreBoard();
  }

  if (showConfetti) {
    updateAndDrawConfetti();
  }
}

// --- 繪製頁面標題 ---
function drawHeader() {
  push();
  fill(255, 234, 167);
  textSize(min(28, width * 0.055));
  textStyle(BOLD);
  text('🧩 模型製作基本技法 - 點點聽語音配對 🧩', width / 2, 35);
  pop();
}

// --- 繪製上方放置區 (卡片標題、圖示、目標框完全分離不重疊) ---
function drawDropZones() {
  for (let zone of dropZones) {
    push();
    rectMode(CENTER);

    // 平滑恢復彈跳效果
    zone.bounceScale = lerp(zone.bounceScale, 1.0, 0.1);

    translate(zone.x, zone.y);
    scale(zone.bounceScale);

    // 卡片背景外框
    stroke(255, 255, 255, 120);
    strokeWeight(2.5);
    fill(40, 53, 80);
    rect(0, 0, zone.w, zone.h, 18);

    // 1. 標題 (鮮黃大字)
    noStroke();
    fill(255, 211, 42);
    textSize(min(19, zone.w * 0.13));
    textStyle(BOLD);
    text('🔊 ' + zone.title, 0, -zone.h / 2 + 22);

    // 2. 動態 Gif 圖示
    drawDynamicGifIcon(zone.type, 0, -5, zone.w * 0.35);

    // 3. 底部吸附目標框
    noFill();
    stroke(255, 255, 255, 70);
    strokeWeight(2);
    rect(0, zone.h / 2 - 28, zone.w * 0.92, 42, 10);

    // 交卷後的正確與錯誤對錯回應
    if (isSubmitted && zone.occupant) {
      if (zone.occupant.id === zone.id) {
        fill(46, 204, 113);
        textSize(18);
        textStyle(BOLD);
        text('✓ 答對了！', 0, zone.h / 2 - 28);
      } else {
        fill(255, 118, 117);
        textSize(18);
        textStyle(BOLD);
        text('✗ 再想想看', 0, zone.h / 2 - 28);
      }
    }
    pop();
  }
}

// --- 模擬 GIF 動畫繪製 ---
function drawDynamicGifIcon(type, x, y, size) {
  push();
  translate(x, y);

  let t = frameCount * 0.08;

  switch (type) {
    case 'SANDING': // 打磨
      let sandOffset = sin(t * 2) * 12;
      fill(211, 166, 112);
      rectMode(CENTER);
      rect(sandOffset, -5, size * 0.9, size * 0.4, 4);
      fill(120);
      rect(0, 10, size * 1.1, 8);
      fill(255, 220);
      noStroke();
      ellipse(sandOffset + random(-5, 5), random(-10, 5), 4, 4);
      break;

    case 'PUTTY': // 補土
      let puttyY = cos(t * 1.5) * 6;
      fill(120);
      rectMode(CENTER);
      rect(0, 8, size * 1.1, 8);
      fill(241, 196, 15);
      arc(0, 4, size * 0.7, 10, PI, TWO_PI);
      stroke(236, 240, 241);
      strokeWeight(3);
      line(-8 + puttyY, -12 - puttyY, 8 + puttyY, 4 - puttyY);
      break;

    case 'ASSEMBLY': // 假組
      let gap = abs(sin(t)) * 15;
      fill(54, 160, 244);
      rectMode(CENTER);
      rect(-gap - 8, 0, size * 0.35, size * 0.55, 4);
      fill(255, 107, 107);
      rect(gap + 8, 0, size * 0.35, size * 0.55, 4);
      break;

    case 'PAINTING': // 噴漆
      stroke(180);
      strokeWeight(3);
      line(-size * 0.3, -size * 0.1, -size * 0.05, 0);
      noStroke();
      fill(155, 89, 182, 180);
      for (let i = 0; i < 5; i++) {
        let pX = (t * 8 + i * 7) % (size * 0.7);
        let pSize = map(pX, 0, size * 0.7, 2, 10);
        ellipse(pX, random(-pX * 0.25, pX * 0.25), pSize, pSize);
      }
      break;

    case 'GLUING': // 膠水
      fill(140);
      rectMode(CENTER);
      rect(0, 10, size, 8);
      let dropY = (t * 4) % (size * 0.4);
      fill(0, 210, 211, 220);
      noStroke();
      ellipse(0, -size * 0.2 + dropY, 7, 9);
      break;

    case 'CUTTING': // 切割
      let angle = sin(t * 2) * 0.25;
      stroke(255);
      strokeWeight(3);
      push();
      rotate(angle);
      line(0, 0, -size * 0.35, -size * 0.25);
      pop();
      push();
      rotate(-angle);
      line(0, 0, -size * 0.35, size * 0.25);
      pop();
      break;
  }
  pop();
}

// --- 繪製下方拖曳選項 ---
function drawDragItems() {
  for (let item of dragItems) {
    push();
    rectMode(CENTER);

    if (item.isDragging) {
      stroke(255, 234, 167);
      strokeWeight(4);
      fill(9, 132, 227);
    } else if (item.targetZone) {
      stroke(85, 239, 196);
      strokeWeight(2);
      fill(0, 184, 148);
    } else {
      stroke(255, 255, 255, 180);
      strokeWeight(2);
      fill(108, 92, 231);
    }

    let drawX = item.x;
    let drawY = item.y;
    let drawW = item.w;
    let drawH = item.h;

    if (item.targetZone && !item.isDragging) {
      drawX = item.targetZone.x;
      drawY = item.targetZone.y + item.targetZone.h / 2 - 28;
      drawW = item.targetZone.w * 0.9;
      drawH = 40;
    }

    rect(drawX, drawY, drawW, drawH, 10);

    noStroke();
    fill(255);
    textSize(min(15, drawW * 0.085));
    textStyle(BOLD);
    text(item.text, drawX, drawY, drawW - 8, drawH - 4);
    pop();
  }
}

// --- 檢查是否全部 6 題皆已吸附放置 ---
function checkAllPlaced() {
  if (isSubmitted) {
    if (submitButton) submitButton.style('display', 'none');
    return;
  }

  let allPlaced = dragItems.every(item => item.targetZone !== null);

  if (allPlaced) {
    submitButton.style('display', 'block');
  } else {
    submitButton.style('display', 'none');
  }
}

// --- 滑鼠/觸控 點擊事件 ---
function mousePressed() {
  if (isSubmitted) return;

  // 1. 點擊圖片卡片發出奶龍語音
  for (let zone of dropZones) {
    if (
      mouseX > zone.x - zone.w / 2 &&
      mouseX < zone.x + zone.w / 2 &&
      mouseY > zone.y - zone.h / 2 &&
      mouseY < zone.y + zone.h / 2
    ) {
      zone.bounceScale = 1.18;
      speakNailong(zone.speech);
    }
  }

  // 2. 抓取拖曳卡片
  for (let i = dragItems.length - 1; i >= 0; i--) {
    let item = dragItems[i];
    
    let currentX = item.x;
    let currentY = item.y;
    let currentW = item.w;
    let currentH = item.h;

    if (item.targetZone) {
      currentX = item.targetZone.x;
      currentY = item.targetZone.y + item.targetZone.h / 2 - 28;
      currentW = item.targetZone.w * 0.9;
      currentH = 40;
    }

    if (
      mouseX > currentX - currentW / 2 &&
      mouseX < currentX + currentW / 2 &&
      mouseY > currentY - currentH / 2 &&
      mouseY < currentY + currentH / 2
    ) {
      draggedItem = item;
      item.isDragging = true;

      if (item.targetZone) {
        item.targetZone.occupant = null;
        item.targetZone = null;
      }
      break;
    }
  }
}

// --- 拖曳中事件 ---
function mouseDragged() {
  if (draggedItem) {
    draggedItem.x = mouseX;
    draggedItem.y = mouseY;
  }
}

// --- 放開拖曳事件 (靈敏自動吸附) ---
function mouseReleased() {
  if (draggedItem) {
    draggedItem.isDragging = false;
    let snapped = false;

    for (let zone of dropZones) {
      let d = dist(draggedItem.x, draggedItem.y, zone.x, zone.y);

      if (d < 110 && (zone.occupant === null || zone.occupant === draggedItem)) {
        draggedItem.x = zone.x;
        draggedItem.y = zone.y + zone.h / 2 - 28;
        draggedItem.targetZone = zone;
        zone.occupant = draggedItem;
        snapped = true;
        break;
      }
    }

    if (!snapped) {
      draggedItem.x = draggedItem.homeX;
      draggedItem.y = draggedItem.homeY;
      draggedItem.targetZone = null;
    }

    draggedItem = null;
  }
}

// --- 交卷計算成績 ---
function handleSubmit() {
  isSubmitted = true;
  let correctCount = 0;

  for (let zone of dropZones) {
    if (zone.occupant && zone.occupant.id === zone.id) {
      correctCount++;
    }
  }

  score = floor((correctCount / quizData.length) * 100);

  if (score >= 80) {
    initConfetti();
    showConfetti = true;
    speakNailong('哇！太棒了！你得了 ' + score + ' 分！你是超級棒的模型小達人喔！');
  } else {
    speakNailong('你得到了 ' + score + ' 分！沒關係，再點點圖案聽聽看，下次一定會全對喔！');
  }
}

// --- 繪製成績結果 ---
function drawScoreBoard() {
  push();
  fill(0, 210);
  rect(width / 2, height / 2, width, height);

  fill(34, 47, 62);
  stroke(score >= 80 ? color(46, 204, 113) : color(255, 118, 117));
  strokeWeight(5);
  rectMode(CENTER);
  rect(width / 2, height / 2, min(420, width * 0.85), 300, 22);

  noStroke();
  fill(255);
  textSize(28);
  textStyle(BOLD);
  text('🏆 測驗成績 🏆', width / 2, height / 2 - 100);

  textSize(58);
  fill(score >= 80 ? color(46, 204, 113) : color(255, 118, 117));
  text(score + ' 分', width / 2, height / 2 - 25);

  textSize(20);
  fill(255);
  if (score >= 80) {
    text('🎉 恭喜你！太厲害了！\n你已經是模型小高手囉！', width / 2, height / 2 + 50);
  } else {
    text('💪 沒關係！再試一次，\n你一定會做得更好！', width / 2, height / 2 + 50);
  }
  pop();
}

// --- 重新抽題並重置測驗 ---
function resetQuiz() {
  pickRandomQuizData();
  createQuizElements();
  if (submitButton) submitButton.style('display', 'none');
}

// --- 彩帶特效系統 ---
function initConfetti() {
  confettiList = [];
  let colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#fd79a8'];

  for (let i = 0; i < 180; i++) {
    confettiList.push({
      x: random(width),
      y: random(-height, 0),
      size: random(8, 15),
      color: random(colors),
      speedY: random(2, 6),
      speedX: random(-2, 2),
      rotation: random(TWO_PI),
      rotSpeed: random(-0.1, 0.1)
    });
  }
}

function updateAndDrawConfetti() {
  push();
  noStroke();
  for (let p of confettiList) {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotSpeed;

    if (p.y > height) {
      p.y = random(-50, 0);
      p.x = random(width);
    }

    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    fill(p.color);
    rect(0, 0, p.size, p.size / 2);
    pop();
  }
  pop();
}

// --- 視窗縮放適應 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createQuizElements();
}